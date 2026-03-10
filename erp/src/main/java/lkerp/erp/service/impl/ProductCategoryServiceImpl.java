package lkerp.erp.service.impl;

import lkerp.erp.dto.ProductCategoryDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.ProductCategory;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.ProductCategoryRepository;
import lkerp.erp.service.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryServiceImpl implements ProductCategoryService {

    private final ProductCategoryRepository categoryRepository;
    private final BusinessRepository businessRepository;

    @Override
    public ProductCategoryDTO.Response createCategory(ProductCategoryDTO.Request request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + request.getBusinessId()));

        ProductCategory category = ProductCategory.builder()
                .business(business)
                .name(request.getName())
                .build();

        ProductCategory saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    public ProductCategoryDTO.Response getCategory(Long id) {
        ProductCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToResponse(category);
    }

    @Override
    public List<ProductCategoryDTO.Response> getCategoriesByBusiness(Long businessId) {
        return categoryRepository.findAll().stream()
                .filter(c -> c.getBusiness().getId().equals(businessId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductCategoryDTO.Response updateCategory(Long id, ProductCategoryDTO.Request request) {
        ProductCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setName(request.getName());

        ProductCategory updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }

    private ProductCategoryDTO.Response mapToResponse(ProductCategory category) {
        return ProductCategoryDTO.Response.builder()
                .id(category.getId())
                .businessId(category.getBusiness().getId())
                .name(category.getName())
                .build();
    }
}
