// 用户相关类型
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserLogin {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}

// 红酒相关类型
export interface Wine {
  id: number;
  name: string;
  vintage_year: number;
  region: string;
  grape_variety?: string;
  price?: number;
  supplier?: string;
  storage_location?: string;
  current_stock: number;
  low_stock_threshold: number;
  notes?: string;
  image_url?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface WineCreate {
  name: string;
  vintage_year: number;
  region: string;
  grape_variety?: string;
  price?: number;
  supplier?: string;
  storage_location?: string;
  current_stock?: number;
  low_stock_threshold?: number;
  notes?: string;
  image_url?: string;
}

export interface WineUpdate {
  name?: string;
  vintage_year?: number;
  region?: string;
  grape_variety?: string;
  price?: number;
  supplier?: string;
  storage_location?: string;
  current_stock?: number;
  low_stock_threshold?: number;
  notes?: string;
  image_url?: string;
}

export interface WineListResponse {
  items: Wine[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 出入库相关类型
export interface InventoryTransaction {
  id: number;
  wine_id: number;
  transaction_type: 'in' | 'out';
  quantity: number;
  reason?: string;
  performed_by?: number;
  created_at: string;
  wine_name?: string;
  performer_name?: string;
}

export interface TransactionCreate {
  wine_id: number;
  quantity: number;
  reason?: string;
}

export interface TransactionListResponse {
  items: InventoryTransaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 仪表盘相关类型
export interface DashboardSummary {
  total_wines: number;
  total_stock: number;
  total_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

export interface StockTrend {
  date: string;
  stock_in: number;
  stock_out: number;
}

export interface StockDistribution {
  name: string;
  value: number;
}

// 操作日志相关类型
export interface OperationLog {
  id: number;
  user_id?: number;
  user_name?: string;
  action_type: string;
  entity_type?: string;
  entity_id?: number;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface LogListResponse {
  items: OperationLog[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// API响应通用类型
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

// 表单验证错误类型
export interface ValidationError {
  field: string;
  message: string;
}

// 筛选和排序类型
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

// 主题类型
export type Theme = 'light' | 'dark';

// 股票状态类型
export type StockStatus = 'normal' | 'low' | 'out';

// 事务类型
export type TransactionType = 'in' | 'out';

// 用户角色类型
export type UserRole = 'admin' | 'user';

// 导出格式类型
export type ExportFormat = 'csv' | 'excel';

// 日期范围类型
export interface DateRange {
  start: string;
  end: string;
}
