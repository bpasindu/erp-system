package lkerp.erp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class CustomerDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private Long id; // Used for updates

        @NotNull(message = "Business ID is required")
        private Long businessId;

        @NotBlank(message = "Name is required")
        private String name;

        @Email(message = "Invalid email format")
        private String email;

        private String phone;
        private String address;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long businessId;
        private String name;
        private String email;
        private String phone;
        private String address;
        private String notes;
        private LocalDateTime createdAt;
    }
}
