'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Eye, User } from 'lucide-react';
import { useParams } from 'next/navigation';
import Comments from '@/components/Comments';

export default function BlogDetail() {
  const params = useParams();
  const slug = params?.slug;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blogs/${slug}`)
      .then((r) => r.json())
      .then((d) => { setBlog(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <main className="min-h-screen flex items-center justify-center text-white/50">Loading...</main>;
  if (!blog) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Article not found</h1>
        <Link href="/blog" className="text-[#00D4FF]">Back to blog</Link>
      </div>
    </main>
  );

  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.thumbnail ? [blog.thumbnail] : undefined,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    author: { '@type': 'Person', name: blog.author },
    publisher: { '@type': 'Organization', name: 'AlGloryThm', logo: { '@type': 'ImageObject', url: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/icon.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${process.env.NEXT_PUBLIC_BASE_URL || ''}/blog/${blog.slug}` },
  };

  return (
    <main className="min-h-screen relative noise">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
      <div className="aurora w-[700px] h-[700px] -top-60 left-1/2 -translate-x-1/2 bg-[#0066FF]" style={{ opacity: 0.2 }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative container mx-auto px-6 py-20 max-w-4xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-white/60 hover:text-[#00D4FF] mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All articles
        </Link>

        <div className="mb-8 flex flex-wrap gap-2">
          {(blog.categories || []).map((c) => (
            <span key={c} className="text-xs px-3 py-1 rounded-full glass-strong text-[#00D4FF]">{c}</span>
          ))}
        </div>

        <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
          <span className="text-gradient">{blog.title}</span>
        </h1>

        <p className="text-xl text-white/70 leading-relaxed mb-8">{blog.excerpt}</p>

        <div className="flex flex-wrap items-center gap-6 mb-12 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <User className="w-4 h-4" /> {blog.author}
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Calendar className="w-4 h-4" /> {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Eye className="w-4 h-4" /> {blog.views || 0} views
          </div>
        </div>

        {blog.thumbnail && (
          <div className="rounded-2xl overflow-hidden mb-12 glow-blue">
            <img src={blog.thumbnail} alt={blog.title} className="w-full" />
          </div>
        )}

        <article className="prose prose-invert prose-lg max-w-none">
          {blog.content && blog.content.startsWith('<') ? (
            <div className="text-white/80 leading-relaxed text-lg [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#00D4FF] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_a]:text-[#00D4FF] [&_a]:underline [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:rounded-lg [&_img]:rounded-xl [&_img]:my-4"
                 dangerouslySetInnerHTML={{ __html: blog.content }} />
          ) : (
            (blog.content || '').split('\n\n').map((p, i) => (
              <p key={i} className="text-white/80 leading-relaxed mb-6 text-lg">{p}</p>
            ))
          )}
        </article>

        <Comments slug={slug} />

        <div className="mt-20 pt-12 border-t border-white/10">
          <div className="glass-strong rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to build with AI?</h3>
            <p className="text-white/60 mb-6">Book a 30-minute discovery call with our team.</p>
            <Link href="/#contact" className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2">
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
