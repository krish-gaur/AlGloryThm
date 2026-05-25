'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, Eye, Sparkles, FileText, Loader2 } from 'lucide-react';

export default function AdminBlogs() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('algt_token');
    if (!t) { router.push('/admin'); return; }
    setToken(t);
    fetch('/api/admin/blogs', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((d) => { setBlogs(d.data || []); setLoading(false); });
  }, [router]);

  const del = async (id) => {
    if (!confirm('Delete this blog post?')) return;
    await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setBlogs(blogs.filter((b) => b.id !== id));
  };

  return (
    <main className="min-h-screen relative noise">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <header className="relative glass-strong border-b border-white/5 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00D4FF]" />
              <span className="font-semibold">Blog management</span>
            </div>
          </div>
          <Link href="/admin/blogs/new" className="btn-primary px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> New post
          </Link>
        </div>
      </header>

      <div className="relative container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">All blog posts</h1>
        <p className="text-white/50 mb-10">Create, edit, publish your AlGloryThm research articles.</p>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" /></div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left p-4">Title</th>
                    <th className="text-left p-4">Author</th>
                    <th className="text-left p-4">Categories</th>
                    <th className="text-left p-4">Views</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {blogs.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5">
                      <td className="p-4">
                        <div className="font-medium">{b.title}</div>
                        <div className="text-xs text-white/40 mt-1">/{b.slug}</div>
                      </td>
                      <td className="p-4 text-white/70">{b.author}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(b.categories || []).slice(0, 2).map((c) => (
                            <span key={c} className="text-xs px-2 py-0.5 rounded glass text-[#00D4FF]">{c}</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-white/60">{b.views || 0}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${b.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                          {b.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Link href={`/blog/${b.slug}`} target="_blank" className="p-2 hover:bg-white/5 rounded" title="View">
                            <Eye className="w-4 h-4 text-white/60" />
                          </Link>
                          <Link href={`/admin/blogs/${b.id}/edit`} className="p-2 hover:bg-white/5 rounded" title="Edit">
                            <Edit className="w-4 h-4 text-[#00D4FF]" />
                          </Link>
                          <button onClick={() => del(b.id)} className="p-2 hover:bg-red-500/10 rounded" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {blogs.length === 0 && (
                    <tr><td colSpan={6} className="p-12 text-center text-white/50">No blogs yet. <Link href="/admin/blogs/new" className="text-[#00D4FF]">Create your first post</Link>.</td></tr>
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
