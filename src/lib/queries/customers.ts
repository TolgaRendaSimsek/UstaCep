/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/client';
import { Customer } from '@/types/database';

export async function getCustomers(): Promise<Customer[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Oturum açılmamış.');

  const { data, error } = await (supabase.from('customers' as any) as any)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Customer[]) || [];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Oturum açılmamış.');

  const { data, error } = await (supabase.from('customers' as any) as any)
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return (data as Customer) || null;
}

export interface CustomerInput {
  name: string;
  phone: string;
  address?: string | null;
  notes?: string | null;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Oturum açılmamış.');

  const cleanPhone = input.phone.trim();

  const { data, error } = await (supabase.from('customers' as any) as any)
    .insert([
      {
        user_id: user.id,
        name: input.name.trim(),
        phone: cleanPhone,
        address: input.address?.trim() || null,
        notes: input.notes?.trim() || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Oturum açılmamış.');

  const cleanPhone = input.phone.trim();

  const { data, error } = await (supabase.from('customers' as any) as any)
    .update({
      name: input.name.trim(),
      phone: cleanPhone,
      address: input.address?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Customer;
}

export async function deleteCustomer(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Oturum açılmamış.');

  const { error } = await (supabase.from('customers' as any) as any)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
