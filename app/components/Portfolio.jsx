"use client";

import { Award } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

function Portfolio() {
  const cases = [
    { client: 'FinEdge Capital', title: 'AI powered reconciliation engine', desc: 'Cut month end close from 11 days to 3. 96% straight through processing.', tags: ['LLM', 'RAG', 'Finance'], img: 'https://images.unsplash.com/photo-1606778303077-3780ea8d5420?crop=entropy&cs=srgb&fm=jpg&q=85&w=900' },
    { client: 'MedAxis Health', title: 'Clinical triage agent for 14 hospitals', desc: 'Reduced patient wait times by 41%. HIPAA-compliant and deployed on prem.', tags: ['Agents', 'Healthcare', 'On-prem'], img: 'https://images.unsplash.com/photo-1664526937033-fe2c11f1be25?crop=entropy&cs=srgb&fm=jpg&q=85&w=900' },
    { client: 'ShopVerse', title: 'Personalized commerce AI', desc: 'Lifted conversion 28% in 6 weeks via dynamic product discovery agents.', tags: ['E-commerce', 'Personalization'], img: 'https://images.unsplash.com/photo-1660165458059-57cfb6cc87e5?crop=entropy&cs=srgb&fm=jpg&q=85&w=900' },
  ];
  return (
    <section id="portfolio" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full text-xs text-[#00D4FF]">
              <Award className="w-3 h-3" /> Case Studies
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold">Work that <span className="text-gradient-blue">shipped</span></h2>
          </div>
          <p className="text-white/60 max-w-md text-lg">Real systems, Real outcomes. We move from idea to production in weeks and not quarters.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl overflow-hidden card-hover glass border"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <Image src={c.img} alt={c.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#03050B] via-[#03050B]/40 to-transparent" />
              </div>
              <div className="p-6">
                <div className="text-xs text-[#00D4FF] mb-2">{c.client}</div>
                <h3 className="text-xl font-bold mb-2">{c.title}</h3>
                <p className="text-white/60 text-sm mb-4">{c.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {c.tags.map((t) => (
                    <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Portfolio;