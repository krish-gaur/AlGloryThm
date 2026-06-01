"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
              <Image src="/log.jpeg" alt="Logo" width={36} height={36} />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight">
            Ai<span className="text-gradient-blue">Glo</span>
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

export default Nav;