package lkerp.erp.controller;

import jakarta.validation.Valid;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.ProductDTO;
import lkerp.erp.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDTO.Response>> createProduct(@Valid @RequestBody ProductDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created", productService.createProduct(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO.Response>> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Product retrieved", productService.getProduct(id)));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<List<ProductDTO.Response>>> getProductsByBusiness(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success("Products retrieved", productService.getProductsByBusiness(businessId)));
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<ApiResponse<List<ProductDTO.Response>>> getProductsBySupplier(@PathVariable Long supplierId) {
        return ResponseEntity.ok(ApiResponse.success("Supplier products retrieved", productService.getProductsBySupplier(supplierId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO.Response>> updateProduct(
            @PathVariable Long id, @Valid @RequestBody ProductDTO.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.updateProduct(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }
}
