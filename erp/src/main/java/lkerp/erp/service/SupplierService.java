package lkerp.erp.service;

import lkerp.erp.dto.SupplierDTO;
import java.util.List;

public interface SupplierService {
    SupplierDTO.Response createSupplier(SupplierDTO.Request request);
    SupplierDTO.Response getSupplier(Long id);
    List<SupplierDTO.Response> getSuppliersByBusiness(Long businessId);
    SupplierDTO.Response updateSupplier(Long id, SupplierDTO.Request request);
    void deleteSupplier(Long id);
}
