'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wrench, UserPlus, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Ad Soyad zorunludur (en az 2 karakter)'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
    passwordConfirm: z.string().min(8, 'Şifre tekrarı zorunludur'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Şifreler birbiriyle eşleşmiyor',
    path: ['passwordConfirm'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        setErrorMsg('Bu e-posta adresi ile zaten kayıt oluşturulmuş.');
      } else {
        setErrorMsg('Kayıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.');
      }
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <Card className="w-full max-w-sm border-slate-800 bg-slate-900 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl mb-3 shadow-lg shadow-blue-600/30 mx-auto">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-100">UstaCep Kayıt</CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-1">
            İşlerini tek yerden yönet.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ad Soyad
              </label>
              <Input
                type="text"
                placeholder="Ahmet Usta"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-[11px] text-red-400 mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                E-posta
              </label>
              <Input
                type="email"
                placeholder="usta@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Şifre
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Şifre Tekrar
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('passwordConfirm')}
              />
              {errors.passwordConfirm && (
                <p className="text-[11px] text-red-400 mt-1">{errors.passwordConfirm.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 font-semibold shadow-lg shadow-blue-600/30"
            >
              {loading ? (
                <span>Hesap Oluşturuluyor...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Hesap Oluştur</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="text-blue-400 hover:underline font-semibold">
              Giriş Yap
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
