'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Users, Plus, Search, AlertCircle } from 'lucide-react';
import { getCustomers } from '@/lib/queries/customers';
import { CustomerCard } from '@/components/customers/customer-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: customers = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Müşteriler</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Toplam {customers.length} kayıtlı müşteri
          </p>
        </div>

        <Link href="/customers/new" className="shrink-0">
          <Button className="w-full sm:w-auto font-semibold shadow-md shadow-blue-600/20">
            <Plus className="w-4 h-4" />
            <span>+ Yeni Müşteri</span>
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        <Input
          type="text"
          placeholder="Müşteri ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error State */}
      {isError && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error instanceof Error ? error.message : 'Müşteriler yüklenemedi.'}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : customers.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-200">Henüz müşteri eklenmemiş.</p>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            İş ve randevularınızı takip etmek için ilk müşterinizi hemen ekleyin.
          </p>
          <Link href="/customers/new">
            <Button className="font-semibold shadow-md shadow-blue-600/30">
              <Plus className="w-4 h-4" />
              <span>İlk Müşterini Ekle</span>
            </Button>
          </Link>
        </div>
      ) : filteredCustomers.length === 0 ? (
        /* Search No Match State */
        <div className="text-center py-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <p className="text-xs text-slate-400">Arama sonucuna uygun müşteri bulunamadı.</p>
        </div>
      ) : (
        /* Customer Cards List */
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}
    </div>
  );
}
