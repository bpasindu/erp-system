package lkerp.erp.controller;

import jakarta.validation.Valid;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.AIRequestDTO;
import lkerp.erp.service.AIRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIRequestService aiRequestService;

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<AIRequestDTO.Response>> createRequest(@Valid @RequestBody AIRequestDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("AI Request processed", aiRequestService.createRequest(request)));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<List<AIRequestDTO.Response>>> getRequestsByBusiness(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success("AI requests retrieved", aiRequestService.getRequestsByBusiness(businessId)));
    }
}
