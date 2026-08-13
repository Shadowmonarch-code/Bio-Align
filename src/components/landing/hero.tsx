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
        {/* Outer ring - Sage Green border */}
        <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full border border-[#8EB69B]/20 animate-pulse" />
        
        {/* Middle ring - Deep Teal Green border */}
        <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full border border-[#235347]/20" 
          style={{ animation: 'spin 20s linear infinite' }} 
        />
        
        {/* Inner ring - Forest Green border */}
        <div className="absolute w-40 h-40 md:w-52 md:h-52 rounded-full border border-[#163832]/25"
          style={{ animation: 'spin 15s linear reverse infinite' }}
        />

        {/* Core glow - Forest gradient */}
        <div className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#163832]/20 via-transparent to-[#8EB69B]/20 blur-xl" />

        {/* Central DNA Icon */}
        <motion.div
          animate={{ rotateY: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative z-10"
        >
          <Dna className="w-16 h-16 md:w-20 md:h-20 text-[#163832] dark:text-[#8EB69B]" strokeWidth={1.5} />
        </motion.div>

        {/* Orbiting molecular nodes - Botanical palette alternating */}
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
              backgroundColor: i % 2 === 0 ? '#163832' : '#8EB69B',
              boxShadow: `0 0 10px ${i % 2 === 0 ? 'rgba(22,56,50,0.5)' : 'rgba(142,182,155,0.5)'}`,
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

        {/* Floating data points - Botanical palette with forest green borders */}
        {[
          { x: '-10%', y: '20%', icon: Atom, color: '#163832' },
          { x: '85%', y: '25%', icon: Activity, color: '#8EB69B' },
          { x: '15%', y: '75%', icon: Sparkles, color: '#235347' },
          { x: '80%', y: '70%', icon: Dna, color: '#0B2B26' },
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
              className="p-2.5 rounded-xl backdrop-blur-md border shadow-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: `${point.color}40`,
                boxShadow: `0 4px 20px ${point.color}20`,
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#DAF1DE] dark:bg-[#051F20]"
    >
      {/* Scientific grid pattern overlay */}
      <div className="absolute inset-0 scientific-grid" />
      
      {/* Subtle radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(5,31,32,0.15)_100%)] dark:bg-[radial-gradient(ellipse_at_center,_rgba(142,182,155,0.03)_0%,_transparent_70%)]" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          {/* Badge - Botanical forest theme */}
          <motion.div variants={itemVariants} className="mb-6 md:mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/80 dark:bg-[#163832]/50 text-[#051F20] dark:text-[#DAF1DE] border border-[#163832]/20 dark:border-[#8EB69B]/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#163832] dark:bg-[#8EB69B] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#163832] dark:bg-[#8EB69B]" />
              </span>
              Next-Gen Bioinformatics Platform
            </span>
          </motion.div>

          {/* Main Headline with Gradient - Botanical theme */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 md:mb-8"
          >
            <span className="block text-[#051F20] dark:text-[#DAF1DE]">One Platform.</span>
            <span className="block mt-2 md:mt-4 bg-gradient-to-r from-[#163832] via-[#235347] to-[#8EB69B] dark:from-[#8EB69B] dark:via-[#A8CBB8] dark:to-[#C5E6D5] bg-clip-text text-transparent">
              Every Bioinformatics Tool.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-[#163832]/80 dark:text-[#8EB69B]/80 mb-10 md:mb-12 leading-relaxed"
          >
            Analyze, visualize, and understand biological data in one{' '}
            <span className="text-[#051F20] dark:text-[#DAF1DE] font-medium">intelligent research workspace.</span>
          </motion.p>

          {/* CTA Buttons - Botanical forest-green theme */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Primary CTA Button - Forest Green */}
            <button 
              onClick={onStartClick}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-[#DAF1DE] dark:text-[#051F20] bg-[#163832] hover:bg-[#235347] dark:bg-[#8EB69B] dark:hover:bg-[#A8CBB8] rounded-xl shadow-lg shadow-[#163832]/25 dark:shadow-[#8EB69B]/25 hover:shadow-[#163832]/40 dark:hover:shadow-[#8EB69B]/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">Start Analyzing</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            {/* Secondary Button - Outline with botanical colors */}
            <button 
              onClick={onExploreClick}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-[#163832] dark:text-[#8EB69B] bg-white/80 dark:bg-white/[0.03] border-2 border-[#163832]/30 dark:border-[#8EB69B]/30 hover:border-[#163832] dark:hover:border-[#8EB69B]/50 rounded-xl hover:bg-white dark:hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm cursor-pointer"
            >
              Explore Tools
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#163832] dark:text-[#8EB69B]" />
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

        {/* Stats Bar - Glassmorphism Cards - Botanical forest theme */}
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
              className="group relative p-4 md:p-6 rounded-2xl bg-white/70 dark:bg-[#0B2B26]/70 backdrop-blur-xl border border-[#163832]/10 dark:border-[#8EB69B]/10 shadow-sm hover:shadow-lg hover:shadow-[#163832]/10 dark:hover:shadow-[#8EB69B]/10 transition-all duration-300 cursor-default"
            >
              {/* Subtle gradient glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#163832]/0 to-[#8EB69B]/0 group-hover:from-[#163832]/[0.03] group-hover:to-[#8EB69B]/[0.02] transition-all duration-300" />
              
              <div className="relative flex flex-col items-center text-center">
                {/* Icon container with botanical colors */}
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#E8F5EE] dark:bg-[#163832]/50 mb-3 md:mb-4 group-hover:bg-[#C5E6D5] dark:group-hover:bg-[#163832]/70 transition-colors">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-[#163832] dark:text-[#8EB69B]" />
                </div>
                {/* Value text - botanical colors */}
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#051F20] dark:text-[#DAF1DE] mb-1">
                  {stat.value}
                </div>
                {/* Label text - botanical colors */}
                <div className="text-sm md:text-base font-medium text-[#163832] dark:text-[#8EB69B]">
                  {stat.label}
                </div>
                {/* Description - muted botanical */}
                <p className="hidden md:block text-xs text-[#5A7D72] dark:text-[#6A9488] mt-2 max-w-[140px]">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust indicators - Botanical styling */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12 md:mt-16 text-center"
        >
          <p className="text-xs md:text-sm text-[#5A7D72] dark:text-[#6A9488]">
            Trusted by leading institutions including{' '}
            <span className="font-medium text-[#163832] dark:text-[#8EB69B]">Stanford</span>,{' '}
            <span className="font-medium text-[#163832] dark:text-[#8EB69B]">MIT</span>,{' '}
            <span className="font-medium text-[#163832] dark:text-[#8EB69B]">NIH</span>, and{' '}
            <span className="font-medium text-[#163832] dark:text-[#8EB69B]">100+ more</span>
          </p>
        </motion.div>
      </div>

      {/* Bottom fade gradient - Botanical colors */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#DAF1DE] dark:from-[#051F20] to-transparent" />
    </section>
  );
}
