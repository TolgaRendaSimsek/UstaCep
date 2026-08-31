import { JobStatus } from '@/types/database';
import { Badge } from '@/components/ui/badge';

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export const statusConfig: Record<
  JobStatus,
  { label: string; variantClass: string }
> = {
  waiting: {
    label: 'Bekliyor',
    variantClass: 'bg-amber-950/60 text-amber-300 border-amber-800/80',
  },
  in_progress: {
    label: 'Devam Ediyor',
    variantClass: 'bg-blue-950/60 text-blue-300 border-blue-800/80',
  },
  completed: {
    label: 'Tamamlandı',
    variantClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80',
  },
};

export function JobStatusBadge({ status, className = '' }: JobStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    variantClass: 'bg-slate-900 text-slate-300 border-slate-700',
  };

  return (
    <Badge
      variant="outline"
      className={`font-semibold px-2.5 py-0.5 text-xs border ${config.variantClass} ${className}`}
    >
      {config.label}
    </Badge>
  );
}
