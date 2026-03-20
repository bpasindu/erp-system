import api from './api';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  minStockThreshold: number;
  sku: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getProductsByBusiness = async (businessId: number): Promise<Product[]> => {
  try {
    const response = await api.get<ApiResponse<Product[]>>(`/products/business/${businessId}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch products');
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: number): Promise<Product> => {
  try {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch product');
  } catch (error: any) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const InventoryService = {
  getProductsByBusiness,
  getProductById,
};
