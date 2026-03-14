package lkerp.erp.controller;

import jakarta.validation.Valid;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.WarehouseDTO;
import lkerp.erp.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    public ResponseEntity<ApiResponse<WarehouseDTO.Response>> createWarehouse(
            @Valid @RequestBody WarehouseDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Warehouse created", warehouseService.createWarehouse(request)));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<List<WarehouseDTO.Response>>> getWarehousesByBusiness(
            @PathVariable Long businessId) {
        return ResponseEntity.ok(
                ApiResponse.success("Warehouses retrieved", warehouseService.getWarehousesByBusiness(businessId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WarehouseDTO.Response>> getWarehouse(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Warehouse retrieved", warehouseService.getWarehouse(id)));
    }
}
