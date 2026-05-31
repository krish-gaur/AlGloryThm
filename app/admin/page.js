'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Building, Phone, Sparkles, ShieldCheck, LogOut, Users, FileText, Calendar, TrendingUp, Bell, X } from 'lucide-react';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('admin@alglorythm.com');
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
        onLogin(json.data.token);
      } else {
        setError(json.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative noise px-6">
      <div className="aurora w-[600px] h-[600px] -top-40 -left-40 bg-[#0066FF]" />
      <div className="aurora w-[500px] h-[500px] -bottom-40 -right-40 bg-[#00D4FF]" style={{ opacity: 0.3 }} />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <form onSubmit={submit} className="relative w-full max-w-md glass-strong rounded-2xl p-8 lg:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#0066FF] items-center justify-center mb-4 glow-blue">
            <ShieldCheck className="w-7 h-7 text-[#03050B]" />
          </div>
          <h1 className="text-2xl font-bold">Admin Console</h1>
          <p className="text-white/50 text-sm mt-2">Sign in to AlGloryThm dashboard</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full glass rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D4FF]/60" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="AlGlory@2025"
              className="w-full glass rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D4FF]/60" />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-lg font-semibold disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        <Link href="/" className="flex items-center justify-center gap-2 mt-6 text-sm text-white/50 hover:text-[#00D4FF]">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>
      </form>
    </main>
  );
}

function Dashboard({ token, onLogout }) {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [tab, setTab] = useState('overview');
  const [toasts, setToasts] = useState([]);

  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const load = () => {
    fetch('/api/admin/stats', auth).then((r) => r.json()).then((d) => setStats(d.data)).catch(() => {});
    fetch('/api/leads', auth).then((r) => r.json()).then((d) => setLeads(d.data || [])).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  // SSE real-time notifications
  useEffect(() => {
    if (!token) return;
    const es = new EventSource(`/api/admin/stream?token=${token}`);
    es.addEventListener('lead', (e) => {
      try {
        const data = JSON.parse(e.data);
        const id = Date.now() + Math.random();
        setToasts((t) => [...t, { id, ...data }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
        load();
      } catch {}
    });
    es.onerror = () => { /* reconnect handled by EventSource */ };
    return () => es.close();
  }, [token]);

  const updateStatus = async (id, status) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ leadStatus: status }),
    });
    load();
  };

  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 bg-grid opacity-20" />
      {/* SSE Toasts */}
      <div className="fixed top-20 right-6 z-[100] space-y-3 max-w-sm">
        {toasts.map((t) => (
          <div key={t.id} className="glass-strong rounded-xl p-4 border border-[#00D4FF]/30 glow-blue animate-pulse-glow flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-[#03050B]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">New lead: {t.firstName}</div>
              <div className="text-xs text-white/60 mt-0.5">{t.email}</div>
              <div className="text-xs text-[#00D4FF] mt-1">{(t.serviceType || '').replace('_', ' ')}</div>
            </div>
            <button onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))} className="text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <header className="relative border-b border-white/5 glass-strong sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF] to-[#0066FF] rounded-lg rotate-45" />
              <div className="absolute inset-1 bg-[#03050B] rounded-md rotate-45" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-[#00D4FF]" />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold">AlGloryThm</div>
              <div className="text-xs text-white/40">Admin Console</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/2fa" className="btn-ghost px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> 2FA
            </Link>
            <Link href="/admin/blogs" className="btn-ghost px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
              <FileText className="w-4 h-4" /> Blog editor
            </Link>
            <Link href="/" className="text-sm text-white/60 hover:text-white">View site</Link>
            <button onClick={onLogout} className="btn-ghost px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-white/50 mb-10">Real-time overview of leads, content, and events.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Leads', value: stats?.leadsCount || 0, icon: Users, color: 'from-[#00D4FF] to-[#0066FF]' },
            { label: 'Published Blogs', value: stats?.blogsCount || 0, icon: FileText, color: 'from-[#00BFFF] to-[#0099FF]' },
            { label: 'Active Events', value: stats?.eventsCount || 0, icon: Calendar, color: 'from-[#0099FF] to-[#0066FF]' },
            { label: 'Registrations', value: stats?.regsCount || 0, icon: TrendingUp, color: 'from-[#00D4FF] to-[#00B5FF]' },
          ].map((c) => (
            <div key={c.label} className="glass rounded-2xl p-6 card-hover relative overflow-hidden">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 glow-blue`}>
                <c.icon className="w-5 h-5 text-[#03050B]" />
              </div>
              <div className="text-3xl font-bold text-gradient mb-1">{c.value}</div>
              <div className="text-sm text-white/60">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 border-b border-white/5">
          {['overview', 'leads'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${tab === t ? 'text-[#00D4FF] border-[#00D4FF]' : 'text-white/50 border-transparent hover:text-white/80'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="font-semibold">Recent leads</h3>
            </div>
            <div className="divide-y divide-white/5">
              {(stats?.recentLeads || []).slice(0, 5).map((l) => (
                <div key={l.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition">
                  <div>
                    <div className="font-medium">{l.firstName} {l.lastName}</div>
                    <div className="text-sm text-white/50">{l.email} • {l.company || 'No company'}</div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full glass text-[#00D4FF]">{l.serviceType.replace('_', ' ')}</span>
                </div>
              ))}
              {(!stats?.recentLeads || stats.recentLeads.length === 0) && (
                <div className="p-10 text-center text-white/50">No leads yet — submit the contact form to see them here.</div>
              )}
            </div>
          </div>
        )}

        {tab === 'leads' && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Contact</th>
                    <th className="text-left p-4">Service</th>
                    <th className="text-left p-4">Budget</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-white/5 transition">
                      <td className="p-4">
                        <div className="font-medium">{l.firstName} {l.lastName}</div>
                        <div className="text-xs text-white/40">{l.company}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-white/80 flex items-center gap-1 text-xs"><Mail className="w-3 h-3" /> {l.email}</div>
                        {l.phone && <div className="text-white/50 flex items-center gap-1 text-xs mt-1"><Phone className="w-3 h-3" /> {l.phone}</div>}
                      </td>
                      <td className="p-4"><span className="text-[#00D4FF] text-xs">{l.serviceType.replace('_', ' ')}</span></td>
                      <td className="p-4 text-white/60 text-xs">{l.budget || '—'}</td>
                      <td className="p-4">
                        <select value={l.leadStatus} onChange={(e) => updateStatus(l.id, e.target.value)}
                          className="glass rounded-md px-2 py-1 text-xs focus:outline-none">
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="CLOSED_WON">CLOSED WON</option>
                          <option value="CLOSED_LOST">CLOSED LOST</option>
                        </select>
                      </td>
                      <td className="p-4 text-white/50 text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr><td colSpan={6} className="p-12 text-center text-white/50">No leads to display.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('algt_token');
    if (t) setToken(t);
    setReady(true);
  }, []);

  const logout = () => {
    localStorage.removeItem('algt_token');
    localStorage.removeItem('algt_user');
    setToken(null);
  };

  if (!ready) return null;
  if (!token) return <LoginForm onLogin={setToken} />;
  return <Dashboard token={token} onLogout={logout} />;
}
