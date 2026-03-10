package lkerp.erp.controller;

import jakarta.validation.Valid;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.SubscriptionDTO;
import lkerp.erp.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/plans")
    public ResponseEntity<ApiResponse<SubscriptionDTO.PlanResponse>> createPlan(
            @Valid @RequestBody SubscriptionDTO.PlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Plan created", subscriptionService.createPlan(request)));
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<SubscriptionDTO.PlanResponse>>> getAllPlans() {
        return ResponseEntity.ok(ApiResponse.success("Plans retrieved", subscriptionService.getAllPlans()));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<SubscriptionDTO.BusinessSubscriptionResponse>> subscribeBusiness(
            @Valid @RequestBody SubscriptionDTO.BusinessSubscriptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business subscribed", subscriptionService.subscribeBusiness(request)));
    }

    @GetMapping("/active/business/{businessId}")
    public ResponseEntity<ApiResponse<SubscriptionDTO.BusinessSubscriptionResponse>> getActiveSubscription(
            @PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success("Subscription retrieved", subscriptionService.getActiveSubscription(businessId)));
    }
}
