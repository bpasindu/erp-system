package lkerp.erp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class AIRequestDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotNull(message = "Business ID is required")
        private Long businessId;

        @NotNull(message = "User ID is required")
        private Long userId;

        @NotBlank(message = "Prompt is required")
        private String prompt;

        @NotBlank(message = "Request type is required")
        private String requestType; // EMAIL, INSIGHT, SUMMARY, MARKETING
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long businessId;
        private Long userId;
        private String prompt;
        private String response;
        private String imageUrl;
        private String requestType;
        private Integer tokensUsed;
        private Double costEstimate;
        private String status;
        private String businessName;
        private Boolean isFlagged;
        private Boolean isReviewed;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long totalRequests;
        private Double avgRequestsPerBusiness;
        private String topFeature;
        private Double totalCostEstimate;
    }
}
