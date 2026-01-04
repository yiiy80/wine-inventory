import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  UserLogin,
  Token,
  Wine,
  WineCreate,
  WineUpdate,
  WineListResponse,
  InventoryTransaction,
  TransactionCreate,
  TransactionListResponse,
  DashboardSummary,
  StockTrend,
  StockDistribution,
  OperationLog,
  LogListResponse,
} from '../types';

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证错误
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除本地token并重定向到登录页
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API响应工具函数
const handleResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

// 认证相关API
export const authAPI = {
  login: async (data: UserLogin): Promise<Token> => {
    const response = await api.post<Token>('/auth/login', data);
    return handleResponse(response);
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refresh: async (): Promise<Token> => {
    const response = await api.post<Token>('/auth/refresh');
    return handleResponse(response);
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return handleResponse(response);
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/auth/profile', data);
    return handleResponse(response);
  },

  changePassword: async (data: { current_password: string; new_password: string }): Promise<void> => {
    await api.put('/auth/password', data);
  },

  forgotPassword: async (data: { email: string }): Promise<void> => {
    await api.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: { token: string; new_password: string }): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },
};

// 红酒相关API
export const wineAPI = {
  getWines: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    region?: string;
    grape_variety?: string;
    supplier?: string;
    storage_location?: string;
    vintage_year?: number;
    min_price?: number;
    max_price?: number;
    stock_status?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<WineListResponse> => {
    const response = await api.get<WineListResponse>('/wines', { params });
    return handleResponse(response);
  },

  getWine: async (id: number): Promise<Wine> => {
    const response = await api.get<Wine>(`/wines/${id}`);
    return handleResponse(response);
  },

  createWine: async (data: WineCreate): Promise<Wine> => {
    const response = await api.post<Wine>('/wines', data);
    return handleResponse(response);
  },

  updateWine: async (id: number, data: WineUpdate): Promise<Wine> => {
    const response = await api.put<Wine>(`/wines/${id}`, data);
    return handleResponse(response);
  },

  deleteWine: async (id: number): Promise<void> => {
    await api.delete(`/wines/${id}`);
  },

  getLowStockWines: async (): Promise<Wine[]> => {
    const response = await api.get<Wine[]>('/wines/low-stock');
    return handleResponse(response);
  },

  getRegions: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/wines/regions');
    return handleResponse(response);
  },

  getVarieties: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/wines/varieties');
    return handleResponse(response);
  },

  getSuppliers: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/wines/suppliers');
    return handleResponse(response);
  },

  getLocations: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/wines/locations');
    return handleResponse(response);
  },
};

// 出入库相关API
export const inventoryAPI = {
  getTransactions: async (params?: {
    page?: number;
    page_size?: number;
    wine_id?: number;
    transaction_type?: string;
    start_date?: string;
    end_date?: string;
    performed_by?: number;
  }): Promise<TransactionListResponse> => {
    const response = await api.get<TransactionListResponse>('/inventory', { params });
    return handleResponse(response);
  },

  createStockIn: async (data: TransactionCreate): Promise<InventoryTransaction> => {
    const response = await api.post<InventoryTransaction>('/inventory/in', data);
    return handleResponse(response);
  },

  createStockOut: async (data: TransactionCreate): Promise<InventoryTransaction> => {
    const response = await api.post<InventoryTransaction>('/inventory/out', data);
    return handleResponse(response);
  },

  getTransaction: async (id: number): Promise<InventoryTransaction> => {
    const response = await api.get<InventoryTransaction>(`/inventory/${id}`);
    return handleResponse(response);
  },
};

// 仪表盘相关API
export const dashboardAPI = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get<DashboardSummary>('/dashboard/summary');
    return handleResponse(response);
  },

  getTrends: async (params?: {
    days?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<StockTrend[]> => {
    const response = await api.get<StockTrend[]>('/dashboard/trends', { params });
    return handleResponse(response);
  },

  getDistribution: async (): Promise<StockDistribution[]> => {
    const response = await api.get<StockDistribution[]>('/dashboard/distribution/region');
    return handleResponse(response);
  },

  getAlerts: async (): Promise<{ low_stock_count: number; out_of_stock_count: number }> => {
    const response = await api.get<{ low_stock_count: number; out_of_stock_count: number }>('/dashboard/alerts');
    return handleResponse(response);
  },
};

// 用户管理API (管理员专用)
export const userAPI = {
  getUsers: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    role?: string;
    is_active?: boolean;
  }): Promise<{ items: User[]; total: number; page: number; page_size: number; total_pages: number }> => {
    const response = await api.get('/users', { params });
    return handleResponse(response);
  },

  getUser: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return handleResponse(response);
  },

  createUser: async (data: {
    email: string;
    name: string;
    password: string;
    role?: string;
  }): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return handleResponse(response);
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return handleResponse(response);
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  toggleUserStatus: async (id: number): Promise<User> => {
    const response = await api.put<User>(`/users/${id}/status`, {});
    return handleResponse(response);
  },
};

// 操作日志API
export const logAPI = {
  getLogs: async (params?: {
    page?: number;
    page_size?: number;
    user_id?: number;
    action_type?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<LogListResponse> => {
    const response = await api.get<LogListResponse>('/logs', { params });
    return handleResponse(response);
  },

  getLog: async (id: number): Promise<OperationLog> => {
    const response = await api.get<OperationLog>(`/logs/${id}`);
    return handleResponse(response);
  },
};

// 数据导入导出API
export const exportAPI = {
  exportWines: async (params?: {
    format?: string;
    include_inactive?: boolean;
  }): Promise<Blob> => {
    const response = await api.get('/export/wines', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  exportTransactions: async (params?: {
    format?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Blob> => {
    const response = await api.get('/export/transactions', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  importWines: async (file: File): Promise<{ imported: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/import/wines', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return handleResponse(response);
  },
};

export default api;
