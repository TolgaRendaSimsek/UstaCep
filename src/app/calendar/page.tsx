import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-500" />
          <span>Takvim</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Randevu ve gün takvimi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Randevu Takvimi Placeholder</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-400 py-8 text-center">
          Takvim modülü altyapısı hazır.
        </CardContent>
      </Card>
    </div>
  );
}
