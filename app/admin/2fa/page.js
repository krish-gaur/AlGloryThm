'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';

export default function Admin2FA() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState(null);
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('algt_token');
    if (!t) { router.push('/admin'); return; }
    setToken(t);
    refresh(t);
  }, [router]);

  const refresh = async (t) => {
    const r = await fetch('/api/admin/2fa/status', { headers: { Authorization: `Bearer ${t}` } });
    const j = await r.json();
    setStatus(j.data?.enabled);
  };

  const setup = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/2fa/setup', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    if (j.success) { setQr(j.data.qrDataUrl); setSecret(j.data.secret); }
    setLoading(false);
  };
  const verify = async () => {
    setLoading(true);
    setError('');
    const r = await fetch('/api/admin/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code }),
    });
    const j = await r.json();
    if (j.success) { setQr(null); setStatus(true); setCode(''); }
    else setError(j.error || 'Failed');
    setLoading(false);
  };
  const disable = async () => {
    if (!confirm('Disable 2FA?')) return;
    await fetch('/api/admin/2fa/disable', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setStatus(false);
  };

  return (
    <main className="min-h-screen relative noise">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <header className="relative glass-strong border-b border-white/5 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="w-px h-6 bg-white/10" />
          <ShieldCheck className="w-4 h-4 text-[#00D4FF]" />
          <span className="font-semibold">Two-Factor Authentication</span>
        </div>
      </header>
      <div className="relative container mx-auto px-6 py-12 max-w-2xl">
        <div className="glass-strong rounded-2xl p-8">
          {status === true && !qr ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">2FA is enabled</h2>
              </div>
              <p className="text-white/60 mb-6">Your admin account is protected with TOTP-based two-factor authentication.</p>
              <button onClick={disable} className="btn-ghost px-5 py-2.5 rounded-lg text-sm hover:bg-red-500/10 hover:border-red-500/30">Disable 2FA</button>
            </div>
          ) : qr ? (
            <div>
              <h2 className="text-2xl font-bold mb-2">Scan this QR code</h2>
              <p className="text-white/60 mb-6">Open Google Authenticator, Authy, or 1Password and scan to add your AlGloryThm admin account.</p>
              <div className="bg-white inline-block p-4 rounded-xl mb-6">
                <img src={qr} alt="2FA QR Code" className="w-48 h-48" />
              </div>
              <div className="glass rounded-lg p-4 mb-6 text-xs font-mono break-all text-white/60">
                <div className="text-[#00D4FF] mb-1">Or paste secret manually:</div>
                {secret}
              </div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Enter 6-digit code from app</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" maxLength={6}
                className="w-full glass rounded-lg px-4 py-3 text-lg font-mono text-center focus:outline-none focus:border-[#00D4FF]/60 mb-4" />
              {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
              <button onClick={verify} disabled={loading || code.length !== 6} className="btn-primary w-full py-3 rounded-lg font-semibold disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Verify & enable'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-6 h-6 text-[#00D4FF]" />
                <h2 className="text-2xl font-bold">Enable 2FA</h2>
              </div>
              <p className="text-white/60 mb-6">
                Add an extra layer of security with TOTP (Google Authenticator, Authy, 1Password). Recommended for production admin accounts.
              </p>
              <button onClick={setup} disabled={loading} className="btn-primary px-6 py-3 rounded-lg font-semibold disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Begin setup'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
