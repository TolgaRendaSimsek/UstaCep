/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/client';
import { Payment, PaymentStatus, PaymentSummary, Job } from '@/types/database';

/**
 * Calculates payment totals and effective payment status based on job price and list of payments.
 */
export function calculatePaymentSummary(
  price: number | null | undefined,
  payments: Payment[] | { amount: number }[] = []
): PaymentSummary {
  const totalPrice = typeof price === 'number' && !isNaN(price) && price > 0 ? price : 0;
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const remainingBalance = Math.max(totalPrice - totalPaid, 0);

  let paymentState: PaymentStatus = 'unpaid';
  if (totalPrice > 0 && totalPaid > 0) {
    if (totalPaid >= totalPrice) {
      paymentState = 'paid';
    } else {
      paymentState = 'partial';
    }
  }

  return {
    totalPrice,
    totalPaid,
    remainingBalance,
    paymentState,
  };
}

export async function getPaymentsByJob(jobId: string): Promise<Payment[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
  }

  const { data, error } = await (supabase.from('payments' as any) as any)
    .select('*')
    .eq('job_id', jobId)
    .eq('user_id', user.id)
    .order('payment_date', { ascending: false });

  if (error) {
    throw new Error('Ödeme bilgileri yüklenemedi: ' + error.message);
  }

  return (data as Payment[]) || [];
}

export interface CreatePaymentInput {
  job_id: string;
  amount: number;
  payment_date?: string;
}

export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
  }

  // 1. Security Check: Verify user owns the job
  const { data: job, error: jobError } = await (supabase.from('jobs' as any) as any)
    .select('id, price, user_id')
    .eq('id', input.job_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (jobError || !job) {
    throw new Error('İş bulunamadı veya bu işe erişim yetkiniz yok.');
  }

  if (!job.price || job.price <= 0) {
    throw new Error('Ödeme eklemek için önce iş ücretini belirleyin.');
  }

  // 2. Fetch existing payments to calculate remaining balance
  const existingPayments = await getPaymentsByJob(input.job_id);
  const currentSummary = calculatePaymentSummary(job.price, existingPayments);

  if (input.amount <= 0) {
    throw new Error('Ödeme tutarı 0\'dan büyük olmalıdır.');
  }

  // Overpayment protection
  if (input.amount > currentSummary.remainingBalance) {
    throw new Error('Kalan tutardan daha yüksek ödeme giremezsin.');
  }

  const newSummary = calculatePaymentSummary(job.price, [
    ...existingPayments,
    { amount: input.amount } as Payment,
  ]);

  // 3. Insert payment record
  const { data: newPayment, error: insertError } = await (
    supabase.from('payments' as any) as any
  )
    .insert([
      {
        user_id: user.id,
        job_id: input.job_id,
        amount: input.amount,
        status: newSummary.paymentState,
        payment_date: input.payment_date || new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (insertError) {
    throw new Error('Ödeme kaydedilirken bir hata oluştu: ' + insertError.message);
  }

  // 4. Sync payment_status column on jobs table
  await (supabase.from('jobs' as any) as any)
    .update({ payment_status: newSummary.paymentState })
    .eq('id', input.job_id)
    .eq('user_id', user.id);

  return newPayment as Payment;
}

export async function deletePayment(id: string, jobId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
  }

  // 1. Delete payment record where user_id matches
  const { error: deleteError } = await (supabase.from('payments' as any) as any)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (deleteError) {
    throw new Error('Ödeme kaydı silinirken bir hata oluştu: ' + deleteError.message);
  }

  // 2. Recalculate remaining payments for the job and sync status
  const { data: job } = await (supabase.from('jobs' as any) as any)
    .select('id, price')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (job) {
    const remainingPayments = await getPaymentsByJob(jobId);
    const summary = calculatePaymentSummary(job.price, remainingPayments);

    await (supabase.from('jobs' as any) as any)
      .update({ payment_status: summary.paymentState })
      .eq('id', jobId)
      .eq('user_id', user.id);
  }
}

export interface ReceivableJobItem {
  job: Job;
  summary: PaymentSummary;
}

export async function getReceivables(statusFilter?: string): Promise<{
  receivables: ReceivableJobItem[];
  totalReceivableSum: number;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
  }

  const { data: jobs, error } = await (supabase.from('jobs' as any) as any)
    .select('*, customer:customers(id, name, phone), payments:payments(id, amount, payment_date)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Alacak bilgileri yüklenemedi: ' + error.message);
  }

  const allJobs = (jobs as any[]) || [];

  const receivables: ReceivableJobItem[] = [];
  let totalReceivableSum = 0;

  for (const rawJob of allJobs) {
    const paymentsList = rawJob.payments || [];
    const summary = calculatePaymentSummary(rawJob.price, paymentsList);

    // Only include jobs with remaining balance > 0 (unpaid or partial)
    if (summary.remainingBalance > 0 && summary.totalPrice > 0) {
      totalReceivableSum += summary.remainingBalance;

      // Filter by status if specified
      if (
        !statusFilter ||
        statusFilter === 'all' ||
        statusFilter === 'tumu' ||
        summary.paymentState === statusFilter
      ) {
        receivables.push({
          job: rawJob as Job,
          summary,
        });
      }
    }
  }

  return {
    receivables,
    totalReceivableSum,
  };
}
