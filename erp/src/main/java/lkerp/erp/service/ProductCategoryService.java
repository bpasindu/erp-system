package lkerp.erp.service;

import lkerp.erp.dto.ProductCategoryDTO;
import java.util.List;

public interface ProductCategoryService {
    ProductCategoryDTO.Response createCategory(ProductCategoryDTO.Request request);
    ProductCategoryDTO.Response getCategory(Long id);
    List<ProductCategoryDTO.Response> getCategoriesByBusiness(Long businessId);
    ProductCategoryDTO.Response updateCategory(Long id, ProductCategoryDTO.Request request);
    void deleteCategory(Long id);
}
