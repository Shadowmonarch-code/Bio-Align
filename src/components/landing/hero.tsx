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
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
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
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
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
      {/* Central DNA Helix Visualization */}
      <motion.div
        style={{
          transform: `translateX(${mousePos.x}px) translateY(${mousePos.y}px)`,
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Outer ring - Subtle green border */}
        <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full border border-green-primary/10 dark:border-green-bright/10 animate-pulse" />
        
        {/* Middle ring - Green accent border */}
        <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full border border-green-dark/15 dark:border-green-primary/15" 
          style={{ animation: 'spin 20s linear infinite' }} 
        />
        
        {/* Inner ring - Brighter green border */}
        <div className="absolute w-40 h-40 md:w-52 md:h-52 rounded-full border border-green-primary/20 dark:border-green-soft/20"
          style={{ animation: 'spin 15s linear reverse infinite' }}
        />

        {/* Core glow - Subtle green gradient */}
        <div className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-green-primary/10 via-transparent to-green-soft/10 blur-xl" />

        {/* Central DNA Icon */}
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative z-10"
        >
          <Dna className="w-16 h-16 md:w-20 md:h-20 text-green-primary dark:text-green-bright" strokeWidth={1.5} />
        </motion.div>

        {/* Orbiting molecular nodes - Green palette alternating */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: i % 2 === 0 ? '#16A34A' : '#22C55E',
              boxShadow: `0 0 10px ${i % 2 === 0 ? 'rgba(22,163,74,0.5)' : 'rgba(34,197,94,0.5)'}`,
            }}
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

        {/* Floating data points - Clean white cards with green accents */}
        {[
          { x: '-10%', y: '20%', icon: Atom, color: '#16A34A' },
          { x: '85%', y: '25%', icon: Activity, color: '#22C55E' },
          { x: '15%', y: '75%', icon: Sparkles, color: '#15803D' },
          { x: '80%', y: '70%', icon: Dna, color: '#86EFAC' },
        ].map((point, i) => (
          <motion.div
            key={`point-${i}`}
            className="absolute"
            style={{ left: point.x, top: point.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [0.9, 1.1, 0.9],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          >
            <div 
              className="p-2.5 rounded-xl backdrop-blur-md border shadow-lg bg-white/90 dark:bg-black/90"
              style={{
                borderColor: `${point.color}30`,
                boxShadow: `0 4px 20px ${point.color}15`,
              }}
            >
              <point.icon 
                className="w-5 h-5 md:w-6 md:h-6" 
                style={{ color: point.color }} 
                strokeWidth={1.5}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ============ Main Hero Section Component ============
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
      {/* Scientific grid pattern overlay - Very subtle */}
      <div className="absolute inset-0 scientific-grid" />
      
      {/* Subtle radial gradient for depth - Green tint in center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(22,163,74,0.03)_0%,_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.04)_0%,_transparent_70%)]" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          {/* Badge - Clean professional styling */}
          <motion.div variants={itemVariants} className="mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-light dark:bg-green-bg text-green-dark dark:text-green-soft border border-green-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-primary" />
              </span>
              Next-Gen Bioinformatics Platform
            </span>
          </motion.div>

          {/* Main Headline - Clean typography */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 md:mb-8"
          >
            <span className="block text-gray-900 dark:text-white">One Platform.</span>
            <span className="block mt-2 md:mt-4 bg-gradient-to-r from-green-primary via-green-bright to-green-soft dark:from-green-bright dark:via-green-primary dark:to-green-soft bg-clip-text text-transparent">
              Every Bioinformatics Tool.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 md:mb-12 leading-relaxed"
          >
            A unified research workspace for bioinformatics, biotechnology, plant breeding,{' '}
            <span className="text-gray-900 dark:text-white font-medium">statistical analysis, and scientific discovery.</span>
          </motion.p>

          {/* CTA Buttons - Green primary, outlined secondary */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Primary CTA Button - Green brand color */}
            <button 
              onClick={onStartClick}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-green-primary hover:bg-green-dark rounded-xl shadow-lg shadow-green-primary/25 hover:shadow-green-primary/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">Start Analyzing</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            {/* Secondary Button - Outlined with green border */}
            <button 
              onClick={onExploreClick}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-green-primary dark:text-green-bright bg-white dark:bg-black border-2 border-green-primary/30 hover:border-green-primary dark:hover:border-green-bright/50 rounded-xl hover:bg-green-light/50 dark:hover:bg-green-bg/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Explore Tools
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-green-primary dark:text-green-bright" />
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

        {/* Stats Bar - Clean white cards with subtle borders */}
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
              whileHover={{ 
                y: -4, 
                scale: 1.02,
                transition: { duration: 0.2 } 
              }}
              className="group relative p-4 md:p-6 rounded-2xl bg-white dark:bg-zinc-900 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:shadow-green-primary/5 dark:hover:shadow-green-primary/10 transition-all duration-300 cursor-default"
            >
              {/* Subtle gradient glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent group-hover:from-green-primary/[0.02] group-hover:to-green-soft/[0.02] transition-all duration-300" />
              
              <div className="relative flex flex-col items-center text-center">
                {/* Icon container with light green background */}
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-light dark:bg-green-bg mb-3 md:mb-4 group-hover:bg-green-100 dark:group-hover:bg-green-bg/80 transition-colors">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-green-primary dark:text-green-bright" />
                </div>
                {/* Value text - Strong typography */}
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                {/* Label text - Medium weight */}
                <div className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                  {stat.label}
                </div>
                {/* Description - Muted */}
                <p className="hidden md:block text-xs text-gray-500 dark:text-gray-500 mt-2 max-w-[140px]">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust indicators - Clean styling */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12 md:mt-16 text-center"
        >
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500">
            Trusted by leading institutions including{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">Stanford</span>,{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">MIT</span>,{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">NIH</span>, and{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">100+ more</span>
          </p>
        </motion.div>
      </div>

      {/* Bottom fade gradient - Match section backgrounds */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-black to-transparent" />
    </section>
  );
}
