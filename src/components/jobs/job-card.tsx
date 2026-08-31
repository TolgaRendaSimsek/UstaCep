import Link from 'next/link';
import { Calendar, User, Banknote, ChevronRight } from 'lucide-react';
import { Job } from '@/types/database';
import { JobStatusBadge } from '@/components/jobs/job-status-badge';
import { Card, CardContent } from '@/components/ui/card';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const formattedAppointment = job.appointment_date
    ? new Date(job.appointment_date).toLocaleString('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const formattedPrice =
    typeof job.price === 'number' && job.price > 0
      ? `₺${job.price.toLocaleString('tr-TR')}`
      : null;

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <Card className="hover:border-slate-700 bg-slate-900/80 transition duration-150 shadow-sm">
        <CardContent className="p-4 space-y-3">
          {/* Header Row: Title & Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <h3 className="font-bold text-base text-slate-100 group-hover:text-blue-400 transition truncate">
                {job.title}
              </h3>
              {job.customer && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{job.customer.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <JobStatusBadge status={job.status} />
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition" />
            </div>
          </div>

          {/* Footer Details: Appointment Date & Price */}
          {(formattedAppointment || formattedPrice) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              {formattedAppointment ? (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{formattedAppointment}</span>
                </div>
              ) : (
                <span className="text-slate-500 italic">Randevu tarihi yok</span>
              )}

              {formattedPrice && (
                <div className="flex items-center gap-1 font-mono font-bold text-emerald-400">
                  <Banknote className="w-3.5 h-3.5 shrink-0" />
                  <span>{formattedPrice}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
