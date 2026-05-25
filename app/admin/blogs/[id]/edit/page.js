'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Save, Loader2, FileText, Trash2 } from 'lucide-react';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

export default function EditBlog() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [token, setToken] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('algt_token');
    if (!t) { router.push('/admin'); return; }
    setToken(t);
    fetch(`/api/admin/blogs/${id}`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setForm({
            ...d.data,
            categories: (d.data.categories || []).join(', '),
            tags: (d.data.tags || []).join(', '),
          });
        }
        setLoading(false);
      });
  }, [id, router]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        categories: form.categories.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) router.push('/admin/blogs');
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    router.push('/admin/blogs');
  };

  if (loading || !form) return <main className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#00D4FF]" /></main>;

  const inp = "w-full glass rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#00D4FF]/60";

  return (
    <main className="min-h-screen relative noise">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <header className="relative glass-strong border-b border-white/5 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/blogs" className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="w-px h-6 bg-white/10" />
            <FileText className="w-4 h-4 text-[#00D4FF]" />
            <span className="font-semibold">Edit blog post</span>
          </div>
          <div className="flex gap-2">
            <button onClick={del} className="btn-ghost px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 hover:bg-red-500/10 hover:border-red-500/30">
              <Trash2 className="w-4 h-4 text-red-400" /> Delete
            </button>
            <button onClick={save} disabled={saving} className="btn-primary px-5 py-2 rounded-lg text-sm inline-flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save changes
            </button>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-6 py-10 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Blog title"
              className="w-full bg-transparent text-3xl lg:text-5xl font-bold focus:outline-none" />
            <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Excerpt"
              className={inp} />
            <TiptapEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
          </div>
          <aside className="space-y-4">
            <div className="glass-strong rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">Metadata</h3>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Thumbnail</label>
                <input value={form.thumbnail || ''} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Author</label>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Categories</label>
                <input value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Tags</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inp} />
              </div>
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-[#00D4FF]" />
                Published
              </label>
              <div className="text-xs text-white/40 pt-2 border-t border-white/5">
                Views: {form.views || 0}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
