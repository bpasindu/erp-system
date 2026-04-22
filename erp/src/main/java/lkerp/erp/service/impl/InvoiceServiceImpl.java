package lkerp.erp.service.impl;

import lkerp.erp.dto.InvoiceDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.Customer;
import lkerp.erp.entity.Invoice;
import lkerp.erp.entity.InvoiceItem;
import lkerp.erp.entity.Product;
import lkerp.erp.exception.BadRequestException;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.CustomerRepository;
import lkerp.erp.repository.InvoiceItemRepository;
import lkerp.erp.repository.InvoiceRepository;
import lkerp.erp.repository.ProductRepository;
import lkerp.erp.service.InvoiceService;
import lkerp.erp.service.UsageLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final UsageLogService usageLogService;

    @Override
    @Transactional
    public InvoiceDTO.Response createInvoice(InvoiceDTO.CreateRequest request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
                
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        List<InvoiceItem> invoiceItems = new ArrayList<>();
        BigDecimal grandTotal = BigDecimal.ZERO;

        Invoice invoice = Invoice.builder()
                .business(business)
                .customer(customer)
                .invoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .status("UNPAID")
                .createdAt(LocalDateTime.now())
                .build();
                
        // First save the invoice to generate ID for items
        Invoice savedInvoice = invoiceRepository.save(invoice);

        for (InvoiceDTO.InvoiceItemDTO itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));

            // 1. Check & deduct stock directly from product
            int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
            if (currentStock < itemReq.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product " + product.getName()
                        + ". Current: " + currentStock + ", Required: " + itemReq.getQuantity());
            }
            product.setStockQuantity(currentStock - itemReq.getQuantity());
            productRepository.save(product);

            // 2. Create Invoice Item
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            grandTotal = grandTotal.add(lineTotal);

            InvoiceItem item = InvoiceItem.builder()
                    .invoice(savedInvoice)
                    .product(product)
                    .description(itemReq.getDescription() != null ? itemReq.getDescription() : product.getName())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .totalPrice(lineTotal)
                    .build();
            
            invoiceItems.add(invoiceItemRepository.save(item));
        }

        savedInvoice.setTotalAmount(grandTotal);
        savedInvoice.setItems(invoiceItems);
        Invoice finalInvoice = invoiceRepository.save(savedInvoice);

        usageLogService.log(business.getId(), null, "CREATE_INVOICE", "Created invoice " + finalInvoice.getInvoiceNumber() + " for total amount: " + finalInvoice.getTotalAmount(), "Billing", "127.0.0.1", "Success");

        return mapToResponse(finalInvoice);
    }

    @Override
    public InvoiceDTO.Response getInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found id: " + id));
        return mapToResponse(invoice);
    }

    @Override
    public List<InvoiceDTO.Response> getInvoicesByBusiness(Long businessId) {
        return invoiceRepository.findAll().stream()
                .filter(i -> i.getBusiness().getId().equals(businessId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InvoiceDTO.Response> getUnpaidInvoicesByBusiness(Long businessId) {
        return invoiceRepository.findByBusinessIdAndStatus(businessId, "UNPAID").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InvoiceDTO.Response> getUnpaidInvoicesByCustomer(Long customerId) {
        return invoiceRepository.findByCustomerIdAndStatus(customerId, "UNPAID").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteInvoice(Long id) {
        if (!invoiceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Invoice not found id: " + id);
        }
        invoiceRepository.deleteById(id);
    }

    @Override
    @Transactional
    public InvoiceDTO.Response updateInvoiceStatus(Long id, String status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found id: " + id));
        invoice.setStatus(status);
        Invoice saved = invoiceRepository.save(invoice);
        return mapToResponse(saved);
    }

    private InvoiceDTO.Response mapToResponse(Invoice invoice) {
        List<InvoiceDTO.InvoiceItemResponse> itemResponses = new ArrayList<>();
        if (invoice.getItems() != null) {
            itemResponses = invoice.getItems().stream().map(i -> InvoiceDTO.InvoiceItemResponse.builder()
                    .id(i.getId())
                    .productId(i.getProduct().getId())
                    .description(i.getDescription())
                    .quantity(i.getQuantity())
                    .unitPrice(i.getUnitPrice())
                    .totalPrice(i.getTotalPrice())
                    .build()
            ).collect(Collectors.toList());
        }

        return InvoiceDTO.Response.builder()
                .id(invoice.getId())
                .businessId(invoice.getBusiness().getId())
                .customerId(invoice.getCustomer() != null ? invoice.getCustomer().getId() : null)
                .invoiceNumber(invoice.getInvoiceNumber())
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .createdAt(invoice.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
