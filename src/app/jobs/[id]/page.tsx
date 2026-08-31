'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Banknote,
  User,
  Phone,
  Edit2,
  Trash2,
  AlertCircle,
  Clock,
  ChevronDown,
  Check,
  Plus,
  Wallet,
} from 'lucide-react';
import { getJobById, updateJobStatus, deleteJob } from '@/lib/queries/jobs';
import { getPaymentsByJob, calculatePaymentSummary } from '@/lib/queries/payments';
import { JobStatus, PaymentStatus } from '@/types/database';
import { JobStatusBadge } from '@/components/jobs/job-status-badge';
import { PaymentModal } from '@/components/payments/payment-modal';
import { PaymentHistory } from '@/components/payments/payment-history';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusOptions: { status: JobStatus; label: string; bgClass: string }[] = [
  { status: 'waiting', label: 'Bekliyor', bgClass: 'text-amber-400' },
  { status: 'in_progress', label: 'Devam Ediyor', bgClass: 'text-blue-400' },
  { status: 'completed', label: 'Tamamlandı', bgClass: 'text-emerald-400' },
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

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const jobId = params.id as string;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Query job detail
  const {
    data: job,
    isLoading: isLoadingJob,
    isError: isJobError,
    error: jobError,
  } = useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => getJobById(jobId),
    enabled: Boolean(jobId),
  });

  // Query payments list for calculation
  const { data: payments = [] } = useQuery({
    queryKey: ['payments', jobId],
    queryFn: () => getPaymentsByJob(jobId),
    enabled: Boolean(jobId),
  });

  // Calculate dynamic payment summary
  const paymentSummary = calculatePaymentSummary(job?.price, payments);

  // Mutation: Change Job Status
  const statusMutation = useMutation({
    mutationFn: (newStatus: JobStatus) => updateJobStatus(jobId, newStatus),
    onSuccess: (updatedJob) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (updatedJob.customer_id) {
        queryClient.invalidateQueries({
          queryKey: ['customer-jobs', updatedJob.customer_id],
        });
      }
    },
    onError: (err: Error) => {
      setActionError(
        err.message || 'Durum güncellenirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    },
  });

  // Mutation: Delete Job
  const deleteMutation = useMutation({
    mutationFn: () => deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.push('/jobs');
    },
    onError: (err: Error) => {
      setActionError(
        err.message || 'İş silinirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    },
  });

  if (isLoadingJob) {
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        <div className="h-8 bg-slate-900 border border-slate-800 rounded-xl animate-pulse w-3/4" />
        <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isJobError || !job) {
    return (
      <div className="space-y-4 max-w-lg mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
        <p className="text-sm font-semibold text-slate-200">
          {isJobError ? (jobError as Error).message : 'İş bulunamadı.'}
        </p>
        <Link href="/jobs">
          <Button variant="outline" size="sm" className="mt-2">
            İşlerim Listesine Dön
          </Button>
        </Link>
      </div>
    );
  }

  const formattedAppointment = job.appointment_date
    ? new Date(job.appointment_date).toLocaleString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const formattedCreated = new Date(job.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const paymentBadge = paymentBadgeConfig[paymentSummary.paymentState];

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      {/* Top Navigation & Edit/Delete Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/jobs">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
              <span className="sr-only">Geri</span>
            </Button>
          </Link>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight truncate">
            {job.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/jobs/${job.id}/edit`}>
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

      {/* Action Error Banner */}
      {actionError && (
        <div className="p-3.5 bg-red-950/80 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Quick Status Bar Card */}
      <Card className="bg-slate-900/90 border-slate-800">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              İş Durumu
            </span>
            <div className="mt-1">
              <JobStatusBadge status={job.status} className="text-sm px-3 py-1" />
            </div>
          </div>

          {/* Status Change Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs font-semibold"
                disabled={statusMutation.isPending}
              >
                <span>{statusMutation.isPending ? 'Güncelleniyor...' : 'Durumu Değiştir'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-slate-950 border-slate-800">
              {statusOptions.map((opt) => {
                const isCurrent = job.status === opt.status;
                return (
                  <DropdownMenuItem
                    key={opt.status}
                    onClick={() => {
                      if (!isCurrent) {
                        setActionError(null);
                        statusMutation.mutate(opt.status);
                      }
                    }}
                    className={`flex items-center justify-between text-xs py-2.5 cursor-pointer ${
                      isCurrent ? 'bg-slate-900 font-bold' : ''
                    }`}
                  >
                    <span className={opt.bgClass}>{opt.label}</span>
                    {isCurrent && <Check className="w-4 h-4 text-blue-400" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* PAYMENT SUMMARY SECTION */}
      <Card className="border-emerald-950/80 bg-slate-900/90">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Ödeme Bilgileri</span>
          </CardTitle>

          {job.price > 0 && (
            <Badge variant="outline" className={`text-xs px-2.5 py-0.5 border ${paymentBadge.variantClass}`}>
              {paymentBadge.label}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {job.price <= 0 ? (
            <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-center space-y-2">
              <p className="text-xs font-semibold text-amber-300">Ücret belirtilmemiş</p>
              <p className="text-[11px] text-amber-400/80">
                Ödeme eklemek için önce iş ücretini belirleyin.
              </p>
              <Link href={`/jobs/${job.id}/edit`} className="inline-block">
                <Button size="sm" variant="outline" className="text-xs gap-1 border-amber-800/80 text-amber-300">
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Ücret Ekle</span>
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Payment Summary Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                    Toplam
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-200 block mt-0.5 truncate">
                    ₺{paymentSummary.totalPrice.toLocaleString('tr-TR')}
                  </span>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                    Ödenen
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-400 block mt-0.5 truncate">
                    ₺{paymentSummary.totalPaid.toLocaleString('tr-TR')}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border text-center ${
                  paymentSummary.remainingBalance > 0
                    ? 'bg-amber-950/30 border-amber-800/80'
                    : 'bg-slate-950/80 border-slate-800'
                }`}>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                    Kalan
                  </span>
                  <span className={`font-mono text-sm font-bold block mt-0.5 truncate ${
                    paymentSummary.remainingBalance > 0 ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    ₺{paymentSummary.remainingBalance.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Add Payment Button */}
              <div>
                {paymentSummary.remainingBalance > 0 ? (
                  <Button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full min-h-[46px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 gap-2 text-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Ödeme Ekle</span>
                  </Button>
                ) : (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-center text-xs font-semibold text-emerald-300">
                    ✓ Ödeme Tamamlandı
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* PAYMENT HISTORY */}
      <PaymentHistory jobId={job.id} />

      {/* Linked Customer Card */}
      {job.customer && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-400" />
              <span>Müşteri Bilgileri</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <Link
                  href={`/customers/${job.customer.id}`}
                  className="font-bold text-base text-slate-100 hover:text-blue-400 transition block"
                >
                  {job.customer.name}
                </Link>
                <span className="font-mono text-xs text-slate-400 block mt-0.5">
                  {job.customer.phone}
                </span>
              </div>

              <a
                href={`tel:${job.customer.phone}`}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 min-h-[44px] shrink-0"
              >
                <Phone className="w-4 h-4" />
                <span>Ara</span>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Job Details Card */}
      <Card>
        <CardContent className="p-5 space-y-4">
          {/* Price & Appointment Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                <span>İş Ücreti</span>
              </span>
              <span className="font-mono text-base font-bold text-emerald-400 block">
                {typeof job.price === 'number' && job.price > 0
                  ? `₺${job.price.toLocaleString('tr-TR')}`
                  : 'Belirtilmedi'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Randevu Tarihi</span>
              </span>
              <span className="text-xs font-semibold text-slate-200 block leading-tight">
                {formattedAppointment || 'Randevu verilmedi'}
              </span>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                Açıklama
              </span>
              <p className="text-sm text-slate-200 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </div>
          )}

          {/* Created Date */}
          <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>Kayıt Tarihi: {formattedCreated}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {job.price > 0 && (
        <PaymentModal
          open={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          jobId={job.id}
          jobPrice={job.price}
          remainingBalance={paymentSummary.remainingBalance}
        />
      )}

      {/* Delete Confirmation Sheet Modal */}
      <Sheet open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <SheetContent side="bottom" className="pb-8">
          <SheetHeader>
            <SheetTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>İş Silinecek</span>
            </SheetTitle>
          </SheetHeader>

          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-200">
              <strong className="text-slate-100">{job.title}</strong> işini silmek istediğine emin misin?
            </p>
            <p className="text-xs text-slate-400">
              Bu işlem geri alınamaz. İş ve bu işe bağlı tüm ödeme kayıtları veritabanından tamamen kaldırılacaktır.
            </p>

            {actionError && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{actionError}</span>
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
                  setActionError(null);
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
