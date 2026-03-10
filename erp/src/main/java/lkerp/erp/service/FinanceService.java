package lkerp.erp.service;

import lkerp.erp.dto.FinanceDTO;
import java.util.List;

public interface FinanceService {
    FinanceDTO.CategoryResponse createCategory(FinanceDTO.CategoryRequest request);
    List<FinanceDTO.CategoryResponse> getCategoriesByBusiness(Long businessId);

    FinanceDTO.TransactionResponse recordTransaction(FinanceDTO.TransactionRequest request);
    List<FinanceDTO.TransactionResponse> getTransactionsByBusiness(Long businessId);
}
