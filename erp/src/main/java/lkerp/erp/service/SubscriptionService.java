package lkerp.erp.service;

import lkerp.erp.dto.SubscriptionDTO;
import java.util.List;

public interface SubscriptionService {
    SubscriptionDTO.PlanResponse createPlan(SubscriptionDTO.PlanRequest request);
    List<SubscriptionDTO.PlanResponse> getAllPlans();
    
    SubscriptionDTO.BusinessSubscriptionResponse subscribeBusiness(SubscriptionDTO.BusinessSubscriptionRequest request);
    SubscriptionDTO.BusinessSubscriptionResponse getActiveSubscription(Long businessId);
}
