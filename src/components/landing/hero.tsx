'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Zap, BarChart3, Users, ShieldCheck } from 'lucide-react';

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FAFAFA] dark:bg-black"
    >
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(193,18,31,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(193,18,31,0.03)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(193,18,31,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(193,18,31,0.05)_1px,transparent_1px)]" />

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
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-red-50 dark:bg-[#C1121F]/10 text-[#C1121F] dark:text-[#C1121F] border border-red-200/50 dark:border-[#C1121F]/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C1121F] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C1121F]" />
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
            <span className="block mt-2 md:mt-4 bg-gradient-to-r from-[#C1121F] via-red-600 to-orange-600 dark:from-[#C1121F] dark:via-[#E10600] dark:to-[#C1121F] bg-clip-text text-transparent">
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
            <button 
              onClick={onStartClick}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#C1121F] hover:bg-[#9B0F1A] rounded-xl shadow-lg shadow-[#C1121F]/25 hover:shadow-[#C1121F]/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">Start Analyzing</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            <button 
              onClick={onExploreClick}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-white/[0.05] border-2 border-gray-200 dark:border-white/10 hover:border-[#C1121F] dark:hover:border-[#C1121F] rounded-xl hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-sm cursor-pointer"
            >
              Explore Tools
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#C1121F] dark:text-[#C1121F]" />
            </button>
          </motion.div>
        </motion.div>

        {/* Stats Bar - Glassmorphism Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
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
              className="group relative p-4 md:p-6 rounded-2xl bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl border border-gray-200/50 dark:border-white/[0.08] shadow-sm hover:shadow-md hover:shadow-[#C1121F]/5 dark:hover:shadow-[#C1121F]/10 transition-all duration-300 cursor-default"
            >
              {/* Subtle gradient glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#C1121F]/0 to-[#C1121F]/0 group-hover:from-[#C1121F]/[0.02] group-hover:to-[#C1121F]/[0.01] transition-all duration-300" />
              
              <div className="relative flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-50 dark:bg-[#C1121F]/10 mb-3 md:mb-4 group-hover:bg-red-100 dark:group-hover:bg-[#C1121F]/15 transition-colors">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-[#C1121F] dark:text-[#C1121F]" />
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
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500">
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
    </section>
  );
}
