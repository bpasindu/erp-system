package lkerp.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private Long totalBusinesses;
    private Long activeSubscriptions;
    private Double monthlyRevenue;
    private Long totalAiRequests;
    private List<StatisticsDTO.DataPoint> signupTrend;
    private List<StatisticsDTO.DataPoint> revenueTrend;
    private List<UsageLogDTO.Response> recentActivities;
}
