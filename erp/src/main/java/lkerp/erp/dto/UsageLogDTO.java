package lkerp.erp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

public class UsageLogDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long businessId;
        private String businessName;
        private Long userId;
        private String userName;
        private String action;
        private String module;
        private String ip;
        private String result;
        private String description;
        private LocalDateTime createdAt;
    }
}
