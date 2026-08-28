import Link from 'next/link';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Wallet,
  Plus,
  ArrowRight,
  Wrench,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const statCards = [
    {
      title: 'Bugünkü İşler',
      value: '3',
      subtitle: 'Planlanan randevular',
      icon: Calendar,
      variant: 'default',
      badge: 'Bugün',
    },
    {
      title: 'Bekleyen İşler',
      value: '8',
      subtitle: 'Onay ve başlama bekleyen',
      icon: Clock,
      variant: 'warning',
      badge: 'Bekliyor',
    },
    {
      title: 'Bu Ay Tamamlanan',
      value: '21',
      subtitle: 'Başarıyla bitirilen servisler',
      icon: CheckCircle2,
      variant: 'success',
      badge: 'Tamamlandı',
    },
    {
      title: 'Tahsil Edilecek',
      value: '₺18.500',
      subtitle: 'Kalan müşteri bakiyeleri',
      icon: Wallet,
      variant: 'destructive',
      badge: 'Alacak',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-500" />
            <span>Hoş Geldin, Ustam</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            UstaCep mobil iş ve müşteri yönetim paneline hoş geldiniz.
          </p>
        </div>

        {/* Prominent Action Button */}
        <Link href="/jobs?action=new" className="shrink-0">
          <Button size="lg" className="w-full sm:w-auto font-bold text-sm shadow-lg shadow-blue-600/30">
            <Plus className="w-5 h-5" />
            <span>+ Yeni İş</span>
          </Button>
        </Link>
      </div>

      {/* 4 Required Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="hover:border-slate-700 transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-slate-400">
                  {card.title}
                </CardTitle>
                <div className="p-2 bg-slate-800/80 rounded-xl">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-slate-100 mb-1">
                  {card.value}
                </div>
                <p className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{card.subtitle}</span>
                  <Badge variant={card.variant as 'default' | 'warning' | 'success' | 'destructive'} className="text-[10px] py-0 px-1.5">
                    {card.badge}
                  </Badge>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Placeholder Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bugünkü Planlanan İşler</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Mock takvim ve iş listesi görünümü</p>
          </div>
          <Link href="/jobs">
            <Button variant="ghost" size="sm" className="text-xs text-blue-400 gap-1">
              <span>Tüm İşler</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { title: 'Kombi Arızası & Genel Bakım', customer: 'Ahmet Yılmazer', status: 'Bekliyor', time: '10:30' },
            { title: 'Daire Elektrik Pano Montajı', customer: 'Mehmet Demir', status: 'Devam Ediyor', time: '14:00' },
            { title: 'Mutfak Musluk ve Tesisat Değişimi', customer: 'Ayşe Kaya', status: 'Tamamlandı', time: '16:30' },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/60"
            >
              <div>
                <p className="font-semibold text-xs text-slate-200">{item.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.customer}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-medium text-blue-400 block">{item.time}</span>
                <span className="text-[10px] text-slate-400 font-medium">{item.status}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
