export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
}

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

export interface InventoryTransaction {
  id: number;
  wine_id: number;
  wine?: Wine;
  transaction_type: 'in' | 'out';
  quantity: number;
  reason?: string;
  performed_by: number;
  performer?: User;
  created_at: string;
}

export interface DashboardStats {
  total_wines: number;
  total_stock: number;
  total_value: number;
  low_stock_count: number;
  recent_transactions: InventoryTransaction[];
}

export interface OperationLog {
  id: number;
  user_id: number;
  user?: User;
  action_type: string;
  entity_type?: string;
  entity_id?: number;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
