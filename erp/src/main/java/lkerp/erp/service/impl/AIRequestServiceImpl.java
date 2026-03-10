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

@Service
@RequiredArgsConstructor
public class AIRequestServiceImpl implements AIRequestService {

    private final AIRequestRepository aiRequestRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

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
                .status("PENDING") // Status updated by AI engine later
                .createdAt(LocalDateTime.now())
                .build();

        // Simulate AI Response instantly for this mockup ERP
        aiReq.setStatus("SUCCESS");
        aiReq.setResponse("Simulated AI Response for: " + request.getPrompt());
        aiReq.setTokensUsed(150);
        aiReq.setCostEstimate(0.002);

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
