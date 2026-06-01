"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Play, ShieldCheck, Award, Users, TrendingUp } from 'lucide-react';

function Hero() {

  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 noise">
      <div className="aurora w-[600px] h-[600px] -top-40 -left-40 bg-[#0066FF]" />
      <div className="aurora w-[500px] h-[500px] top-1/2 right-0 bg-[#00D4FF]" style={{ opacity: 0.3 }} />
      <div className="aurora w-[400px] h-[400px] bottom-0 left-1/3 bg-[#0099FF]" style={{ opacity: 0.25 }} />
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0"></div>
      {/* 3D neural network sphere */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-70">
        <div className="w-full h-full max-w-5xl"></div>
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
          We design and ship enterprise grade AI automation, custom AI agents and intelligent SaaS platforms
          that turn successful roadmaps into measurable revenue.
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

export default Hero;