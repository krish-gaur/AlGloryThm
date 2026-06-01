function LogoMarquee() {
  const logos = ['AiGlo', 'AiGlo', 'AiGlo', 'AiGlo', 'AiGlo', 'AiGlo', 'AiGlo', 'AiGlo', 'AiGlo', 'AiGlo'];
  return (
    <section className="py-16 border-y border-white/5 relative overflow-hidden">
      <div className="text-center text-xs text-white/40 uppercase tracking-[0.2em] mb-8">Trusted by People of India</div>
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

export default LogoMarquee;