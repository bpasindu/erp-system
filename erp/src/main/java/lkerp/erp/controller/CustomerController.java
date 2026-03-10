package lkerp.erp.controller;

import jakarta.validation.Valid;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.CustomerDTO;
import lkerp.erp.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerDTO.Response>> createCustomer(@Valid @RequestBody CustomerDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer created", customerService.createCustomer(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDTO.Response>> getCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Customer retrieved", customerService.getCustomer(id)));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<List<CustomerDTO.Response>>> getCustomersByBusiness(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved", customerService.getCustomersByBusiness(businessId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDTO.Response>> updateCustomer(
            @PathVariable Long id, @Valid @RequestBody CustomerDTO.Request request) {
        return ResponseEntity.ok(ApiResponse.success("Customer updated", customerService.updateCustomer(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer deleted", null));
    }
}
