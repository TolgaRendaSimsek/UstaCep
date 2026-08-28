'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const customerSchema = z.object({
  name: z
    .string()
    .min(1, 'Ad soyad zorunludur.')
    .min(2, 'Ad soyad en az 2 karakter olmalıdır.'),
  phone: z
    .string()
    .min(1, 'Telefon numarası zorunludur.')
    .min(10, 'Geçerli bir telefon numarası giriniz (en az 10 hane).'),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialValues?: Partial<CustomerFormValues>;
  onSubmit: (values: CustomerFormValues) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  onCancel?: () => void;
}

export function CustomerForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Kaydet',
  onCancel,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialValues?.name || '',
      phone: initialValues?.phone || '',
      address: initialValues?.address || '',
      notes: initialValues?.notes || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Ad Soyad *
        </label>
        <Input
          type="text"
          placeholder="Ahmet Yılmaz"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-[11px] text-red-400 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Telefon Numarası *
        </label>
        <Input
          type="tel"
          placeholder="0532 000 00 00"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-[11px] text-red-400 mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Adres (İsteğe Bağlı)
        </label>
        <Input
          type="text"
          placeholder="Mahalle, Sokak, No, İlçe"
          {...register('address')}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Notlar (İsteğe Bağlı)
        </label>
        <textarea
          rows={3}
          placeholder="Daire no, zil adı veya müşteriyle ilgili notlar..."
          {...register('notes')}
          className="flex w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="pt-3 flex items-center gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            İptal
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 font-semibold shadow-md shadow-blue-600/30"
        >
          {isSubmitting ? 'Kaydediliyor...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
