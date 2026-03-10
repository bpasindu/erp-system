package lkerp.erp.service;

import lkerp.erp.dto.WarehouseDTO;
import java.util.List;

public interface WarehouseService {
    WarehouseDTO.Response createWarehouse(WarehouseDTO.Request request);
    WarehouseDTO.Response getWarehouse(Long id);
    List<WarehouseDTO.Response> getWarehousesByBusiness(Long businessId);
    WarehouseDTO.Response updateWarehouse(Long id, WarehouseDTO.Request request);
    void deleteWarehouse(Long id);
}
