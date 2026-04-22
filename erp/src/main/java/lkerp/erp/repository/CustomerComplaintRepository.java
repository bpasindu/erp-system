package lkerp.erp.repository;

import lkerp.erp.entity.CustomerComplaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomerComplaintRepository extends JpaRepository<CustomerComplaint, Long> {
    List<CustomerComplaint> findByBusinessIdAndStatus(Long businessId, String status);
}
