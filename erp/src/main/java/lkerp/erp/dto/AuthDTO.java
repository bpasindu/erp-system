package lkerp.erp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        @NotBlank(message = "Role is required")
        private String role; // e.g., ADMIN, BUSINESS_OWNER, STAFF
        
        private Long businessId; // Optional for admin, required for business owners/staff
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private Long userId;
        private String email;
        private String role;
        private Long businessId;
    }
}
