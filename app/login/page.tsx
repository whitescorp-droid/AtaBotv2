'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Giriş yapılamadı.');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e2e2e2] flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-md bg-[#121214] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full border border-[#c5a059] flex items-center justify-center mx-auto mb-4">
            <span className="text-[#c5a059] font-serif text-2xl italic">A</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Hoş Geldiniz</h1>
          <p className="text-sm text-white/50 mt-2">Milli Mücadele Sohbetleri&apos;ne devam etmek için giriş yapın.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">E-posta</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors"
              placeholder="E-posta adresiniz"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Şifre</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors"
              placeholder="Şifreniz"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#c5a059] text-black font-semibold rounded-xl py-3 mt-4 hover:bg-[#d4af37] transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-white/50">
          Hesabınız yok mu? <Link href="/register" className="text-[#c5a059] hover:underline">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
