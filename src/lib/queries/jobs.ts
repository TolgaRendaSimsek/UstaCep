/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/client';
import { Job } from '@/types/database';

export interface CreateJobInput {
  customer_id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  appointment_date?: string | null;
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
  }

  // Security check: Verify customer belongs to the authenticated user
  const { data: customer, error: customerError } = await (
    supabase.from('customers' as any) as any
  )
    .select('id')
    .eq('id', input.customer_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (customerError || !customer) {
    throw new Error('Seçilen müşteri bulunamadı veya bu müşteriye erişim yetkiniz yok.');
  }

  const cleanTitle = input.title.trim();
  if (!cleanTitle) {
    throw new Error('İş başlığı zorunludur.');
  }

  const { data, error } = await (supabase.from('jobs' as any) as any)
    .insert([
      {
        user_id: user.id,
        customer_id: input.customer_id,
        title: cleanTitle,
        description: input.description?.trim() || null,
        status: 'waiting',
        payment_status: 'unpaid',
        price: typeof input.price === 'number' && !isNaN(input.price) ? input.price : 0,
        amount_paid: 0,
        appointment_date: input.appointment_date || null,
        photo_urls: [],
      },
    ])
    .select('*, customer:customers(*)')
    .single();

  if (error) {
    throw new Error('İş kaydedilirken bir hata oluştu: ' + error.message);
  }

  return data as Job;
}

export async function getJobById(id: string): Promise<Job | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
  }

  const { data, error } = await (supabase.from('jobs' as any) as any)
    .select('*, customer:customers(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return (data as Job) || null;
}
