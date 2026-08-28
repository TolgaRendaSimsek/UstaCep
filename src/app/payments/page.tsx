import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <span>Alacaklarım</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Müşteri ödemeleri ve tahsilat takibi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Alacak ve Ödeme Takibi Placeholder</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-400 py-8 text-center">
          Alacaklar ve ödeme takibi modülü altyapısı hazır.
        </CardContent>
      </Card>
    </div>
  );
}
