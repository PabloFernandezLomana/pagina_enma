'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function MetallicBottleModel({ color = '#d1d5db', autoRotate = true }) {
  const groupRef = useRef(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.2, 0]}>
      {/* Bottle Body */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.55, 2.2, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.92}
          roughness={0.18}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Shoulder Transition */}
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.3, 0.55, 0.35, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 2.7, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.3, 32]} />
        <meshStandardMaterial
          color="#1c1917"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      {/* Cap Stainless Ring */}
      <mesh position={[0, 2.95, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.22, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={1.0}
          roughness={0.1}
        />
      </mesh>

      {/* ModaEnma Engraved Logo Band */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.555, 0.555, 0.4, 32]} />
        <meshStandardMaterial
          color="#1c1917"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

export default function ProductViewer3D({ productName = "Botella Térmica Metalizada Pro 750ml" }) {
  const [mounted, setMounted] = useState(false);
  const [bottleColor, setBottleColor] = useState('#d1d5db');
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-80 bg-warm-sand/50 animate-pulse rounded-lg" />;
  }

  const colors = [
    { label: 'Plata Titanio', hex: '#d1d5db' },
    { label: 'Negro Obsidiana', hex: '#27272a' },
    { label: 'Oro Rosa', hex: '#e0a996' }
  ];

  return (
    <div className="relative w-full h-[400px] bg-white rounded-xl border border-warm-border overflow-hidden flex flex-col shadow-sm">
      {/* 3D Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <span className="text-[10px] font-bold tracking-editorial uppercase px-3 py-1 bg-warm-sand/90 backdrop-blur-md rounded-full text-warm-dark border border-warm-border shadow-xs">
          Visor 3D Interactivo 360°
        </span>
        <div className="flex gap-2 pointer-events-auto">
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => setBottleColor(c.hex)}
              className={`w-6 h-6 rounded-full border-2 transition-transform shadow-xs ${
                bottleColor === c.hex ? 'scale-110 border-brand-terracotta' : 'border-white opacity-80'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 10, 5]} intensity={2.5} color="#ffffff" />
        <directionalLight position={[-5, -5, -5]} intensity={1.2} color="#f4f0e8" />
        
        <MetallicBottleModel color={bottleColor} autoRotate={autoRotate} />

        <OrbitControls
          enableZoom={true}
          maxDistance={6}
          minDistance={3}
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>

      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
        <span className="text-[11px] text-warm-muted font-semibold tracking-wide">
          ✦ Arrastra para girar en 360° • Rueda para zoom
        </span>
      </div>
    </div>
  );
}
