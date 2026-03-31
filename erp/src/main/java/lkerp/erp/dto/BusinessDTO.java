package lkerp.erp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class BusinessDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotBlank(message = "Business name is required")
        private String name;
        @NotBlank(message = "Currency is required")
        private String currency;
        private String status;
        private String plan;
        @NotBlank(message = "Owner email is required")
        private String ownerEmail;
        private String email;
        @NotBlank(message = "Default password is required")
        private String defaultPassword;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String currency;
        private String status;
        private String plan;
        private String ownerEmail;
        private String email;
        private LocalDateTime createdAt;
        private LocalDateTime lastActiveAt;
    }
}
