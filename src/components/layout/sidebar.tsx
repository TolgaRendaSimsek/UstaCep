'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Wrench,
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Wallet,
  Settings,
  Plus,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Ana Sayfa', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Müşteriler', href: '/customers', icon: Users },
    { label: 'İşlerim', href: '/jobs', icon: Briefcase },
    { label: 'Takvim', href: '/calendar', icon: Calendar },
    { label: 'Alacaklarım', href: '/payments', icon: Wallet },
    { label: 'Ayarlar', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900 h-screen sticky top-0 shrink-0 p-4">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-2">
        <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-600/30">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-100 leading-none">UstaCep</h1>
          <p className="text-[11px] text-slate-400 font-medium mt-1">İş & Müşteri Takibi</p>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Primary Action */}
      <div className="my-3">
        <Link href="/jobs?action=new">
          <Button className="w-full justify-start font-semibold text-sm shadow-md shadow-blue-600/20">
            <Plus className="w-4 h-4" />
            <span>+ Yeni İş</span>
          </Button>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer info & Logout */}
      <div className="pt-4 border-t border-slate-800 px-2 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition cursor-pointer border border-transparent hover:border-red-900/40"
        >
          <LogOut className="w-4 h-4" />
          <span>Çıkış Yap</span>
        </button>

        <div className="text-xs text-slate-500">
          <p className="font-medium text-slate-400">UstaCep v1.0</p>
          <p className="text-[11px] text-slate-600 mt-0.5">Mobil Teknik Servis</p>
        </div>
      </div>
    </aside>
  );
}
