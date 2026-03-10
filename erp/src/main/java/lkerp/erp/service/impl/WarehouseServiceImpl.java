package lkerp.erp.service.impl;

import lkerp.erp.dto.WarehouseDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.Warehouse;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.WarehouseRepository;
import lkerp.erp.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final BusinessRepository businessRepository;

    @Override
    public WarehouseDTO.Response createWarehouse(WarehouseDTO.Request request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + request.getBusinessId()));

        Warehouse warehouse = Warehouse.builder()
                .business(business)
                .name(request.getName())
                .location(request.getLocation())
                .build();

        Warehouse saved = warehouseRepository.save(warehouse);
        return mapToResponse(saved);
    }

    @Override
    public WarehouseDTO.Response getWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));
        return mapToResponse(warehouse);
    }

    @Override
    public List<WarehouseDTO.Response> getWarehousesByBusiness(Long businessId) {
        return warehouseRepository.findAll().stream()
                .filter(w -> w.getBusiness().getId().equals(businessId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public WarehouseDTO.Response updateWarehouse(Long id, WarehouseDTO.Request request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with id: " + id));

        warehouse.setName(request.getName());
        warehouse.setLocation(request.getLocation());

        Warehouse updated = warehouseRepository.save(warehouse);
        return mapToResponse(updated);
    }

    @Override
    public void deleteWarehouse(Long id) {
        if (!warehouseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Warehouse not found with id: " + id);
        }
        warehouseRepository.deleteById(id);
    }

    private WarehouseDTO.Response mapToResponse(Warehouse warehouse) {
        return WarehouseDTO.Response.builder()
                .id(warehouse.getId())
                .businessId(warehouse.getBusiness().getId())
                .name(warehouse.getName())
                .location(warehouse.getLocation())
                .build();
    }
}
