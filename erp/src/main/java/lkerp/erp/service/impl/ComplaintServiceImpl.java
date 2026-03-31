package lkerp.erp.service.impl;

import lkerp.erp.dto.ComplaintDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.Customer;
import lkerp.erp.entity.CustomerComplaint;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.CustomerComplaintRepository;
import lkerp.erp.repository.CustomerRepository;
import lkerp.erp.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final CustomerComplaintRepository complaintRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;

    @Override
    public ComplaintDTO.Response createComplaint(ComplaintDTO.Request request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        CustomerComplaint complaint = CustomerComplaint.builder()
                .business(business)
                .customer(customer)
                .subject(request.getSubject())
                .description(request.getDescription())
                .status("OPEN")
                .createdAt(LocalDateTime.now())
                .build();

        return mapToResponse(complaintRepository.save(complaint));
    }

    @Override
    public List<ComplaintDTO.Response> getOpenComplaintsByBusiness(Long businessId) {
        return complaintRepository.findByBusinessIdAndStatus(businessId, "OPEN").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void resolveComplaint(Long id) {
        CustomerComplaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        complaint.setStatus("RESOLVED");
        complaintRepository.save(complaint);
    }

    private ComplaintDTO.Response mapToResponse(CustomerComplaint complaint) {
        return ComplaintDTO.Response.builder()
                .id(complaint.getId())
                .businessId(complaint.getBusiness().getId())
                .customerId(complaint.getCustomer().getId())
                .customerName(complaint.getCustomer().getName())
                .subject(complaint.getSubject())
                .description(complaint.getDescription())
                .status(complaint.getStatus())
                .createdAt(complaint.getCreatedAt())
                .build();
    }
}
