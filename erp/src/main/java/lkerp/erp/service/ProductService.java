package lkerp.erp.service;

import lkerp.erp.dto.ProductDTO;
import java.util.List;

public interface ProductService {
    ProductDTO.Response createProduct(ProductDTO.Request request);
    ProductDTO.Response getProduct(Long id);
    List<ProductDTO.Response> getProductsByBusiness(Long businessId);
    ProductDTO.Response updateProduct(Long id, ProductDTO.Request request);
    void deleteProduct(Long id);
}
