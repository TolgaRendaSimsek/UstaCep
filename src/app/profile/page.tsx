'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, LogOut, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { Header } from '@/components/layout/header';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  businessName: z.string().optional(),
  tradeCategory: z.string().min(2, 'Uzmanlık alanı yazın'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [successMsg, setSuccessMsg] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return (data as unknown as Profile) || null;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      setValue('fullName', profile.full_name || '');
      setValue('phone', profile.phone || '');
      setValue('businessName', profile.business_name || '');
      setValue('tradeCategory', profile.trade_category || '');
    }
  }, [profile, setValue]);

  const updateMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Oturum açılmamış');

      const { error } = await (supabase.from('profiles' as any) as any).upsert({
        id: user.id,
        full_name: values.fullName,
        phone: values.phone,
        business_name: values.businessName || null,
        trade_category: values.tradeCategory,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const onSubmit = (values: ProfileFormValues) => {
    updateMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex flex-col pb-6">
      <Header />

      <main className="flex-1 p-4 max-w-xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            <span>Profilim & İşletme Bilgileri</span>
          </h2>
          <p className="text-xs text-slate-400">
            Kişisel ve mesleki bilgilerinizi güncelleyin
          </p>
        </div>

        {isLoading ? (
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Profil bilgileriniz başarıyla güncellendi.</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  {...register('fullName')}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
                {errors.fullName && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Telefon Numarası *
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
                {errors.phone && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Uzmanlık Alanınız / Meslek *
                </label>
                <input
                  type="text"
                  placeholder="Elektrikçi, Tesisatçı..."
                  {...register('tradeCategory')}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
                {errors.tradeCategory && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.tradeCategory.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  İşletme / Dükkan Adı (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  placeholder="Ahmet Elektrik & Teknik Servis"
                  {...register('businessName')}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Bilgileri Güncelle'}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Hesaptan Çıkış Yap</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
