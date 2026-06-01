"use client";

import { Sparkles } from 'lucide-react';


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
                Ai<span className="text-gradient-blue">Glo</span>
              </span>
            </div>
            <p className="text-white/50 max-w-sm mb-6">
              Building production grade AI automation, agents and intelligent SaaS platforms for ambitious teams.
            </p>
            
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
          <div>&copy; 2025 AiGlo. All rights reserved.</div>
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

export default Footer;