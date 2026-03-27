package lkerp.erp.repository;

import lkerp.erp.entity.AIRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface AIRequestRepository extends JpaRepository<AIRequest, Long> {
    List<AIRequest> findAllByOrderByCreatedAtDesc();
    List<AIRequest> findByIsFlaggedTrueAndIsReviewedFalseOrderByCreatedAtDesc();
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
