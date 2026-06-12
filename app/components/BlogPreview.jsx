"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { LineChart, ArrowRight } from "lucide-react";

function BlogPreview() {
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    fetch("/api/blogs")
      .then((r) => r.json())
      .then((d) => setBlogs((d.data || []).slice(0, 3)))
      .catch(() => {});
  }, []);
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full text-xs text-[#00D4FF]">
              <LineChart className="w-3 h-3" /> Research & Insights
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold">
              From the <span className="text-gradient-blue">lab</span>
            </h2>
          </div>
          <a
            href="/blog"
            className="btn-ghost px-6 py-3 rounded-xl inline-flex items-center gap-2 self-start lg:self-end"
          >
            View all posts <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {blogs.map((b, i) => (
            <motion.a
              key={b.id}
              href={`/blog/${b.slug}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group block glass rounded-2xl overflow-hidden card-hover"
            >
              <div className="aspect-video overflow-hidden relative">
                <Image
                  src={b.thumbnail}
                  alt={b.title}
                  fill
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {(b.categories || []).slice(0, 1).map((c) => (
                    <span
                      key={c}
                      className="text-xs px-3 py-1 rounded-full glass-strong text-[#00D4FF]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 group-hover:text-[#00D4FF] transition-colors">
                  {b.title}
                </h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">
                  {b.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{b.author}</span>
                  <span>
                    {new Date(b.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BlogPreview;
