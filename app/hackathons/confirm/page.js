'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2, Sparkles, Trophy } from 'lucide-react';

function ConfirmInner() {
  const sp = useSearchParams();
  const token = sp.get('token');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', linkedIn: '', github: '', college: '', year: '', skillset: '', projectInterests: '' });

  useEffect(() => {
    if (!token) { setError('Missing invitation token'); setLoading(false); return; }
    fetch(`/api/hackathons/invite-info?token=${token}`).then((r) => r.json()).then((d) => {
      if (d.success) setInfo(d.data);
      else setError(d.error || 'Invalid invitation');
      setLoading(false);
    });
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/hackathons/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...form }),
      });
      const json = await res.json();
      if (json.success) setSuccess(true);
      else setError(json.error || 'Confirmation failed');
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const inp = "w-full glass rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#00D4FF]/60";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" />
    </div>
  );

  if (error && !info) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-strong rounded-2xl p-10 max-w-md text-center">
        <h1 className="text-2xl font-bold mb-3">Invitation issue</h1>
        <p className="text-red-400 mb-6">{error}</p>
        <Link href="/hackathons" className="btn-primary px-6 py-3 rounded-lg inline-flex items-center gap-2">Browse hackathons</Link>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-strong rounded-2xl p-12 max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center mx-auto mb-6 glow-blue-strong">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-3">You&apos;re in! \ud83c\udf89</h1>
        <p className="text-white/60 mb-6">Welcome to <strong className="text-[#00D4FF]">{info?.team?.teamName}</strong>. Your team leader will reach out with next steps.</p>
        <Link href="/dashboard" className="btn-primary px-6 py-3 rounded-lg inline-flex items-center gap-2">Go to dashboard <ArrowRight className="w-4 h-4" /></Link>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen relative noise py-12 px-6">
      <div className="aurora w-[600px] h-[600px] -top-40 left-1/2 -translate-x-1/2 bg-[#0066FF]" style={{ opacity: 0.2 }} />
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative max-w-2xl mx-auto">
        <div className="glass-strong rounded-2xl p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center glow-blue">
              <Trophy className="w-6 h-6 text-[#03050B]" />
            </div>
            <div>
              <div className="text-xs text-[#00D4FF] uppercase tracking-wider">Hackathon invitation</div>
              <h1 className="text-2xl font-bold">{info?.hackathon?.title}</h1>
            </div>
          </div>
          <p className="text-white/70 mb-6">
            <strong className="text-[#00D4FF]">{info?.invite?.invitedBy}</strong> has invited you to join team <strong>{info?.team?.teamName}</strong>.
            Complete your profile below to accept.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="First name *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inp} />
              <input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inp} />
              <input placeholder="College" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} className={inp} />
              <input placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inp} />
              <input placeholder="LinkedIn URL" value={form.linkedIn} onChange={(e) => setForm({ ...form, linkedIn: e.target.value })} className={inp} />
              <input placeholder="GitHub URL" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} className={inp} />
            </div>
            <input placeholder="Skillset (e.g. React, Python, ML)" value={form.skillset} onChange={(e) => setForm({ ...form, skillset: e.target.value })} className={inp} />
            <textarea rows={2} placeholder="What excites you about this hackathon?" value={form.projectInterests} onChange={(e) => setForm({ ...form, projectInterests: e.target.value })} className={inp + ' resize-none'} />
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button type="submit" disabled={submitting} className="btn-primary w-full py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Accept invitation <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white/50">Loading...</div>}>
      <ConfirmInner />
    </Suspense>
  );
}
