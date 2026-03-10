package lkerp.erp.service;

public interface AuditLogService {
    void logAction(Long actorUserId, String action, String entityType, Long entityId, String ipAddress, String userAgent);
}
