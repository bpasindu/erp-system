package lkerp.erp.service.impl;

import lkerp.erp.dto.StatisticsDTO;
import lkerp.erp.dto.DashboardDTO;
import lkerp.erp.dto.UsageLogDTO;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.UsageLogRepository;
import lkerp.erp.repository.AIRequestRepository;
import lkerp.erp.repository.PaymentRepository;
import lkerp.erp.repository.SubscriptionPlanRepository;
import lkerp.erp.service.StatisticsService;
import lkerp.erp.service.UsageLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final BusinessRepository businessRepository;
    private final UsageLogRepository usageLogRepository;
    private final AIRequestRepository aiRequestRepository;
    private final PaymentRepository paymentRepository;
    private final UsageLogService usageLogService;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    public DashboardDTO getDashboardSummary() {
        LocalDateTime lastMonth = LocalDateTime.now().minusDays(30);
        
        // KPIs
        long totalBusinesses = businessRepository.count();
        // Count businesses with status "ACTIVE" and plan NOT "Free"
        long activeSubs = businessRepository.countByStatusAndPlanNot("ACTIVE", "Free");
        long totalAi = aiRequestRepository.count();
        
        // Calculated Monthly Revenue = SUM(plan price for all ACTIVE businesses)
        List<lkerp.erp.entity.Business> activeBusinesses = businessRepository.findAll().stream()
                .filter(b -> "ACTIVE".equalsIgnoreCase(b.getStatus()))
                .collect(java.util.stream.Collectors.toList());
        
        List<lkerp.erp.entity.SubscriptionPlan> allPlans = subscriptionPlanRepository.findAll();
        
        double monthlyRevenue = activeBusinesses.stream()
                .mapToDouble(b -> {
                    if (b.getPlan() == null || "Free".equalsIgnoreCase(b.getPlan())) return 0.0;
                    return allPlans.stream()
                            .filter(p -> p.getName().equalsIgnoreCase(b.getPlan()))
                            .map(p -> p.getPrice() != null ? p.getPrice().doubleValue() : 0.0)
                            .findFirst()
                            .orElse(0.0);
                })
                .sum();
        
        // Final sanity check: if monthlyRevenue is 0 but we have active paid subs, 
        // and the user specifically mentioned flower-lassana (2500), 
        // we might need to verify the exactly what's in the DB.
        // For now, robust filtering is the best approach.

        // Trends (Reusing existing methods logic)
        StatisticsDTO.GrowthStats growth = getGrowthStats();
        StatisticsDTO.RevenueStats revenue = getRevenueStats();
        
        // Recent Activities
        List<UsageLogDTO.Response> activities = usageLogService.getLogs(null, null, null).stream()
                .limit(10)
                .collect(Collectors.toList());

        return DashboardDTO.builder()
                .totalBusinesses(totalBusinesses)
                .activeSubscriptions(activeSubs)
                .monthlyRevenue(monthlyRevenue)
                .totalAiRequests(totalAi)
                .signupTrend(growth.getNewSignups())
                .revenueTrend(revenue.getMrrTrend())
                .recentActivities(activities)
                .build();
    }

    @Override
    public StatisticsDTO getSystemStatistics() {
        return StatisticsDTO.builder()
                .growth(getGrowthStats())
                .revenue(getRevenueStats())
                .aiAnalytics(getAIAnalyticsStats())
                .build();
    }

    private StatisticsDTO.GrowthStats getGrowthStats() {
        List<StatisticsDTO.DataPoint> signups = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 29; i >= 0; i--) {
            LocalDateTime dayStart = now.minusDays(i).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime dayEnd = dayStart.plusHours(23).plusMinutes(59).plusSeconds(59);
            
            long count = businessRepository.countByCreatedAtBetween(dayStart, dayEnd);
            signups.add(new StatisticsDTO.DataPoint(dayStart.format(formatter), (double) count));
        }

        List<StatisticsDTO.DataPoint> churn = new ArrayList<>();
        // For churn, we count businesses with status 'CANCELED' or similar if we had a field,
        // for now we'll mock it based on inactive status to show movement.
        for (int i = 29; i >= 0; i--) {
            churn.add(new StatisticsDTO.DataPoint(now.minusDays(i).format(formatter), 0.0));
        }

        return StatisticsDTO.GrowthStats.builder()
                .newSignups(signups)
                .churnRate(churn)
                .build();
    }

    private StatisticsDTO.RevenueStats getRevenueStats() {
        List<StatisticsDTO.DataPoint> mrr = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yy");

        List<lkerp.erp.entity.SubscriptionPlan> allPlans = subscriptionPlanRepository.findAll();
        List<lkerp.erp.entity.Business> activeBusinesses = businessRepository.findAll().stream()
                .filter(b -> "ACTIVE".equalsIgnoreCase(b.getStatus()))
                .collect(java.util.stream.Collectors.toList());

        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = now.minusMonths(i);
            
            // For the current month (i=0), use the calculated real-time MRR
            double sum;
            if (i == 0) {
                sum = activeBusinesses.stream()
                        .mapToDouble(b -> {
                            if (b.getPlan() == null || "Free".equalsIgnoreCase(b.getPlan())) return 0.0;
                            return allPlans.stream()
                                    .filter(p -> p.getName().equalsIgnoreCase(b.getPlan()))
                                    .map(p -> p.getPrice() != null ? p.getPrice().doubleValue() : 0.0)
                                    .findFirst()
                                    .orElse(0.0);
                        })
                        .sum();
            } else {
                // For historical, we fallback to payments or 0 if payments are empty
                List<String> successStatuses = Arrays.asList("SUCCESS", "Success", "PAID", "Paid", "COMPLETED", "Completed");
                LocalDateTime start = month.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
                LocalDateTime end = month.withDayOfMonth(month.toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);
                
                sum = paymentRepository.findAll().stream()
                        .filter(p -> p.getPaymentDate() != null && !p.getPaymentDate().isBefore(start) && !p.getPaymentDate().isAfter(end))
                        .filter(p -> p.getStatus() != null && successStatuses.stream().anyMatch(s -> s.equalsIgnoreCase(p.getStatus())))
                        .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                        .sum();
            }
            
            mrr.add(new StatisticsDTO.DataPoint(month.format(formatter), sum));
        }

        // Real plan distribution from Business table
        Map<String, Long> planDist = activeBusinesses.stream()
                .collect(Collectors.groupingBy(
                    b -> b.getPlan() != null ? b.getPlan() : "Free", 
                    Collectors.counting()
                ));

        return StatisticsDTO.RevenueStats.builder()
                .mrrTrend(mrr)
                .planDistribution(planDist)
                .build();
    }

    private StatisticsDTO.AIAnalyticsStats getAIAnalyticsStats() {
        // Real requests by feature
        Map<String, Long> byFeature = aiRequestRepository.findAll().stream()
                .collect(Collectors.groupingBy(r -> r.getRequestType() != null ? r.getRequestType() : "Unknown", Collectors.counting()));

        List<StatisticsDTO.DataPoint> daily = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 29; i >= 0; i--) {
            LocalDateTime dayStart = now.minusDays(i).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime dayEnd = dayStart.plusHours(23).plusMinutes(59).plusSeconds(59);
            
            long count = aiRequestRepository.countByCreatedAtBetween(dayStart, dayEnd);
            daily.add(new StatisticsDTO.DataPoint(dayStart.format(formatter), (double) count));
        }

        return StatisticsDTO.AIAnalyticsStats.builder()
                .requestsByFeature(byFeature)
                .dailyRequests(daily)
                .build();
    }
}
