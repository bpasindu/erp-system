package lkerp.erp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SubscriptionDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanRequest {
        @NotBlank(message = "Plan name is required")
        private String name;

        private String description;

        @NotNull(message = "Price is required")
        private BigDecimal price;

        @NotNull(message = "Duration in days is required")
        private Integer durationDays;

        @NotNull(message = "Max users limit is required")
        private Integer maxUsers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer durationDays;
        private Integer maxUsers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusinessSubscriptionRequest {
        @NotNull(message = "Business ID is required")
        private Long businessId;

        @NotNull(message = "Plan ID is required")
        private Long planId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusinessSubscriptionResponse {
        private Long id;
        private Long businessId;
        private Long planId;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String status;
    }
}
