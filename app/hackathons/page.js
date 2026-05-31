'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, MapPin, Trophy, Users, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function HackathonsPage() {
  const [hacks, setHacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hackathons').then((r) => r.json()).then((d) => { setHacks(d.data || []); setLoading(false); });
  }, []);

  return (
    <main className="min-h-screen relative noise">
      <div className="aurora w-[600px] h-[600px] -top-40 -left-40 bg-[#0066FF]" />
      <div className="aurora w-[500px] h-[500px] top-1/2 -right-40 bg-[#00D4FF]" style={{ opacity: 0.25 }} />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative container mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#00D4FF] mb-12">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>

        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full text-xs text-[#00D4FF]">
            <Trophy className="w-3 h-3" /> Hackathons
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            Build at <span className="text-gradient-blue">light speed</span>
          </h1>
          <p className="text-xl text-white/60 leading-relaxed">
            Join AlGloryThm hackathons to get real AI products in 48 hours. Massive prize pools,
            mentorship from FAANG engineers and a shot at joining our team.
          </p>
        </div>

        {loading ? (
          <div className="text-white/50">Loading hackathons...</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {hacks.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl overflow-hidden card-hover group">
                <div className="aspect-video relative overflow-hidden">
                  <Image src={h.image} alt={h.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03050B] via-[#03050B]/40 to-transparent" />
                  <div className="absolute top-4 right-4 glass-strong px-3 py-1.5 rounded-full text-xs text-[#00D4FF] flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> {h.prizePool}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-[#00D4FF] transition-colors">{h.title}</h3>
                  <p className="text-white/60 mb-5">{h.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm text-white/70 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#00D4FF]" />
                      <span>{new Date(h.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#00D4FF]" />
                      <span>{h.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#00D4FF]" />
                      <span>{h.maxTeams} teams max</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#00D4FF]" />
                      <span>{h.teamsCount || 0} registered</span>
                    </div>
                  </div>
                  <Link href={`/hackathons/${h.id}`} className="btn-primary w-full py-3 rounded-lg inline-flex items-center justify-center gap-2 font-semibold">
                    Register your team <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
