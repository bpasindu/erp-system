package lkerp.erp.service.impl;

import lkerp.erp.dto.AIRequestDTO;
import lkerp.erp.entity.AIRequest;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.User;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.AIRequestRepository;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.UserRepository;
import lkerp.erp.service.AIRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;

@Service
@RequiredArgsConstructor
public class AIRequestServiceImpl implements AIRequestService {

    private final AIRequestRepository aiRequestRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    @Value("${openai.api.key}")
    private String openAiApiKey;

    @Value("${openai.api.url}")
    private String openAiApiUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public AIRequestDTO.Response createRequest(AIRequestDTO.Request request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
                
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AIRequest aiReq = AIRequest.builder()
                .business(business)
                .user(user)
                .prompt(request.getPrompt())
                .requestType(request.getRequestType())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        String generatedResponse = "";
        int tokensUsed = 0;
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);
            
            List<Map<String, Object>> messages = new ArrayList<>();
            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-4o-mini");
            
            if ("CHAT".equals(request.getRequestType()) || "INSIGHT".equals(request.getRequestType())) {
                StringBuilder schemaBuilder = new StringBuilder();
                try {
                    String schemaQuery = "SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM information_schema.columns WHERE table_schema = DATABASE() AND TABLE_NAME NOT IN ('users', 'businesses', 'ai_requests')";
                    List<Map<String, Object>> schemaResults = jdbcTemplate.queryForList(schemaQuery);
                    Map<String, List<String>> tables = new HashMap<>();
                    for (Map<String, Object> row : schemaResults) {
                        String table = (String) row.get("TABLE_NAME");
                        String col = (String) row.get("COLUMN_NAME") + " (" + row.get("DATA_TYPE") + ")";
                        tables.computeIfAbsent(table, k -> new ArrayList<>()).add(col);
                    }
                    for (Map.Entry<String, List<String>> entry : tables.entrySet()) {
                        schemaBuilder.append("Table '").append(entry.getKey()).append("':\n");
                        for (String col : entry.getValue()) {
                            schemaBuilder.append("  - ").append(col).append("\n");
                        }
                    }
                } catch (Exception e) {
                    schemaBuilder.append("Could not load schema.");
                }

                StringBuilder contextBuilder = new StringBuilder();
                contextBuilder.append("You are an intelligent ERP AI Assistant acting as a Data Analyst for the business '").append(business.getName()).append("' (business_id=").append(business.getId()).append(").\n");
                contextBuilder.append("You have access to a tool called 'execute_sql'. You MUST use this tool to dynamically execute SELECT queries on the MySQL database to answer the user's question.\n");
                contextBuilder.append("CRITICAL INSTRUCTION: Since this is a multi-tenant database, YOU MUST ALWAYS append 'WHERE business_id = ").append(business.getId()).append("' (or join appropriately) to every query to ensure you ONLY fetch data belonging to this business!!\n");
                contextBuilder.append("Do NOT guess or hallucinate data. If you need data, execute a query.\n");
                contextBuilder.append("Only read-only SELECT queries are allowed.\n\n");
                contextBuilder.append("Here is the database schema:\n");
                contextBuilder.append(schemaBuilder.toString());
                
                Map<String, Object> systemMsg = new HashMap<>();
                systemMsg.put("role", "system");
                systemMsg.put("content", contextBuilder.toString());
                messages.add(systemMsg);
                
                // Define the tool
                List<Map<String, Object>> tools = new ArrayList<>();
                Map<String, Object> tool = new HashMap<>();
                tool.put("type", "function");
                Map<String, Object> function = new HashMap<>();
                function.put("name", "execute_sql");
                function.put("description", "Executes a SELECT query on the MySQL database and returns the JSON result. ONLY read queries (SELECT) are allowed.");
                Map<String, Object> params = new HashMap<>();
                params.put("type", "object");
                Map<String, Object> props = new HashMap<>();
                Map<String, Object> queryProp = new HashMap<>();
                queryProp.put("type", "string");
                queryProp.put("description", "The MySQL SELECT query to execute. Example: SELECT * FROM products WHERE business_id = 1");
                props.put("query", queryProp);
                params.put("properties", props);
                params.put("required", List.of("query"));
                function.put("parameters", params);
                tool.put("function", function);
                tools.add(tool);
                body.put("tools", tools);
            }
            
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", request.getPrompt());
            messages.add(message);
            
            body.put("messages", messages);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(openAiApiUrl, HttpMethod.POST, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            
            if (responseBody != null && responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, Object> msg = (Map<String, Object>) choice.get("message");
                    
                    if (msg.containsKey("tool_calls")) {
                        // AI wants to call a database tool
                        List<Map<String, Object>> toolCalls = (List<Map<String, Object>>) msg.get("tool_calls");
                        messages.add(msg); // Append assistant's tool call message
                        
                        for (Map<String, Object> toolCall : toolCalls) {
                            String toolCallId = (String) toolCall.get("id");
                            Map<String, Object> functionCall = (Map<String, Object>) toolCall.get("function");
                            String functionName = (String) functionCall.get("name");
                            String functionArgsStr = (String) functionCall.get("arguments");
                            
                            String toolResult = "";
                            if ("execute_sql".equals(functionName)) {
                                try {
                                    JsonParser parser = JsonParserFactory.getJsonParser();
                                    Map<String, Object> argsMap = parser.parseMap(functionArgsStr);
                                    String sqlQuery = (String) argsMap.get("query");
                                    
                                    if (sqlQuery == null || !sqlQuery.trim().toUpperCase().startsWith("SELECT")) {
                                        toolResult = "{\"error\": \"Only SELECT queries are allowed for security reasons.\"}";
                                    } else {
                                        List<Map<String, Object>> queryResults = jdbcTemplate.queryForList(sqlQuery);
                                        toolResult = queryResults.toString();
                                    }
                                } catch (Exception e) {
                                    toolResult = "{\"error\": \"" + e.getMessage() + "\"}";
                                }
                            }
                            
                            Map<String, Object> toolMessage = new HashMap<>();
                            toolMessage.put("role", "tool");
                            toolMessage.put("tool_call_id", toolCallId);
                            toolMessage.put("name", functionName);
                            toolMessage.put("content", toolResult);
                            messages.add(toolMessage);
                        }
                        
                        // Send the tool results back to OpenAI
                        body.put("messages", messages);
                        
                        HttpEntity<Map<String, Object>> secondEntity = new HttpEntity<>(body, headers);
                        ResponseEntity<Map> secondResponse = restTemplate.exchange(openAiApiUrl, HttpMethod.POST, secondEntity, Map.class);
                        Map<String, Object> secondResponseBody = secondResponse.getBody();
                        
                        List<Map<String, Object>> secondChoices = (List<Map<String, Object>>) secondResponseBody.get("choices");
                        Map<String, Object> secondMsg = (Map<String, Object>) secondChoices.get(0).get("message");
                        generatedResponse = (String) secondMsg.get("content");
                        
                        if (secondResponseBody.containsKey("usage")) {
                            Map<String, Object> usage = (Map<String, Object>) secondResponseBody.get("usage");
                            tokensUsed += (Integer) usage.get("total_tokens");
                        }
                    } else {
                        // Regular text response
                        generatedResponse = (String) msg.get("content");
                        if (responseBody.containsKey("usage")) {
                            Map<String, Object> usage = (Map<String, Object>) responseBody.get("usage");
                            tokensUsed = (Integer) usage.get("total_tokens");
                        }
                    }
                }
            }
        } catch (Exception e) {
            generatedResponse = "Error calling AI: " + e.getMessage();
        }

        aiReq.setStatus("SUCCESS");
        aiReq.setResponse(generatedResponse);
        aiReq.setTokensUsed(tokensUsed);
        aiReq.setCostEstimate((tokensUsed / 1000000.0) * 0.15);

        AIRequest saved = aiRequestRepository.save(aiReq);
        return mapToResponse(saved);
    }

    @Override
    public List<AIRequestDTO.Response> getRequestsByBusiness(Long businessId) {
        return aiRequestRepository.findAll().stream()
                .filter(r -> r.getBusiness().getId().equals(businessId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AIRequestDTO.Response mapToResponse(AIRequest req) {
        return AIRequestDTO.Response.builder()
                .id(req.getId())
                .businessId(req.getBusiness().getId())
                .userId(req.getUser().getId())
                .prompt(req.getPrompt())
                .response(req.getResponse())
                .requestType(req.getRequestType())
                .tokensUsed(req.getTokensUsed())
                .costEstimate(req.getCostEstimate())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .build();
    }
}
