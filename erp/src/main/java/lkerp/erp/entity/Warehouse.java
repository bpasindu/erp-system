package lkerp.erp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "warehouses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    private String name;
    private String location;

    @OneToMany(mappedBy = "warehouse")
    @Builder.Default
    private List<StockMovement> stockMovements = new ArrayList<>();

    @OneToMany(mappedBy = "warehouse")
    @Builder.Default
    private List<InventoryBalance> inventoryBalances = new ArrayList<>();

    @OneToMany(mappedBy = "warehouse")
    @Builder.Default
    private List<Batch> batches = new ArrayList<>();
}
