'use client';

import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  Suspense,
} from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Stars,
  Float,
  useTexture,
  Billboard,
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/* ================= CONFIG ================= */

const CONFIG = {
  particleCount: 20000,
  heartColor: '#ff0055',

  bloomStrength: 2,
  bloomRadius: 0.5,

  textLines: [
    '14/2 Vui Vẻ nha bạn',
    'Mãi Yêu <3',
    "Happy Valentine’s",
    'Love You Forever',
  ],



  imageUrls: [
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500&q=80',
    'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=500&q=80',
    'https://images.unsplash.com/photo-1513279922550-250c2129b13a?w=500&q=80',
  ],
};

/* ================= PARTICLE TEXTURE ================= */

const useParticleTexture = () =>
  useMemo(() => {
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,80,80,0.8)');
    g.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);

    return new THREE.CanvasTexture(canvas);
  }, []);

/* ================= TEXT TEXTURE (KHÔNG KHÍT) ================= */

const createTextTexture = (text: string) => {
  if (typeof document === 'undefined') return new THREE.Texture();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = 2048;
  canvas.height = 256;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 72px Arial';
  ctx.fillStyle = 'white';
  ctx.textBaseline = 'middle';

  const letterSpacing = 10;

  let x = 100;
  for (let r = 0; r < 3; r++) {
    for (const ch of text + '   ') {
      ctx.fillText(ch, x, canvas.height / 2);
      x += ctx.measureText(ch).width + letterSpacing;
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
};

/* ================= FLOATING IMAGE ================= */

const FloatingImage = ({
  url,
  position,
}: {
  url: string;
  position: [number, number, number];
}) => {
  const texture = useTexture(url);

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={2}>
      <Billboard position={position}>
        <mesh>
          <planeGeometry args={[4, 4]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>
      </Billboard>
    </Float>
  );
};
/* ================= MEMORIES CLOUD ================= */

const MemoriesCloud = () => {
  const images = useMemo(() => {
    return CONFIG.imageUrls.map((url, i) => {
      const angle = (i / CONFIG.imageUrls.length) * Math.PI * 2;
      const r = 22;
      return {
        url,
        position: [
          Math.cos(angle) * r,
          (Math.random() - 0.5) * 8,
          Math.sin(angle) * r,
        ] as [number, number, number],
      };
    });
  }, []);

  return (
    <group position={[0, 5, 0]}>
      {images.map((img, i) => (
        <FloatingImage key={i} {...img} />
      ))}
    </group>
  );
};

/* ================= HEART PARTICLES ================= */

const HeartParticles = () => {
  const ref = useRef<THREE.Points>(null);
  const texture = useParticleTexture();

  const { positions, colors } = useMemo(() => {
    const p: number[] = [];
    const c: number[] = [];
    const col = new THREE.Color(CONFIG.heartColor);

    let i = 0;
    while (i < CONFIG.particleCount) {
      const x = (Math.random() * 2 - 1) * 1.3;
      const y = (Math.random() * 2 - 1) * 1.3;
      const z = (Math.random() * 2 - 1) * 1.3;

      const a = x * x + (9 / 4) * y * y + z * z - 1;
      if (a * a * a - x * x * z * z * z - (9 / 80) * y * y * z * z * z < 0) {
        p.push(x * 10, z * 10 + 5, y * 10);
        c.push(col.r, col.g, col.b);
        i++;
      }
    }

    return {
      positions: new Float32Array(p),
      colors: new Float32Array(c),
    };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const beat = 1 + Math.pow(Math.sin(t * 3), 4) * 0.08;
    ref.current.scale.set(beat, beat, beat);
    ref.current.rotation.y -= 0.003;
  });

  if (!texture) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.4}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

/* ================= TEXT RING ================= */

const FloatingTextRing = ({
  text,
  index,
}: {
  text: string;
  index: number;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createTextTexture(text), [text]);

  useFrame(() => {
    if (ref.current)
      ref.current.rotation.y += 0.004 * (index % 2 ? -1 : 1);
  });

  return (
    <mesh ref={ref} position={[0, -8 - index * 1.5, 0]}>
      <cylinderGeometry
        args={[14 + index * 3, 14 + index * 3, 4, 64, 1, true]}
      />
      <meshBasicMaterial
        map={texture}
        transparent
side={THREE.DoubleSide}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

/* ================= MUSIC ================= */

const BackgroundMusic = ({ onPlay }: { onPlay: () => void }) => {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const play = () => {
      ref.current?.play().catch(() => {});
      onPlay();
    };
    window.addEventListener('click', play);
    window.addEventListener('touchstart', play);
    return () => {
      window.removeEventListener('click', play);
      window.removeEventListener('touchstart', play);
    };
  }, [onPlay]);

  return (
    <audio ref={ref} loop>
      <source src={CONFIG.musicUrl} type="audio/mp3" />
    </audio>
  );
};

/* ================= MAIN ================= */

export default function ValentineHeart() {
  const [showHint, setShowHint] = useState(true);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 10000); // 10 giây

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {showHint && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            zIndex: 10,
            fontSize: 18,
            opacity: 0.85,
            pointerEvents: 'none',
            textShadow: '0 0 10px #ff0055',
          }}
        >
          Chạm vào màn hình để mở quà ❤️
        </div>
      )}

      <BackgroundMusic onPlay={() => setShowHint(false)} />

      <Canvas camera={{ position: [0, 5, 45], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#000']} />

        <OrbitControls enableDamping autoRotate autoRotateSpeed={0.8} />
        <HeartParticles />

        <Stars
          radius={100}
          depth={50}
          count={7000}
          factor={4}
          saturation={0}
          fade
        />

        <Suspense fallback={null}>
          <MemoriesCloud />
        </Suspense>

        {CONFIG.textLines.map((t, i) => (
          <FloatingTextRing key={i} text={t} index={i} />
        ))}

        <EffectComposer>
          <Bloom
            luminanceThreshold={0}
            luminanceSmoothing={0.9}
            intensity={CONFIG.bloomStrength}
            radius={CONFIG.bloomRadius}
          />
        </EffectComposer>
      </Canvas>
      {/* CONTACT BUTTON - HIỆN SAU 10 GIÂY */}
<div
  className={`fixed bottom-6 right-6 transition-all duration-1000 z-50
  ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
>
  <a
    href="https://lekimlambio.vercel.app"
    target="_blank"
    rel="noopener noreferrer"
    className="px-6 py-3 rounded-full 
      bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500
      text-white font-semibold tracking-wide
      shadow-lg shadow-pink-500/50
      hover:scale-110 hover:shadow-pink-400/90
      transition duration-300 animate-pulse"
  >
    💌 Liên Hệ
  </a>
</div>

    </div>
  );
}
