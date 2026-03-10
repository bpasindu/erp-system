package lkerp.erp.controller;

import jakarta.validation.Valid;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.PaymentDTO;
import lkerp.erp.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentDTO.Response>> recordPayment(@Valid @RequestBody PaymentDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment recorded", paymentService.recordPayment(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentDTO.Response>> getPayment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved", paymentService.getPayment(id)));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<List<PaymentDTO.Response>>> getPaymentsByBusiness(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved", paymentService.getPaymentsByBusiness(businessId)));
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<ApiResponse<List<PaymentDTO.Response>>> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved for invoice", paymentService.getPaymentsByInvoice(invoiceId)));
    }
}
