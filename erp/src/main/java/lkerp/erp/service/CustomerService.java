package lkerp.erp.service;

import lkerp.erp.dto.CustomerDTO;
import java.util.List;

public interface CustomerService {
    CustomerDTO.Response createCustomer(CustomerDTO.Request request);
    CustomerDTO.Response getCustomer(Long id);
    List<CustomerDTO.Response> getCustomersByBusiness(Long businessId);
    CustomerDTO.Response updateCustomer(Long id, CustomerDTO.Request request);
    void deleteCustomer(Long id);
}
