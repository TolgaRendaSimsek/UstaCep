import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          <span>Ayarlar</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Uygulama ve profil ayarları</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ayarlar Placeholder</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-400 py-8 text-center">
          Profil ve uygulama ayarları altyapısı hazır.
        </CardContent>
      </Card>
    </div>
  );
}
