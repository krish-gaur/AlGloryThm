"use client";

import {
  useEffect,
  useRef,
  Suspense,
  useMemo,
  useState,
  useCallback,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion, useMotionValue, useSpring } from "framer-motion";
import * as THREE from "three";
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Award,
  Users,
  TrendingUp,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   PERF CONSTANTS
───────────────────────────────────────────────────────────── */
const NODE_COUNT = 50;
const MAX_DPR = 1.2;

/* ─────────────────────────────────────────────────────────────
   TIER DETECTION  (mobile / low-end → fewer particles)
───────────────────────────────────────────────────────────── */
function useTier() {
  return useMemo(() => {
    if (typeof window === "undefined") return "high";
    const mobile = window.innerWidth < 768;
    const lowEnd = (navigator.hardwareConcurrency ?? 8) < 4;
    return mobile || lowEnd ? "low" : "high";
  }, []);
}

/* ─────────────────────────────────────────────────────────────
   PARTICLE FIELD
   – mouse uniform throttled to every 2nd frame
───────────────────────────────────────────────────────────── */
function ParticleField({ count }) {
  const ref = useRef();
  const frame = useRef(0);

  const [geometry, material] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      rnd[i] = Math.random();
      sz[i] = 0.5 + Math.random() * 1.4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        attribute float aRnd; attribute float aSize;
        uniform float uTime; uniform vec2 uMouse;
        varying float vA;
        void main(){
          vec3 p=position;
          p.y+=sin(uTime*.35+aRnd*6.28)*.15;
          p.x+=cos(uTime*.25+aRnd*6.28)*.10;
          vec2 d=p.xy-uMouse; float dist=length(d);
          if(dist<2.8){ float f=pow(1.-dist/2.8,2.); p.xy+=normalize(d)*f*1.5; }
          vA=.2+.8*abs(sin(uTime*.5+aRnd*3.14));
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=aSize*(210./-mv.z); gl_Position=projectionMatrix*mv;
        }`,
      fragmentShader: `
        varying float vA;
        void main(){
          vec2 uv=gl_PointCoord-.5; float d=length(uv);
          if(d>.5)discard;
          gl_FragColor=vec4(0.,0.78,1.,(1.-d*2.)*vA*.8);
        }`,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return [geo, mat];
  }, [count]);

  useFrame(({ clock, mouse }) => {
    frame.current++;
    material.uniforms.uTime.value = clock.getElapsedTime();
    if (frame.current % 2 === 0)
      material.uniforms.uMouse.value.set(mouse.x * 9, mouse.y * 5);
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.01;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

/* ─────────────────────────────────────────────────────────────
   NEURAL SPHERE
───────────────────────────────────────────────────────────── */
function NeuralSphere({ pulse }) {
  const groupRef = useRef();
  const pulseRef = useRef(0);
  const { mouse } = useThree();

  useEffect(() => {
    if (pulse > 0) pulseRef.current = 1.0;
  }, [pulse]);

  const nodePositions = useMemo(
    () =>
      Array.from({ length: NODE_COUNT }, (_, i) => {
        const phi = Math.acos(-1 + (2 * i) / NODE_COUNT);
        const theta = Math.sqrt(NODE_COUNT * Math.PI) * phi;
        return new THREE.Vector3(
          2.6 * Math.sin(phi) * Math.cos(theta),
          2.6 * Math.cos(phi),
          2.6 * Math.sin(phi) * Math.sin(theta),
        );
      }),
    [],
  );

  const edgeGeo = useMemo(() => {
    const v = [];
    for (let i = 0; i < nodePositions.length; i++)
      for (let j = i + 1; j < nodePositions.length; j++)
        if (nodePositions[i].distanceTo(nodePositions[j]) < 1.55)
          v.push(
            nodePositions[i].x,
            nodePositions[i].y,
            nodePositions[i].z,
            nodePositions[j].x,
            nodePositions[j].y,
            nodePositions[j].z,
          );
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(v), 3),
    );
    return g;
  }, [nodePositions]);

  const edgeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uPulse: { value: 0 } },
        vertexShader: `void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `uniform float uPulse;void main(){float g=.12+uPulse*.55;vec3 c=mix(vec3(0.,.7,1.),vec3(.5,1.,1.),uPulse);gl_FragColor=vec4(c,g);}`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const nodeGeo = useMemo(() => {
    const pos = new Float32Array(nodePositions.length * 3);
    nodePositions.forEach((v, i) => {
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [nodePositions]);

  const nodeMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: "#00eeff",
        size: 0.1,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1 + mouse.x * 0.35;
      groupRef.current.rotation.x = Math.sin(t * 0.06) * 0.18 + mouse.y * 0.18;
    }
    pulseRef.current *= 0.94;
    edgeMat.uniforms.uPulse.value = pulseRef.current;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={edgeGeo} material={edgeMat} />
      <points geometry={nodeGeo} material={nodeMat} />
      <mesh>
        <sphereGeometry args={[2.65, 22, 22]} />
        <meshBasicMaterial
          color="#0044cc"
          wireframe
          transparent
          opacity={0.04}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   FLOATING ORBS  – plain wireframe, no shader uniform updates
───────────────────────────────────────────────────────────── */
function FloatingOrbs() {
  const configs = useMemo(
    () => [
      {
        geo: new THREE.OctahedronGeometry(0.36, 0),
        offset: 0,
        speed: 0.9,
        r: 5.5,
        y: 1.2,
      },
      {
        geo: new THREE.IcosahedronGeometry(0.26, 0),
        offset: 1.4,
        speed: 0.65,
        r: 6.2,
        y: -1.5,
      },
      {
        geo: new THREE.TetrahedronGeometry(0.4, 0),
        offset: 2.8,
        speed: 1.1,
        r: 4.8,
        y: 0.4,
      },
      {
        geo: new THREE.OctahedronGeometry(0.2, 0),
        offset: 4.2,
        speed: 0.75,
        r: 7.0,
        y: 2.0,
      },
    ],
    [],
  );

  const refs = useRef([]);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#00aaff",
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    configs.forEach((c, i) => {
      const m = refs.current[i];
      if (!m) return;
      const a = t * c.speed * 0.18 + c.offset;
      m.position.set(
        Math.cos(a) * c.r,
        c.y + Math.sin(t * 0.4 + c.offset) * 0.35,
        Math.sin(a) * c.r,
      );
      m.rotation.x += 0.007;
      m.rotation.y += 0.011;
    });
  });

  return (
    <>
      {configs.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          geometry={c.geo}
          material={mat}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   ENERGY RINGS  – 2 rings
───────────────────────────────────────────────────────────── */
function EnergyRings() {
  const r1 = useRef(),
    r2 = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (r1.current) {
      r1.current.rotation.z = t * 0.28;
      r1.current.rotation.x = t * 0.11;
    }
    if (r2.current) {
      r2.current.rotation.z = -t * 0.19;
      r2.current.rotation.y = t * 0.16;
    }
  });
  return (
    <>
      <mesh ref={r1}>
        <torusGeometry args={[3.6, 0.012, 2, 100]} />
        <meshBasicMaterial color="#00cfff" transparent opacity={0.45} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[4.8, 0.008, 2, 100]} />
        <meshBasicMaterial color="#0077ff" transparent opacity={0.25} />
      </mesh>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   CAMERA RIG
───────────────────────────────────────────────────────────── */
function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.035;
    camera.position.y += (mouse.y * 0.7 - camera.position.y) * 0.035;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ─────────────────────────────────────────────────────────────
   DATA STREAMS  – SSR-safe, CSS-only (zero GPU)
   FIX: uses transform:translateY only → fully composited
───────────────────────────────────────────────────────────── */
function DataStreams() {
  const [streams, setStreams] = useState([]);
  useEffect(() => {
    setStreams(
      Array.from({ length: 10 }, (_, i) => ({
        left: `${(i / 10) * 100}%`,
        delay: Math.random() * 4,
        duration: 7 + Math.random() * 5,
        chars: Array.from({ length: 8 }, () =>
          String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96)),
        ).join(""),
      })),
    );
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 3,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      {streams.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.left,
            top: 0,
            color: "rgba(0,210,255,0.1)",
            fontSize: 11,
            fontFamily: "monospace",
            lineHeight: 1.8,
            writingMode: "vertical-rl",
            userSelect: "none",
            willChange: "transform",
            animation: `datafall ${s.duration}s linear ${s.delay}s infinite`,
          }}
        >
          {s.chars}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────────── */
export default function Hero() {
  const tier = useTier();
  const PARTICLE_COUNT = tier === "low" ? 700 : 1300;

  const [pulse, setPulse] = useState(0);
  const [clickPos, setClickPos] = useState(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 55, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 55, damping: 22 });

  const handleMouseMove = useCallback(
    (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      mouseX.set(((e.clientX - r.left - r.width / 2) / r.width) * 20);
      mouseY.set(((e.clientY - r.top - r.height / 2) / r.height) * -14);
    },
    [mouseX, mouseY],
  );

  const handleClick = useCallback((e) => {
    setPulse((p) => p + 1);
    setClickPos({ x: e.clientX, y: e.clientY });
    setTimeout(() => setClickPos(null), 700);
  }, []);

  return (
    <section
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      aria-label="Hero section"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: 96,
        cursor: "default",
        background:
          "radial-gradient(ellipse 120% 80% at 50% -10%,#020e2a 0%,#010812 60%,#000508 100%)",
      }}
    >
      {/* CLICK RIPPLE – transform only = composited */}
      {clickPos && (
        <div
          key={pulse}
          aria-hidden="true"
          style={{
            position: "fixed",
            left: clickPos.x,
            top: clickPos.y,
            transform: "translate(-50%,-50%)",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "transparent",
            border: "2px solid rgba(0,210,255,0.8)",
            zIndex: 999,
            pointerEvents: "none",
            willChange: "transform,opacity",
            animation: "rippleOut .7s ease-out forwards",
          }}
        />
      )}

      {/* CANVAS */}
      <div
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
        aria-hidden="true"
      >
        <Canvas
          camera={{ position: [0, 0, 9], fov: 55 }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, MAX_DPR]}
          frameloop="always"
          style={{ width: "100%", height: "100%" }}
        >
          <Suspense fallback={null}>
            <CameraRig />
            <ParticleField count={PARTICLE_COUNT} />
            <NeuralSphere pulse={pulse} />
            <FloatingOrbs />
            <EnergyRings />
          </Suspense>
        </Canvas>
      </div>

      {/* DATA STREAMS */}
      <DataStreams />

      {/* DEPTH VIGNETTE */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%,transparent 25%,#010812 100%)",
        }}
      />

      {/* AURORA – will-change so browser composites independently */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          top: -220,
          left: -220,
          borderRadius: "50%",
          zIndex: 3,
          pointerEvents: "none",
          background: "radial-gradient(circle,#0044ee 0%,transparent 65%)",
          opacity: 0.18,
          filter: "blur(90px)",
          willChange: "transform",
          x: springX,
          y: springY,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          top: "42%",
          right: -130,
          borderRadius: "50%",
          zIndex: 3,
          pointerEvents: "none",
          background: "radial-gradient(circle,#00aaff 0%,transparent 65%)",
          opacity: 0.12,
          filter: "blur(80px)",
        }}
      />

      {/* CSS GRID */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          pointerEvents: "none",
          opacity: 0.15,
          backgroundImage:
            "linear-gradient(rgba(0,160,255,.28) 1px,transparent 1px),linear-gradient(90deg,rgba(0,160,255,.28) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 65% 55% at 50% 50%,black 20%,transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 50% 50%,black 20%,transparent 80%)",
        }}
      />

      {/* SCANNING LINE – uses transform:translateY → composited, fixes non-composited warning */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          zIndex: 6,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg,transparent 0%,rgba(0,180,255,.55) 30%,#00d4ff 50%,rgba(0,180,255,.55) 70%,transparent 100%)",
          boxShadow: "0 0 10px 2px rgba(0,180,255,.3)",
          top: 0,
          willChange: "transform",
          animation: "scanBeamT 10s linear infinite",
        }}
      />

      {/* HUD CORNERS */}
      {[
        { s: { top: 16, left: 16 }, d: "M0 28 L0 0 L28 0" },
        { s: { top: 16, right: 16 }, d: "M0 0 L28 0 L28 28" },
        { s: { bottom: 16, left: 16 }, d: "M0 0 L0 28 L28 28" },
        { s: { bottom: 16, right: 16 }, d: "M28 0 L28 28 L0 28" },
      ].map((b, i) => (
        <motion.svg
          key={i}
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          style={{ position: "absolute", ...b.s, zIndex: 8 }}
          animate={{ opacity: [0.22, 0.5, 0.22] }}
          transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
        >
          <path
            d={b.d}
            stroke="#00cfff"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </motion.svg>
      ))}

      {/* STATUS – aria-hidden so screen readers skip decorative text */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 24,
          right: 52,
          zIndex: 9,
          fontFamily: "monospace",
          fontSize: 9,
          color: "rgba(0,180,255,.4)",
          textAlign: "right",
          lineHeight: 1.9,
          pointerEvents: "none",
        }}
      >
        <div>SYS :: ONLINE</div>
        <div>NODE_CNT :: {NODE_COUNT}</div>
      </div>

      {/* ── CONTENT ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          maxWidth: 880,
          padding: "0 24px",
          width: "100%",
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          aria-label="Currently accepting Q3 2025 engagements"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "7px 20px",
            marginBottom: 40,
            borderRadius: 999,
            background: "rgba(0,160,255,.07)",
            border: "1px solid rgba(0,160,255,.25)",
            backdropFilter: "blur(16px)",
            fontSize: 11.5,
            color: "rgba(255,255,255,.85)" /* raised from .75 for contrast */,
            boxShadow:
              "0 0 28px rgba(0,160,255,.07),inset 0 1px 0 rgba(255,255,255,.05)",
            letterSpacing: ".06em",
            textTransform: "uppercase",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "relative",
              display: "inline-flex",
              width: 7,
              height: 7,
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "#00d4ff",
                animation: "ping 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#00d4ff",
                boxShadow: "0 0 8px #00d4ff",
                position: "relative",
              }}
            />
          </span>
          Now accepting Q3 2025 engagements
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: "clamp(42px,7.5vw,92px)",
            fontWeight: 800,
            lineHeight: 1.03,
            letterSpacing: "-.038em",
            margin: "0 0 26px",
          }}
        >
          <span
            style={{
              display: "block",
              background:
                "linear-gradient(140deg,#ffffff 0%,#eaf5ff 60%,#c8e8ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Build the future
          </span>
          <span style={{ display: "block", color: "#fff" }}>
            with{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg,#00eeff 0%,#0088ff 45%,#7c44ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 12px rgba(0,180,255,.22))",
                animation: "gradMove 4s ease-in-out infinite alternate",
                backgroundSize: "200% 100%",
                display: "inline-block",
              }}
            >
              intelligent AI
            </span>
          </span>
        </motion.h1>

        {/* Divider */}
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1.2 }}
          style={{
            width: 120,
            height: 1,
            margin: "0 auto 28px",
            background:
              "linear-gradient(90deg,transparent,#00d4ff,transparent)",
            boxShadow: "0 0 10px rgba(0,200,255,.45)",
          }}
        />

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.8 }}
          style={{
            fontSize: "clamp(15px,1.75vw,18px)",
            color: "rgba(255,255,255,.65)",
            maxWidth: 600,
            margin: "0 auto 48px",
            lineHeight: 1.8,
          }}
          /* raised from .52 → .65 to pass contrast check */
        >
          We design and ship enterprise‑grade AI automation, custom AI agents
          and intelligent SaaS platforms that turn successful roadmaps into
          measurable revenue.
        </motion.p>

        {/* CTAs – aria-label on every link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 68,
          }}
        >
          <a
            href="#contact"
            aria-label="Start your project – contact us"
            style={{
              padding: "15px 34px",
              borderRadius: 14,
              fontSize: 14.5,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              textDecoration: "none",
              background: "linear-gradient(135deg,#00d4ff 0%,#0044ff 100%)",
              color: "#fff",
              boxShadow:
                "0 0 40px rgba(0,150,255,.4),0 8px 24px rgba(0,60,255,.22),inset 0 1px 0 rgba(255,255,255,.14)",
              transition: "transform .18s,box-shadow .18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 0 60px rgba(0,180,255,.6),0 14px 32px rgba(0,60,255,.35),inset 0 1px 0 rgba(255,255,255,.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow =
                "0 0 40px rgba(0,150,255,.4),0 8px 24px rgba(0,60,255,.22),inset 0 1px 0 rgba(255,255,255,.14)";
            }}
          >
            Start your project <ArrowRight size={15} aria-hidden="true" />
          </a>
          <a
            href="#services"
            aria-label="Explore our services"
            style={{
              padding: "15px 34px",
              borderRadius: 14,
              fontSize: 14.5,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(0,180,255,.25)",
              color: "#ddf0ff" /* raised from #cce8ff for contrast */,
              backdropFilter: "blur(12px)",
              transition: "background .18s,border-color .18s,transform .18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,160,255,.1)";
              e.currentTarget.style.borderColor = "rgba(0,200,255,.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,.04)";
              e.currentTarget.style.borderColor = "rgba(0,180,255,.25)";
              e.currentTarget.style.transform = "";
            }}
          >
            <Play size={13} aria-hidden="true" /> Explore services
          </a>
        </motion.div>

        {/* Trust badges – contrast raised */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px 44px",
          }}
        >
          {[
            {
              icon: (
                <ShieldCheck size={13} color="#00cfff" aria-hidden="true" />
              ),
              label: "SOC 2 Ready",
            },
            {
              icon: <Award size={13} color="#00cfff" aria-hidden="true" />,
              label: "ISO 27001",
            },
            {
              icon: <Users size={13} color="#00cfff" aria-hidden="true" />,
              label: "80+ Enterprise Clients",
            },
            {
              icon: <TrendingUp size={13} color="#00cfff" aria-hidden="true" />,
              label: "$200M+ Revenue Influenced",
            },
          ].map((item, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 + i * 0.1 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13,
                color: "rgba(255,255,255,.55)" /* raised from .30 */,
                cursor: "default",
                letterSpacing: ".02em",
              }}
            >
              {item.icon} {item.label}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* HINT */}
      <motion.p
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        style={{
          position: "absolute",
          bottom: 88,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 10,
          color: "rgba(0,180,255,.28)",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          fontFamily: "monospace",
          zIndex: 10,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          margin: 0,
        }}
      >
        Click anywhere · Move mouse to interact
      </motion.p>

      {/* SCROLL CUE */}
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        style={{
          position: "absolute",
          bottom: 26,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          color: "rgba(255,255,255,.28)",
          fontSize: 9.5,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          zIndex: 10,
          willChange: "transform",
        }}
      >
        <span>Scroll</span>
        <div
          style={{
            width: 1,
            height: 44,
            background: "linear-gradient(to bottom,#00cfff,transparent)",
          }}
        />
      </motion.div>

      <style>{`
        /* scanBeam now uses transform instead of top → fully composited */
        @keyframes scanBeamT {
          0%   { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
        @keyframes ping {
          0%   { transform:scale(1);   opacity:.9; }
          70%  { transform:scale(2.6); opacity:0;  }
          100% { transform:scale(2.6); opacity:0;  }
        }
        @keyframes gradMove {
          0%   { background-position:0%   50%; }
          100% { background-position:100% 50%; }
        }
        @keyframes datafall {
          0%   { transform:translateY(-10vh); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:1; }
          100% { transform:translateY(110vh); opacity:0; }
        }
        @keyframes rippleOut {
          0%   { transform:translate(-50%,-50%) scale(1);  opacity:.9; }
          100% { transform:translate(-50%,-50%) scale(18); opacity:0;  }
        }
        @media (prefers-reduced-motion:reduce){
          *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
        }
      `}</style>
    </section>
  );
}
