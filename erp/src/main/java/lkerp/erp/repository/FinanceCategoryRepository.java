package lkerp.erp.repository;

import lkerp.erp.entity.FinanceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinanceCategoryRepository extends JpaRepository<FinanceCategory, Long> {
}
