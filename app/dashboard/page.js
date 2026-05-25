'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, LogOut, Calendar, Rocket, ArrowRight, User, BookOpen, Award } from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('algt_user');
    if (!u) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(u));
    fetch('/api/events').then((r) => r.json()).then((d) => setEvents(d.data || []));
    fetch('/api/hackathons').then((r) => r.json()).then((d) => setHackathons(d.data || []));
    setReady(true);
  }, [router]);

  const logout = () => {
    localStorage.removeItem('algt_token');
    localStorage.removeItem('algt_user');
    router.push('/');
  };

  if (!ready) return null;

  return (
    <main className="min-h-screen relative noise">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="aurora w-[600px] h-[600px] -top-40 -right-40 bg-[#0066FF]" style={{ opacity: 0.2 }} />

      <header className="relative glass-strong border-b border-white/5 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF] to-[#0066FF] rounded-lg rotate-45" />
              <div className="absolute inset-1 bg-[#03050B] rounded-md rotate-45" />
              <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-3 h-3 text-[#00D4FF]" /></div>
            </div>
            <span className="font-bold">AlGloryThm</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm text-white/60 hover:text-white">Blog</Link>
            <Link href="/hackathons" className="text-sm text-white/60 hover:text-white">Hackathons</Link>
            <button onClick={logout} className="btn-ghost px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center glow-blue">
            <User className="w-8 h-8 text-[#03050B]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, <span className="text-gradient-blue">{user?.firstName || 'builder'}</span>!</h1>
            <p className="text-white/50 mt-1">Your AlGloryThm journey starts here.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Calendar, label: 'Events available', value: events.length, color: 'from-[#00D4FF] to-[#0066FF]' },
            { icon: Rocket, label: 'Active hackathons', value: hackathons.length, color: 'from-[#00BFFF] to-[#0099FF]' },
            { icon: Award, label: 'Member since', value: 'Today', color: 'from-[#0099FF] to-[#0066FF]' },
          ].map((c) => (
            <div key={c.label} className="glass rounded-2xl p-6 card-hover">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 glow-blue`}>
                <c.icon className="w-5 h-5 text-[#03050B]" />
              </div>
              <div className="text-2xl font-bold mb-1">{c.value}</div>
              <div className="text-sm text-white/60">{c.label}</div>
            </div>
          ))}
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Upcoming hackathons</h2>
            <Link href="/hackathons" className="text-sm text-[#00D4FF] hover:underline inline-flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {hackathons.slice(0, 2).map((h) => (
              <Link key={h.id} href={`/hackathons/${h.id}`} className="glass rounded-2xl overflow-hidden card-hover group">
                <div className="aspect-video overflow-hidden relative">
                  <img src={h.image} alt={h.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03050B] to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-xs text-[#00D4FF] mb-1">Prize pool: {h.prizePool}</div>
                    <h3 className="text-xl font-bold">{h.title}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-white/60 line-clamp-2">{h.description}</p>
                </div>
              </Link>
            ))}
            {hackathons.length === 0 && (
              <div className="col-span-2 glass rounded-2xl p-10 text-center text-white/50">No hackathons available yet.</div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Events</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {events.slice(0, 3).map((e) => (
              <div key={e.id} className="glass rounded-2xl p-5 card-hover">
                <div className="text-xs text-[#00D4FF] mb-2">{e.eventType}</div>
                <h3 className="font-bold mb-2">{e.title}</h3>
                <div className="text-xs text-white/50 mb-3">{new Date(e.date).toLocaleDateString()}</div>
                <p className="text-sm text-white/60 line-clamp-2">{e.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
