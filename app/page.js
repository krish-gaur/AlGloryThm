'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Sparkles, Bot, Workflow, Cpu, BrainCircuit, Code2, Rocket,
  Zap, ShieldCheck, TrendingUp, Users, CheckCircle2, Star, Calendar,
  MapPin, Menu, X, Mail, Phone, Linkedin, Twitter, Github,
  Globe, ArrowUpRight, Play, Quote, Layers, LineChart, Award
} from 'lucide-react';

const Hero3D = dynamic(() => import('@/components/Hero3D'), { ssr: false, loading: () => null });

// ============ PARTICLE / NEURAL NETWORK CANVAS ============
function HeroCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let nodes = [];
    let width = 0, height = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      initNodes();
    };

    const initNodes = () => {
      const count = Math.floor((width * height) / 18000);
      nodes = Array.from({ length: Math.min(count, 80) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const onMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const time = Date.now() * 0.001;
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        const dx = n.x - mouseRef.current.x;
        const dy = n.y - mouseRef.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 0) {
          n.x += (dx / dist) * 0.8;
          n.y += (dy / dist) * 0.8;
        }
        const pulse = Math.sin(time * 2 + n.pulse) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + pulse * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 200, 255, ${0.4 + pulse * 0.4})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3);
        grad.addColorStop(0, 'rgba(0, 200, 255, 0.18)');
        grad.addColorStop(1, 'rgba(0, 200, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 140) {
            const op = (1 - d / 140) * 0.45;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 180, 255, ${op})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        const dm = Math.hypot(nodes[i].x - mouseRef.current.x, nodes[i].y - mouseRef.current.y);
        if (dm < 180) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.strokeStyle = `rgba(0, 220, 255, ${(1 - dm / 180) * 0.5})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouse);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

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

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [
    { href: '#services', label: 'Services' },
    { href: '#automation', label: 'Automation' },
    { href: '#portfolio', label: 'Work' },
    { href: '/blog', label: 'Blog' },
    { href: '/hackathons', label: 'Hackathons' },
    { href: '#contact', label: 'Contact' },
  ];
  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'glass-strong py-3' : 'py-5'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF] to-[#0066FF] rounded-lg rotate-45 group-hover:rotate-[60deg] transition-transform duration-500" />
            <div className="absolute inset-1 bg-[#03050B] rounded-md rotate-45" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#00D4FF]" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight">
            Al<span className="text-gradient-blue">Glory</span>Thm
          </span>
        </a>
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-white/70 hover:text-[#00D4FF] transition-colors relative group">
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#00D4FF] group-hover:w-full transition-all" />
            </a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <a href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Sign in</a>
          <a href="#contact" className="btn-primary px-5 py-2.5 rounded-lg text-sm inline-flex items-center gap-2">
            Book a Call <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-white">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="lg:hidden glass-strong overflow-hidden">
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-white/80 hover:text-[#00D4FF]">{l.label}</a>
              ))}
              <a href="#contact" onClick={() => setOpen(false)} className="btn-primary px-5 py-3 rounded-lg text-sm text-center">Book a Call</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 noise">
      <div className="aurora w-[600px] h-[600px] -top-40 -left-40 bg-[#0066FF]" />
      <div className="aurora w-[500px] h-[500px] top-1/2 right-0 bg-[#00D4FF]" style={{ opacity: 0.3 }} />
      <div className="aurora w-[400px] h-[400px] bottom-0 left-1/3 bg-[#0099FF]" style={{ opacity: 0.25 }} />
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0"><HeroCanvas /></div>
      {/* 3D neural network sphere */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-70">
        <div className="w-full h-full max-w-5xl"><Hero3D /></div>
      </div>
      <div className="absolute inset-0 bg-spotlight" />
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF]/50 to-transparent animate-scan" />

      <div className="relative z-10 container mx-auto px-6 text-center max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 glass rounded-full text-xs text-white/80">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 bg-[#00D4FF] rounded-full animate-ping" />
            <span className="relative bg-[#00D4FF] rounded-full w-2 h-2" />
          </span>
          Now accepting Q3 2025 engagements
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8"
        >
          <span className="block text-gradient">Build the future</span>
          <span className="block">with <span className="text-gradient-blue text-glow">intelligent AI</span></span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg sm:text-xl text-white/65 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          We design and ship enterprise-grade AI automation, custom AI agents, and intelligent SaaS platforms
          that turn ambitious roadmaps into measurable revenue.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a href="#contact" className="btn-primary px-8 py-4 rounded-xl text-base inline-flex items-center gap-2 group">
            Start your project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#services" className="btn-ghost px-8 py-4 rounded-xl text-base inline-flex items-center gap-2 group">
            <Play className="w-4 h-4" /> Explore services
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-20 flex flex-wrap justify-center gap-x-12 gap-y-4 text-white/40 text-sm"
        >
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#00D4FF]" /> SOC 2 Ready</span>
          <span className="flex items-center gap-2"><Award className="w-4 h-4 text-[#00D4FF]" /> ISO 27001</span>
          <span className="flex items-center gap-2"><Users className="w-4 h-4 text-[#00D4FF]" /> 80+ Enterprise Clients</span>
          <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#00D4FF]" /> $200M+ Revenue Influenced</span>
        </motion.div>
      </div>

      <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs"
      >
        <span>Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-[#00D4FF] to-transparent" />
      </motion.div>
    </section>
  );
}

function LogoMarquee() {
  const logos = ['Microsoft', 'TCS', 'Razorpay', 'Zerodha', 'Flipkart', 'Stripe', 'Swiggy', 'Paytm', 'Infosys', 'Wipro'];
  return (
    <section className="py-16 border-y border-white/5 relative overflow-hidden">
      <div className="text-center text-xs text-white/40 uppercase tracking-[0.2em] mb-8">Trusted by engineering teams at</div>
      <div className="flex overflow-hidden">
        <div className="flex shrink-0 gap-16 animate-marquee items-center">
          {[...logos, ...logos].map((l, i) => (
            <div key={i} className="text-2xl font-bold text-white/30 hover:text-white/70 transition-colors whitespace-nowrap">{l}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
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

function Services() {
  const services = [
    { icon: Bot, title: 'AI Automation', desc: 'End-to-end workflow automation powered by LLMs and intelligent decision engines.', gradient: 'from-[#00D4FF] to-[#0066FF]' },
    { icon: BrainCircuit, title: 'AI Agents Development', desc: 'Custom agentic systems that plan, reason, and execute across your tools.', gradient: 'from-[#00BFFF] to-[#0099FF]' },
    { icon: Code2, title: 'SaaS Development', desc: 'AI-first SaaS products built for scale, performance, and conversion.', gradient: 'from-[#00D4FF] to-[#00BFFF]' },
    { icon: Layers, title: 'Business Consulting', desc: 'Roadmaps, audits, and strategy from teams who have shipped at scale.', gradient: 'from-[#0099FF] to-[#0066FF]' },
    { icon: Workflow, title: 'Workflow Integration', desc: 'Seamlessly connect AI to Salesforce, HubSpot, Slack, Notion and 200+ tools.', gradient: 'from-[#00B5FF] to-[#0080FF]' },
    { icon: Cpu, title: 'AI Infrastructure', desc: 'Production-grade RAG, vector DBs, observability, and cost-optimized inference.', gradient: 'from-[#00D4FF] to-[#0044FF]' },
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

function AutomationShowcase() {
  const steps = [
    { num: '01', title: 'Discover', desc: 'Audit your workflows, identify high-leverage automation candidates.' },
    { num: '02', title: 'Design', desc: 'Architect the agent graph, model selection, and integration map.' },
    { num: '03', title: 'Deploy', desc: 'Ship to production with observability, evals, and rollback safety.' },
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
              observability, evals, cost controls, and human-in-the-loop safety nets.
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

function Portfolio() {
  const cases = [
    { client: 'FinEdge Capital', title: 'AI-powered reconciliation engine', desc: 'Cut month-end close from 11 days to 3. 96% straight-through processing.', tags: ['LLM', 'RAG', 'Finance'], img: 'https://images.unsplash.com/photo-1606778303077-3780ea8d5420?crop=entropy&cs=srgb&fm=jpg&q=85&w=900' },
    { client: 'MedAxis Health', title: 'Clinical triage agent for 14 hospitals', desc: 'Reduced patient wait times by 41%. HIPAA-compliant, deployed on-prem.', tags: ['Agents', 'Healthcare', 'On-prem'], img: 'https://images.unsplash.com/photo-1664526937033-fe2c11f1be25?crop=entropy&cs=srgb&fm=jpg&q=85&w=900' },
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
          <p className="text-white/60 max-w-md text-lg">Real systems. Real outcomes. We move from idea to production in weeks, not quarters.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl overflow-hidden card-hover glass border"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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

function Testimonials() {
  const items = [
    { quote: "AlGloryThm rebuilt our internal ops in 8 weeks. We replaced 60% of our manual workflows with AI agents and saved $2.4M annually. The team operates at FAANG quality with startup speed.", name: 'Anjali Verma', title: 'COO, FinEdge Capital', stars: 5 },
    { quote: "Their depth on LLM evaluation and production observability is unmatched. We've worked with three other consultancies before \u2014 none came close.", name: 'Daniel Park', title: 'VP Engineering, MedAxis Health', stars: 5 },
    { quote: "The clearest ROI we've seen on AI investment. 7x return in the first year, deployed safely, governed thoroughly.", name: 'Karan Singh', title: 'CTO, ShopVerse', stars: 5 },
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
            <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-8 bg-[#00D4FF]' : 'w-1.5 bg-white/20'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogPreview() {
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    fetch('/api/blogs').then((r) => r.json()).then((d) => setBlogs((d.data || []).slice(0, 3))).catch(() => {});
  }, []);
  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full text-xs text-[#00D4FF]">
              <LineChart className="w-3 h-3" /> Research & Insights
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold">From the <span className="text-gradient-blue">lab</span></h2>
          </div>
          <a href="/blog" className="btn-ghost px-6 py-3 rounded-xl inline-flex items-center gap-2 self-start lg:self-end">
            View all posts <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {blogs.map((b, i) => (
            <motion.a key={b.id} href={`/blog/${b.slug}`} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group block glass rounded-2xl overflow-hidden card-hover">
              <div className="aspect-video overflow-hidden relative">
                <img src={b.thumbnail} alt={b.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {(b.categories || []).slice(0, 1).map((c) => (
                    <span key={c} className="text-xs px-3 py-1 rounded-full glass-strong text-[#00D4FF]">{c}</span>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 group-hover:text-[#00D4FF] transition-colors">{b.title}</h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{b.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{b.author}</span>
                  <span>{new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Events() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetch('/api/events').then((r) => r.json()).then((d) => setEvents(d.data || [])).catch(() => {});
  }, []);
  return (
    <section id="events" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full text-xs text-[#00D4FF]">
            <Calendar className="w-3 h-3" /> Community
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold mb-4">
            Upcoming <span className="text-gradient-blue">events & hackathons</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">Join the AlGloryThm community of builders. Conferences, hackathons, and deep-tech meetups.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {events.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl overflow-hidden card-hover">
              <div className="aspect-video relative overflow-hidden">
                <img src={e.image} alt={e.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#03050B] via-transparent to-transparent" />
                <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full glass-strong text-[#00D4FF]">{e.eventType}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{e.title}</h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{e.description}</p>
                <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(e.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.location}</span>
                </div>
                <button className="w-full btn-ghost py-2.5 rounded-lg text-sm">Register</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', company: '', serviceType: 'AI_AUTOMATION', message: '', budget: '', timeline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', serviceType: 'AI_AUTOMATION', message: '', budget: '', timeline: '' });
      } else {
        setError(json.error || 'Failed to submit');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full glass rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#00D4FF]/60 focus:ring-1 focus:ring-[#00D4FF]/40 transition";

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      <div className="aurora w-[700px] h-[700px] -top-40 left-1/2 -translate-x-1/2 bg-[#0066FF]" style={{ opacity: 0.18 }} />
      <div className="container mx-auto px-6 relative">
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full text-xs text-[#00D4FF]">
              <Mail className="w-3 h-3" /> Get in touch
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Let&apos;s build your <span className="text-gradient-blue">AI engine</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 leading-relaxed">
              Tell us about your problem. We&apos;ll respond within 24 hours with a discovery call link and a tailored proposal.
            </p>
            <div className="space-y-5">
              {[
                { icon: Mail, label: 'Email', value: 'hello@alglorythm.com' },
                { icon: Phone, label: 'Phone', value: '+91 80 4567 8900' },
                { icon: MapPin, label: 'HQ', value: 'Bangalore \u2022 Mumbai \u2022 Remote' },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg glass flex items-center justify-center shrink-0">
                    <c.icon className="w-4 h-4 text-[#00D4FF]" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/40">{c.label}</div>
                    <div className="text-white/90">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-10">
              {[Linkedin, Twitter, Github, Globe].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-[#00D4FF]/10 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <form onSubmit={submit} className="glass-strong rounded-2xl p-6 lg:p-10 space-y-5">
              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#0066FF] flex items-center justify-center mx-auto mb-6 glow-blue-strong">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Message received</h3>
                  <p className="text-white/60 mb-6">Our team will reach out within 24 hours.</p>
                  <button onClick={() => setSuccess(false)} className="btn-ghost px-6 py-2.5 rounded-lg text-sm">Send another</button>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">First name *</label>
                      <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls} placeholder="John" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Last name</label>
                      <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls} placeholder="Doe" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Work email *</label>
                      <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="you@company.com" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Phone</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="+91 ..." />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Company</label>
                      <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={inputCls} placeholder="Acme Inc" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Service *</label>
                      <select required value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} className={inputCls}>
                        <option value="AI_AUTOMATION">AI Automation</option>
                        <option value="AI_AGENTS">AI Agents Development</option>
                        <option value="SAAS_DEVELOPMENT">SaaS Development</option>
                        <option value="CONSULTING">Business Consulting</option>
                        <option value="WORKFLOW_INTEGRATION">Workflow Integration</option>
                        <option value="AI_INFRASTRUCTURE">AI Infrastructure</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Budget</label>
                      <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={inputCls}>
                        <option value="">Select range</option>
                        <option>$10k - $50k</option>
                        <option>$50k - $150k</option>
                        <option>$150k - $500k</option>
                        <option>$500k+</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Timeline</label>
                      <select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className={inputCls}>
                        <option value="">Select timeline</option>
                        <option>ASAP</option>
                        <option>1-3 months</option>
                        <option>3-6 months</option>
                        <option>Exploring</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Tell us about your project *</label>
                    <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputCls + ' resize-none'} placeholder="What problem are you trying to solve?" />
                  </div>
                  {error && <div className="text-red-400 text-sm">{error}</div>}
                  <button type="submit" disabled={submitting} className="btn-primary w-full py-4 rounded-xl text-base font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
                    {submitting ? 'Sending...' : <>Send message <ArrowRight className="w-4 h-4" /></>}
                  </button>
                  <p className="text-xs text-white/40 text-center">We respect your privacy. No spam, ever.</p>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="relative glass-strong rounded-3xl p-12 lg:p-20 text-center overflow-hidden noise">
          <div className="aurora w-[400px] h-[400px] -top-20 left-1/4 bg-[#00D4FF]" style={{ opacity: 0.4 }} />
          <div className="aurora w-[400px] h-[400px] -bottom-20 right-1/4 bg-[#0066FF]" style={{ opacity: 0.4 }} />
          <div className="relative">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Ready to ship <span className="text-gradient-blue">AI that works?</span>
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
              Limited Q3 slots remaining. Schedule a 30-minute call to scope your AI roadmap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#contact" className="btn-primary px-8 py-4 rounded-xl text-base inline-flex items-center gap-2">
                Book a call <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/blog" className="btn-ghost px-8 py-4 rounded-xl text-base inline-flex items-center gap-2">
                Read our research
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 pt-20 pb-10 relative">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF] to-[#0066FF] rounded-lg rotate-45" />
                <div className="absolute inset-1 bg-[#03050B] rounded-md rotate-45" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#00D4FF]" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight">
                Al<span className="text-gradient-blue">Glory</span>Thm
              </span>
            </div>
            <p className="text-white/50 max-w-sm mb-6">
              Building production-grade AI automation, agents, and intelligent SaaS platforms for ambitious teams.
            </p>
            <div className="flex gap-3">
              {[Linkedin, Twitter, Github, Globe].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-[#00D4FF]/10 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Product', links: ['Services', 'Automation', 'Agents', 'Infrastructure'] },
            { title: 'Company', links: ['About', 'Blog', 'Events', 'Careers'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-xs uppercase tracking-wider text-white/40 mb-4">{col.title}</div>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-white/70 hover:text-[#00D4FF] text-sm transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-4 text-sm text-white/40">
          <div>&copy; 2025 AlGloryThm. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <LogoMarquee />
      <Stats />
      <Services />
      <AutomationShowcase />
      <Portfolio />
      <Testimonials />
      <BlogPreview />
      <Events />
      <Contact />
      <FinalCTA />
      <Footer />
    </main>
  );
}
