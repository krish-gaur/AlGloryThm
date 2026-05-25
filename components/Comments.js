'use client';
import { useEffect, useState } from 'react';
import { Send, Loader2, MessageCircle, Lock } from 'lucide-react';
import Link from 'next/link';

export default function Comments({ slug }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('algt_token');
    const u = localStorage.getItem('algt_user');
    if (t) setToken(t);
    if (u) try { setUser(JSON.parse(u)); } catch {}
    load();
  }, [slug]);

  const load = async () => {
    const r = await fetch(`/api/blogs/${slug}/comments`);
    const j = await r.json();
    if (j.success) setComments(j.data || []);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    const r = await fetch(`/api/blogs/${slug}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: text }),
    });
    const j = await r.json();
    if (j.success) { setText(''); load(); }
    else setError(j.error || 'Failed');
    setSubmitting(false);
  };

  return (
    <div className="mt-16 pt-12 border-t border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-[#00D4FF]" />
        <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
      </div>

      {token ? (
        <form onSubmit={submit} className="glass rounded-xl p-4 mb-8">
          <div className="flex items-center gap-2 mb-3 text-xs text-white/50">
            <span>Commenting as <span className="text-[#00D4FF]">{user?.email}</span></span>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000}
            placeholder="Share your thoughts..."
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none resize-none" />
          {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-white/40">{text.length}/2000</span>
            <button type="submit" disabled={submitting || !text.trim()} className="btn-primary px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post
            </button>
          </div>
        </form>
      ) : (
        <div className="glass rounded-xl p-6 mb-8 text-center">
          <Lock className="w-6 h-6 text-white/40 mx-auto mb-3" />
          <p className="text-white/60 mb-4">Sign in to leave a comment.</p>
          <div className="flex gap-2 justify-center">
            <Link href="/login" className="btn-primary px-4 py-2 rounded-lg text-sm">Sign in</Link>
            <Link href="/signup" className="btn-ghost px-4 py-2 rounded-lg text-sm">Sign up</Link>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center text-xs font-bold text-[#03050B]">
                  {(c.userName || c.userEmail || 'A')[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white">{c.userName || c.userEmail}</span>
              </div>
              <span className="text-xs text-white/40">{new Date(c.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-white/80 text-sm whitespace-pre-wrap">{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && <div className="text-center text-white/40 text-sm py-8">Be the first to comment.</div>}
      </div>
    </div>
  );
}
