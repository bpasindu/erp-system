package lkerp.erp.service.impl;

import lkerp.erp.dto.UsageLogDTO;
import lkerp.erp.entity.UsageLog;
import lkerp.erp.repository.UsageLogRepository;
import lkerp.erp.service.UsageLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsageLogServiceImpl implements UsageLogService {

    private final UsageLogRepository usageLogRepository;

    @Override
    public void log(Long businessId, Long userId, String action, String description) {
        UsageLog log = UsageLog.builder()
                .businessId(businessId)
                .userId(userId)
                .action(action)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
        usageLogRepository.save(log);
    }

    @Override
    public List<UsageLogDTO.Response> getLogs(Long businessId, LocalDateTime startDate, LocalDateTime endDate) {
        List<UsageLog> logs;

        if (businessId != null && startDate != null && endDate != null) {
            logs = usageLogRepository.findByBusinessIdAndDateRange(businessId, startDate, endDate);
        } else if (startDate != null && endDate != null) {
            logs = usageLogRepository.findByDateRange(startDate, endDate);
        } else if (businessId != null) {
            logs = usageLogRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        } else {
            logs = usageLogRepository.findByOrderByCreatedAtDesc();
        }

        return logs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private UsageLogDTO.Response mapToResponse(UsageLog log) {
        return UsageLogDTO.Response.builder()
                .id(log.getId())
                .businessId(log.getBusinessId())
                .userId(log.getUserId())
                .action(log.getAction())
                .description(log.getDescription())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
