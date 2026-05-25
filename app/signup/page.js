'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail, Lock, User, Sparkles, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem('algt_token', json.data.token);
        localStorage.setItem('algt_user', JSON.stringify(json.data.user));
        router.push('/dashboard');
      } else {
        setError(json.error || 'Signup failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full glass rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/40";

  return (
    <main className="min-h-screen relative noise flex items-center justify-center px-6 py-12">
      <div className="aurora w-[600px] h-[600px] -top-40 -right-40 bg-[#0066FF]" />
      <div className="aurora w-[500px] h-[500px] -bottom-40 -left-40 bg-[#00D4FF]" style={{ opacity: 0.3 }} />
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
            <h1 className="text-2xl font-bold">Create account</h1>
            <p className="text-white/50 text-sm">Join the AlGloryThm community</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input required placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inp} />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inp} />
            </div>
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input type="password" required minLength={6} placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inp} />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
        <div className="mt-6 text-center text-sm text-white/50">
          Already have an account?{' '}
          <Link href="/login" className="text-[#00D4FF] hover:underline">Sign in</Link>
        </div>
      </motion.form>
    </main>
  );
}
