package lkerp.erp.controller;

import jakarta.validation.Valid;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.SupplierDTO;
import lkerp.erp.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierDTO.Response>> createSupplier(@Valid @RequestBody SupplierDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Supplier created", supplierService.createSupplier(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDTO.Response>> getSupplier(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Supplier retrieved", supplierService.getSupplier(id)));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<List<SupplierDTO.Response>>> getSuppliersByBusiness(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success("Suppliers retrieved", supplierService.getSuppliersByBusiness(businessId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDTO.Response>> updateSupplier(
            @PathVariable Long id, @Valid @RequestBody SupplierDTO.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Supplier updated", supplierService.updateSupplier(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier deleted", null));
    }
}
