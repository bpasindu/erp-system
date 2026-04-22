package lkerp.erp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Entity
@Table(name = "businesses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String currency;
    private String status;
    private String plan;
    
    @Column(name = "owner_email")
    private String ownerEmail;

    @Column(name = "business_email")
    private String email;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_active_at")
    @Builder.Default
    private LocalDateTime lastActiveAt = LocalDateTime.now();

    // Relationships
    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<User> users;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<Customer> customers;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<Supplier> suppliers;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<ProductCategory> categories;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<Product> products;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL)
    private List<Warehouse> warehouses;

}