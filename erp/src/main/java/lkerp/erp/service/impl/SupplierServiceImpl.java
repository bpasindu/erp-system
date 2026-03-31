package lkerp.erp.service.impl;

import lkerp.erp.dto.SupplierDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.Supplier;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.SupplierRepository;
import lkerp.erp.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final BusinessRepository businessRepository;

    @Override
    public SupplierDTO.Response createSupplier(SupplierDTO.Request request) {
        if (request.getId() != null) {
            return updateSupplier(request.getId(), request);
        }

        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + request.getBusinessId()));

        Supplier supplier = Supplier.builder()
                .business(business)
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        Supplier saved = supplierRepository.save(supplier);
        return mapToResponse(saved);
    }

    @Override
    public SupplierDTO.Response getSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return mapToResponse(supplier);
    }

    @Override
    public List<SupplierDTO.Response> getSuppliersByBusiness(Long businessId) {
        return supplierRepository.findAll().stream()
                .filter(s -> s.getBusiness().getId().equals(businessId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SupplierDTO.Response updateSupplier(Long id, SupplierDTO.Request request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        supplier.setName(request.getName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setNotes(request.getNotes());

        Supplier updated = supplierRepository.save(supplier);
        return mapToResponse(updated);
    }

    @Override
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier not found with id: " + id);
        }
        supplierRepository.deleteById(id);
    }

    private SupplierDTO.Response mapToResponse(Supplier supplier) {
        return SupplierDTO.Response.builder()
                .id(supplier.getId())
                .businessId(supplier.getBusiness().getId())
                .name(supplier.getName())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .notes(supplier.getNotes())
                .createdAt(supplier.getCreatedAt())
                .build();
    }
}
