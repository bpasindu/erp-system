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
        @NotNull(message = "Business ID is required")
        private Long businessId;

        private Long categoryId;

        @NotBlank(message = "Name is required")
        private String name;

        private String sku;
        private String description;

        @NotNull(message = "Price is required")
        @PositiveOrZero(message = "Price must be positive or zero")
        private BigDecimal price;

        @NotNull(message = "Cost is required")
        @PositiveOrZero(message = "Cost must be positive or zero")
        private BigDecimal cost;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long businessId;
        private Long categoryId;
        private String name;
        private String sku;
        private String description;
        private BigDecimal price;
        private BigDecimal cost;
        private LocalDateTime createdAt;
    }
}
