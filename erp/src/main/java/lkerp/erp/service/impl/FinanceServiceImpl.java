package lkerp.erp.service.impl;

import lkerp.erp.dto.FinanceDTO;
import lkerp.erp.entity.Business;
import lkerp.erp.entity.FinanceCategory;
import lkerp.erp.entity.FinanceTransaction;
import lkerp.erp.exception.ResourceNotFoundException;
import lkerp.erp.repository.BusinessRepository;
import lkerp.erp.repository.FinanceCategoryRepository;
import lkerp.erp.repository.FinanceTransactionRepository;
import lkerp.erp.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

    private final FinanceCategoryRepository categoryRepository;
    private final FinanceTransactionRepository transactionRepository;
    private final BusinessRepository businessRepository;

    @Override
    public FinanceDTO.CategoryResponse createCategory(FinanceDTO.CategoryRequest request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        FinanceCategory category = FinanceCategory.builder()
                .business(business)
                .name(request.getName())
                .type(request.getType().toUpperCase())
                .build();
                
        FinanceCategory saved = categoryRepository.save(category);
        return mapCategoryResponse(saved);
    }

    @Override
    public List<FinanceDTO.CategoryResponse> getCategoriesByBusiness(Long businessId) {
        return categoryRepository.findAll().stream()
                .filter(c -> c.getBusiness().getId().equals(businessId))
                .map(this::mapCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FinanceDTO.TransactionResponse recordTransaction(FinanceDTO.TransactionRequest request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
                
        FinanceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        FinanceTransaction transaction = FinanceTransaction.builder()
                .business(business)
                .category(category)
                .amount(request.getAmount())
                .description(request.getDescription())
                .type(request.getType().toUpperCase())
                .transactionDate(LocalDateTime.now())
                .build();

        FinanceTransaction saved = transactionRepository.save(transaction);
        return mapTransactionResponse(saved);
    }

    @Override
    public List<FinanceDTO.TransactionResponse> getTransactionsByBusiness(Long businessId) {
        return transactionRepository.findAll().stream()
                .filter(t -> t.getBusiness().getId().equals(businessId))
                .map(this::mapTransactionResponse)
                .collect(Collectors.toList());
    }

    private FinanceDTO.CategoryResponse mapCategoryResponse(FinanceCategory category) {
        return FinanceDTO.CategoryResponse.builder()
                .id(category.getId())
                .businessId(category.getBusiness().getId())
                .name(category.getName())
                .type(category.getType())
                .build();
    }

    private FinanceDTO.TransactionResponse mapTransactionResponse(FinanceTransaction transaction) {
        return FinanceDTO.TransactionResponse.builder()
                .id(transaction.getId())
                .businessId(transaction.getBusiness().getId())
                .categoryId(transaction.getCategory().getId())
                .amount(transaction.getAmount())
                .description(transaction.getDescription())
                .type(transaction.getType())
                .transactionDate(transaction.getTransactionDate())
                .build();
    }
}
