package lkerp.erp.dto;

import lombok.*;
import java.time.LocalDateTime;

public class ComplaintDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private Long businessId;
        private Long customerId;
        private String subject;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long businessId;
        private Long customerId;
        private String customerName;
        private String subject;
        private String description;
        private String status;
        private LocalDateTime createdAt;
    }
}
