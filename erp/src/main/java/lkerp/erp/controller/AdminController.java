package lkerp.erp.controller;

import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.UsageLogDTO;
import lkerp.erp.dto.StatisticsDTO;
import lkerp.erp.dto.DashboardDTO;
import lkerp.erp.service.UsageLogService;
import lkerp.erp.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" }, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UsageLogService usageLogService;
    private final StatisticsService statisticsService;

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<StatisticsDTO>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success("System statistics retrieved", statisticsService.getSystemStatistics()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardDTO>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved", statisticsService.getDashboardSummary()));
    }

    @GetMapping("/usage-logs")
    public ResponseEntity<ApiResponse<List<UsageLogDTO.Response>>> getUsageLogs(
            @RequestParam(required = false) Long businessId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<UsageLogDTO.Response> logs = usageLogService.getLogs(businessId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Usage logs retrieved", logs));
    }
}
