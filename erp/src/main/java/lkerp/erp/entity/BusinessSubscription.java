package lkerp.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "business_subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlan plan;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status; // ACTIVE, EXPIRED, CANCELED
}
