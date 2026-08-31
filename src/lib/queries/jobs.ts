/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/client';
import { Job, JobStatus } from '@/types/database';

export interface CreateJobInput {
  customer_id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  appointment_date?: string | null;
}

export interface UpdateJobInput {
  customer_id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  appointment_date?: string | null;
}

export interface GetJobsParams {
  status?: string;
  search?: string;
}

export async function getJobs(params?: GetJobsParams): Promise<Job[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
  }

  let query = (supabase.from('jobs' as any) as any)
    .select('*, customer:customers(id, name, phone)')
    .eq('user_id', user.id);

  if (params?.status && params.status !== 'all' && params.status !== 'tumu') {
    query = query.eq('status', params.status);
  }

  // Priority ordering: scheduled appointments first (nearest first), then unscheduled by created_at desc
  query = query
    .order('appointment_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new Error('İşler yüklenemedi: ' + error.message);
  }

  let jobs = (data as Job[]) || [];

  // In-memory search filter for title or customer name
  if (params?.search && params.search.trim() !== '') {
    const q = params.search.trim().toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        (job.customer?.name && job.customer.name.toLowerCase().includes(q))
    );
  }

  return jobs;
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
    .select('*, customer:customers(id, name, phone)')
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
    .select('*, customer:customers(id, name, phone, address, notes)')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return (data as Job) || null;
}

export async function updateJob(id: string, input: UpdateJobInput): Promise<Job> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
  }

  // Security check: Verify customer belongs to authenticated user
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
    .update({
      customer_id: input.customer_id,
      title: cleanTitle,
      description: input.description?.trim() || null,
      price: typeof input.price === 'number' && !isNaN(input.price) ? input.price : 0,
      appointment_date: input.appointment_date || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, customer:customers(id, name, phone)')
    .single();

  if (error) {
    throw new Error('İş güncellenirken bir hata oluştu: ' + error.message);
  }

  return data as Job;
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<Job> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
  }

  const { data, error } = await (supabase.from('jobs' as any) as any)
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, customer:customers(id, name, phone)')
    .single();

  if (error) {
    throw new Error('Durum güncellenirken bir hata oluştu: ' + error.message);
  }

  return data as Job;
}

export async function deleteJob(id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
  }

  const { error } = await (supabase.from('jobs' as any) as any)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error('İş silinirken bir hata oluştu: ' + error.message);
  }
}
