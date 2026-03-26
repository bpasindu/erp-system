import api from './api';

export interface SaleItem {
  productId: number;
  quantity: number;
  description: string;
}

export interface CreateSaleRequest {
  businessId: number;
  customerId: number;
  items: SaleItem[];
}

export interface InvoiceItem {
  id: number;
  productId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  customerName: string;
  customerId: number;
  createdAt: string;
  items: InvoiceItem[];
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
  customerId: number,
  items: SaleItem[],
): Promise<Invoice> => {
  try {
    const payload: CreateSaleRequest = {
      businessId,
      customerId,
      items,
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

export const updateInvoiceStatus = async (id: number, status: string): Promise<Invoice> => {
  try {
    const response = await api.put<ApiResponse<Invoice>>(`/invoices/${id}/status?status=${status.toUpperCase()}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update status');
  } catch (error: any) {
    console.error('Error updating status:', error);
    throw error;
  }
};
