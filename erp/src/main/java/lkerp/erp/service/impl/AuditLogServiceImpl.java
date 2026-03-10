package lkerp.erp.service.impl;

import lkerp.erp.entity.AuditLog;
import lkerp.erp.repository.AuditLogRepository;
import lkerp.erp.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void logAction(Long actorUserId, String action, String entityType, Long entityId, String ipAddress, String userAgent) {
        AuditLog log = AuditLog.builder()
                .actorUserId(actorUserId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }
}
