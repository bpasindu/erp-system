package lkerp.erp.service;

import lkerp.erp.dto.AIRequestDTO;
import java.util.List;

public interface AIRequestService {
    AIRequestDTO.Response createRequest(AIRequestDTO.Request request);
    List<AIRequestDTO.Response> getRequestsByBusiness(Long businessId);
}
