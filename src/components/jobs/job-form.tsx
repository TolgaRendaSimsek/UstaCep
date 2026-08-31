'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Search,
  Plus,
  AlertCircle,
  Calendar,
  Clock,
  Banknote,
  Check,
  ChevronDown,
} from 'lucide-react';
import { getCustomers } from '@/lib/queries/customers';
import { createJob } from '@/lib/queries/jobs';
import { Customer } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

// Validation Schema using Zod
const jobFormSchema = z.object({
  customer_id: z.string().min(1, 'Müşteri seçmelisin.'),
  title: z
    .string()
    .trim()
    .min(1, 'İş başlığı zorunludur.')
    .max(100, 'İş başlığı 100 karakterden uzun olamaz.'),
  description: z.string().optional(),
  price: z.string().optional().refine(
    (val) => {
      if (!val || val.trim() === '') return true;
      const num = Number(val.replace(',', '.'));
      return !isNaN(num) && num >= 0;
    },
    { message: 'Ücret geçerli ve 0 veya daha büyük bir değer olmalıdır.' }
  ),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  initialCustomerId?: string;
}

/**
 * Combines date (YYYY-MM-DD) and optional time (HH:mm) into a local ISO timestamp string.
 * If time is omitted, defaults to 09:00 AM local time.
 */
function parseAppointmentDateTime(dateStr?: string, timeStr?: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  const time = timeStr && timeStr.trim() !== '' ? timeStr.trim() : '09:00';
  const localDate = new Date(`${dateStr}T${time}:00`);
  if (isNaN(localDate.getTime())) return null;
  return localDate.toISOString();
}

export function JobForm({ initialCustomerId }: JobFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isCustomerSheetOpen, setIsCustomerSheetOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch customers belonging to the authenticated user
  const {
    data: customers = [],
    isLoading: isLoadingCustomers,
    isError: isCustomersError,
    error: customersError,
  } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      customer_id: '',
      title: '',
      description: '',
      price: '',
      appointmentDate: '',
      appointmentTime: '',
    },
  });

  const selectedCustomerId = useWatch({ control, name: 'customer_id' });

  // Customer preselection logic: If initialCustomerId is passed, verify and preselect
  useEffect(() => {
    if (initialCustomerId && customers.length > 0) {
      const exists = customers.some((c) => c.id === initialCustomerId);
      if (exists) {
        setValue('customer_id', initialCustomerId, { shouldValidate: true });
      }
    }
  }, [initialCustomerId, customers, setValue]);

  // Selected customer object for UI display
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null;

  // Filtered customer list for modal search
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return customers;
    const query = customerSearchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query)
    );
  }, [customers, customerSearchQuery]);

  // Job creation mutation
  const createJobMutation = useMutation({
    mutationFn: async (values: JobFormValues) => {
      const parsedPrice =
        values.price && values.price.trim() !== ''
          ? Number(values.price.replace(',', '.'))
          : 0;

      const appointmentIso = parseAppointmentDateTime(
        values.appointmentDate,
        values.appointmentTime
      );

      return await createJob({
        customer_id: values.customer_id,
        title: values.title,
        description: values.description,
        price: parsedPrice,
        appointment_date: appointmentIso,
      });
    },
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      if (newJob.customer_id) {
        queryClient.invalidateQueries({
          queryKey: ['customer-jobs', newJob.customer_id],
        });
      }
      router.push(`/jobs/${newJob.id}`);
    },
    onError: (err: Error) => {
      setSubmitError(
        err.message || 'İş kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    },
  });

  const onSubmit = (data: JobFormValues) => {
    setSubmitError(null);
    createJobMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto pb-8">
      {/* Top Error Alert */}
      {submitError && (
        <div className="p-3.5 bg-red-950/80 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* FIELD 1: MÜŞTERİ */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-400" />
            <span>Müşteri *</span>
          </span>
        </label>

        {isLoadingCustomers ? (
          <div className="h-14 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
        ) : isCustomersError ? (
          <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>
              Müşteriler yüklenemedi. ({customersError instanceof Error ? customersError.message : ''})
            </span>
          </div>
        ) : customers.length === 0 ? (
          /* Empty Customer State */
          <Card className="border-dashed border-slate-800 bg-slate-950/50">
            <CardContent className="p-4 text-center space-y-3">
              <p className="text-xs text-slate-400 font-medium">Henüz müşteri eklenmemiş.</p>
              <Link href="/customers/new" className="inline-block">
                <Button variant="outline" size="sm" type="button" className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Müşteri Ekle</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Customer Selection Trigger Button */
          <div>
            <button
              type="button"
              onClick={() => setIsCustomerSheetOpen(true)}
              className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition min-h-[56px] ${
                errors.customer_id
                  ? 'border-red-500/80 bg-red-950/20'
                  : selectedCustomer
                  ? 'border-blue-500/50 bg-slate-900/90 text-slate-100'
                  : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
              }`}
            >
              {selectedCustomer ? (
                <div className="space-y-0.5">
                  <span className="font-semibold text-sm text-slate-100 block">
                    {selectedCustomer.name}
                  </span>
                  <span className="font-mono text-xs text-slate-400 block">
                    {selectedCustomer.phone}
                  </span>
                </div>
              ) : (
                <span className="text-sm">Müşteri Seçin</span>
              )}
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>
        )}

        {errors.customer_id && (
          <p className="text-xs text-red-400 font-medium mt-1">
            {errors.customer_id.message}
          </p>
        )}
      </div>

      {/* FIELD 2: İŞ BAŞLIĞI */}
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-xs font-semibold text-slate-300 block">
          İş Başlığı *
        </label>
        <Input
          id="title"
          placeholder="Örn: Klima Bakımı, Elektrik Arızası..."
          {...register('title')}
          className={`min-h-[48px] ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && (
          <p className="text-xs text-red-400 font-medium mt-1">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* FIELD 3: AÇIKLAMA */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="text-xs font-semibold text-slate-300 block">
          Açıklama (İsteğe bağlı)
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Örn: Salon kliması soğutmuyor. Filtre kontrol edilecek."
          {...register('description')}
          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
        />
      </div>

      {/* FIELD 4: ÜCRET */}
      <div className="space-y-1.5">
        <label htmlFor="price" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Banknote className="w-4 h-4 text-emerald-400" />
          <span>Ücret (₺) (İsteğe bağlı)</span>
        </label>
        <div className="relative">
          <Input
            id="price"
            type="text"
            inputMode="decimal"
            placeholder="Örn: 1500"
            {...register('price')}
            className={`min-h-[48px] pr-10 font-mono ${errors.price ? 'border-red-500' : ''}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            TL
          </span>
        </div>
        {errors.price && (
          <p className="text-xs text-red-400 font-medium mt-1">
            {errors.price.message}
          </p>
        )}
      </div>

      {/* FIELD 5 & 6: RANDEVU TARİHİ & SAATİ */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Randevu (İsteğe bağlı)</span>
        </span>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="appointmentDate" className="text-[11px] text-slate-400 block mb-1">
              Tarih
            </label>
            <Input
              id="appointmentDate"
              type="date"
              {...register('appointmentDate')}
              className="min-h-[48px] bg-slate-950 text-slate-100 text-xs"
            />
          </div>

          <div>
            <label htmlFor="appointmentTime" className="text-[11px] text-slate-400 block mb-1">
              Saat
            </label>
            <div className="relative">
              <Input
                id="appointmentTime"
                type="time"
                {...register('appointmentTime')}
                className="min-h-[48px] bg-slate-950 text-slate-100 text-xs pl-8"
              />
              <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="pt-4 space-y-3">
        <Button
          type="submit"
          className="w-full min-h-[52px] text-base font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 rounded-xl"
          disabled={createJobMutation.isPending}
        >
          {createJobMutation.isPending ? 'Kaydediliyor...' : 'İşi Kaydet'}
        </Button>

        <Link href="/jobs" className="block text-center">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-slate-400 hover:text-slate-200"
            disabled={createJobMutation.isPending}
          >
            Vazgeç
          </Button>
        </Link>
      </div>

      {/* MOBILE-FRIENDLY CUSTOMER SELECTOR SHEET */}
      <Sheet open={isCustomerSheetOpen} onOpenChange={setIsCustomerSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] flex flex-col p-4 pb-6">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-base text-slate-100 flex items-center justify-between">
              <span>Müşteri Seçin</span>
              <Link href="/customers/new" onClick={() => setIsCustomerSheetOpen(false)}>
                <span className="text-xs text-blue-400 hover:underline font-normal flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Müşteri</span>
                </span>
              </Link>
            </SheetTitle>
          </SheetHeader>

          {/* Search Bar */}
          <div className="relative py-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="İsim veya telefon ile ara..."
              value={customerSearchQuery}
              onChange={(e) => setCustomerSearchQuery(e.target.value)}
              className="pl-9 min-h-[44px] bg-slate-950 text-xs"
            />
          </div>

          {/* Customer List */}
          <div className="flex-1 overflow-y-auto space-y-2 py-2">
            {filteredCustomers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Aradığınız kriterlere uygun müşteri bulunamadı.
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = cust.id === selectedCustomerId;
                return (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => {
                      setValue('customer_id', cust.id, { shouldValidate: true });
                      setIsCustomerSheetOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition min-h-[52px] ${
                      isSelected
                        ? 'border-blue-500/80 bg-blue-950/40 text-slate-100'
                        : 'border-slate-800/80 bg-slate-950/50 hover:bg-slate-900 text-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-sm block">{cust.name}</span>
                      <span className="font-mono text-xs text-slate-400 block">{cust.phone}</span>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>
    </form>
  );
}
