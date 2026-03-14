package lkerp.erp.service.impl;

import lkerp.erp.dto.ProductDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.Product;
import lkerp.erp.entity.ProductCategory;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.ProductCategoryRepository;
import lkerp.erp.repository.ProductRepository;
import lkerp.erp.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BusinessRepository businessRepository;
    private final ProductCategoryRepository categoryRepository;

    @Override
    public ProductDTO.Response createProduct(ProductDTO.Request request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + request.getBusinessId()));

        ProductCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        int initialStock = request.getStockQuantity() != null ? request.getStockQuantity() : 0;
        Product product = Product.builder()
                .business(business)
                .category(category)
                .name(request.getName())
                .sku(request.getSku())
                .description(request.getDescription())
                .price(request.getPrice())
                .cost(request.getCost())
                .stockQuantity(initialStock)
                .createdAt(LocalDateTime.now())
                .build();

        Product saved = productRepository.save(product);
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
    public ProductDTO.Response updateProduct(Long id, ProductDTO.Request request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        ProductCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        product.setCategory(category);
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCost(request.getCost());
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    private ProductDTO.Response mapToResponse(Product product) {
        return ProductDTO.Response.builder()
                .id(product.getId())
                .businessId(product.getBusiness().getId())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .name(product.getName())
                .sku(product.getSku())
                .description(product.getDescription())
                .price(product.getPrice())
                .cost(product.getCost())
                .stockQuantity(product.getStockQuantity())  
                .createdAt(product.getCreatedAt())
                .build();
    }
}
