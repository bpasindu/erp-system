package lkerp.erp.service.impl;

import lkerp.erp.dto.ProductDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.Product;
import lkerp.erp.entity.ProductCategory;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.ProductCategoryRepository;
import lkerp.erp.repository.ProductRepository;
import lkerp.erp.repository.SupplierRepository;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.service.ProductService;
import lkerp.erp.service.UsageLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BusinessRepository businessRepository;
    private final ProductCategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final UsageLogService usageLogService;

    @Override
    public ProductDTO.Response createProduct(ProductDTO.Request request) {
        if (request.getId() != null) {
            return updateProduct(request.getId(), request);
        }

        // Note: Field mapping for price/sellingPrice and cost/buyingPrice
        BigDecimal finalPrice = request.getSellingPrice() != null ? request.getSellingPrice() : request.getPrice();
        BigDecimal finalCost = request.getBuyingPrice() != null ? request.getBuyingPrice() : request.getCost();

        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + request.getBusinessId()));

        ProductCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        lkerp.erp.entity.Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        }

        int initialStock = request.getStockQuantity() != null ? request.getStockQuantity() : 0;
        Product product = Product.builder()
                .business(business)
                .category(category)
                .supplier(supplier)
                .name(request.getName())
                .sku(request.getSku())
                .description(request.getDescription())
                .price(finalPrice)
                .cost(finalCost)
                .stockQuantity(initialStock)
                .reorderLevel(request.getReorderLevel())
                .createdAt(LocalDateTime.now())
                .build();

        Product saved = productRepository.save(product);
        
        usageLogService.log(business.getId(), null, "CREATE_PRODUCT", "Created new product: " + saved.getName(), "Inventory", "127.0.0.1", "Success");

        return mapToResponse(saved);
    }

    @Override
    public ProductDTO.Response getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Override
    public List<ProductDTO.Response> getProductsByBusiness(Long businessId) {
        return productRepository.findAll().stream()
                .filter(p -> p.getBusiness().getId().equals(businessId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO.Response> getProductsBySupplier(Long supplierId) {
        return productRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDTO.Response updateProduct(Long id, ProductDTO.Request request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        ProductCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        lkerp.erp.entity.Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        }

        BigDecimal finalPrice = request.getSellingPrice() != null ? request.getSellingPrice() : request.getPrice();
        BigDecimal finalCost = request.getBuyingPrice() != null ? request.getBuyingPrice() : request.getCost();

        product.setCategory(category);
        product.setSupplier(supplier);
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setPrice(finalPrice);
        product.setCost(finalCost);
        product.setReorderLevel(request.getReorderLevel());
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }

        Product updated = productRepository.save(product);

        usageLogService.log(updated.getBusiness().getId(), null, "UPDATE_PRODUCT", "Updated product: " + updated.getName(), "Inventory", "127.0.0.1", "Success");

        return mapToResponse(updated);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        Long businessId = product.getBusiness().getId();
        String name = product.getName();
        
        productRepository.deleteById(id);

        usageLogService.log(businessId, null, "DELETE_PRODUCT", "Deleted product: " + name, "Inventory", "127.0.0.1", "Success");
    }

    private ProductDTO.Response mapToResponse(Product product) {
        return ProductDTO.Response.builder()
                .id(product.getId())
                .businessId(product.getBusiness().getId())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .supplierId(product.getSupplier() != null ? product.getSupplier().getId() : null)
                .name(product.getName())
                .sku(product.getSku())
                .description(product.getDescription())
                .price(product.getPrice())
                .cost(product.getCost())
                .sellingPrice(product.getPrice())
                .buyingPrice(product.getCost())
                .stockQuantity(product.getStockQuantity())
                .reorderLevel(product.getReorderLevel())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
