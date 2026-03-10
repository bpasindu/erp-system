package lkerp.erp.service.impl;

import lkerp.erp.dto.PaymentDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.Invoice;
import lkerp.erp.entity.Payment;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.InvoiceRepository;
import lkerp.erp.repository.PaymentRepository;
import lkerp.erp.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final BusinessRepository businessRepository;

    @Override
    @Transactional
    public PaymentDTO.Response recordPayment(PaymentDTO.Request request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
                
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        Payment payment = Payment.builder()
                .business(business)
                .invoice(invoice)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod().toUpperCase())
                .status("SUCCESS")
                .paymentDate(LocalDateTime.now())
                .build();
                
        Payment saved = paymentRepository.save(payment);

        // Update Invoice logic
        if (request.getAmount().compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus("PAID");
            invoiceRepository.save(invoice);
        }

        return mapToResponse(saved);
    }

    @Override
    public PaymentDTO.Response getPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return mapToResponse(payment);
    }

    @Override
    public List<PaymentDTO.Response> getPaymentsByBusiness(Long businessId) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getBusiness().getId().equals(businessId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentDTO.Response> getPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getInvoice() != null && p.getInvoice().getId().equals(invoiceId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PaymentDTO.Response mapToResponse(Payment payment) {
        return PaymentDTO.Response.builder()
                .id(payment.getId())
                .businessId(payment.getBusiness().getId())
                .invoiceId(payment.getInvoice() != null ? payment.getInvoice().getId() : null)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .paymentDate(payment.getPaymentDate())
                .build();
    }
}
