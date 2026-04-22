package lkerp.erp.service;

import lkerp.erp.dto.InvoiceDTO;
import java.util.List;

public interface InvoiceService {
    InvoiceDTO.Response createInvoice(InvoiceDTO.CreateRequest request);
    InvoiceDTO.Response getInvoice(Long id);
    List<InvoiceDTO.Response> getInvoicesByBusiness(Long businessId);
    List<InvoiceDTO.Response> getUnpaidInvoicesByBusiness(Long businessId);
    List<InvoiceDTO.Response> getUnpaidInvoicesByCustomer(Long customerId);
    void deleteInvoice(Long id);
    InvoiceDTO.Response updateInvoiceStatus(Long id, String status);
}
