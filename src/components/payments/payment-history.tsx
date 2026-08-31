'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Banknote, Trash2, Calendar, AlertCircle, History } from 'lucide-react';
import { getPaymentsByJob, deletePayment } from '@/lib/queries/payments';
import { Payment } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface PaymentHistoryProps {
  jobId: string;
}

export function PaymentHistory({ jobId }: PaymentHistoryProps) {
  const queryClient = useQueryClient();
  const [selectedPaymentToDelete, setSelectedPaymentToDelete] = useState<Payment | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: payments = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['payments', jobId],
    queryFn: () => getPaymentsByJob(jobId),
    enabled: Boolean(jobId),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => deletePayment(paymentId, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSelectedPaymentToDelete(null);
    },
    onError: (err: Error) => {
      setDeleteError(
        err.message || 'Ödeme kaydı silinirken bir hata oluştu.'
      );
    },
  });

  if (isLoading) {
    return (
      <div className="h-24 bg-slate-950/60 border border-slate-800 rounded-xl animate-pulse" />
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
        <span>Ödeme bilgileri yüklenemedi. ({error instanceof Error ? error.message : ''})</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-4 h-4 text-emerald-400" />
          <span>Ödeme Geçmişi</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {payments.length === 0 ? (
          <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 text-center text-xs text-slate-500">
            Henüz ödeme kaydı yok.
          </div>
        ) : (
          payments.map((p) => {
            const formattedDate = new Date(p.payment_date).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <div
                key={p.id}
                className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 font-mono font-bold text-sm text-emerald-400">
                    <Banknote className="w-4 h-4 shrink-0" />
                    <span>₺{Number(p.amount).toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-purple-400 shrink-0" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDeleteError(null);
                    setSelectedPaymentToDelete(p);
                  }}
                  className="w-8 h-8 text-slate-500 hover:text-red-400 hover:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">Sil</span>
                </Button>
              </div>
            );
          })
        )}
      </CardContent>

      {/* Delete Payment Confirmation Sheet */}
      <Sheet
        open={Boolean(selectedPaymentToDelete)}
        onOpenChange={(open) => {
          if (!open) setSelectedPaymentToDelete(null);
        }}
      >
        <SheetContent side="bottom" className="pb-8">
          <SheetHeader>
            <SheetTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Ödeme Kaydı Silinecek</span>
            </SheetTitle>
          </SheetHeader>

          {selectedPaymentToDelete && (
            <div className="py-4 space-y-4">
              <p className="text-sm text-slate-200">
                <strong className="text-emerald-400 font-mono">
                  ₺{Number(selectedPaymentToDelete.amount).toLocaleString('tr-TR')}
                </strong>{' '}
                tutarındaki ödeme kaydını silmek istediğine emin misin?
              </p>
              <p className="text-xs text-slate-400">
                Bu işlem kalan alacak bakiyesini ve ödeme durumunu otomatik güncelleyecektir.
              </p>

              {deleteError && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedPaymentToDelete(null)}
                >
                  İptal
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 font-semibold"
                  disabled={deletePaymentMutation.isPending}
                  onClick={() => {
                    setDeleteError(null);
                    deletePaymentMutation.mutate(selectedPaymentToDelete.id);
                  }}
                >
                  {deletePaymentMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
