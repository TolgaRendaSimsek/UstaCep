'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { createCustomer, CustomerInput } from '@/lib/queries/customers';
import { CustomerForm } from '@/components/customers/customer-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NewCustomerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (values: CustomerInput) => createCustomer(values),
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.push(`/customers/${newCustomer.id}`);
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || 'Müşteri kaydedilirken bir hata oluştu.');
    },
  });

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/customers">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
            <span className="sr-only">Geri</span>
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            <span>Yeni Müşteri Ekle</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Müşteri iletişim ve adres bilgilerini kaydedin</p>
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
            onSubmit={(values) => {
              setErrorMsg(null);
              mutation.mutate(values);
            }}
            isSubmitting={mutation.isPending}
            submitButtonText="Müşteriyi Kaydet"
            onCancel={() => router.push('/customers')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
