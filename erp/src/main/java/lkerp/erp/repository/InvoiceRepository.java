package lkerp.erp.repository;

import lkerp.erp.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByBusinessId(Long businessId);
    List<Invoice> findByBusinessIdAndStatus(Long businessId, String status);
    List<Invoice> findByCustomerIdAndStatus(Long customerId, String status);
}
