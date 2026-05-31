'use client';

// ─── React & Next.js ──────────────────────────────────────────────────────────
import { useEffect, useState, useMemo } from 'react';
import Link                              from 'next/link';
import Image                             from 'next/image';

// ─── Third-party ──────────────────────────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion';

// ─── Icons ────────────────────────────────────────────────────────────────────
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Sparkles,
  Trophy,
  Users,
  Search,
  SlidersHorizontal,
  Clock,
  Zap,
  ChevronRight,
  Globe,
  Wifi,
} from 'lucide-react';


// ─── Constants ────────────────────────────────────────────────────────────────

const FILTERS = ['All', 'Online', 'In-Person', 'Hybrid'];

const STATUS_CONFIG = {
  open:     { label: 'Open',     dot: 'bg-emerald-400',  text: 'text-emerald-400', ring: 'ring-emerald-400/30' },
  soon:     { label: 'Soon',     dot: 'bg-amber-400',    text: 'text-amber-400',   ring: 'ring-amber-400/30'   },
  closed:   { label: 'Closed',   dot: 'bg-red-400',      text: 'text-red-400',     ring: 'ring-red-400/30'     },
  upcoming: { label: 'Upcoming', dot: 'bg-[#00D4FF]',    text: 'text-[#00D4FF]',   ring: 'ring-[#00D4FF]/30'   },
};

function getStatus(h) {
  const now   = Date.now();
  const start = new Date(h.startDate).getTime();
  const end   = new Date(h.endDate   || h.startDate).getTime() + 48 * 3600_000;
  const diff  = start - now;

  if (now > end)                   return 'closed';
  if (now >= start)                return 'open';
  if (diff < 7 * 24 * 3600_000)   return 'soon';
  return 'upcoming';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

function formatPrize(raw = '') {
  return raw.startsWith('$') ? raw : `$${raw}`;
}

function registrationPct(h) {
  if (!h.maxTeams) return 0;
  return Math.min(100, Math.round(((h.teamsCount || 0) / h.maxTeams) * 100));
}

function locationIcon(h) {
  if (!h.location) return Globe;
  const l = h.location.toLowerCase();
  if (l.includes('online') || l.includes('remote') || l.includes('virtual')) return Wifi;
  return MapPin;
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.upcoming;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                      ring-1 ${cfg.ring} bg-black/30 backdrop-blur-sm ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  );
}

function MetaChip({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-white/60">
      <Icon className="w-3.5 h-3.5 flex-shrink-0 text-[#00D4FF]/70" />
      <span className="truncate">{children}</span>
    </div>
  );
}

function RegistrationBar({ pct }) {
  const color = pct >= 90 ? '#f87171' : pct >= 60 ? '#fbbf24' : '#00D4FF';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-white/50">
        <span>Spots filled</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-white/5" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-white/5 rounded-lg w-3/4" />
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-5/6" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-white/5 rounded" />
          ))}
        </div>
        <div className="h-11 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}

function HackathonCard({ h, index }) {
  const status  = getStatus(h);
  const pct     = registrationPct(h);
  const LocIcon = locationIcon(h);
  const isFull  = pct >= 100;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="glass rounded-2xl overflow-hidden card-hover group relative flex flex-col"
      aria-label={h.title}
    >
      {/* ── Thumbnail ──────────────────────────────────────────── */}
      <div className="aspect-video relative overflow-hidden flex-shrink-0">
        {h.image ? (
          <Image
            src={h.image}
            alt={h.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          /* Gradient placeholder when no image */
          <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/30 via-[#00D4FF]/10 to-transparent" />
        )}

        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#03050B]/90 via-[#03050B]/20 to-transparent" />

        {/* Top-left status badge */}
        <div className="absolute top-4 left-4">
          <StatusBadge status={status} />
        </div>

        {/* Top-right prize */}
        <div className="absolute top-4 right-4 glass-strong px-3 py-1.5 rounded-full
                        text-xs font-bold text-[#00D4FF] flex items-center gap-1.5">
          <Trophy className="w-3 h-3" />
          {formatPrize(h.prizePool)}
        </div>

        {/* Bottom-left: start date chip */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5
                        glass-strong px-2.5 py-1 rounded-full text-xs text-white/70">
          <Calendar className="w-3 h-3 text-[#00D4FF]" />
          {formatDate(h.startDate)}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="p-6 flex flex-col flex-1">

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 group-hover:text-[#00D4FF] transition-colors duration-200 line-clamp-2">
          {h.title}
        </h3>

        {/* Description */}
        <p className="text-white/55 text-sm leading-relaxed mb-5 line-clamp-2 flex-shrink-0">
          {h.description}
        </p>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-5">
          <MetaChip icon={LocIcon}>{h.location || 'Online'}</MetaChip>
          <MetaChip icon={Users}>{h.maxTeams} teams max</MetaChip>
          <MetaChip icon={Sparkles}>{h.teamsCount || 0} registered</MetaChip>
          <MetaChip icon={Clock}>48-hour sprint</MetaChip>
        </div>

        {/* Registration progress */}
        <div className="mb-5">
          <RegistrationBar pct={pct} />
        </div>

        {/* Spacer pushes CTA to bottom */}
        <div className="flex-1" />

        {/* CTA */}
        {isFull ? (
          <button
            disabled
            className="w-full py-3 rounded-xl text-sm font-semibold text-white/30
                       bg-white/5 cursor-not-allowed select-none"
          >
            Registration Full
          </button>
        ) : (
          <Link
            href={`/hackathons/${h.id}`}
            className="btn-primary w-full py-3 rounded-xl inline-flex items-center justify-center
                       gap-2 text-sm font-semibold group/btn"
          >
            Register your team
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </Link>
        )}
      </div>
    </motion.article>
  );
}

function EmptyState({ query }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
        <Search className="w-7 h-7 text-white/30" />
      </div>
      <p className="text-white/50 text-lg font-medium mb-1">No hackathons found</p>
      {query && (
        <p className="text-white/30 text-sm">
          No results for <span className="text-white/50">"{query}"</span>
        </p>
      )}
    </motion.div>
  );
}

// ─── Stats banner ─────────────────────────────────────────────────────────────

function StatsBanner({ hacks }) {
  const total      = hacks.length;
  const totalPrize = hacks.reduce((acc, h) => {
    const num = parseInt((h.prizePool || '').replace(/[^0-9]/g, ''), 10);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);
  const registered = hacks.reduce((acc, h) => acc + (h.teamsCount || 0), 0);

  const stats = [
    { label: 'Active events',   value: total,                        icon: Zap      },
    { label: 'Total prize pool', value: `$${(totalPrize / 1000).toFixed(0)}k`, icon: Trophy   },
    { label: 'Teams registered', value: registered,                   icon: Users    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-12">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="glass rounded-xl px-4 py-3 text-center">
          <Icon className="w-4 h-4 text-[#00D4FF] mx-auto mb-1" />
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-white/50 mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HackathonsPage() {
  const [hacks,   setHacks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState('');
  const [filter,  setFilter]  = useState('All');

  useEffect(() => {
    fetch('/api/hackathons')
      .then((r) => r.json())
      .then((d) => {
        setHacks(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = hacks;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (h) =>
          h.title?.toLowerCase().includes(q) ||
          h.description?.toLowerCase().includes(q) ||
          h.location?.toLowerCase().includes(q),
      );
    }

    if (filter !== 'All') {
      const f = filter.toLowerCase();
      result = result.filter((h) => h.location?.toLowerCase().includes(f));
    }

    return result;
  }, [hacks, query, filter]);

  return (
    <main className="min-h-screen relative noise overflow-x-hidden">

      {/* ── Ambient background ─────────────────────────────────── */}
      <div className="aurora w-[700px] h-[700px] -top-60 -left-60 bg-[#0066FF]" />
      <div className="aurora w-[500px] h-[500px] top-1/3 -right-60 bg-[#00D4FF]" style={{ opacity: 0.2 }} />
      <div className="aurora w-[400px] h-[400px] bottom-0 left-1/3 bg-[#0044CC]" style={{ opacity: 0.15 }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* ── Page content ───────────────────────────────────────── */}
      <div className="relative container mx-auto px-6 py-20 max-w-6xl">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-[#00D4FF]
                     transition-colors duration-200 mb-14 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6
                          glass rounded-full text-xs font-semibold text-[#00D4FF] tracking-wider uppercase">
            <Trophy className="w-3 h-3" />
            Hackathons
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold mb-5 leading-[1.05]">
            Build at{' '}
            <span className="text-gradient-blue">light speed</span>
          </h1>

          <p className="text-lg text-white/55 leading-relaxed max-w-2xl">
            Join AlGloryThm hackathons — ship real AI products in 48 hours. Massive prize pools,
            mentorship from FAANG engineers, and a shot at joining our team.
          </p>
        </motion.div>

        {/* ── Stats banner ─────────────────────────────────────── */}
        {!loading && hacks.length > 0 && <StatsBanner hacks={hacks} />}

        {/* ── Search + filter bar ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search hackathons…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl
                         pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30
                         focus:outline-none focus:border-[#00D4FF]/50 focus:bg-white/8
                         transition-all duration-200"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-white/30 flex-shrink-0" />
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${filter === f
                    ? 'bg-[#00D4FF]/15 text-[#00D4FF] ring-1 ring-[#00D4FF]/40'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Result count */}
        <AnimatePresence>
          {!loading && (
            <motion.p
              key={filtered.length}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white/30 mb-5"
            >
              {filtered.length} hackathon{filtered.length !== 1 ? 's' : ''} found
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── Grid ─────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <motion.div layout className="grid lg:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.length > 0
                ? filtered.map((h, i) => <HackathonCard key={h.id} h={h} index={i} />)
                : <EmptyState key="empty" query={query} />
              }
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Bottom CTA ───────────────────────────────────────── */}
        {!loading && hacks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-white/40 text-sm mb-3">
              Don't see what you're looking for?
            </p>
            <Link
              href="/hackathons/suggest"
              className="inline-flex items-center gap-1.5 text-[#00D4FF] text-sm
                         hover:underline underline-offset-4 transition-all"
            >
              Suggest a hackathon
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

      </div>
    </main>
  );
}