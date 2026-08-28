'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Plus,
  Menu,
  Calendar,
  Wallet,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { label: 'Takvim', href: '/calendar', icon: Calendar },
    { label: 'Alacaklarım', href: '/payments', icon: Wallet },
    { label: 'Ayarlar', href: '/settings', icon: Settings },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 pb-safe shadow-xl">
        <div className="flex items-center justify-around h-16 px-1 max-w-md mx-auto relative">
          {/* Ana Sayfa */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-center min-h-[44px] transition ${
              pathname === '/dashboard' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Ana Sayfa</span>
          </Link>

          {/* Müşteriler */}
          <Link
            href="/customers"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-center min-h-[44px] transition ${
              pathname === '/customers' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Müşteriler</span>
          </Link>

          {/* Prominent Center Action: + Yeni İş */}
          <div className="flex items-center justify-center px-1 -mt-4 shrink-0">
            <Link
              href="/jobs?action=new"
              className="flex items-center justify-center w-13 h-13 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40 border-2 border-slate-900 active:scale-95 transition"
              title="Yeni İş"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </Link>
          </div>

          {/* İşlerim */}
          <Link
            href="/jobs"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-center min-h-[44px] transition ${
              pathname === '/jobs' ? 'text-blue-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Briefcase className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">İşlerim</span>
          </Link>

          {/* Menü */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-center min-h-[44px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Menü</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="bottom" className="pb-8">
          <SheetHeader>
            <SheetTitle>UstaCep Menü</SheetTitle>
          </SheetHeader>
          <div className="py-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5 text-blue-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <Separator className="my-2" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/40 transition cursor-pointer"
            >
              <LogOut className="w-5 h-5 text-red-400" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
