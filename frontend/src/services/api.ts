import axios, { AxiosInstance } from 'axios';
import { ApiResponse } from '../types';
import toast from 'react-hot-toast';

class ApiService {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add idempotency key for state-changing requests
        if (['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
          const idempotencyKey = config.headers['Idempotency-Key'] || 
            `${Date.now()}-${Math.random().toString(36).substring(2)}`;
          config.headers['Idempotency-Key'] = idempotencyKey;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('agentEmail');
          window.location.href = '/';
        } else if (error.response?.status === 429) {
          toast.error('Too many requests. Please slow down.');
        } else if (error.response?.data?.error?.message) {
          toast.error(error.response.data.error.message);
        } else {
          toast.error('An unexpected error occurred');
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data;
  }
  
  async post<T>(url: string, data?: any, idempotencyKey?: string): Promise<ApiResponse<T>> {
    const headers: any = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    
    const response = await this.client.post<ApiResponse<T>>(url, data, { headers });
    return response.data;
  }
  
  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data;
  }
  
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data;
  }
}

export const apiService = new ApiService();