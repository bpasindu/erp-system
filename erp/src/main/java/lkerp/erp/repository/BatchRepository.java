package lkerp.erp.repository;

import lkerp.erp.entity.Batch;
import lkerp.erp.entity.Product;
import lkerp.erp.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {

    Optional<Batch> findByProductAndWarehouseAndBatchNumber(Product product, Warehouse warehouse, String batchNumber);
}
