package lkerp.erp.service;

import lkerp.erp.dto.InvoiceDTO;
import java.util.List;

public interface InvoiceService {
    InvoiceDTO.Response createInvoice(InvoiceDTO.CreateRequest request);
    InvoiceDTO.Response getInvoice(Long id);
    List<InvoiceDTO.Response> getInvoicesByBusiness(Long businessId);
    void deleteInvoice(Long id);
    InvoiceDTO.Response updateInvoiceStatus(Long id, String status);
}
