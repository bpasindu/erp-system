package lkerp.erp.repository;

import lkerp.erp.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByStatusAndPaymentDateAfter(String status, LocalDateTime date);
    List<Payment> findByStatusAndPaymentDateBetween(String status, LocalDateTime start, LocalDateTime end);
}
