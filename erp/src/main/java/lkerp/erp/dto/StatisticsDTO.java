package lkerp.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsDTO {

    private GrowthStats growth;
    private RevenueStats revenue;
    private EngagementStats engagement;
    private AIAnalyticsStats aiAnalytics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GrowthStats {
        private List<DataPoint> newSignups;
        private List<DataPoint> churnRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueStats {
        private List<DataPoint> mrrTrend;
        private Map<String, Long> planDistribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EngagementStats {
        private List<DataPoint> dau;
        private List<DataPoint> mau;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AIAnalyticsStats {
        private Map<String, Long> requestsByFeature;
        private List<DataPoint> dailyRequests;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DataPoint {
        private String label;
        private Double value;
    }
}
