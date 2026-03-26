package lkerp.erp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private Long id; // Used for updates

        @NotNull(message = "Business ID is required")
        private Long businessId;

        private Long categoryId;
        private Long supplierId;

        @NotBlank(message = "Name is required")
        private String name;

        private String sku;
        private String description;

        @NotNull(message = "Price is required")
        @PositiveOrZero(message = "Price must be positive or zero")
        private BigDecimal price; // Standard field

        private BigDecimal sellingPrice; // Frontend alias
        private BigDecimal buyingPrice;  // Frontend alias

        @NotNull(message = "Cost is required")
        @PositiveOrZero(message = "Cost must be positive or zero")
        private BigDecimal cost;

        @PositiveOrZero(message = "Stock quantity must be positive or zero")
        private Integer stockQuantity;

        private Integer reorderLevel;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long businessId;
        private Long categoryId;
        private Long supplierId;
        private String name;
        private String sku;
        private String description;
        private BigDecimal price;
        private BigDecimal cost;
        private BigDecimal sellingPrice;
        private BigDecimal buyingPrice;
        private Integer stockQuantity;
        private Integer reorderLevel;
        private LocalDateTime createdAt;
    }
}
