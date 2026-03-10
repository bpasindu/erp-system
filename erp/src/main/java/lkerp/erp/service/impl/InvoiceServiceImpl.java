package lkerp.erp.service.impl;

import lkerp.erp.dto.InvoiceDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.Customer;
import lkerp.erp.entity.InventoryBalance;
import lkerp.erp.entity.Invoice;
import lkerp.erp.entity.InvoiceItem;
import lkerp.erp.entity.Product;
import lkerp.erp.entity.StockMovement;
import lkerp.erp.entity.Warehouse;
import lkerp.erp.exception.BadRequestException;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.CustomerRepository;
import lkerp.erp.repository.InventoryBalanceRepository;
import lkerp.erp.repository.InvoiceItemRepository;
import lkerp.erp.repository.InvoiceRepository;
import lkerp.erp.repository.ProductRepository;
import lkerp.erp.repository.StockMovementRepository;
import lkerp.erp.repository.WarehouseRepository;
import lkerp.erp.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryBalanceRepository inventoryBalanceRepository;
    private final StockMovementRepository stockMovementRepository;

    @Override
    @Transactional
    public InvoiceDTO.Response createInvoice(InvoiceDTO.CreateRequest request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
                
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));

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
            
            // 1. Check & Deduct Inventory
            Optional<InventoryBalance> balanceOpt = inventoryBalanceRepository
                    .findByBusinessAndWarehouseAndProduct(business, warehouse, product);
            
            if (balanceOpt.isEmpty() || balanceOpt.get().getQuantity() < itemReq.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product " + product.getName() + " in warehouse: " + warehouse.getName());
            }

            InventoryBalance balance = balanceOpt.get();
            balance.setQuantity(balance.getQuantity() - itemReq.getQuantity());
            inventoryBalanceRepository.save(balance);

            // 2. Record Stock Movement
            StockMovement movement = StockMovement.builder()
                    .business(business)
                    .warehouse(warehouse)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .type("OUT")
                    .movementDate(LocalDateTime.now())
                    .build();
            stockMovementRepository.save(movement);

            // 3. Create Invoice Item
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
    public void deleteInvoice(Long id) {
        if (!invoiceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Invoice not found id: " + id);
        }
        invoiceRepository.deleteById(id);
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
