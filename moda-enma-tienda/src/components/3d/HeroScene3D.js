'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Center } from '@react-three/drei';

// OPCIÓN A: Maniquí / Silueta de Vestido de Alta Costura 3D
function FashionSilhouetteModel({ mouse }) {
  const meshRef = useRef(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.position.x = (mouse.x * 0.3 - meshRef.current.position.x) * 0.05;
      meshRef.current.position.y = (mouse.y * 0.3 - meshRef.current.position.y) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={[0, -0.2, 0]}>
      {/* Bust / Neck */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.45, 32]} />
        <meshStandardMaterial color="#c86d51" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Upper Torso */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.35, 0.26, 0.75, 32]} />
        <meshStandardMaterial color="#b8860b" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Flared Dress Skirt Silhouette */}
      <mesh position={[0, -0.6, 0]}>
        <coneGeometry args={[0.78, 1.4, 32, 1, true]} />
        <meshStandardMaterial color="#c86d51" metalness={0.7} roughness={0.25} side={2} />
      </mesh>

      {/* Stand Base Ring */}
      <mesh position={[0, -1.35, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
        <meshStandardMaterial color="#1c1917" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// OPCIÓN B: Monograma 3D "ME" (ModaEnma) Esculpido en Metal Cálido
function MonogramMEModel({ mouse }) {
  const groupRef = useRef(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.position.x = (mouse.x * 0.3 - groupRef.current.position.x) * 0.05;
      groupRef.current.position.y = (mouse.y * 0.3 - groupRef.current.position.y) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* M Letter Sculpted Block */}
      <mesh position={[-0.45, 0, 0]}>
        <boxGeometry args={[0.25, 1.2, 0.25]} />
        <meshStandardMaterial color="#c86d51" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[-0.2, 0.35, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.22, 0.7, 0.25]} />
        <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0.05, 0.35, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.22, 0.7, 0.25]} />
        <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0.3, 0, 0]}>
        <boxGeometry args={[0.25, 1.2, 0.25]} />
        <meshStandardMaterial color="#c86d51" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Gold Back Accent Accent Plate */}
      <mesh position={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.9, 0.9, 0.05, 32]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

// OPCIÓN C: Cinta de Seda Orgánica 3D (Textile Silk Ribbon)
function SilkRibbonModel({ mouse }) {
  const meshRef = useRef(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
      meshRef.current.position.x = (mouse.x * 0.3 - meshRef.current.position.x) * 0.05;
      meshRef.current.position.y = (mouse.y * 0.3 - meshRef.current.position.y) * 0.05;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <torusKnotGeometry args={[0.7, 0.22, 128, 32, 2, 3]} />
        <meshStandardMaterial
          color="#c86d51"
          metalness={0.65}
          roughness={0.25}
          envMapIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

// Escena Principal 3D con Aro Marco y Encuadre Seguro
function MainScene({ activeOption, mouse }) {
  const ringRef = useRef(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.15;
      ringRef.current.rotation.x += delta * 0.08;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.6}>
        
        {/* Render selected inner brand model */}
        {activeOption === 'A' && <FashionSilhouetteModel mouse={mouse} />}
        {activeOption === 'B' && <MonogramMEModel mouse={mouse} />}
        {activeOption === 'C' && <SilkRibbonModel mouse={mouse} />}

        {/* Outer Titanium/Gold Frame Ring with generous bounds */}
        <mesh ref={ringRef} scale={1.8}>
          <torusGeometry args={[1, 0.022, 16, 100]} />
          <meshStandardMaterial
            color="#b8860b"
            metalness={0.95}
            roughness={0.12}
          />
        </mesh>

      </Float>

      <Sparkles count={25} scale={5} size={2} speed={0.3} color="#c86d51" />
    </group>
  );
}

export default function HeroScene3D() {
  const [mounted, setMounted] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [activeOption, setActiveOption] = useState('A'); // 'A' | 'B' | 'C'

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-warm-sand/30 animate-pulse rounded-lg" />;
  }

  const options = [
    { id: 'A', label: 'Silueta Maniquí 3D' },
    { id: 'B', label: 'Monograma ME 3D' },
    { id: 'C', label: 'Cinta de Seda 3D' },
  ];

  return (
    <div className="w-full h-full min-h-[380px] sm:min-h-[460px] relative pointer-events-auto flex flex-col justify-between">
      
      {/* 3D Canvas with generous Camera Distance (8.5) and FOV (38) to PREVENT CUTTING OFF */}
      <div className="w-full h-full absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 8.5], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 8]} intensity={2.2} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={1.0} color="#f4f0e8" />
          <spotLight position={[0, 8, 8]} angle={0.4} penumbra={1} intensity={1.8} color="#c86d51" />
          
          <MainScene activeOption={activeOption} mouse={mouse} />
        </Canvas>
      </div>

      {/* Interactive Model Switcher Overlay Bar */}
      <div className="absolute bottom-3 left-0 right-0 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        <span className="text-[10px] font-bold tracking-editorial uppercase px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-warm-dark border border-warm-border shadow-xs">
          ✦ Elige Modelo 3D del Hero:
        </span>
        <div className="flex gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-full border border-warm-border shadow-sm">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveOption(opt.id)}
              className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all ${
                activeOption === opt.id
                  ? 'bg-brand-terracotta text-white shadow-xs'
                  : 'text-warm-muted hover:text-warm-dark hover:bg-warm-sand'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
