package lkerp.erp.config;

import lkerp.erp.entity.SubscriptionPlan;
import lkerp.erp.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    public void run(String... args) throws Exception {
        if (subscriptionPlanRepository.count() == 0) {
            SubscriptionPlan free = SubscriptionPlan.builder()
                    .name("Free")
                    .description("Basic plan for small businesses")
                    .price(BigDecimal.ZERO)
                    .durationDays(30)
                    .maxUsers(1)
                    .build();

            SubscriptionPlan starter = SubscriptionPlan.builder()
                    .name("Starter")
                    .description("Great for growing teams")
                    .price(new BigDecimal("2500.00"))
                    .durationDays(30)
                    .maxUsers(5)
                    .build();

            SubscriptionPlan pro = SubscriptionPlan.builder()
                    .name("Pro")
                    .description("Advanced features for professionals")
                    .price(new BigDecimal("7500.00"))
                    .durationDays(30)
                    .maxUsers(20)
                    .build();

            SubscriptionPlan enterprise = SubscriptionPlan.builder()
                    .name("Enterprise")
                    .description("Full scale solution for large enterprises")
                    .price(new BigDecimal("25000.00"))
                    .durationDays(30)
                    .maxUsers(999)
                    .build();

            subscriptionPlanRepository.saveAll(Arrays.asList(free, starter, pro, enterprise));
            System.out.println("Standard subscription plans initialized.");
        }
    }
}
