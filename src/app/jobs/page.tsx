'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, Plus, Search, AlertCircle, Filter } from 'lucide-react';
import { getJobs } from '@/lib/queries/jobs';
import { JobStatus } from '@/types/database';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const statusFilterTabs: { id: string; label: string; status?: JobStatus }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'waiting', label: 'Bekliyor', status: 'waiting' },
  { id: 'in_progress', label: 'Devam Ediyor', status: 'in_progress' },
  { id: 'completed', label: 'Tamamlandı', status: 'completed' },
];

export default function JobsPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    data: jobs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['jobs', { status: activeFilter, search: searchQuery }],
    queryFn: () =>
      getJobs({
        status: activeFilter !== 'all' ? activeFilter : undefined,
        search: searchQuery,
      }),
  });

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-8">
      {/* Header & Primary Action */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 tracking-tight">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <span>İşlerim</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Tüm aktif ve tamamlanan servis işleri</p>
        </div>
        <Link href="/jobs/new">
          <Button size="sm" className="gap-1.5 font-semibold bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 text-xs shrink-0">
            <Plus className="w-4 h-4" />
            <span>+ Yeni İş</span>
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="İş ara... (başlık veya müşteri)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 min-h-[44px] bg-slate-900/80 border-slate-800 text-xs rounded-xl focus:border-blue-500"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {statusFilterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-2 rounded-xl border whitespace-nowrap font-medium transition ${
                isActive
                  ? 'border-blue-500/80 bg-blue-950/60 text-blue-300 font-semibold'
                  : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Jobs List Content */}
      {isLoading ? (
        <div className="space-y-3 pt-1">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 bg-slate-900/80 border border-slate-800/80 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 bg-red-950/40 border border-red-800/60 rounded-2xl text-center space-y-3 my-4">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs font-semibold text-red-200">
            İşler yüklenemedi. ({error instanceof Error ? error.message : 'Bilinmeyen hata'})
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Tekrar Dene
          </Button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-800 bg-slate-950/40 rounded-2xl text-center space-y-4 my-2">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Filter className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">
              {searchQuery || activeFilter !== 'all'
                ? 'Bu durumda veya aramaya uygun iş bulunamadı.'
                : 'Henüz iş eklenmemiş.'}
            </p>
            <p className="text-xs text-slate-500">
              {searchQuery || activeFilter !== 'all'
                ? 'Filtreleri veya arama terimini değiştirebilirsiniz.'
                : 'Müşterileriniz için yeni iş oluşturarak başlayın.'}
            </p>
          </div>

          {!searchQuery && activeFilter === 'all' && (
            <Link href="/jobs/new" className="inline-block pt-1">
              <Button size="sm" className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500">
                <Plus className="w-4 h-4" />
                <span>İlk İşini Oluştur</span>
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
