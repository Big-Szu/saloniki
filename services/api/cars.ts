// services/api/cars.ts
import { supabase } from '@/services/supabase/client';
import { Car, CarMake, CarModel } from '@/types';

export async function getCars(userId: string) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCarById(id: string) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCar(carData: Partial<Car>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('cars')
    .insert({
      ...carData,
      user_id: userData.user.id
    })
    .select()
    .single();

  return { data, error };
}

export async function updateCar(id: string, updates: Partial<Car>) {
  const { data, error } = await supabase
    .from('cars')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteCar(id: string) {
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', id);

  return { error };
}

export async function getCarMakes(): Promise<CarMake[]> {
  const { data, error } = await supabase
    .from('car_makes')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getCarModelsForMake(makeId: number): Promise<CarModel[]> {
  const { data, error } = await supabase
    .from('car_models')
    .select('*')
    .eq('make_id', makeId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getCarWithDetails(id: string) {
  const { data, error } = await supabase
    .from('cars')
    .select(`
      *,
      car_makes (name, logo),
      car_models (name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getCarsForUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllCarModels(): Promise<CarModel[]> {
  const { data, error } = await supabase
    .from('car_models')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}