"use client";
import { Quote, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

function Testimonials() {
  const items = [
    { quote: "AiGlo rebuilt our internal ops in 8 weeks. We replaced 60% of our manual workflows with AI agents and saved $2.4M annually. The team operates at FAANG quality with startup speed.", name: 'Anjali Verma', title: 'COO, FinEdge Capital', stars: 5 },
    { quote: "Their depth on LLM evaluation and production observability is unmatched. We have worked with 3 other consultancies before \u2014 none came close.", name: 'Daniel Park', title: 'VP Engineering, MedAxis Health', stars: 5 },
    { quote: "The clearest ROI we have seen on AI investment. 7x return in the first year, deployed safely and governed thoroughly.", name: 'Karan Singh', title: 'CTO, ShopVerse', stars: 5 },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="aurora w-[500px] h-[500px] -bottom-40 -left-40 bg-[#0066FF]" style={{ opacity: 0.25 }} />
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full text-xs text-[#00D4FF]">
            <Quote className="w-3 h-3" /> Testimonials
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold">Loved by <span className="text-gradient-blue">operators</span></h2>
        </div>
        <div className="max-w-4xl mx-auto relative h-80 sm:h-72">
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}
              className="absolute inset-0 glass-strong rounded-2xl p-8 lg:p-12">
              <div className="flex gap-1 mb-6">
                {Array.from({ length: items[idx].stars }).map((_, i) => (<Star key={i} className="w-5 h-5 fill-[#00D4FF] text-[#00D4FF]" />))}
              </div>
              <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">&ldquo;{items[idx].quote}&rdquo;</p>
              <div>
                <div className="font-semibold">{items[idx].name}</div>
                <div className="text-sm text-white/50">{items[idx].title}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {items.map((_, i) => (
            <button aria-label={`Show testimonial ${i + 1}`} key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-8 bg-[#00D4FF]' : 'w-1.5 bg-white/20'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;