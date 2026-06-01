"use client";
import { Rocket, Users, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';


function Stats() {

    function Counter({ end, suffix = '', duration = 2 }) {
      const [val, setVal] = useState(0);
      const ref = useRef(null);
      const inView = useInView(ref, { once: true, margin: '-50px' });
      useEffect(() => {
        if (!inView) return;
        const start = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - start) / (duration * 1000), 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(eased * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        tick();
      }, [inView, end, duration]);
      return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
    }
  
  const stats = [
    { value: 200, suffix: '+', label: 'AI Systems Shipped', icon: Rocket },
    { value: 80, suffix: '+', label: 'Enterprise Clients', icon: Users },
    { value: 99, suffix: '.9%', label: 'Uptime SLA', icon: ShieldCheck },
    { value: 7, suffix: 'x', label: 'Avg ROI', icon: TrendingUp },
  ];
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 lg:p-8 card-hover relative overflow-hidden group"
            >
              <s.icon className="w-6 h-6 text-[#00D4FF] mb-4" />
              <div className="text-4xl lg:text-5xl font-bold text-gradient mb-2"><Counter end={s.value} suffix={s.suffix} /></div>
              <div className="text-sm text-white/60">{s.label}</div>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[#00D4FF]/5 rounded-full blur-2xl group-hover:bg-[#00D4FF]/15 transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats; 