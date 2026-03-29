package lkerp.erp.service.impl;

import lkerp.erp.dto.BusinessDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.User;
import lkerp.erp.exception.BadRequestException;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.UserRepository;
import lkerp.erp.service.BusinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusinessServiceImpl implements BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public BusinessDTO.Response createBusiness(BusinessDTO.Request request) {
        if (userRepository.findByEmail(request.getOwnerEmail()).isPresent()) {
            throw new BadRequestException("Owner email is already taken");
        }

        Business business = new Business();
        business.setName(request.getName());
        business.setCurrency(request.getCurrency());
        business.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        business.setPlan(request.getPlan());
        business.setOwnerEmail(request.getOwnerEmail());
        business.setEmail(request.getEmail());
        business.setLastActiveAt(LocalDateTime.now());
        
        Business saved = businessRepository.save(business);

        User user = User.builder()
                .email(request.getOwnerEmail())
                .password(passwordEncoder.encode(request.getDefaultPassword()))
                .role("BUSINESS_OWNER")
                .business(saved)
                .isActive(true)
                .build();
        userRepository.save(user);

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
        String ownerEmail = business.getOwnerEmail();
        // Fallback: if ownerEmail is null in business, try to find it from the users collection
        if ((ownerEmail == null || ownerEmail.isEmpty()) && business.getUsers() != null) {
            ownerEmail = business.getUsers().stream()
                    .filter(u -> "BUSINESS_OWNER".equalsIgnoreCase(u.getRole()))
                    .map(User::getEmail)
                    .findFirst()
                    .orElse(ownerEmail);
        }

        return BusinessDTO.Response.builder()
                .id(business.getId())
                .name(business.getName())
                .currency(business.getCurrency())
                .status(business.getStatus())
                .plan(business.getPlan())
                .ownerEmail(ownerEmail)
                .email(business.getEmail())
                .createdAt(business.getCreatedAt())
                .lastActiveAt(business.getLastActiveAt() != null ? business.getLastActiveAt() : business.getCreatedAt())
                .build();
    }
}
