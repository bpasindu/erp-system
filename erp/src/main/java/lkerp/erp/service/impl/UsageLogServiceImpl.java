package lkerp.erp.service.impl;

import lkerp.erp.dto.UsageLogDTO;
import lkerp.erp.entity.UsageLog;
import lkerp.erp.repository.UsageLogRepository;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.UserRepository;
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
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    @Override
    public void log(Long businessId, Long userId, String action, String description, String module, String ip, String result) {
        UsageLog log = UsageLog.builder()
                .businessId(businessId)
                .userId(userId)
                .action(action)
                .module(module)
                .ip(ip)
                .result(result)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
        usageLogRepository.save(log);

        if (businessId != null) {
            businessRepository.findById(businessId).ifPresent(b -> {
                b.setLastActiveAt(LocalDateTime.now());
                businessRepository.save(b);
            });
        }
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
        String businessName = "System";
        if (log.getBusinessId() != null) {
            businessName = businessRepository.findById(log.getBusinessId())
                    .map(b -> b.getName())
                    .orElse("Unknown Business");
        }

        String userName = "System";
        if (log.getUserId() != null) {
            userName = userRepository.findById(log.getUserId())
                    .map(u -> u.getEmail())
                    .orElse("Unknown User");
        }

        return UsageLogDTO.Response.builder()
                .id(log.getId())
                .businessId(log.getBusinessId())
                .businessName(businessName)
                .userId(log.getUserId())
                .userName(userName)
                .action(log.getAction())
                .module(log.getModule())
                .ip(log.getIp())
                .result(log.getResult())
                .description(log.getDescription())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
