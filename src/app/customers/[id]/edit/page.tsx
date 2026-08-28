'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, ArrowLeft, AlertCircle } from 'lucide-react';
import { getCustomerById, updateCustomer, CustomerInput } from '@/lib/queries/customers';
import { CustomerForm } from '@/components/customers/customer-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const customerId = params.id as string;
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch existing customer data
  const {
    data: customer,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['customers', customerId],
    queryFn: () => getCustomerById(customerId),
    enabled: Boolean(customerId),
  });

  // Update mutation
  const mutation = useMutation({
    mutationFn: (values: CustomerInput) => updateCustomer(customerId, values),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
      router.push(`/customers/${updated.id}`);
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || 'Müşteri güncellenirken bir hata oluştu.');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        <div className="h-8 bg-slate-900 border border-slate-800 rounded-xl animate-pulse w-1/2" />
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="space-y-4 max-w-lg mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
        <p className="text-sm font-semibold text-slate-200">
          {isError ? (error as Error).message : 'Müşteri bulunamadı.'}
        </p>
        <Link href="/customers">
          <Button variant="outline" size="sm" className="mt-2">
            Müşteri Listesine Dön
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Link href={`/customers/${customer.id}`}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
            <span className="sr-only">Geri</span>
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-blue-500" />
            <span>Müşteriyi Düzenle</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{customer.name} bilgilerini güncelleyin</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <CustomerForm
            initialValues={{
              name: customer.name,
              phone: customer.phone,
              address: customer.address || '',
              notes: customer.notes || '',
            }}
            onSubmit={(values) => {
              setErrorMsg(null);
              mutation.mutate(values);
            }}
            isSubmitting={mutation.isPending}
            submitButtonText="Değişiklikleri Kaydet"
            onCancel={() => router.push(`/customers/${customer.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
