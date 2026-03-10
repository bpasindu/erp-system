package lkerp.erp.service.impl;

import lkerp.erp.dto.SubscriptionDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.BusinessSubscription;
import lkerp.erp.entity.SubscriptionPlan;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.BusinessSubscriptionRepository;
import lkerp.erp.repository.SubscriptionPlanRepository;
import lkerp.erp.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final BusinessSubscriptionRepository businessSubscriptionRepository;
    private final BusinessRepository businessRepository;

    @Override
    public SubscriptionDTO.PlanResponse createPlan(SubscriptionDTO.PlanRequest request) {
        SubscriptionPlan plan = SubscriptionPlan.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .durationDays(request.getDurationDays())
                .maxUsers(request.getMaxUsers())
                .build();
        SubscriptionPlan saved = planRepository.save(plan);
        return mapPlanResponse(saved);
    }

    @Override
    public List<SubscriptionDTO.PlanResponse> getAllPlans() {
        return planRepository.findAll().stream()
                .map(this::mapPlanResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SubscriptionDTO.BusinessSubscriptionResponse subscribeBusiness(SubscriptionDTO.BusinessSubscriptionRequest request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
                
        SubscriptionPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        // Set previous active to expired if needed, missing from requirements but logical. Keep it simple.
        
        BusinessSubscription sub = BusinessSubscription.builder()
                .business(business)
                .plan(plan)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(plan.getDurationDays()))
                .status("ACTIVE")
                .build();

        BusinessSubscription saved = businessSubscriptionRepository.save(sub);
        return mapSubResponse(saved);
    }

    @Override
    public SubscriptionDTO.BusinessSubscriptionResponse getActiveSubscription(Long businessId) {
        return businessSubscriptionRepository.findAll().stream()
                .filter(s -> s.getBusiness().getId().equals(businessId) && "ACTIVE".equals(s.getStatus()))
                .findFirst()
                .map(this::mapSubResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No active subscription for business"));
    }

    private SubscriptionDTO.PlanResponse mapPlanResponse(SubscriptionPlan plan) {
        return SubscriptionDTO.PlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .price(plan.getPrice())
                .durationDays(plan.getDurationDays())
                .maxUsers(plan.getMaxUsers())
                .build();
    }

    private SubscriptionDTO.BusinessSubscriptionResponse mapSubResponse(BusinessSubscription sub) {
        return SubscriptionDTO.BusinessSubscriptionResponse.builder()
                .id(sub.getId())
                .businessId(sub.getBusiness().getId())
                .planId(sub.getPlan().getId())
                .startDate(sub.getStartDate())
                .endDate(sub.getEndDate())
                .status(sub.getStatus())
                .build();
    }
}
