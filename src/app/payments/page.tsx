'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Wallet, AlertCircle, User, ChevronRight } from 'lucide-react';
import { getReceivables } from '@/lib/queries/payments';
import { PaymentStatus } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const filterTabs: { id: string; label: string; status?: PaymentStatus }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'unpaid', label: 'Ödenmedi', status: 'unpaid' },
  { id: 'partial', label: 'Kısmi Ödendi', status: 'partial' },
];

const paymentBadgeConfig: Record<
  PaymentStatus,
  { label: string; variantClass: string }
> = {
  unpaid: {
    label: 'Ödenmedi',
    variantClass: 'bg-red-950/60 text-red-300 border-red-800/80',
  },
  partial: {
    label: 'Kısmi Ödendi',
    variantClass: 'bg-amber-950/60 text-amber-300 border-amber-800/80',
  },
  paid: {
    label: 'Ödendi',
    variantClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80',
  },
};

export default function PaymentsPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['receivables', activeFilter],
    queryFn: () => getReceivables(activeFilter !== 'all' ? activeFilter : undefined),
  });

  const receivables = data?.receivables || [];
  const totalReceivableSum = data?.totalReceivableSum || 0;

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 tracking-tight">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <span>Alacaklarım</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Müşteri ödemeleri ve tahsilat takibi
        </p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-emerald-900/40 shadow-lg">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-400/90 uppercase tracking-wider block">
              Toplam Alacak
            </span>
            <span className="font-mono text-2xl font-black text-emerald-400 block mt-0.5">
              ₺{totalReceivableSum.toLocaleString('tr-TR')}
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Wallet className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-2 rounded-xl border whitespace-nowrap font-medium transition ${
                isActive
                  ? 'border-emerald-500/80 bg-emerald-950/60 text-emerald-300 font-semibold'
                  : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3 pt-1">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 bg-slate-900/80 border border-slate-800/80 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 bg-red-950/40 border border-red-800/60 rounded-2xl text-center space-y-3 my-4">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs font-semibold text-red-200">
            Alacak bilgileri yüklenemedi. ({error instanceof Error ? error.message : ''})
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Tekrar Dene
          </Button>
        </div>
      ) : receivables.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-800 bg-slate-950/40 rounded-2xl text-center space-y-3 my-2">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">
              Alacak kaydı bulunmuyor.
            </p>
            <p className="text-xs text-slate-500">
              Tüm müşterilerinizin ödemeleri tamamlanmış görünüyor.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {receivables.map(({ job, summary }) => {
            const badge = paymentBadgeConfig[summary.paymentState];

            return (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                <Card className="hover:border-slate-700 bg-slate-900/80 transition duration-150 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    {/* Header Row: Customer Name & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        {job.customer && (
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-100 group-hover:text-blue-400 transition truncate">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{job.customer.name}</span>
                          </div>
                        )}
                        <h3 className="text-xs text-slate-400 truncate">
                          {job.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-xs px-2.5 py-0.5 border ${badge.variantClass}`}
                        >
                          {badge.label}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
                      </div>
                    </div>

                    {/* Financial Summary Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                      <div className="p-2 bg-slate-950/60 rounded-lg">
                        <span className="text-[10px] text-slate-500 block uppercase">
                          Toplam
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-300 block truncate">
                          ₺{summary.totalPrice.toLocaleString('tr-TR')}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-950/60 rounded-lg">
                        <span className="text-[10px] text-slate-500 block uppercase">
                          Ödenen
                        </span>
                        <span className="font-mono text-xs font-semibold text-emerald-400 block truncate">
                          ₺{summary.totalPaid.toLocaleString('tr-TR')}
                        </span>
                      </div>

                      <div className="p-2 bg-amber-950/30 rounded-lg border border-amber-800/40">
                        <span className="text-[10px] text-amber-400/80 block uppercase font-semibold">
                          Kalan
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-400 block truncate">
                          ₺{summary.remainingBalance.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
