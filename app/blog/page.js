'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Eye, Sparkles, Search } from 'lucide-react';

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/blogs')
      .then((r) => r.json())
      .then((d) => { setBlogs(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = blogs.filter((b) =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    (b.excerpt || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="min-h-screen relative noise">
      <div className="aurora w-[600px] h-[600px] -top-40 -left-40 bg-[#0066FF]" />
      <div className="aurora w-[500px] h-[500px] top-1/2 -right-40 bg-[#00D4FF]" style={{ opacity: 0.25 }} />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative container mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#00D4FF] mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>

        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full text-xs text-[#00D4FF]">
            <Sparkles className="w-3 h-3" /> Research & Insights
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            The <span className="text-gradient-blue">AI Lab</span>
          </h1>
          <p className="text-xl text-white/60 leading-relaxed">
            Field reports, technical deep dives, and strategic frameworks from our engagements
            with high-growth enterprises.
          </p>
        </div>

        <div className="max-w-md mb-12 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full glass rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/40"
          />
        </div>

        {loading ? (
          <div className="text-white/50">Loading articles...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/blog/${b.slug}`} className="group block glass rounded-2xl overflow-hidden card-hover h-full">
                  <div className="aspect-video overflow-hidden relative">
                    <img src={b.thumbnail} alt={b.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {(b.categories || []).slice(0, 1).map((c) => (
                        <span key={c} className="text-xs px-3 py-1 rounded-full glass-strong text-[#00D4FF]">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-[#00D4FF] transition-colors line-clamp-2">{b.title}</h3>
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">{b.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>{b.author}</span>
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {b.views || 0}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
