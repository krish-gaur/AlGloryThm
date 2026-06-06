'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { uploadToCloudinary } from '@/lib/clientUpload';
import { ArrowLeft, Save, Eye, Loader2, FileText, Upload, Image as ImageIcon } from 'lucide-react';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false, loading: () => <div className="glass rounded-xl p-12 text-center text-white/40">Loading editor...</div> });

export default function NewBlog() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail: '',
    author: 'AlGloryThm Team',
    categories: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    published: true,
  });

  useEffect(() => {
    const t = localStorage.getItem('algt_token');
    if (!t) { router.push('/admin'); return; }
    setToken(t);
  }, [router]);

  const updateTitle = (v) => {
    setForm({
      ...form,
      title: v,
      slug: (form.slug || generatedSlug).trim().replace(/^\/+/, ''),
    });
  };

  const save = async () => {
    if (!form.title || !form.content) { alert('Title and content required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        categories: form.categories.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) router.push('/admin/blogs');
      else alert(json.error || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full glass rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#00D4FF]/60";

  return (
    <main className="min-h-screen relative noise">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <header className="relative glass-strong border-b border-white/5 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/blogs" className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to blogs
            </Link>
            <div className="w-px h-6 bg-white/10" />
            <FileText className="w-4 h-4 text-[#00D4FF]" />
            <span className="font-semibold">New blog post</span>
          </div>
          <button onClick={save} disabled={saving} className="btn-primary px-5 py-2 rounded-lg text-sm inline-flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </header>

      <div className="relative container mx-auto px-6 py-10 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <input value={form.title} onChange={(e) => updateTitle(e.target.value)}
              placeholder="Blog title"
              className="w-full bg-transparent text-3xl lg:text-5xl font-bold focus:outline-none placeholder:text-white/20" />
            <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Short excerpt for the blog card..."
              className={inp} />
            <TiptapEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
          </div>
          <aside className="space-y-4">
            <div className="glass-strong rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">Metadata</h3>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">URL slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inp} placeholder="auto-generated" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Thumbnail</label>
                {form.thumbnail ? (
                  <div className="relative rounded-lg overflow-hidden group">
                    <img src={form.thumbnail} className="w-full aspect-video object-cover" alt="thumb" />
                    <button type="button" onClick={() => setForm({ ...form, thumbnail: '' })} className="absolute top-2 right-2 glass-strong rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition">Remove</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 glass rounded-lg p-6 cursor-pointer hover:bg-white/5">
                    <ImageIcon className="w-6 h-6 text-[#00D4FF]" />
                    <span className="text-sm text-white/60">Upload thumbnail</span>
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const r = await uploadToCloudinary(f, 'post-thumbnail');
                        setForm((s) => ({ ...s, thumbnail: r.secure_url }));
                      } catch (err) { alert(err.message); }
                    }} />
                  </label>
                )}
                <input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className={inp + ' mt-2 text-xs'} placeholder="Or paste URL" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Author</label>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Categories (comma sep)</label>
                <input value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} className={inp} placeholder="AI, Engineering" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Tags (comma sep)</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inp} placeholder="agents, llm" />
              </div>
              <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-[#00D4FF]" />
                Publish immediately
              </label>
            </div>
            <div className="glass-strong rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00D4FF]">SEO</h3>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">SEO title</label>
                <input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} className={inp} maxLength={60} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">SEO description</label>
                <textarea rows={3} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} className={inp + ' resize-none'} maxLength={160} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
