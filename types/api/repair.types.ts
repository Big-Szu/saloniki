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
}