package lkerp.erp.controller;

import jakarta.validation.Valid;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.InvoiceDTO;
import lkerp.erp.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<ApiResponse<InvoiceDTO.Response>> createInvoice(@Valid @RequestBody InvoiceDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invoice created successfully", invoiceService.createInvoice(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceDTO.Response>> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Invoice retrieved", invoiceService.getInvoice(id)));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<List<InvoiceDTO.Response>>> getInvoicesByBusiness(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success("Invoices retrieved", invoiceService.getInvoicesByBusiness(businessId)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<InvoiceDTO.Response>> updateInvoiceStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Invoice status updated", invoiceService.updateInvoiceStatus(id, status)));
    }

    @GetMapping("/unpaid/business/{businessId}")
    public ResponseEntity<ApiResponse<List<InvoiceDTO.Response>>> getUnpaidInvoices(@PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success("Unpaid invoices retrieved", invoiceService.getUnpaidInvoicesByBusiness(businessId)));
    }

    @GetMapping("/unpaid/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<InvoiceDTO.Response>>> getUnpaidInvoicesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success("Unpaid customer invoices retrieved", invoiceService.getUnpaidInvoicesByCustomer(customerId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice deleted", null));
    }
}
