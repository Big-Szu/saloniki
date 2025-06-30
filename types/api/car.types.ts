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