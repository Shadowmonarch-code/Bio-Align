'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Zap, BarChart3, Users, ShieldCheck } from 'lucide-react';

// ============ DNA Helix Background Component ============
function DNAHelix() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.07] dark:opacity-[0.05]">
      <div className="dna-helix-container">
        {/* First helix strand */}
        <div className="dna-strand dna-strand-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`strand1-${i}`} className="dna-node" style={{ '--i': i } as React.CSSProperties}>
              <span className="dna-base">A</span>
              <div className="dna-connector" />
              <span className="dna-base">T</span>
            </div>
          ))}
        </div>
        
        {/* Second helix strand (offset) */}
        <div className="dna-strand dna-strand-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`strand2-${i}`} className="dna-node" style={{ '--i': i } as React.CSSProperties}>
              <span className="dna-base">C</span>
              <div className="dna-connector" />
              <span className="dna-base">G</span>
            </div>
          ))}
        </div>

        {/* Third helix (background layer) */}
        <div className="dna-strand dna-strand-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={`strand3-${i}`} className="dna-node" style={{ '--i': i } as React.CSSProperties}>
              <span className="dna-base">G</span>
              <div className="dna-connector" />
              <span className="dna-base">C</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .dna-helix-container {
          position: absolute;
          width: 100%;
          height: 100%;
          perspective: 1000px;
        }

        .dna-strand {
          position: absolute;
          top: -10%;
          left: 50%;
          transform-style: preserve-3d;
          animation: rotateHelix 20s linear infinite;
        }

        .dna-strand-1 {
          --helix-radius: 280px;
          animation-duration: 25s;
        }

        .dna-strand-2 {
          --helix-radius: 320px;
          animation-duration: 30s;
          animation-delay: -5s;
          animation-direction: reverse;
        }

        .dna-strand-3 {
          --helix-radius: 350px;
          animation-duration: 35s;
          animation-delay: -10s;
        }

        .dna-node {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 8px;
          transform-style: preserve-3d;
          animation: waveMotion 4s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.2s);
        }

        .dna-base {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 700;
          color: #C1121F;
          background: rgba(193, 18, 31, 0.1);
          padding: 6px 12px;
          border-radius: 50%;
          border: 1.5px solid rgba(193, 18, 31, 0.3);
          min-width: 36px;
          text-align: center;
          backdrop-filter: blur(4px);
        }

        .dark .dna-base {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.25);
        }

        .dna-connector {
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #C1121F, transparent, #C1121F);
          transform: scaleX(0.8);
        }

        @keyframes rotateHelix {
          0% {
            transform: translateX(-50%) rotateX(75deg) rotateZ(0deg);
          }
          100% {
            transform: translateX(-50%) rotateX(75deg) rotateZ(360deg);
          }
        }

        @keyframes waveMotion {
          0%, 100% {
            transform: translateY(calc(var(--i) * 50px)) rotateY(0deg) translateX(var(--helix-radius));
          }
          50% {
            transform: translateY(calc(var(--i) * 50px + 20px)) rotateY(180deg) translateX(calc(var(--helix-radius) * -1));
          }
        }

        @media (max-width: 768px) {
          .dna-strand-1 { --helix-radius: 180px; }
          .dna-strand-2 { --helix-radius: 210px; }
          .dna-strand-3 { --helix-radius: 240px; }
          
          .dna-base {
            font-size: 11px;
            padding: 4px 8px;
            min-width: 28px;
          }
          
          .dna-connector {
            width: 24px;
          }
        }
      `}</style>
    </div>
  );
}

// ============ Floating Particles Component ============
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'circle' | 'molecule' | 'atom';
}

function FloatingParticles({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 12 + 4,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      type: (['circle', 'molecule', 'atom'] as const)[Math.floor(Math.random() * 3)],
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            x: [(mouseX - 0.5) * particle.size * 2, (mouseX - 0.5) * particle.size],
            y: [
              (mouseY - 0.5) * particle.size * 2 + 0,
              (mouseY - 0.5) * particle.size - 30,
              (mouseY - 0.5) * particle.size + 0
            ],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {particle.type === 'circle' && (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 dark:from-red-400/15 dark:to-red-500/5 blur-[1px]" />
          )}
          {particle.type === 'molecule' && (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-full bg-red-400/20 dark:bg-red-400/10" />
              <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-1/2 h-1/2 rounded-full bg-red-300/20 dark:bg-red-300/10" />
              <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-1/2 h-1/2 rounded-full bg-red-300/20 dark:bg-red-300/10" />
            </div>
          )}
          {particle.type === 'atom' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-red-400/30 dark:border-red-400/15" />
              <div className="w-1/3 h-1/3 rounded-full bg-red-500/40 dark:bg-red-400/20" />
            </div>
          )}
        </motion.div>
      ))}

      {/* Gradient orbs for depth */}
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-red-200/20 dark:bg-red-900/10 blur-[100px]"
        animate={{
          x: (mouseX - 0.5) * 50,
          y: (mouseY - 0.5) * 50,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 30 }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-orange-200/15 dark:bg-orange-900/10 blur-[100px]"
        animate={{
          x: (mouseX - 0.5) * -40,
          y: (mouseY - 0.5) * -40,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 30 }}
      />
    </div>
  );
}

// ============ Stats Data ============
const stats = [
  { icon: Zap, value: '50+', label: 'Tools', description: 'Integrated bioinformatics tools' },
  { icon: BarChart3, value: '10M+', label: 'Analyses', description: 'Completed analyses worldwide' },
  { icon: Users, value: '100K+', label: 'Researchers', description: 'Active scientists & researchers' },
  { icon: ShieldCheck, value: '99.9%', label: 'Uptime', description: 'Platform reliability guaranteed' },
];

// ============ Animation Variants ============
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const statCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// ============ Main Hero Section Component ============
export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  
  // Mouse tracking with spring physics
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const springConfig = { damping: 30, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Transform mouse values to display
  const displayMouseX = useTransform(smoothMouseX, [0, 1], [-1, 1]);
  const displayMouseY = useTransform(smoothMouseY, [0, 1], [-1, 1]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(Math.max(0, Math.min(1, x)));
      mouseY.set(Math.max(0, Math.min(1, y)));
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FAFAFA] dark:bg-black"
    >
      {/* Background Effects */}
      <DNAHelix />
      
      {/* Mouse-following particles */}
      <FloatingParticles 
        mouseX={typeof displayMouseX.get === 'function' ? displayMouseX.get() : 0} 
        mouseY={typeof displayMouseY.get === 'function' ? displayMouseY.get() : 0} 
      />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(193,18,31,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(193,18,31,0.02)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.03)_1px,transparent_1px)]" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-red-50 dark:bg-red-950/30 text-[#C1121F] dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C1121F] dark:bg-red-500" />
              </span>
              Next-Gen Bioinformatics Platform
            </span>
          </motion.div>

          {/* Main Headline with Gradient */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 md:mb-8"
          >
            <span className="block text-gray-900 dark:text-white">One Platform.</span>
            <span className="block mt-2 md:mt-4 bg-gradient-to-r from-[#C1121F] via-red-600 to-orange-600 dark:from-red-500 dark:via-red-400 dark:to-orange-400 bg-clip-text text-transparent">
              Every Bioinformatics Tool.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 md:mb-12 leading-relaxed"
          >
            Analyze sequences, proteins, genomes, and more —{' '}
            <span className="text-gray-900 dark:text-white font-medium">without switching between dozens of tools.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#C1121F] hover:bg-[#9B0F1A] rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden">
              <span className="relative z-10">Start Analyzing</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-white/5 border-2 border-gray-200 dark:border-gray-800 hover:border-[#C1121F] dark:hover:border-red-500 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm">
              Explore Tools
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#C1121F] dark:text-red-500" />
            </button>
          </motion.div>
        </motion.div>

        {/* Stats Bar - Glassmorphism Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 md:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={statCardVariants}
              custom={index}
              whileHover={{ 
                y: -4, 
                scale: 1.02,
                transition: { duration: 0.2 } 
              }}
              className="group relative p-4 md:p-6 rounded-2xl bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl border border-gray-200/50 dark:border-white/[0.06] shadow-sm hover:shadow-md hover:shadow-red-500/5 dark:hover:shadow-red-500/5 transition-all duration-300 cursor-default"
            >
              {/* Subtle gradient glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/0 to-orange-500/0 group-hover:from-red-500/[0.03] group-hover:to-orange-500/[0.03] transition-all duration-300" />
              
              <div className="relative flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-50 dark:bg-red-950/30 mb-3 md:mb-4 group-hover:bg-red-100 dark:group-hover:bg-red-950/50 transition-colors">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-[#C1121F] dark:text-red-500" />
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                  {stat.label}
                </div>
                <p className="hidden md:block text-xs text-gray-500 dark:text-gray-500 mt-2 max-w-[140px]">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12 md:mt-16 text-center"
        >
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-600">
            Trusted by leading institutions including{' '}
            <span className="font-medium text-gray-700 dark:text-gray-400">Stanford</span>,{' '}
            <span className="font-medium text-gray-700 dark:text-gray-400">MIT</span>,{' '}
            <span className="font-medium text-gray-700 dark:text-gray-400">NIH</span>, and{' '}
            <span className="font-medium text-gray-700 dark:text-gray-400">100+ more</span>
          </p>
        </motion.div>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAFAFA] dark:from-black to-transparent" />

      {/* Global styles for DNA animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        .particle {
          will-change: transform, opacity;
        }
      `}</style>
    </section>
  );
}
