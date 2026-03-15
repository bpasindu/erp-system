package lkerp.erp.service;

import lkerp.erp.dto.UsageLogDTO;
import java.time.LocalDateTime;
import java.util.List;

public interface UsageLogService {
    void log(Long businessId, Long userId, String action, String description);
    List<UsageLogDTO.Response> getLogs(Long businessId, LocalDateTime startDate, LocalDateTime endDate);
}
