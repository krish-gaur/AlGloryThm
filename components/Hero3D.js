'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Animated neural network sphere with particles + lines
function NeuralSphere() {
  const groupRef = useRef();
  const pointsRef = useRef();
  const linesRef = useRef();

  const { positions, lineGeometry } = useMemo(() => {
    const COUNT = 120;
    const RADIUS = 2.4;
    const pos = new Float32Array(COUNT * 3);
    const points = [];
    for (let i = 0; i < COUNT; i++) {
      // Fibonacci sphere distribution
      const phi = Math.acos(1 - 2 * (i + 0.5) / COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const x = Math.sin(phi) * Math.cos(theta) * RADIUS;
      const y = Math.sin(phi) * Math.sin(theta) * RADIUS;
      const z = Math.cos(phi) * RADIUS;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      points.push(new THREE.Vector3(x, y, z));
    }

    // Build line connections between nearby points
    const lineVerts = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = points[i].distanceTo(points[j]);
        if (d < 1.0) {
          lineVerts.push(points[i].x, points[i].y, points[i].z);
          lineVerts.push(points[j].x, points[j].y, points[j].z);
        }
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVerts, 3));
    return { positions: pos, lineGeometry };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.15;
    }
    if (pointsRef.current) {
      pointsRef.current.material.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial color={0x0066FF} transparent opacity={0.08} />
      </mesh>
      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[2.4, 16, 16]} />
        <meshBasicMaterial color={0x00D4FF} wireframe transparent opacity={0.12} />
      </mesh>
      {/* Points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
        </bufferGeometry>
        <pointsMaterial color={0x00D4FF} size={0.06} sizeAttenuation transparent opacity={0.9} />
      </points>
      {/* Connecting lines */}
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color={0x00D4FF} transparent opacity={0.18} />
      </lineSegments>
    </group>
  );
}

function FloatingParticles() {
  const ref = useRef();
  const positions = useMemo(() => {
    const COUNT = 200;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 4 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.z = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
      </bufferGeometry>
      <pointsMaterial color={0x00D4FF} size={0.03} sizeAttenuation transparent opacity={0.5} />
    </points>
  );
}

export default function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 60 }} dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color={0x00D4FF} />
      <pointLight position={[-5, -5, -5]} intensity={1} color={0x0066FF} />
      <NeuralSphere />
      <FloatingParticles />
    </Canvas>
  );
}
