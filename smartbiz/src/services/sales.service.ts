import api from './api';

export interface SaleItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleRequest {
  businessId: number;
  customerName: string;
  items: SaleItem[];
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  customerName: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getInvoicesByBusiness = async (businessId: number): Promise<Invoice[]> => {
  try {
    const response = await api.get<ApiResponse<Invoice[]>>(`/invoices/business/${businessId}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch invoices');
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

export const createSale = async (
  businessId: number,
  customerName: string,
  productId: number,
  quantity: number,
  unitPrice: number,
): Promise<Invoice> => {
  try {
    const payload: CreateSaleRequest = {
      businessId,
      customerName,
      items: [{ productId, quantity, unitPrice }],
    };
    const response = await api.post<ApiResponse<Invoice>>('/invoices', payload);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create sale');
  } catch (error: any) {
    console.error('Error creating sale:', error);
    throw error;
  }
};
