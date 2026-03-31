package lkerp.erp.repository;

import lkerp.erp.entity.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByStatusAndPlanNot(String status, String plan);
}
