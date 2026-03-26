import api from './api';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;
  stockQuantity: number;
  reorderLevel: number;
  sku: string;
  description: string;
}

export interface CreateProductRequest {
  businessId: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  cost: number;
  stockQuantity: number;
  reorderLevel?: number;
  categoryId?: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
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

export const createProduct = async (data: CreateProductRequest): Promise<Product> => {
  try {
    const response = await api.post<ApiResponse<Product>>('/products', data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create product');
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const getCustomersByBusiness = async (businessId: number): Promise<Customer[]> => {
  try {
    const response = await api.get<ApiResponse<Customer[]>>(`/customers/business/${businessId}`);
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const InventoryService = {
  getProductsByBusiness,
  getProductById,
  createProduct,
};
