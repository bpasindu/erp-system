package lkerp.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Lob
    private String prompt;
    
    @Lob
    private String response;

    @Lob
    private String imageUrl;

    private String requestType; // EMAIL, INSIGHT, SUMMARY, MARKETING
    private Integer tokensUsed;
    private Double costEstimate;
    private String status; // SUCCESS, FAILED, PENDING
    
    @Builder.Default
    private Boolean isFlagged = false;
    
    @Builder.Default
    private Boolean isReviewed = false;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
