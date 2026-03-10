package lkerp.erp.repository;

import lkerp.erp.entity.InventoryBalance;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.Warehouse;
import lkerp.erp.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InventoryBalanceRepository extends JpaRepository<InventoryBalance, Long> {
    Optional<InventoryBalance> findByBusinessAndWarehouseAndProduct(Business business, Warehouse warehouse, Product product);
}
