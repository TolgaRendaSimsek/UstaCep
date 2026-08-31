'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle, Edit3 } from 'lucide-react';
import { getJobById } from '@/lib/queries/jobs';
import { JobForm } from '@/components/jobs/job-form';
import { Button } from '@/components/ui/button';

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.id as string;

  const { data: job, isLoading, isError, error } = useQuery({
    queryKey: ['jobs', jobId],
    queryFn: () => getJobById(jobId),
    enabled: Boolean(jobId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        <div className="h-8 bg-slate-900 border border-slate-800 rounded-xl animate-pulse w-3/4" />
        <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="space-y-4 max-w-lg mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
        <p className="text-sm font-semibold text-slate-200">
          {isError ? (error as Error).message : 'İş bulunamadı.'}
        </p>
        <Link href="/jobs">
          <Button variant="outline" size="sm" className="mt-2">
            İşlerim Listesine Dön
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex items-center gap-3">
        <Link href={`/jobs/${job.id}`}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
            <span className="sr-only">Geri</span>
          </Button>
        </Link>

        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-500" />
            <span>İşi Düzenle</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium truncate">
            {job.title}
          </p>
        </div>
      </div>

      <JobForm jobToEdit={job} />
    </div>
  );
}
