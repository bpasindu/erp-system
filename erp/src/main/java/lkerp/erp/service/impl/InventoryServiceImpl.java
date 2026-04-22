package lkerp.erp.service.impl;

import lkerp.erp.dto.AddStockRequestDTO;
import lkerp.erp.dto.InventoryDTO;
import lkerp.erp.entity.Batch;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.InventoryBalance;
import lkerp.erp.entity.Product;
import lkerp.erp.entity.StockMovement;
import lkerp.erp.entity.Warehouse;
import lkerp.erp.exception.BadRequestException;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BatchRepository;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.InventoryBalanceRepository;
import lkerp.erp.repository.ProductRepository;
import lkerp.erp.repository.StockMovementRepository;
import lkerp.erp.repository.WarehouseRepository;
import lkerp.erp.service.InventoryService;
import lkerp.erp.service.UsageLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final StockMovementRepository stockMovementRepository;
    private final InventoryBalanceRepository inventoryBalanceRepository;
    private final BatchRepository batchRepository;
    private final BusinessRepository businessRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final UsageLogService usageLogService;

    @Override
    @Transactional
    public InventoryDTO.StockMovementResponse recordStockMovement(InventoryDTO.StockMovementRequest request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!request.getType().equalsIgnoreCase("IN") && !request.getType().equalsIgnoreCase("OUT")) {
            throw new BadRequestException("Movement type must be IN or OUT");
        }

        // Handle Balance
        Optional<InventoryBalance> balanceOpt = inventoryBalanceRepository
                .findByBusinessAndWarehouseAndProduct(business, warehouse, product);
        
        InventoryBalance balance;
        if (request.getType().equalsIgnoreCase("IN")) {
            if (balanceOpt.isPresent()) {
                balance = balanceOpt.get();
                balance.setQuantity(balance.getQuantity() + request.getQuantity());
            } else {
                balance = InventoryBalance.builder()
                        .business(business)
                        .warehouse(warehouse)
                        .product(product)
                        .quantity(request.getQuantity())
                        .build();
            }
        } else { // OUT
            if (balanceOpt.isPresent()) {
                balance = balanceOpt.get();
                if (balance.getQuantity() < request.getQuantity()) {
                    throw new BadRequestException("Insufficient stock for product " + product.getName() 
                            + " in warehouse. Current: " + balance.getQuantity() + ", Required: " + request.getQuantity());
                }
                balance.setQuantity(balance.getQuantity() - request.getQuantity());
            } else {
                throw new BadRequestException("No stock found for product " + product.getName() + " in this warehouse.");
            }
        }
        
        inventoryBalanceRepository.save(balance);

        StockMovement movement = StockMovement.builder()
                .business(business)
                .warehouse(warehouse)
                .product(product)
                .quantity(request.getQuantity())
                .type(request.getType().toUpperCase())
                .movementDate(LocalDateTime.now())
                .build();
                
        StockMovement saved = stockMovementRepository.save(movement);
        
        return InventoryDTO.StockMovementResponse.builder()
                .id(saved.getId())
                .businessId(business.getId())
                .warehouseId(warehouse.getId())
                .productId(product.getId())
                .quantity(saved.getQuantity())
                .type(saved.getType())
                .movementDate(saved.getMovementDate())
                .build();
    }

    @Override
    @Transactional
    public InventoryDTO.AddStockResponse addStock(AddStockRequestDTO request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + request.getWarehouseId()));
        Business business = product.getBusiness();
        if (warehouse.getBusiness() == null || !warehouse.getBusiness().getId().equals(business.getId())) {
            throw new BadRequestException("Warehouse does not belong to the product's business");
        }

        // Find or create batch
        Batch batch = batchRepository
                .findByProductAndWarehouseAndBatchNumber(product, warehouse, request.getBatchNumber())
                .orElseGet(() -> {
                    Batch newBatch = Batch.builder()
                            .business(business)
                            .warehouse(warehouse)
                            .product(product)
                            .batchNumber(request.getBatchNumber())
                            .quantity(0)
                            .costPrice(request.getCostPrice())
                            .createdAt(LocalDateTime.now())
                            .build();
                    return batchRepository.save(newBatch);
                });

        int qty = request.getQuantity();
        batch.setQuantity(batch.getQuantity() == null ? qty : batch.getQuantity() + qty);
        if (request.getCostPrice() != null) {
            batch.setCostPrice(request.getCostPrice());
        }
        batchRepository.save(batch);

        // Create stock movement (STOCK_IN -> type IN)
        StockMovement movement = StockMovement.builder()
                .business(business)
                .warehouse(warehouse)
                .product(product)
                .quantity(qty)
                .type("IN")
                .batch(batch)
                .movementDate(LocalDateTime.now())
                .build();
        StockMovement savedMovement = stockMovementRepository.save(movement);

        // Update or create inventory balance (warehouse level)
        Optional<InventoryBalance> balanceOpt = inventoryBalanceRepository
                .findByBusinessAndWarehouseAndProduct(business, warehouse, product);
        InventoryBalance balance;
        if (balanceOpt.isPresent()) {
            balance = balanceOpt.get();
            balance.setQuantity(balance.getQuantity() + qty);
        } else {
            balance = InventoryBalance.builder()
                    .business(business)
                    .warehouse(warehouse)
                    .product(product)
                    .quantity(qty)
                    .build();
        }
        inventoryBalanceRepository.save(balance);
        int newWarehouseBalance = balance.getQuantity();

        // Update product total quantity
        int currentTotal = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
        product.setStockQuantity(currentTotal + qty);
        productRepository.save(product);
        int newProductTotal = product.getStockQuantity();

        usageLogService.log(business.getId(), null, "ADD_STOCK", "Added " + qty + " units of " + product.getName() + " to warehouse ID " + warehouse.getId(), "Inventory", "127.0.0.1", "Success");

        return InventoryDTO.AddStockResponse.builder()
                .movementId(savedMovement.getId())
                .batchId(batch.getId())
                .productId(product.getId())
                .warehouseId(warehouse.getId())
                .quantityAdded(qty)
                .newWarehouseBalance(newWarehouseBalance)
                .newProductTotalQuantity(newProductTotal)
                .build();
    }

    @Override
    public List<InventoryDTO.StockMovementResponse> getMovementsByWarehouse(Long warehouseId) {
        return stockMovementRepository.findAll().stream()
                .filter(s -> s.getWarehouse().getId().equals(warehouseId))
                .map(s -> InventoryDTO.StockMovementResponse.builder()
                        .id(s.getId())
                        .businessId(s.getBusiness().getId())
                        .warehouseId(s.getWarehouse().getId())
                        .productId(s.getProduct().getId())
                        .quantity(s.getQuantity())
                        .type(s.getType())
                        .movementDate(s.getMovementDate())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryDTO.InventoryBalanceResponse> getInventoryByBusiness(Long businessId) {
        return inventoryBalanceRepository.findAll().stream()
                .filter(b -> b.getBusiness().getId().equals(businessId))
                .map(b -> InventoryDTO.InventoryBalanceResponse.builder()
                        .id(b.getId())
                        .businessId(b.getBusiness().getId())
                        .warehouseId(b.getWarehouse().getId())
                        .productId(b.getProduct().getId())
                        .quantity(b.getQuantity())
                        .build())
                .collect(Collectors.toList());
    }
}
