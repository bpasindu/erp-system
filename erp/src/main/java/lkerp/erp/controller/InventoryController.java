package lkerp.erp.controller;

import jakarta.validation.Valid;
import lkerp.erp.dto.AddStockRequestDTO;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.InventoryDTO;
import lkerp.erp.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/add-stock")
    public ResponseEntity<ApiResponse<InventoryDTO.AddStockResponse>> addStock(
            @Valid @RequestBody AddStockRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stock added successfully", inventoryService.addStock(request)));
    }

    @PostMapping("/movement")
    public ResponseEntity<ApiResponse<InventoryDTO.StockMovementResponse>> recordMovement(
            @Valid @RequestBody InventoryDTO.StockMovementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stock movement recorded", inventoryService.recordStockMovement(request)));
    }

    @GetMapping("/movements/warehouse/{warehouseId}")
    public ResponseEntity<ApiResponse<List<InventoryDTO.StockMovementResponse>>> getMovementsByWarehouse(
            @PathVariable Long warehouseId) {
        return ResponseEntity.ok(ApiResponse.success("Movements retrieved", inventoryService.getMovementsByWarehouse(warehouseId)));
    }

    @GetMapping("/balances/business/{businessId}")
    public ResponseEntity<ApiResponse<List<InventoryDTO.InventoryBalanceResponse>>> getInventoryBalances(
            @PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success("Balances retrieved", inventoryService.getInventoryByBusiness(businessId)));
    }
}
