"use client";

import { motion } from 'framer-motion';
import { Workflow, BrainCircuit, Zap } from 'lucide-react';

function AutomationShowcase() {
  const steps = [
    { num: '01', title: 'Discover', desc: 'Audit your workflows, identify high leverage automation candidates.' },
    { num: '02', title: 'Design', desc: 'Architect the agent graph, model selection and integration map.' },
    { num: '03', title: 'Deploy', desc: 'Ship to production with observability, evals and rollback safety.' },
    { num: '04', title: 'Scale', desc: 'Continuous improvement loops with feedback signals from real usage.' },
  ];
  return (
    <section id="automation" className="py-32 relative overflow-hidden">
      <div className="aurora w-[500px] h-[500px] top-1/4 -right-40 bg-[#0066FF]" style={{ opacity: 0.3 }} />
      <div className="container mx-auto px-6 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full text-xs text-[#00D4FF]">
              <Workflow className="w-3 h-3" /> Automation Engine
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              From manual chaos to <span className="text-gradient-blue">autonomous flow</span>
            </h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Our four-phase delivery model has shipped 200+ AI systems into production. We obsess over the boring parts:
              observability, evals, cost controls and human in the-loop safety nets.
            </p>
            <div className="space-y-4">
              {steps.map((s, i) => (
                <motion.div key={s.num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex gap-4 group">
                  <div className="text-3xl font-bold text-gradient-blue w-16">{s.num}</div>
                  <div className="flex-1 pb-4 border-b border-white/5 group-hover:border-[#00D4FF]/30 transition-colors">
                    <h4 className="font-semibold mb-1">{s.title}</h4>
                    <p className="text-white/50 text-sm">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-full border border-[#00D4FF]/20 animate-spin-slow" />
              <div className="absolute inset-8 rounded-full border border-[#00D4FF]/15 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />
              <div className="absolute inset-16 rounded-full border border-[#00D4FF]/10 animate-spin-slow" style={{ animationDuration: '25s' }} />
              <div className="absolute inset-1/4 rounded-full bg-gradient-to-br from-[#00D4FF] via-[#0099FF] to-[#0066FF] glow-blue-strong animate-pulse-glow flex items-center justify-center">
                <BrainCircuit className="w-20 h-20 text-white" />
              </div>
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <div key={i} className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#00D4FF] rounded-full glow-blue"
                  style={{ transform: `rotate(${deg}deg) translateX(180px) rotate(-${deg}deg)` }} />
              ))}
            </div>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -top-4 -left-4 glass-strong rounded-xl p-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white/80">Agent online</span>
              </div>
            </motion.div>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5 }}
              className="absolute -bottom-4 -right-4 glass-strong rounded-xl p-3 text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-[#00D4FF]" />
                <span className="text-white/80">2.4M tasks / day</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AutomationShowcase; 