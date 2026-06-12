"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  Bot,
  BrainCircuit,
  Code2,
  Layers,
  Workflow,
  Cpu,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   3D TILT + GLOW CARD
───────────────────────────────────────────────────────────── */
function ServiceCard({ service, index }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 120, damping: 18 });
  const springY = useSpring(rawY, { stiffness: 120, damping: 18 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = useCallback(
    (e) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      rawX.set(nx);
      rawY.set(ny);
      setGlowPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    },
    [rawX, rawY],
  );

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    setHovered(false);
    setGlowPos({ x: 50, y: 50 });
  }, [rawX, rawY]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.09,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ perspective: 900 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          /* floating bob animation via CSS */
          animation: `cardFloat ${3.5 + index * 0.4}s ease-in-out ${index * 0.25}s infinite alternate`,
          position: "relative",
          borderRadius: 20,
          padding: "2px",
          background: hovered
            ? `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(0,200,255,0.55) 0%, rgba(0,80,220,0.25) 45%, rgba(0,20,80,0.1) 100%)`
            : "linear-gradient(135deg, rgba(0,150,255,0.18) 0%, rgba(0,40,120,0.1) 100%)",
          boxShadow: hovered
            ? `0 0 0 1px rgba(0,200,255,0.5), 0 8px 40px rgba(0,160,255,0.35), 0 32px 80px rgba(0,60,200,0.2), 0 0 120px rgba(0,180,255,0.08)`
            : `0 0 0 1px rgba(0,120,220,0.18), 0 4px 24px rgba(0,80,180,0.14), 0 16px 48px rgba(0,30,100,0.12)`,
          transition: "box-shadow 0.35s ease, background 0.25s ease",
          cursor: "pointer",
        }}
      >
        {/* Inner card */}
        <div
          style={{
            borderRadius: 18,
            padding: "36px 32px 32px",
            background:
              "linear-gradient(145deg, rgba(2,14,42,0.96) 0%, rgba(1,10,30,0.98) 100%)",
            backdropFilter: "blur(20px)",
            position: "relative",
            overflow: "hidden",
            height: "100%",
          }}
        >
          {/* Mouse-follow radial glow inside card */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              pointerEvents: "none",
              background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(0,180,255,0.1) 0%, transparent 65%)`,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />

          {/* Top-right corner glow blob */}
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 140,
              height: 140,
              borderRadius: "50%",
              pointerEvents: "none",
              background: `radial-gradient(circle, ${service.glowColor}33 0%, transparent 70%)`,
              filter: "blur(24px)",
              opacity: hovered ? 1 : 0.35,
              transform: hovered ? "scale(1.5)" : "scale(1)",
              transition: "opacity 0.5s ease, transform 0.6s ease",
            }}
          />

          {/* Scan line on hover */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${service.glowColor}88, transparent)`,
              top: hovered ? "100%" : "-2px",
              transition: hovered ? "top 0.9s linear" : "none",
              pointerEvents: "none",
              opacity: hovered ? 1 : 0,
            }}
          />

          {/* Icon */}
          <motion.div
            animate={hovered ? { y: -4, scale: 1.08 } : { y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: service.iconBg,
              boxShadow: hovered
                ? `0 0 0 1px ${service.glowColor}55, 0 0 24px ${service.glowColor}66, 0 0 48px ${service.glowColor}33`
                : `0 0 0 1px ${service.glowColor}22, 0 4px 16px ${service.glowColor}22`,
              transition: "box-shadow 0.3s ease",
              position: "relative",
            }}
          >
            <service.icon style={{ width: 26, height: 26, color: "#03050B" }} />

            {/* Icon inner glow ring */}
            <div
              style={{
                position: "absolute",
                inset: -1,
                borderRadius: 15,
                border: `1px solid ${service.glowColor}`,
                opacity: hovered ? 0.6 : 0,
                transition: "opacity 0.3s ease",
              }}
            />
          </motion.div>

          {/* Number tag */}
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 28,
              fontSize: 11,
              fontFamily: "monospace",
              color: `${service.glowColor}55`,
              letterSpacing: "0.1em",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>

          <h3
            style={{
              fontSize: 21,
              fontWeight: 700,
              marginBottom: 12,
              color: "#fff",
              letterSpacing: "-0.02em",
              textShadow: hovered ? `0 0 20px ${service.glowColor}44` : "none",
              transition: "text-shadow 0.3s ease",
            }}
          >
            {service.title}
          </h3>

          <p
            style={{
              color: "rgba(255,255,255,0.52)",
              marginBottom: 28,
              lineHeight: 1.75,
              fontSize: 14.5,
            }}
          >
            {service.desc}
          </p>

          <a
            href="#contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: service.glowColor,
              textDecoration: "none",
              letterSpacing: "0.02em",
              opacity: hovered ? 1 : 0.65,
              transition: "opacity 0.2s ease",
            }}
          >
            Learn more
            <motion.span
              animate={hovered ? { x: 3, y: -3 } : { x: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ArrowUpRight style={{ width: 15, height: 15 }} />
            </motion.span>
          </a>

          {/* Bottom edge glow line */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "20%",
              right: "20%",
              height: 1,
              background: `linear-gradient(90deg, transparent, ${service.glowColor}66, transparent)`,
              opacity: hovered ? 0.8 : 0,
              transition: "opacity 0.4s ease",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BACKGROUND ORBS  – subtle ambient blobs
───────────────────────────────────────────────────────────── */
function AmbientOrbs() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {[
        { top: "10%", left: "5%", size: 500, color: "#0044ff", opacity: 0.06 },
        { top: "55%", right: "3%", size: 420, color: "#00aaff", opacity: 0.05 },
        { top: "30%", left: "40%", size: 600, color: "#0066ff", opacity: 0.04 },
      ].map((o, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: o.top,
            left: o.left,
            right: o.right,
            width: o.size,
            height: o.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${o.color} 0%, transparent 65%)`,
            opacity: o.opacity,
            filter: "blur(80px)",
            animation: `orbDrift ${8 + i * 2}s ease-in-out ${i * 1.5}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SERVICES  – main export
───────────────────────────────────────────────────────────── */
const services = [
  {
    icon: Bot,
    title: "AI Automation",
    desc: "End-to-end workflow automation powered by LLMs and intelligent decision engines.",
    iconBg: "linear-gradient(135deg, #00D4FF 0%, #0066FF 100%)",
    glowColor: "#00D4FF",
  },
  {
    icon: BrainCircuit,
    title: "AI Agents Development",
    desc: "Custom agentic systems that plan, reason and execute across your tools.",
    iconBg: "linear-gradient(135deg, #00BFFF 0%, #0099FF 100%)",
    glowColor: "#00BFFF",
  },
  {
    icon: Code2,
    title: "SaaS Development",
    desc: "AI-first SaaS products built for scale, performance and conversion.",
    iconBg: "linear-gradient(135deg, #00D4FF 0%, #00BFFF 100%)",
    glowColor: "#00E5FF",
  },
  {
    icon: Layers,
    title: "Business Consulting",
    desc: "Roadmaps, audits and strategy from teams who have shipped at scale.",
    iconBg: "linear-gradient(135deg, #0099FF 0%, #0066FF 100%)",
    glowColor: "#0099FF",
  },
  {
    icon: Workflow,
    title: "Workflow Integration",
    desc: "Seamlessly connect AI to Salesforce, HubSpot, Slack, Notion and 200+ tools.",
    iconBg: "linear-gradient(135deg, #00B5FF 0%, #0080FF 100%)",
    glowColor: "#00B5FF",
  },
  {
    icon: Cpu,
    title: "AI Infrastructure",
    desc: "Production-grade RAG, vector DBs, observability and cost-optimised inference.",
    iconBg: "linear-gradient(135deg, #00D4FF 0%, #0044FF 100%)",
    glowColor: "#00AAFF",
  },
];

function Services() {
  return (
    <section
      id="services"
      style={{
        padding: "128px 0",
        position: "relative",
        background: "#010812",
      }}
    >
      <AmbientOrbs />

      {/* Fine grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.15,
          backgroundImage:
            "linear-gradient(rgba(0,140,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(0,140,255,0.25) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 18px",
              marginBottom: 24,
              borderRadius: 999,
              background: "rgba(0,160,255,0.07)",
              border: "1px solid rgba(0,160,255,0.22)",
              backdropFilter: "blur(14px)",
              fontSize: 11.5,
              color: "#00D4FF",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <Sparkles style={{ width: 12, height: 12 }} /> Services
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: "clamp(36px, 5vw, 62px)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              marginBottom: 18,
              color: "#fff",
            }}
          >
            What we{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #00eeff 0%, #0088ff 50%, #7c44ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 10px rgba(0,180,255,0.2))",
              }}
            >
              build
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
            style={{
              color: "rgba(255,255,255,0.5)",
              maxWidth: 520,
              margin: "0 auto",
              fontSize: 16.5,
              lineHeight: 1.75,
            }}
          >
            Six pillars of capability. One outcome: AI that compounds revenue.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 24,
          }}
        >
          {services.map((s, i) => (
            <ServiceCard key={s.title} service={s} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cardFloat {
          0%   { transform: translateY(0px);   }
          100% { transform: translateY(-10px); }
        }
        @keyframes orbDrift {
          0%   { transform: translate(0px, 0px)   scale(1);    }
          100% { transform: translate(30px, 20px) scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

export default Services;
