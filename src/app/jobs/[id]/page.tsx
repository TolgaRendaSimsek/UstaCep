'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, AlertCircle, Calendar, Banknote, User, Briefcase } from 'lucide-react';
import { getJobById } from '@/lib/queries/jobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const { data: job, isLoading, isError, error } = useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => getJobById(jobId),
    enabled: Boolean(jobId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        <div className="h-8 bg-slate-900 border border-slate-800 rounded-xl animate-pulse w-3/4" />
        <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="space-y-4 max-w-lg mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
        <p className="text-sm font-semibold text-slate-200">
          {isError ? (error as Error).message : 'İş kaydı bulunamadı.'}
        </p>
        <Link href="/jobs">
          <Button variant="outline" size="sm" className="mt-2">
            İşlerim Listesine Dön
          </Button>
        </Link>
      </div>
    );
  }

  const formattedDate = job.appointment_date
    ? new Date(job.appointment_date).toLocaleString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-6">
      {/* Header & Back Button */}
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

        <Badge variant="outline" className="bg-amber-950/40 text-amber-300 border-amber-800/80 px-2.5 py-1">
          Bekliyor
        </Badge>
      </div>

      {/* Success Confirmation Banner */}
      <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-center gap-3 text-emerald-200">
        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
        <div className="text-xs">
          <p className="font-semibold text-emerald-100">İş başarıyla oluşturuldu!</p>
          <p className="text-emerald-400/90 mt-0.5">İş detayları aşağıda listelenmiştir.</p>
        </div>
      </div>

      {/* Job Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>İş Bilgileri</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          {/* Customer */}
          {job.customer && (
            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <User className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Müşteri
                </span>
                <span className="text-sm font-bold text-slate-100 block">
                  {job.customer.name}
                </span>
                <span className="font-mono text-xs text-slate-400 block">
                  {job.customer.phone}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Açıklama
              </span>
              <p className="text-sm text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          )}

          {/* Price & Appointment Date */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ücret</span>
              </span>
              <span className="font-mono text-base font-bold text-emerald-400">
                ₺{job.price.toLocaleString('tr-TR')}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Randevu</span>
              </span>
              <span className="text-xs font-medium text-slate-200 block">
                {formattedDate || 'Belirtilmedi'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
