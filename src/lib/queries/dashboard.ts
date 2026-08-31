/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/client';
import { Job } from '@/types/database';
import { getReceivables } from '@/lib/queries/payments';

/**
 * Returns ISO timestamp boundaries for today in local user time (00:00 today to 00:00 tomorrow).
 */
export function getLocalDayBoundaries(): { startOfDayIso: string; endOfDayIso: string } {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return {
    startOfDayIso: startOfDay.toISOString(),
    endOfDayIso: endOfDay.toISOString(),
  };
}

/**
 * Returns ISO timestamp boundaries for current month in local user time.
 */
export function getLocalMonthBoundaries(): { startOfMonthIso: string; endOfMonthIso: string } {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  return {
    startOfMonthIso: startOfMonth.toISOString(),
    endOfMonthIso: endOfMonth.toISOString(),
  };
}

export interface DashboardSummary {
  todayJobsCount: number;
  waitingJobsCount: number;
  completedThisMonthCount: number;
  totalReceivable: number;
  collectedThisMonth: number;
  todayJobs: Job[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Oturum açılmamış. Lütfen tekrar giriş yapın.');
  }

  const { startOfDayIso, endOfDayIso } = getLocalDayBoundaries();
  const { startOfMonthIso, endOfMonthIso } = getLocalMonthBoundaries();

  // 1. Today's Jobs List & Count
  const { data: todayJobsData, count: todayJobsCount, error: todayError } = await (
    supabase.from('jobs' as any) as any
  )
    .select('*, customer:customers(id, name, phone)', { count: 'exact' })
    .eq('user_id', user.id)
    .gte('appointment_date', startOfDayIso)
    .lt('appointment_date', endOfDayIso)
    .order('appointment_date', { ascending: true })
    .limit(5);

  if (todayError) {
    throw new Error('Bugünkü işler yüklenemedi: ' + todayError.message);
  }

  // 2. Waiting Jobs Count
  const { count: waitingJobsCount, error: waitingError } = await (
    supabase.from('jobs' as any) as any
  )
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'waiting');

  if (waitingError) {
    throw new Error('Bekleyen işler yüklenemedi: ' + waitingError.message);
  }

  // 3. Completed Jobs Count This Month
  // Note: MVP approximation using updated_at for jobs currently in completed status.
  const { count: completedThisMonthCount, error: completedError } = await (
    supabase.from('jobs' as any) as any
  )
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('updated_at', startOfMonthIso)
    .lt('updated_at', endOfMonthIso);

  if (completedError) {
    throw new Error('Tamamlanan işler yüklenemedi: ' + completedError.message);
  }

  // 4. Total Outstanding Receivables Sum
  const { totalReceivableSum } = await getReceivables();

  // 5. Collected Payments This Month
  const { data: monthPayments, error: paymentsError } = await (
    supabase.from('payments' as any) as any
  )
    .select('amount')
    .eq('user_id', user.id)
    .gte('payment_date', startOfMonthIso)
    .lt('payment_date', endOfMonthIso);

  if (paymentsError) {
    throw new Error('Tahsilat bilgileri yüklenemedi: ' + paymentsError.message);
  }

  const collectedThisMonth = (monthPayments || []).reduce(
    (sum: number, p: any) => sum + (Number(p.amount) || 0),
    0
  );

  return {
    todayJobsCount: todayJobsCount || 0,
    waitingJobsCount: waitingJobsCount || 0,
    completedThisMonthCount: completedThisMonthCount || 0,
    totalReceivable: totalReceivableSum || 0,
    collectedThisMonth: collectedThisMonth || 0,
    todayJobs: (todayJobsData as Job[]) || [],
  };
}
