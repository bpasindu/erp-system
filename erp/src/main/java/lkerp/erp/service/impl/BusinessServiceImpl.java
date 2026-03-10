package lkerp.erp.service.impl;

import lkerp.erp.dto.BusinessDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.service.BusinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusinessServiceImpl implements BusinessService {

    private final BusinessRepository businessRepository;

    @Override
    public BusinessDTO.Response createBusiness(BusinessDTO.Request request) {
        Business business = new Business();
        business.setName(request.getName());
        business.setCurrency(request.getCurrency());
        business.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        
        Business saved = businessRepository.save(business);
        return mapToResponse(saved);
    }

    @Override
    public BusinessDTO.Response getBusiness(Long id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id));
        return mapToResponse(business);
    }

    @Override
    public List<BusinessDTO.Response> getAllBusinesses() {
        return businessRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BusinessDTO.Response updateBusiness(Long id, BusinessDTO.Request request) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + id));
        
        business.setName(request.getName());
        business.setCurrency(request.getCurrency());
        if (request.getStatus() != null) {
            business.setStatus(request.getStatus());
        }
        
        Business updated = businessRepository.save(business);
        return mapToResponse(updated);
    }

    @Override
    public void deleteBusiness(Long id) {
        if (!businessRepository.existsById(id)) {
            throw new ResourceNotFoundException("Business not found with id: " + id);
        }
        businessRepository.deleteById(id);
    }

    private BusinessDTO.Response mapToResponse(Business business) {
        return BusinessDTO.Response.builder()
                .id(business.getId())
                .name(business.getName())
                .currency(business.getCurrency())
                .status(business.getStatus())
                .createdAt(business.getCreatedAt())
                .build();
    }
}
