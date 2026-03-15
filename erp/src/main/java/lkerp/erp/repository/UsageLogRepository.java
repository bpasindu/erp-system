package lkerp.erp.repository;

import lkerp.erp.entity.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {

    List<UsageLog> findByOrderByCreatedAtDesc();

    List<UsageLog> findByBusinessIdOrderByCreatedAtDesc(Long businessId);

    @Query("SELECT u FROM UsageLog u WHERE u.createdAt >= :startDate AND u.createdAt <= :endDate ORDER BY u.createdAt DESC")
    List<UsageLog> findByDateRange(
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT u FROM UsageLog u WHERE u.businessId = :businessId AND u.createdAt >= :startDate AND u.createdAt <= :endDate ORDER BY u.createdAt DESC")
    List<UsageLog> findByBusinessIdAndDateRange(
            @Param("businessId") Long businessId, 
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate
    );
}
