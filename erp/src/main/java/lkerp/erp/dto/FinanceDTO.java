package lkerp.erp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FinanceDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryRequest {
        @NotNull(message = "Business ID is required")
        private Long businessId;

        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Type is required (INCOME or EXPENSE)")
        private String type;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private Long businessId;
        private String name;
        private String type;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionRequest {
        @NotNull(message = "Business ID is required")
        private Long businessId;

        @NotNull(message = "Category ID is required")
        private Long categoryId;

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be strictly positive")
        private BigDecimal amount;

        private String description;

        @NotBlank(message = "Type is required (INCOME or EXPENSE)")
        private String type;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionResponse {
        private Long id;
        private Long businessId;
        private Long categoryId;
        private BigDecimal amount;
        private String description;
        private String type;
        private LocalDateTime transactionDate;
    }
}
