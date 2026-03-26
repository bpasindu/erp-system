package lkerp.erp.repository;

import lkerp.erp.entity.AIRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIRequestRepository extends JpaRepository<AIRequest, Long> {
    List<AIRequest> findAllByOrderByCreatedAtDesc();
    List<AIRequest> findByIsFlaggedTrueAndIsReviewedFalseOrderByCreatedAtDesc();
}
