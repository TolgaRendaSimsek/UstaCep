'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JobForm } from '@/components/jobs/job-form';

function NewJobContent() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId') || undefined;

  return <JobForm initialCustomerId={customerId} />;
}

export default function NewJobPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Header & Back Button */}
      <div className="flex items-center gap-3">
        <Link href="/jobs">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
            <span className="sr-only">Geri</span>
          </Button>
        </Link>

        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <span>Yeni İş</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Müşteri seçerek yeni servis işi ekleyin
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-14 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
            <div className="h-12 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
            <div className="h-24 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          </div>
        }
      >
        <NewJobContent />
      </Suspense>
    </div>
  );
}
