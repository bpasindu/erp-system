package lkerp.erp.service;

import lkerp.erp.dto.ComplaintDTO;
import java.util.List;

public interface ComplaintService {
    ComplaintDTO.Response createComplaint(ComplaintDTO.Request request);
    List<ComplaintDTO.Response> getOpenComplaintsByBusiness(Long businessId);
    void resolveComplaint(Long id);
}
