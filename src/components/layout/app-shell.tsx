'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';
import { Wrench } from 'lucide-react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 antialiased">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Compact Mobile Top Header */}
        <header className="md:hidden sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-slate-100 tracking-tight">UstaCep</span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
