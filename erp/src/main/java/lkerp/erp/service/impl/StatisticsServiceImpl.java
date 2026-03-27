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
                .engagement(getEngagementStats())
                .aiAnalytics(getAIAnalyticsStats())
                .build();
    }

    private StatisticsDTO.GrowthStats getGrowthStats() {
        // Mocking daily signups for last 30 days based on creation date
        List<StatisticsDTO.DataPoint> signups = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 29; i >= 0; i--) {
            LocalDateTime day = now.minusDays(i);
            String label = day.format(formatter);
            // In a real scenario, we'd countBusinesses created on this day
            signups.add(new StatisticsDTO.DataPoint(label, (double) (Math.random() * 8)));
        }

        List<StatisticsDTO.DataPoint> churn = new ArrayList<>();
        for (int i = 29; i >= 0; i--) {
            churn.add(new StatisticsDTO.DataPoint(now.minusDays(i).format(formatter), Math.random() < 0.2 ? 2.0 : 0.0));
        }

        return StatisticsDTO.GrowthStats.builder()
                .newSignups(signups)
                .churnRate(churn)
                .build();
    }

    private StatisticsDTO.RevenueStats getRevenueStats() {
        List<StatisticsDTO.DataPoint> mrr = new ArrayList<>();
        String[] months = {"Sep", "Oct", "Nov", "Dec", "Jan", "Feb"};
        double val = 280000;
        for (String m : months) {
            val += (Math.random() * 50000);
            mrr.add(new StatisticsDTO.DataPoint(m, val));
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

    private StatisticsDTO.EngagementStats getEngagementStats() {
        List<StatisticsDTO.DataPoint> dau = new ArrayList<>();
        List<StatisticsDTO.DataPoint> mau = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 29; i >= 0; i--) {
            String label = now.minusDays(i).format(formatter);
            dau.add(new StatisticsDTO.DataPoint(label, 5.0 + Math.random() * 15.0));
            mau.add(new StatisticsDTO.DataPoint(label, 15.0 + Math.random() * 20.0));
        }

        return StatisticsDTO.EngagementStats.builder()
                .dau(dau)
                .mau(mau)
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
            daily.add(new StatisticsDTO.DataPoint(now.minusDays(i).format(formatter), 50.0 + Math.random() * 200.0));
        }

        return StatisticsDTO.AIAnalyticsStats.builder()
                .requestsByFeature(byFeature)
                .dailyRequests(daily)
                .build();
    }
}
