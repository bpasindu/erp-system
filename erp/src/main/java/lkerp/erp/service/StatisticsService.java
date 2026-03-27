package lkerp.erp.service;

import lkerp.erp.dto.StatisticsDTO;
import lkerp.erp.dto.DashboardDTO;

public interface StatisticsService {
    StatisticsDTO getSystemStatistics();
    DashboardDTO getDashboardSummary();
}
