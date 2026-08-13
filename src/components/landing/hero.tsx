'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Zap, BarChart3, Users, ShieldCheck, Sparkles, Dna, Atom, Activity } from 'lucide-react';

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
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const statCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ============ Scientific Visualization Component ============
function ScientificVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left - rect.width / 2) / 25,
      y: (e.clientY - rect.top - rect.height / 2) / 25,
    });
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[500px]"
    >
      <motion.div
        style={{ transform: `translateX(${mousePos.x}px) translateY(${mousePos.y}px)` }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Orbital rings - Theme appropriate colors */}
        <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full border border-green-brand/15 dark:border-red-brand/15 animate-pulse" />
        <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full border border-green-hover/12 dark:border-red-dark/12"
          style={{ animation: 'spin 20s linear infinite' }} 
        />
        <div className="absolute w-40 h-40 md:w-52 md:h-52 rounded-full border border-green-brand/18 dark:border-red-brand/18"
          style={{ animation: 'spin 15s linear reverse infinite' }}
        />

        {/* Core glow */}
        <div className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-green-brand/15 via-transparent to-green-soft/10 dark:from-red-brand/15 dark:via-transparent dark:to-red-soft/10 blur-xl" />

        {/* Central DNA Icon - Theme colored */}
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative z-10"
        >
          <Dna className="w-16 h-16 md:w-20 md:h-20 text-green-brand dark:text-red-brand" strokeWidth={1.5} />
        </motion.div>

        {/* Orbiting nodes - Theme alternating */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: '50%', left: '50%',
              width: '8px', height: '8px',
              borderRadius: '50%',
              backgroundColor: i % 2 === 0 ? '#16A34A' : '#22C55E',
              boxShadow: `0 0 10px ${i % 2 === 0 ? 'rgba(22,163,74,0.5)' : 'rgba(34,197,94,0.4)'}`,
            }}
            className="dark:[&]:bg-[#EF4444] dark:[&]:shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            animate={{
              rotate: i * 60,
              x: Math.cos((i * 60 * Math.PI) / 180) * 140,
              y: Math.sin((i * 60 * Math.PI) / 180) * 140,
            }}
            transition={{
              rotate: { duration: 0 },
              x: { duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut", direction: "alternate" },
              y: { duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut", direction: "alternate" },
            }}
          />
        ))}

        {/* Floating data cards - High contrast */}
        {[
          { x: '-10%', y: '20%', icon: Atom, colorLight: '#16A34A', colorDark: '#EF4444' },
          { x: '85%', y: '25%', icon: Activity, colorLight: '#15803D', colorDark: '#F87171' },
          { x: '15%', y: '75%', icon: Sparkles, colorLight: '#22C55E', colorDark: '#DC2626' },
          { x: '80%', y: '70%', icon: Dna, colorLight: '#166534', colorDark: '#FCA5A5' },
        ].map((point, i) => (
          <motion.div
            key={`point-${i}`}
            className="absolute"
            style={{ left: point.x, top: point.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9], y: [0, -8, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
          >
            <div className="p-2.5 rounded-xl backdrop-blur-md border shadow-lg bg-white/95 dark:bg-zinc-900/95 border-gray-200/60 dark:border-zinc-700/60">
              <point.icon 
                className="w-5 h-5 md:w-6 md:h-6 text-[var(--icon-color)]" 
                style={{ '--icon-color': point.colorLight } as React.CSSProperties}
                strokeWidth={1.5}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ============ Main Hero Section ============
interface HeroSectionProps {
  onStartClick?: () => void;
  onExploreClick?: () => void;
}

export default function HeroSection({ onStartClick, onExploreClick }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black"
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 scientific-grid" />
      
      {/* Very subtle center glow - theme aware */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(22,163,74,0.02)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(239,68,68,0.03)_0%,_transparent_70%)]" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          {/* Badge - HIGH CONTRAST */}
          <motion.div variants={itemVariants} className="mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-bg dark:bg-red-bg text-green-hover dark:text-red-soft border border-green-brand/25 dark:border-red-brand/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-brand dark:bg-red-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-brand dark:bg-red-brand" />
              </span>
              Next-Gen Bioinformatics Platform
            </span>
          </motion.div>

          {/* Main Headline - Maximum Readability */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 md:mb-8"
          >
            <span className="block text-slate-900 dark:text-white">One Platform.</span>
            <span className="block mt-2 md:mt-4 bg-gradient-to-r from-green-brand via-green-bright to-green-soft dark:from-red-brand dark:via-red-hover dark:to-red-soft bg-clip-text text-transparent">
              Every Bioinformatics Tool.
            </span>
          </motion.h1>

          {/* Subheadline - Clear readable text */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-10 md:mb-12 leading-relaxed"
          >
            A unified research workspace for bioinformatics, biotechnology, plant breeding,{' '}
            <span className="text-slate-900 dark:text-white font-semibold">statistical analysis</span>, and{' '}
            <span className="text-slate-900 dark:text-white font-semibold">scientific discovery.</span>
          </motion.p>

          {/* CTA Buttons - Bold & Clear */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            
            {/* Primary Button - Green in light, Red in dark */}
            <button 
              onClick={onStartClick}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-green-brand hover:bg-green-hover dark:bg-red-brand dark:hover:bg-red-dark rounded-xl shadow-lg shadow-green-brand/25 dark:shadow-red-brand/30 hover:shadow-green-brand/35 dark:hover:shadow-red-brand/45 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">Start Analyzing</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            {/* Secondary Button - Outlined with theme color */}
            <button 
              onClick={onExploreClick}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-green-brand dark:text-red-brand bg-white dark:bg-black border-2 border-green-brand/30 dark:border-red-brand/30 hover:border-green-brand dark:hover:border-red-brand hover:bg-green-bg/50 dark:hover:bg-red-bg/30 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Explore Tools
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-green-brand dark:text-red-brand" />
            </button>
          </motion.div>
        </motion.div>

        {/* Scientific Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="mt-16 md:mt-20"
        >
          <ScientificVisualization />
        </motion.div>

        {/* Stats Bar - Clean cards with clear text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="mt-16 md:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={statCardVariants}
              custom={index}
              whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
              className="group relative p-4 md:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:shadow-green-brand/8 dark:hover:shadow-red-brand/12 transition-all duration-300 cursor-default"
            >
              <div className="relative flex flex-col items-center text-center">
                {/* Icon - Theme colored background */}
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-bg dark:bg-red-bg mb-3 md:mb-4 group-hover:bg-green-pale dark:group-hover:bg-red-surface transition-colors">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-green-brand dark:text-red-brand" />
                </div>
                
                {/* Value - Bold, high contrast */}
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                
                {/* Label - Medium weight, readable */}
                <div className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-300">
                  {stat.label}
                </div>
                
                {/* Description - Muted but readable */}
                <p className="hidden md:block text-xs text-slate-500 dark:text-slate-500 mt-2 max-w-[140px]">
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
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-500">
            Trusted by leading institutions including{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">Stanford</span>,{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">MIT</span>,{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">NIH</span>, and{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">100+ more</span>
          </p>
        </motion.div>
      </div>

      {/* Bottom fade - Match backgrounds */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none" />
    </section>
  );
}
