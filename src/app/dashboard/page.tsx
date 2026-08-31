'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Wallet,
  Plus,
  ArrowRight,
  Wrench,
  AlertCircle,
  Banknote,
  User,
} from 'lucide-react';
import { getDashboardSummary } from '@/lib/queries/dashboard';
import { JobStatusBadge } from '@/components/jobs/job-status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary,
  });

  const statCards = [
    {
      title: 'Bugünkü İşler',
      value: summary ? summary.todayJobsCount.toString() : '0',
      subtitle: 'Bugünkü randevular',
      icon: Calendar,
      variant: 'default',
      badge: 'Bugün',
    },
    {
      title: 'Bekleyen İşler',
      value: summary ? summary.waitingJobsCount.toString() : '0',
      subtitle: 'Başlama bekleyen',
      icon: Clock,
      variant: 'warning',
      badge: 'Bekliyor',
    },
    {
      title: 'Bu Ay Tamamlanan',
      value: summary ? summary.completedThisMonthCount.toString() : '0',
      subtitle: 'Bitirilen servisler',
      icon: CheckCircle2,
      variant: 'success',
      badge: 'Tamamlandı',
    },
    {
      title: 'Toplam Alacak',
      value: summary ? `₺${summary.totalReceivable.toLocaleString('tr-TR')}` : '₺0',
      subtitle: 'Kalan müşteri bakiyeleri',
      icon: Wallet,
      variant: 'destructive',
      badge: 'Alacak',
    },
    {
      title: 'Bu Ay Tahsil Edilen',
      value: summary ? `₺${summary.collectedThisMonth.toLocaleString('tr-TR')}` : '₺0',
      subtitle: 'Bu ay alınan ödemeler',
      icon: Banknote,
      variant: 'success',
      badge: 'Tahsilat',
    },
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-500" />
            <span>Hoş Geldin, Ustam</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            UstaCep mobil iş ve müşteri yönetim paneli
          </p>
        </div>

        {/* Prominent Action Button */}
        <Link href="/jobs/new" className="shrink-0">
          <Button size="lg" className="w-full sm:w-auto font-bold text-sm bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30">
            <Plus className="w-5 h-5" />
            <span>+ Yeni İş</span>
          </Button>
        </Link>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
          <p className="text-xs font-semibold text-red-200">
            Özet bilgiler yüklenemedi. ({error instanceof Error ? error.message : ''})
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Tekrar Dene
          </Button>
        </div>
      )}

      {/* 5 KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="hover:border-slate-700 bg-slate-900/80 transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-1">
                <CardTitle className="text-[11px] font-semibold text-slate-400 truncate">
                  {card.title}
                </CardTitle>
                <div className="p-1.5 bg-slate-800/80 rounded-lg shrink-0">
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-1">
                {isLoading ? (
                  <div className="h-6 w-16 bg-slate-800 rounded animate-pulse my-1" />
                ) : (
                  <div className="text-lg font-extrabold text-slate-100 truncate">
                    {card.value}
                  </div>
                )}
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span className="truncate">{card.subtitle}</span>
                  <Badge variant={card.variant as 'default' | 'warning' | 'success' | 'destructive'} className="text-[9px] py-0 px-1 shrink-0 ml-1">
                    {card.badge}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Jobs Section */}
      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Bugünkü İşler</span>
            </CardTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">Bugün için planlanan randevular</p>
          </div>
          <Link href="/jobs">
            <Button variant="ghost" size="sm" className="text-xs text-blue-400 gap-1 px-2">
              <span>Tüm İşleri Gör</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="space-y-2.5">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((n) => (
                <div key={n} className="h-16 bg-slate-950/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !summary || summary.todayJobs.length === 0 ? (
            <div className="p-6 border border-dashed border-slate-800 bg-slate-950/40 rounded-xl text-center space-y-3">
              <p className="text-xs text-slate-400 font-medium">Bugün için planlanmış iş yok.</p>
              <Link href="/jobs/new" className="inline-block">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni İş Oluştur</span>
                </Button>
              </Link>
            </div>
          ) : (
            summary.todayJobs.map((job) => {
              const appointmentTime = job.appointment_date
                ? new Date(job.appointment_date).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null;

              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition group"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <p className="font-semibold text-xs text-slate-200 group-hover:text-blue-400 transition truncate">
                      {job.title}
                    </p>
                    {job.customer && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{job.customer.name}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    {appointmentTime && (
                      <span className="text-xs font-mono font-bold text-blue-400 block">
                        {appointmentTime}
                      </span>
                    )}
                    <JobStatusBadge status={job.status} className="text-[10px] py-0 px-1.5" />
                  </div>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
