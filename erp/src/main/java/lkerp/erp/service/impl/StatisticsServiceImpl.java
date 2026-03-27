package lkerp.erp.service.impl;

import lkerp.erp.dto.StatisticsDTO;
import lkerp.erp.dto.DashboardDTO;
import lkerp.erp.dto.UsageLogDTO;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.BusinessSubscriptionRepository;
import lkerp.erp.repository.UsageLogRepository;
import lkerp.erp.repository.AIRequestRepository;
import lkerp.erp.repository.PaymentRepository;
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
    private final BusinessSubscriptionRepository businessSubscriptionRepository;
    private final UsageLogRepository usageLogRepository;
    private final AIRequestRepository aiRequestRepository;
    private final PaymentRepository paymentRepository;
    private final UsageLogService usageLogService;

    @Override
    public DashboardDTO getDashboardSummary() {
        LocalDateTime lastMonth = LocalDateTime.now().minusDays(30);
        
        // KPIs
        long totalBusinesses = businessRepository.count();
        long activeSubs = businessSubscriptionRepository.countByStatus("ACTIVE");
        long totalAi = aiRequestRepository.count();
        
        double monthlyRevenue = paymentRepository.findByStatusAndPaymentDateAfter("SUCCESS", lastMonth).stream()
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                .sum();

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

        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = now.minusMonths(i);
            LocalDateTime start = month.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime end = month.withDayOfMonth(month.toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);
            
            double sum = paymentRepository.findByStatusAndPaymentDateBetween("SUCCESS", start, end).stream()
                    .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                    .sum();
            
            mrr.add(new StatisticsDTO.DataPoint(month.format(formatter), sum));
        }

        // Real plan distribution
        Map<String, Long> planDist = businessSubscriptionRepository.findAll().stream()
                .filter(s -> s.getPlan() != null)
                .collect(Collectors.groupingBy(s -> s.getPlan().getName(), Collectors.counting()));

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
