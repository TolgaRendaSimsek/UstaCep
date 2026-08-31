'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Banknote, Calendar, AlertCircle } from 'lucide-react';
import { createPayment } from '@/lib/queries/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobPrice: number;
  remainingBalance: number;
}

export function PaymentModal({
  open,
  onOpenChange,
  jobId,
  jobPrice,
  remainingBalance,
}: PaymentModalProps) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const paymentSchema = z.object({
    amount: z
      .string()
      .trim()
      .min(1, 'Ödeme tutarı zorunludur.')
      .refine(
        (val) => {
          const num = Number(val.replace(',', '.'));
          return !isNaN(num) && num > 0;
        },
        { message: "Ödeme tutarı 0'dan büyük olmalıdır." }
      )
      .refine(
        (val) => {
          const num = Number(val.replace(',', '.'));
          return num <= remainingBalance;
        },
        { message: 'Kalan tutardan daha yüksek ödeme giremezsin.' }
      ),
    paymentDate: z.string().optional(),
  });

  type PaymentFormValues = z.infer<typeof paymentSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: '',
      paymentDate: todayStr,
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSubmitError(null);
      reset({
        amount: '',
        paymentDate: todayStr,
      });
    }
    onOpenChange(newOpen);
  };

  const addPaymentMutation = useMutation({
    mutationFn: async (values: PaymentFormValues) => {
      const parsedAmount = Number(values.amount.replace(',', '.'));
      const paymentDateIso = values.paymentDate
        ? new Date(values.paymentDate).toISOString()
        : new Date().toISOString();

      return await createPayment({
        job_id: jobId,
        amount: parsedAmount,
        payment_date: paymentDateIso,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      handleOpenChange(false);
    },
    onError: (err: Error) => {
      setSubmitError(
        err.message || 'Ödeme kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    setSubmitError(null);
    addPaymentMutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base text-slate-100 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-emerald-400" />
            <span>Ödeme Ekle</span>
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="py-3 space-y-4">
          {/* Remaining Balance Info Card */}
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-400 block">
                İş Ücreti: ₺{jobPrice.toLocaleString('tr-TR')}
              </span>
              <span className="text-xs text-emerald-300 font-semibold block">
                Kalan Alacak:
              </span>
            </div>
            <span className="font-mono text-base font-bold text-emerald-400">
              ₺{remainingBalance.toLocaleString('tr-TR')}
            </span>
          </div>

          {/* Submit Error Banner */}
          {submitError && (
            <div className="p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label htmlFor="amount" className="text-xs font-semibold text-slate-300 block">
              Ödeme Tutarı (₺) *
            </label>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder={`Örn: ${remainingBalance}`}
                {...register('amount')}
                className={`min-h-[48px] pr-10 font-mono text-sm ${
                  errors.amount ? 'border-red-500' : ''
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                TL
              </span>
            </div>
            {errors.amount && (
              <p className="text-xs text-red-400 font-medium mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Payment Date Input */}
          <div className="space-y-1.5">
            <label htmlFor="paymentDate" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Ödeme Tarihi</span>
            </label>
            <Input
              id="paymentDate"
              type="date"
              {...register('paymentDate')}
              className="min-h-[48px] bg-slate-950 text-slate-100 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-h-[48px]"
              onClick={() => onOpenChange(false)}
              disabled={addPaymentMutation.isPending}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="flex-1 min-h-[48px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              disabled={addPaymentMutation.isPending}
            >
              {addPaymentMutation.isPending ? 'Kaydediliyor...' : 'Ödemeyi Kaydet'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
