package lkerp.erp.controller;

import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.UsageLogDTO;
import lkerp.erp.service.UsageLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UsageLogService usageLogService;

    @GetMapping("/usage-logs")
    public ResponseEntity<ApiResponse<List<UsageLogDTO.Response>>> getUsageLogs(
            @RequestParam(required = false) Long businessId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<UsageLogDTO.Response> logs = usageLogService.getLogs(businessId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Usage logs retrieved", logs));
    }
}
