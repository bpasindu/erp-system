package lkerp.erp.service;

import lkerp.erp.dto.PaymentDTO;
import java.util.List;

public interface PaymentService {
    PaymentDTO.Response recordPayment(PaymentDTO.Request request);
    PaymentDTO.Response getPayment(Long id);
    List<PaymentDTO.Response> getPaymentsByBusiness(Long businessId);
    List<PaymentDTO.Response> getPaymentsByInvoice(Long invoiceId);
}
