'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Phone,
  MessageCircle,
  User,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Job } from '@/types/database';
import { Header } from '@/components/layout/header';

export default function FinancialsPage() {
  const supabase = createClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['financial-jobs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await (supabase.from('jobs' as any) as any)
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Job[]) || [];
    },
  });

  // Calculate totals
  const totalRevenue = jobs.reduce((acc, j) => acc + (j.amount_paid || 0), 0);
  const totalReceivables = jobs.reduce((acc, j) => {
    const remaining = (j.price || 0) - (j.amount_paid || 0);
    return acc + (remaining > 0 ? remaining : 0);
  }, 0);
  const totalBilled = jobs.reduce((acc, j) => acc + (j.price || 0), 0);

  // Unpaid or partially paid jobs list
  const unpaidJobs = jobs.filter((j) => j.payment_status !== 'paid' && (j.price - j.amount_paid) > 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  const formatWhatsAppReminder = (phone: string, fullName: string, jobTitle: string, remaining: number) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '9' + clean;
    } else if (!clean.startsWith('90') && clean.length === 10) {
      clean = '90' + clean;
    }
    const message = encodeURIComponent(
      `Merhaba ${fullName}, "${jobTitle}" işi için kalan bakiye tutarı ${formatCurrency(remaining)} dir. Bilgilerinize sunarım.`
    );
    return `https://wa.me/${clean}?text=${message}`;
  };

  return (
    <div className="min-h-screen flex flex-col pb-6">
      <Header />

      <main className="flex-1 p-4 max-w-xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>Kazanç & Alacaklarım</span>
          </h2>
          <p className="text-xs text-slate-400">
            Ödemelerinizi ve alacak durumunuzu anlık takip edin
          </p>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Total Revenue */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Toplam Kazanç</span>
              <div className="p-2 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-400">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Tahsil Edilen Toplam Tutar</p>
          </div>

          {/* Unpaid Receivables */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Alacaklarım</span>
              <div className="p-2 bg-red-950/80 border border-red-800/80 rounded-xl text-red-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-extrabold text-red-400">
              {formatCurrency(totalReceivables)}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">{unpaidJobs.length} İşten Beklenen Bakiye</p>
          </div>
        </div>

        {/* Billed Summary Box */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Toplam İş Hacmi (Fiyatlandırılan)</p>
            <p className="text-base font-bold text-slate-200 mt-0.5">{formatCurrency(totalBilled)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Tahsilat Oranı</p>
            <p className="text-base font-bold text-blue-400 mt-0.5">
              {totalBilled > 0 ? `%${Math.round((totalRevenue / totalBilled) * 100)}` : '%0'}
            </p>
          </div>
        </div>

        {/* Unpaid Receivables List */}
        <div className="mb-4">
          <h3 className="font-bold text-slate-200 text-sm mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>Bekleyen Alacak Listesi ({unpaidJobs.length})</span>
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : unpaidJobs.length === 0 ? (
            <div className="text-center py-8 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">Tebrikler! Alacağınız bulunmuyor.</p>
              <p className="text-[11px] text-slate-500 mt-1">Tüm ödemeleriniz eksiksiz tahsil edildi.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unpaidJobs.map((job) => {
                const remaining = job.price - job.amount_paid;
                return (
                  <div
                    key={job.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-100 text-sm">{job.title}</h4>
                        {job.customer && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-slate-500" />
                            {job.customer.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-red-400 text-sm">
                          {formatCurrency(remaining)}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          Toplam: {formatCurrency(job.price)}
                        </p>
                      </div>
                    </div>

                    {job.customer && (
                      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                        <a
                          href={`tel:${job.customer.phone}`}
                          className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl flex items-center gap-1 transition"
                        >
                          <Phone className="w-3 h-3 text-blue-400" />
                          <span>Ara</span>
                        </a>
                        <a
                          href={formatWhatsAppReminder(
                            job.customer.phone,
                            job.customer.name,
                            job.title,
                            remaining
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-medium rounded-xl flex items-center gap-1.5 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Hatırlatma Gönder</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
