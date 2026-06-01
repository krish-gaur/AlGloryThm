"use client";

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

function FinalCTA() {
  const [loading, setLoading] = useState(false);
  const startPayment = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'consultation_deposit' }),
      });
      const j = await r.json();
      if (j.success && j.data.url) window.location.href = j.data.url;
    } finally {
      setLoading(false);
    }
  };
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
              Limited Q3 slots remaining. Reserve a 30 minute call with a $99 refundable deposit we take you seriously, you take us seriously.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={startPayment} disabled={loading} className="btn-primary px-8 py-4 rounded-xl text-base inline-flex items-center gap-2 disabled:opacity-50">
                {loading ? 'Loading...' : 'Reserve call — $99'} <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#contact" className="btn-ghost px-8 py-4 rounded-xl text-base inline-flex items-center gap-2">
                Free contact form
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;