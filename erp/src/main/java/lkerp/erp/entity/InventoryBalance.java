package lkerp.erp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory_balances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryBalance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private Integer quantity;
}
