"use client";
import { Bot, BrainCircuit, Code2, Layers, Workflow, Cpu, Sparkles, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";


function Services() {
  const services = [
    { icon: Bot, title: 'AI Automation', desc: 'End to end workflow automation powered by LLMs and intelligent decision engines.', gradient: 'from-[#00D4FF] to-[#0066FF]' },
    { icon: BrainCircuit, title: 'AI Agents Development', desc: 'Custom agentic systems that plan, reason and execute across your tools.', gradient: 'from-[#00BFFF] to-[#0099FF]' },
    { icon: Code2, title: 'SaaS Development', desc: 'AI first SaaS products built for scale, performance and conversion.', gradient: 'from-[#00D4FF] to-[#00BFFF]' },
    { icon: Layers, title: 'Business Consulting', desc: 'Roadmaps, audits and strategy from teams who have shipped at scale.', gradient: 'from-[#0099FF] to-[#0066FF]' },
    { icon: Workflow, title: 'Workflow Integration', desc: 'Seamlessly connect AI to Salesforce, HubSpot, Slack, Notion and 200+ tools.', gradient: 'from-[#00B5FF] to-[#0080FF]' },
    { icon: Cpu, title: 'AI Infrastructure', desc: 'Production grade RAG, vector DBs, observability and in cost inference.', gradient: 'from-[#00D4FF] to-[#0044FF]' },
  ];
  return (
    <section id="services" className="py-32 relative">
      <div className="absolute inset-0 bg-grid-fine opacity-30" />
      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full text-xs text-[#00D4FF]">
            <Sparkles className="w-3 h-3" /> Services
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl lg:text-6xl font-bold mb-4">
            What we <span className="text-gradient-blue">build</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-white/60 max-w-2xl mx-auto text-lg">
            Six pillars of capability. One outcome: AI that compounds revenue.
          </motion.p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div key={s.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group relative glass rounded-2xl p-8 card-hover overflow-hidden"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 glow-blue`}>
                <s.icon className="w-7 h-7 text-[#03050B]" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
              <p className="text-white/60 mb-6 leading-relaxed">{s.desc}</p>
              <a href="#contact" className="inline-flex items-center gap-2 text-[#00D4FF] text-sm font-medium group/link">
                Learn more <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
              </a>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00D4FF]/5 rounded-full blur-3xl group-hover:bg-[#00D4FF]/20 transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;