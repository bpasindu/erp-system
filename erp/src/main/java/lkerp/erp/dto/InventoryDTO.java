package lkerp.erp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class InventoryDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockMovementRequest {
        @NotNull(message = "Business ID is required")
        private Long businessId;

        @NotNull(message = "Warehouse ID is required")
        private Long warehouseId;

        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be greater than zero")
        private Integer quantity;

        @NotBlank(message = "Type is required (IN/OUT)")
        private String type;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockMovementResponse {
        private Long id;
        private Long businessId;
        private Long warehouseId;
        private Long productId;
        private Integer quantity;
        private String type;
        private LocalDateTime movementDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryBalanceResponse {
        private Long id;
        private Long businessId;
        private Long warehouseId;
        private Long productId;
        private Integer quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddStockResponse {
        private Long movementId;
        private Long batchId;
        private Long productId;
        private Long warehouseId;
        private Integer quantityAdded;
        private Integer newWarehouseBalance;
        private Integer newProductTotalQuantity;
    }
}
