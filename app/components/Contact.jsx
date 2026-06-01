"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, Globe, CheckCircle2, ArrowRight } from 'lucide-react';


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
                { icon: Mail, label: 'Email', value: 'aiglo2706@gmail.com' },
                { icon: Phone, label: 'Phone', value: '+91 9205499346' },
                { icon: MapPin, label: 'HQ', value: 'New Delhi \u2022 Delhi NCR \u2022 Remote' },
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

export default Contact;