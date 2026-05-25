'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail, Lock, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem('algt_token', json.data.token);
        localStorage.setItem('algt_user', JSON.stringify(json.data.user));
        if (json.data.user.role === 'ADMIN') router.push('/admin');
        else router.push('/dashboard');
      } else {
        setError(json.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative noise flex items-center justify-center px-6">
      <div className="aurora w-[600px] h-[600px] -top-40 -left-40 bg-[#0066FF]" />
      <div className="aurora w-[500px] h-[500px] -bottom-40 -right-40 bg-[#00D4FF]" style={{ opacity: 0.3 }} />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <motion.form initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={submit} className="relative w-full max-w-md glass-strong rounded-2xl p-8 lg:p-10">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#00D4FF] mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF] to-[#0066FF] rounded-lg rotate-45" />
            <div className="absolute inset-1 bg-[#03050B] rounded-md rotate-45" />
            <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-4 h-4 text-[#00D4FF]" /></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-white/50 text-sm">Sign in to AlGloryThm</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full glass rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/40" />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                className="w-full glass rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/40" />
            </div>
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-white/50">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#00D4FF] hover:underline">Sign up</Link>
        </div>

        <div className="mt-8 p-4 glass rounded-lg text-xs text-white/40">
          <div className="font-semibold text-white/60 mb-2">Demo admin access:</div>
          <div>admin@alglorythm.com / AlGlory@2025</div>
        </div>
      </motion.form>
    </main>
  );
}
