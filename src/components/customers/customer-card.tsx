import Link from 'next/link';
import { Phone, MapPin, ChevronRight } from 'lucide-react';
import { Customer } from '@/types/database';
import { Card } from '@/components/ui/card';

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <Card className="hover:border-slate-700 transition p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <Link href={`/customers/${customer.id}`} className="group block">
            <h3 className="font-bold text-slate-100 text-base group-hover:text-blue-400 transition truncate">
              {customer.name}
            </h3>
          </Link>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{customer.phone}</span>
          </div>

          {customer.address && (
            <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`tel:${customer.phone}`}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl transition flex items-center justify-center min-h-[44px] min-w-[44px]"
            title="Ara"
          >
            <Phone className="w-4 h-4" />
          </a>
          <Link
            href={`/customers/${customer.id}`}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition flex items-center justify-center min-h-[44px] min-w-[44px]"
            title="Detay"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
