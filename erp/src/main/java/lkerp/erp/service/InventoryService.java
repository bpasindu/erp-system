package lkerp.erp.service;

import lkerp.erp.dto.AddStockRequestDTO;
import lkerp.erp.dto.InventoryDTO;

import java.util.List;

public interface InventoryService {
    InventoryDTO.StockMovementResponse recordStockMovement(InventoryDTO.StockMovementRequest request);
    InventoryDTO.AddStockResponse addStock(AddStockRequestDTO request);
    List<InventoryDTO.StockMovementResponse> getMovementsByWarehouse(Long warehouseId);
    List<InventoryDTO.InventoryBalanceResponse> getInventoryByBusiness(Long businessId);
}
