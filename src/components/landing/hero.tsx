'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Zap, BarChart3, Users, ShieldCheck, Sparkles, Dna, Atom, Activity, Molecule } from 'lucide-react';

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
      className="relative w-full max-w-4xl mx-auto h-[380px] md:h-[480px]"
    >
      <motion.div
        style={{ transform: `translateX(${mousePos.x}px) translateY(${mousePos.y}px)` }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-80 h-80 md:w-[400px] md:h-[400px] rounded-full bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-red-500/10 dark:via-orange-500/5 dark:to-transparent blur-3xl" />
        </div>
        
        {/* Orbital rings - Theme appropriate colors */}
        <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full border border-emerald-500/15 dark:border-red-500/15 animate-pulse" />
        <div className="absolute w-48 h-48 md:w-60 md:h-60 rounded-full border border-emerald-600/12 dark:border-red-400/12"
          style={{ animation: 'spin 20s linear infinite' }} 
        />
        <div className="absolute w-36 h-36 md:w-44 md:h-44 rounded-full border border-emerald-500/18 dark:border-red-500/18"
          style={{ animation: 'spin 15s linear reverse infinite' }}
        />

        {/* Core glow */}
        <div className="absolute w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-teal-300/10 dark:from-red-500/20 dark:via-red-400/10 dark:to-orange-300/10 blur-xl" />

        {/* Central DNA Icon - Theme colored */}
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative z-10"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-red-500/20 dark:to-orange-500/20 flex items-center justify-center backdrop-blur-sm border border-emerald-500/20 dark:border-red-500/20">
            <Dna className="w-8 h-8 md:w-10 md:h-10 text-emerald-600 dark:text-red-400" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Orbiting nodes - Theme alternating */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: '50%', left: '50%',
              width: '10px', height: '10px',
              borderRadius: '50%',
              backgroundColor: i % 2 === 0 ? '#10B981' : '#34D399',
              boxShadow: `0 0 12px ${i % 2 === 0 ? 'rgba(16,185,129,0.6)' : 'rgba(52,211,153,0.5)'}`,
            }}
            className="dark:[&]:bg-[#EF4444] dark:[&]:shadow-[0_0_12px_rgba(239,68,68,0.6)]"
            animate={{
              rotate: i * 60,
              x: Math.cos((i * 60 * Math.PI) / 180) * 130,
              y: Math.sin((i * 60 * Math.PI) / 180) * 130,
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
          { x: '-12%', y: '18%', icon: Atom, colorLight: '#059669', colorDark: '#DC2626' },
          { x: '82%', y: '22%', icon: Activity, colorLight: '#047857', colorDark: '#F87171' },
          { x: '12%', y: '72%', icon: Sparkles, colorLight: '#10B981', colorDark: '#EF4444' },
          { x: '78%', y: '68%', icon: Dna, colorLight: '#065F46', colorDark: '#FCA5A5' },
        ].map((point, i) => (
          <motion.div
            key={`point-${i}`}
            className="absolute"
            style={{ left: point.x, top: point.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.7, 1, 0.7], scale: [0.95, 1.05, 0.95], y: [0, -10, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
          >
            <div className="p-2.5 md:p-3 rounded-xl backdrop-blur-md bg-white/95 dark:bg-zinc-900/95 border border-gray-200/70 dark:border-zinc-700/70 shadow-lg shadow-gray-200/50 dark:shadow-black/30">
              <point.icon 
                className="w-5 h-5 md:w-6 md:h-6" 
                style={{ color: point.colorLight }} 
                strokeWidth={1.5}
                className="dark:[&]:text-[var(--color-dark)]"
              />
            </div>
          </motion.div>
        ))}
        
        {/* Additional floating molecules for richness */}
        {[
          { x: '25%', y: '45%', size: 6, delay: 0 },
          { x: '65%', y: '40%', size: 8, delay: 1 },
          { x: '40%', y: '75%', size: 5, delay: 2 },
          { x: '55%', y: '15%', size: 7, delay: 0.5 },
        ].map((particle, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-emerald-400/40 dark:bg-red-400/40"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.3, 1],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
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
      {/* Rich layered background */}
      <div className="absolute inset-0">
        {/* Base grid pattern */}
        <div className="absolute inset-0 scientific-grid" />
        
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.06)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(239,68,68,0.08)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(20,184,166,0.05)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,_rgba(220,38,38,0.06)_0%,_transparent_50%)]" />
        
        {/* Center subtle glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.03)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(239,68,68,0.04)_0%,_transparent_70%)]" />
        
        {/* Animated floating orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-emerald-400/5 dark:bg-red-400/5 blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-teal-400/5 dark:bg-orange-400/5 blur-3xl"
          animate={{ 
            x: [0, -25, 0],
            y: [0, 25, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          {/* Badge - HIGH CONTRAST */}
          <motion.div variants={itemVariants} className="mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-emerald-50 dark:bg-red-950/50 text-emerald-700 dark:text-red-300 border border-emerald-200/60 dark:border-red-800/40 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 dark:bg-red-500" />
              </span>
              Next-Gen Bioinformatics Platform
            </span>
          </motion.div>

          {/* Main Headline - Maximum Readability */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 md:mb-8"
          >
            <span className="block text-gray-900 dark:text-white">One Platform.</span>
            <span className="block mt-2 md:mt-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 dark:from-red-500 dark:via-red-400 dark:to-orange-400 bg-clip-text text-transparent">
              Every Bioinformatics Tool.
            </span>
          </motion.h1>

          {/* Subheadline - Clear readable text */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 md:mb-12 leading-relaxed"
          >
            A unified research workspace for bioinformatics, biotechnology, plant breeding,{' '}
            <span className="text-gray-900 dark:text-white font-semibold">statistical analysis</span>, and{' '}
            <span className="text-gray-900 dark:text-white font-semibold">scientific discovery.</span>
          </motion.p>

          {/* CTA Buttons - Bold & Clear */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            
            {/* Primary Button - Green in light, Red in dark */}
            <button 
              onClick={onStartClick}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-xl shadow-lg shadow-emerald-500/25 dark:shadow-red-500/30 hover:shadow-emerald-500/35 dark:hover:shadow-red-500/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">Start Analyzing</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            {/* Secondary Button - Outlined with theme color */}
            <button 
              onClick={onExploreClick}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-emerald-700 dark:text-red-400 bg-white dark:bg-zinc-950 border-2 border-emerald-200 dark:border-red-900/50 hover:border-emerald-400 dark:hover:border-red-500 hover:bg-emerald-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-sm"
            >
              Explore Tools
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-emerald-600 dark:text-red-400" />
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
              className="group relative p-4 md:p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-emerald-500/8 dark:hover:shadow-red-500/12 transition-all duration-300 cursor-default overflow-hidden"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-red-950/30 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative flex flex-col items-center text-center">
                {/* Icon - Theme colored background */}
                <div className="flex items-center justify-center w-11 h-11 md:w-13 md:h-13 rounded-xl bg-emerald-50 dark:bg-red-950/40 group-hover:bg-emerald-100 dark:group-hover:bg-red-950/60 mb-3 md:mb-4 transition-colors">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 dark:text-red-400" />
                </div>
                
                {/* Value - Bold, high contrast */}
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                
                {/* Label - Medium weight, readable */}
                <div className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                  {stat.label}
                </div>
                
                {/* Description - Muted but readable */}
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
          <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-4 rounded-2xl bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800/50">
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              Trusted by leading institutions including{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">Stanford</span>,{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">MIT</span>,{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">NIH</span>, and{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">100+ more</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade - Match backgrounds */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none" />
      
      {/* Decorative corner elements */}
      <div className="absolute top-20 left-10 w-20 h-20 border-l-2 border-t-2 border-emerald-200/30 dark:border-red-800/30 rounded-tl-3xl hidden lg:block" />
      <div className="absolute top-20 right-10 w-20 h-20 border-r-2 border-t-2 border-emerald-200/30 dark:border-red-800/30 rounded-tr-3xl hidden lg:block" />
      <div className="absolute bottom-32 left-10 w-20 h-20 border-l-2 border-b-2 border-emerald-200/30 dark:border-red-800/30 rounded-bl-3xl hidden lg:block" />
      <div className="absolute bottom-32 right-10 w-20 h-20 border-r-2 border-b-2 border-emerald-200/30 dark:border-red-800/30 rounded-br-3xl hidden lg:block" />
    </section>
  );
}
