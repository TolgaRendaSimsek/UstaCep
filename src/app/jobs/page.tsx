'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <span>İşlerim</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Tüm aktif ve tamamlanan servis işleri</p>
        </div>
        <Button className="w-full sm:w-auto shadow-md shadow-blue-600/30">
          <Plus className="w-4 h-4" />
          <span>+ Yeni İş Ekle</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">İşlerim Listesi Placeholder</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-400 py-8 text-center">
          İş ve randevu takibi modülü altyapısı hazır.
        </CardContent>
      </Card>
    </div>
  );
}
