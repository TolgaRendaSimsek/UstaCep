'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Phone,
  MapPin,
  FileText,
  Calendar,
  Edit2,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Briefcase,
  Plus,
} from 'lucide-react';
import { getCustomerById, deleteCustomer } from '@/lib/queries/customers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const customerId = params.id as string;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Query customer details
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteCustomer(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.push('/customers');
    },
    onError: (err: Error) => {
      setDeleteError(err.message || 'Müşteri silinirken bir hata oluştu.');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        <div className="h-8 bg-slate-900 border border-slate-800 rounded-xl animate-pulse w-3/4" />
        <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
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

  const formattedDate = new Date(customer.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-6">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/customers">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
              <span className="sr-only">Geri</span>
            </Button>
          </Link>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight truncate">
            {customer.name}
          </h2>
        </div>

        {/* Edit & Delete & New Job Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/jobs/new?customerId=${customer.id}`}>
            <Button size="sm" className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30">
              <Plus className="w-3.5 h-3.5" />
              <span>+ Yeni İş</span>
            </Button>
          </Link>

          <Link href={`/customers/${customer.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Edit2 className="w-3.5 h-3.5" />
              <span>Düzenle</span>
            </Button>
          </Link>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sil</span>
          </Button>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardContent className="p-5 space-y-4">
          {/* Direct Phone Call Banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Telefon
              </span>
              <span className="font-mono text-base font-bold text-slate-100 mt-0.5 block">
                {customer.phone}
              </span>
            </div>

            <a
              href={`tel:${customer.phone}`}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-2 min-h-[44px]"
            >
              <Phone className="w-4 h-4" />
              <span>Hemen Ara</span>
            </a>
          </div>

          {/* Address */}
          {customer.address && (
            <div>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Adres</span>
              </span>
              <p className="text-sm text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                {customer.address}
              </p>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Notlar</span>
              </span>
              <p className="text-sm text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 whitespace-pre-wrap">
                {customer.notes}
              </p>
            </div>
          )}

          {/* Created Date */}
          <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>Kayıt Tarihi: {formattedDate}</span>
          </div>
        </CardContent>
      </Card>

      {/* Reserved Job History Section Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>İş Geçmişi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 text-center text-xs text-slate-400">
            Bu müşteriye ait işler sonraki aşamada eklenecek.
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Sheet Modal */}
      <Sheet open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <SheetContent side="bottom" className="pb-8">
          <SheetHeader>
            <SheetTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Müşteri Silinecek</span>
            </SheetTitle>
          </SheetHeader>

          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-200">
              <strong className="text-slate-100">{customer.name}</strong> isimli müşteriyi silmek istediğine emin misin?
            </p>
            <p className="text-xs text-slate-400">
              Bu işlem geri alınamaz. Müşteri bilgileri tamamen silinecektir.
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
                onClick={() => setIsDeleteModalOpen(false)}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                className="flex-1 font-semibold"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  setDeleteError(null);
                  deleteMutation.mutate();
                }}
              >
                {deleteMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
