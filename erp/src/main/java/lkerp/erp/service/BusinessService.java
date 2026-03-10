package lkerp.erp.service;

import lkerp.erp.dto.BusinessDTO;
import java.util.List;

public interface BusinessService {
    BusinessDTO.Response createBusiness(BusinessDTO.Request request);
    BusinessDTO.Response getBusiness(Long id);
    List<BusinessDTO.Response> getAllBusinesses();
    BusinessDTO.Response updateBusiness(Long id, BusinessDTO.Request request);
    void deleteBusiness(Long id);
}
