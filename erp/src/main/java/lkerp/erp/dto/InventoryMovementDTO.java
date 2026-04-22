package lkerp.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lkerp.erp.entity.StockMovement;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovementDTO {
    private Long id;
    private Long productId;
    private String productName;
    private Long batchId;
    private String batchNumber;
    private Long warehouseId;
    private String warehouseName;
    private String movementType;
    private Integer quantity;
    private BigDecimal costPrice;
    private LocalDateTime createdAt;

    /** Maps from StockMovement (inventory movement record) to DTO. */
    public static InventoryMovementDTO fromStockMovement(StockMovement movement) {
        return InventoryMovementDTO.builder()
                .id(movement.getId())
                .productId(movement.getProduct().getId())
                .productName(movement.getProduct().getName())
                .batchId(movement.getBatch() != null ? movement.getBatch().getId() : null)
                .batchNumber(movement.getBatch() != null ? movement.getBatch().getBatchNumber() : null)
                .warehouseId(movement.getWarehouse().getId())
                .warehouseName(movement.getWarehouse().getName())
                .movementType(movement.getType())
                .quantity(movement.getQuantity())
                .costPrice(movement.getBatch() != null ? movement.getBatch().getCostPrice() : null)
                .createdAt(movement.getMovementDate())
                .build();
    }
}