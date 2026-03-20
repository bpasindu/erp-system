import api from './api';

export interface DashboardData {
  totalProducts: number;
  todaySales: number;
  monthSales: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentInvoices: any[];
  salesChartData: {
    labels: string[];
    datasets: { data: number[] }[];
  };
}

export const getDashboardData = async (businessId: number): Promise<DashboardData> => {
  try {
    const [invRes, prodRes] = await Promise.all([
      api.get(`/invoices/business/${businessId}`),
      api.get(`/products/business/${businessId}`),
    ]);

    const invoices = invRes.data.data || [];
    const products = prodRes.data.data || [];

    // Today's Sales Calculation
    const today = new Date().toISOString().slice(0, 10);
    const todaySales = invoices.reduce((sum: number, inv: any) => {
      const invDate = inv.createdAt ? String(inv.createdAt).slice(0, 10) : '';
      return invDate === today ? sum + (inv.totalAmount || 0) : sum;
    }, 0);

    // Month Sales Calculation
    const month = new Date().toISOString().slice(0, 7);
    const monthSales = invoices.reduce((sum: number, inv: any) => {
      const invMonth = inv.createdAt ? String(inv.createdAt).slice(0, 7) : '';
      return invMonth === month ? sum + (inv.totalAmount || 0) : sum;
    }, 0);

    // Stock Stats
    let lowStock = 0;
    let outOfStock = 0;
    products.forEach((p: any) => {
      const qty = p.stockQty || 0;
      const reorder = p.reorderLevel || 0;
      if (qty === 0) outOfStock++;
      else if (qty <= reorder) lowStock++;
    });

    // Recent Invoices (last 5)
    const recentInvoices = invoices
      .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .slice(0, 5)
      .map((inv: any) => ({
        id: inv.invoiceNumber || `INV-${inv.id}`,
        amount: inv.totalAmount || 0,
        status: (inv.status || 'unpaid').toLowerCase(),
        customer: 'Customer', // Would need Customer mapping for better UI
      }));

    // Mock Sales Chart Data (Last 7 Days)
    const salesChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [20, 45, 28, 80, 99, 43, 50], // Placeholder data
        },
      ],
    };

    return {
      totalProducts: products.length,
      todaySales,
      monthSales,
      lowStockItems: lowStock,
      outOfStockItems: outOfStock,
      recentInvoices,
      salesChartData,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
