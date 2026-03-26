package lkerp.erp.service.impl;

import lkerp.erp.dto.CustomerDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.Customer;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.CustomerRepository;
import lkerp.erp.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final BusinessRepository businessRepository;

    @Override
    public CustomerDTO.Response createCustomer(CustomerDTO.Request request) {
        if (request.getId() != null) {
            return updateCustomer(request.getId(), request);
        }
        
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + request.getBusinessId()));

        Customer customer = Customer.builder()
                .business(business)
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved);
    }

    @Override
    public CustomerDTO.Response getCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToResponse(customer);
    }

    @Override
    public List<CustomerDTO.Response> getCustomersByBusiness(Long businessId) {
        return customerRepository.findAll().stream()
                .filter(c -> c.getBusiness().getId().equals(businessId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerDTO.Response updateCustomer(Long id, CustomerDTO.Request request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setNotes(request.getNotes());

        Customer updated = customerRepository.save(customer);
        return mapToResponse(updated);
    }

    @Override
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found with id: " + id);
        }
        customerRepository.deleteById(id);
    }

    private CustomerDTO.Response mapToResponse(Customer customer) {
        return CustomerDTO.Response.builder()
                .id(customer.getId())
                .businessId(customer.getBusiness().getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .notes(customer.getNotes())
                .createdAt(customer.getCreatedAt())
                .build();
    }
}
