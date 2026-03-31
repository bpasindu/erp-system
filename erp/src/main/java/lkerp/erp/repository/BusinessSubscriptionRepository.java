package lkerp.erp.repository;

import lkerp.erp.entity.BusinessSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessSubscriptionRepository extends JpaRepository<BusinessSubscription, Long> {
    long countByStatus(String status);
}
