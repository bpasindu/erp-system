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
  lowStockProducts: any[];
}

export const getDashboardData = async (businessId: number): Promise<DashboardData> => {
  try {
    const [invRes, prodRes, custRes] = await Promise.all([
      api.get(`/invoices/business/${businessId}`),
      api.get(`/products/business/${businessId}`),
      api.get(`/customers/business/${businessId}`),
    ]);

    const invoices = invRes.data.data || [];
    const products = prodRes.data.data || [];
    const customers = custRes.data.data || [];

    // Customer Name Mapping
    const customerMap = new Map();
    customers.forEach((c: any) => customerMap.set(c.id, c.name));

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
      const qty = Number(p.stockQuantity ?? p.stockQty ?? 0);
      if (qty <= 0) outOfStock++;
      else if (qty < 5) lowStock++;
    });

    // Recent Invoices (last 5)
    const recentInvoices = invoices
      .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .slice(0, 5)
      .map((inv: any) => ({
        id: inv.invoiceNumber || `INV-${inv.id}`,
        amount: inv.totalAmount || 0,
        status: (inv.status || 'unpaid').toLowerCase(),
        customer: customerMap.get(inv.customerId) || 'Unknown Customer',
      }));

    // Real Sales Chart Data (Last 7 Days)
    const days: { label: string; dateStr: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toISOString().slice(0, 10);
      days.push({ label: dayName, dateStr, total: 0 });
    }

    invoices.forEach((inv: any) => {
      const date = inv.createdAt ? String(inv.createdAt).slice(0, 10) : '';
      const dayObj = days.find(d => d.dateStr === date);
      if (dayObj) {
        dayObj.total += Number(inv.totalAmount || 0);
      }
    });

    const salesChartData = {
      labels: days.map(d => d.label),
      datasets: [
        {
          data: days.map(d => d.total),
        },
      ],
    };

    // Low Stock Products (top 5)
    const lowStockProducts = products
      .filter((p: any) => {
        const qty = Number(p.stockQuantity ?? p.stockQty ?? 0);
        return qty > 0 && qty < 5;
      })
      .slice(0, 5)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        qty: Number(p.stockQuantity ?? p.stockQty ?? 0),
      }));

    return {
      totalProducts: products.length,
      todaySales,
      monthSales,
      lowStockItems: lowStock,
      outOfStockItems: outOfStock,
      recentInvoices,
      salesChartData,
      lowStockProducts,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
