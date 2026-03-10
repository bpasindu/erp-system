package lkerp.erp.controller;

import jakarta.validation.Valid;
import lkerp.erp.dto.ApiResponse;
import lkerp.erp.dto.FinanceDTO;
import lkerp.erp.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<FinanceDTO.CategoryResponse>> createCategory(
            @Valid @RequestBody FinanceDTO.CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created", financeService.createCategory(request)));
    }

    @GetMapping("/categories/business/{businessId}")
    public ResponseEntity<ApiResponse<List<FinanceDTO.CategoryResponse>>> getCategoriesByBusiness(
            @PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved", financeService.getCategoriesByBusiness(businessId)));
    }

    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse<FinanceDTO.TransactionResponse>> recordTransaction(
            @Valid @RequestBody FinanceDTO.TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transaction recorded", financeService.recordTransaction(request)));
    }

    @GetMapping("/transactions/business/{businessId}")
    public ResponseEntity<ApiResponse<List<FinanceDTO.TransactionResponse>>> getTransactionsByBusiness(
            @PathVariable Long businessId) {
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved", financeService.getTransactionsByBusiness(businessId)));
    }
}
