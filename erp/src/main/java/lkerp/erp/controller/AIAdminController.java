package lkerp.erp.controller;

import lkerp.erp.dto.AIRequestDTO;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.service.AIRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
public class AIAdminController {

    private final AIRequestService aiRequestService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AIRequestDTO.Summary>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success("AI Usage Summary fetched", aiRequestService.getAIUsageSummary()));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<AIRequestDTO.Response>>> getAllRequests() {
        return ResponseEntity.ok(ApiResponse.success("All AI Requests fetched", aiRequestService.getAllRequests()));
    }

    @GetMapping("/flagged")
    public ResponseEntity<ApiResponse<List<AIRequestDTO.Response>>> getFlaggedRequests() {
        return ResponseEntity.ok(ApiResponse.success("Flagged AI Requests fetched", aiRequestService.getFlaggedRequests()));
    }

    @PutMapping("/requests/{id}/review")
    public ResponseEntity<ApiResponse<AIRequestDTO.Response>> markAsReviewed(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("AI Request marked as reviewed", aiRequestService.markAsReviewed(id)));
    }
}
