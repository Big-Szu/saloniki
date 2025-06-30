// User and Authentication Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Car Related Types
export interface Car {
  id: string;
  user_id: string;
  make_id: number;
  model_id: number;
  engine: string;
  year: number;
  vin?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  // Virtual fields for display
  make?: string;
  model?: string;
}

export interface CarMake {
  id: number;
  name: string;
  logo?: string;
}

export interface CarModel {
  id: number;
  make_id: number;
  name: string;
}

// Repair Types
export interface Repair {
  id: string;
  car_id: string;
  workshop_id?: string;
  repair_date: string;
  description: string;
  cost: number;
  currency: string;
  mileage: number;
  confirmed: boolean;
  created_at: string;
  updated_at: string;
  // Virtual fields
  workshop?: Workshop;
}

// Workshop Types
export interface Workshop {
  id: string;
  logo?: string;
  name: string;
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  webpage?: string;
  created_at: string;
  updated_at: string;
}

// Form Types
export interface CarFormData {
  make_id: number;
  model_id: number;
  engine: string;
  year: number;
  vin?: string;
  color?: string;
}

export interface RepairFormData {
  description: string;
  repair_date: string;
  cost: number;
  currency: string;
  mileage: number;
  workshop_id?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}