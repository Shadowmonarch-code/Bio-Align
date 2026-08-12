'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { Sparkles, Palette, Waves, Star, Zap, Heart, Flame, Gem } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// COLOR PALETTES
// ============================================
export const GRADIENTS = {
  sunset: ['#FF6B6B', '#FFE66D', '#FF8E53'],
  ocean: ['#4ECDC4', '#44A08D', '#093028'],
  aurora: ['#A855F7', '#6366F1', '#06B6D4', '#10B981'],
  candy: ['#FF6B6B', '#F59E0B', '#A855F7', '#EC4899'],
  forest: ['#10B981', '#059669', '#34D399'],
  galaxy: ['#7C3AED', '#2563EB', '#06B6D4', '#A855F7'],
  flame: ['#FF6B6B', '#F97316', '#FBBF24'],
  berry: ['#EC4899', '#A855F7', '#6366F1']
} as const

export type GradientKey = keyof typeof GRADIENTS

// ============================================
// RAINBOW GRADIENT COMPONENT
// ============================================
interface RainbowGradientProps {
  children?: React.ReactNode
  className?: string
  colors?: string[]
  speed?: number
  showParticles?: boolean
  particleCount?: number
  intensity?: 'subtle' | 'medium' | 'vibrant'
}

const Particle = ({ delay, duration, size }: { delay: number; duration: number; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-white/30"
    style={{
      width: size,
      height: size,
    }}
    initial={{ 
      opacity: 0,
      y: '100vh',
      x: `${Math.random() * 100}%`
    }}
    animate={{
      opacity: [0, 1, 0],
      y: ['-10vh', '-50vh'],
      x: ['0%', `${Math.random() * 20 - 10}%`]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeOut'
    }}
  />
)

export const RainbowGradient: React.FC<RainbowGradientProps> = ({
  children,
  className,
  colors = [...GRADIENTS.candy, ...GRADIENTS.aurora],
  speed = 15,
  showParticles = false,
  particleCount = 20,
  intensity = 'vibrant'
}) => {
  const intensityMap = {
    subtle: { backgroundSize: '400% 400%', opacity: 0.5 },
    medium: { backgroundSize: '300% 300%', opacity: 0.75 },
    vibrant: { backgroundSize: '200% 200%', opacity: 1 }
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(-45deg, ${colors.join(', ')})`,
          backgroundSize: intensityMap[intensity].backgroundSize,
          opacity: intensityMap[intensity].opacity,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Optional Particle Overlay */}
      {showParticles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: particleCount }).map((_, i) => (
            <Particle
              key={i}
              delay={Math.random() * speed}
              duration={speed + Math.random() * 10}
              size={Math.random() * 4 + 2}
            />
          ))}
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// ============================================
// MESH GRADIENT COMPONENT
// ============================================
interface MeshGradientProps {
  children?: React.ReactNode
  className?: string
  colors?: string[]
  blobCount?: number
  animationSpeed?: number
  blurAmount?: number
}

interface BlobProps {
  color: string
  size: number
  x: number
  y: number
  delay: number
  duration: number
}

const MeshBlob = ({ color, size, x, y, delay, duration }: BlobProps) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      top: `${y}%`,
      backgroundColor: color,
      filter: 'blur(60px)',
    }}
    initial={{ scale: 0.8, opacity: 0.6 }}
    animate={{
      scale: [0.8, 1.2, 0.9, 1.1, 0.8],
      opacity: [0.5, 0.8, 0.6, 0.7, 0.5],
      x: [0, 30, -20, 15, 0],
      y: [0, -25, 35, -15, 0]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
  />
)

export const MeshGradient: React.FC<MeshGradientProps> = ({
  children,
  className,
  colors = [...GRADIENTS.galaxy, ...GRADIENTS.ocean],
  blobCount = 5,
  animationSpeed = 20,
  blurAmount = 60
}) => {
  // Generate random blob positions
  const generateBlobs = (): BlobProps[] => {
    const blobs: BlobProps[] = []
    for (let i = 0; i < blobCount; i++) {
      blobs.push({
        color: colors[i % colors.length],
        size: Math.random() * 300 + 200,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        delay: Math.random() * animationSpeed,
        duration: animationSpeed + Math.random() * 10
      })
    }
    return blobs
  }

  const blobs = generateBlobs()

  return (
    <div className={cn('relative overflow-hidden min-h-[300px]', className)}>
      {/* Mesh Blobs */}
      <div className="absolute inset-0" style={{ filter: `blur(${blurAmount}px)` }}>
        {blobs.map((blob, index) => (
          <MeshBlob key={index} {...blob} />
        ))}
      </div>
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// ============================================
// AURORA BACKGROUND COMPONENT
// ============================================
interface AuroraBackgroundProps {
  children?: React.ReactNode
  className?: string
  colors?: string[]
  waveCount?: number
  speed?: number
  amplitude?: number
}

const AuroraWave = ({ 
  colors, 
  index, 
  totalWaves, 
  speed, 
  amplitude 
}: { 
  colors: string[]
  index: number
  totalWaves: number
  speed: number
  amplitude: number
}) => {
  const baseY = (index / totalWaves) * 100
  
  return (
    <motion.svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 600"
      preserveAspectRatio="none"
      style={{ transform: `translateY(${index * 10}px)` }}
    >
      <defs>
        <linearGradient id={`aurora-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
          {colors.map((color, i) => (
            <stop
              key={i}
              offset={`${(i / (colors.length - 1)) * 100}%`}
              stopColor={color}
            />
          ))}
        </linearGradient>
        <filter id={`aurora-blur-${index}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
        </filter>
      </defs>
      
      <motion.path
        d={`M0,${300 + baseY} Q360,${300 + baseY - amplitude}, 720,${300 + baseY} T1440,${300 + baseY} L1440,600 L0,600 Z`}
        fill={`url(#aurora-gradient-${index})`}
        opacity={0.4 - (index * 0.05)}
        filter={`url(#aurora-blur-${index})`}
        animate={{
          d: [
            `M0,${300 + baseY} Q360,${300 + baseY - amplitude}, 720,${300 + baseY} T1440,${300 + baseY} L1440,600 L0,600 Z`,
            `M0,${300 + baseY} Q360,${300 + baseY + amplitude}, 720,${300 + baseY - amplitude/2} T1440,${300 + baseY} L1440,600 L0,600 Z`,
            `M0,${300 + baseY} Q360,${300 + baseY - amplitude/2}, 720,${300 + baseY + amplitude} T1440,${300 + baseY} L1440,600 L0,600 Z`,
            `M0,${300 + baseY} Q360,${300 + baseY - amplitude}, 720,${300 + baseY} T1440,${300 + baseY} L1440,600 L0,600 Z`
          ]
        }}
        transition={{
          duration: speed + index * 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.svg>
  )
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  children,
  className,
  colors = GRADIENTS.aurora,
  waveCount = 4,
  speed = 12,
  amplitude = 80
}) => {
  // Distribute colors across waves
  const getWaveColors = (index: number): string[] => {
    const startIdx = index % colors.length
    const waveColors: string[] = []
    for (let i = 0; i < 3; i++) {
      waveColors.push(colors[(startIdx + i) % colors.length])
    }
    return waveColors
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Dark base */}
      <div className="absolute inset-0 bg-slate-950" />
      
      {/* Aurora Waves */}
      <div className="absolute inset-0">
        {Array.from({ length: waveCount }).map((_, index) => (
          <AuroraWave
            key={index}
            colors={getWaveColors(index)}
            index={index}
            totalWaves={waveCount}
            speed={speed}
            amplitude={amplitude - index * 10}
          />
        ))}
      </div>
      
      {/* Star-like sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 5,
              repeat: Infinity
            }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// ============================================
// COLORFUL DIVIDER COMPONENT
// ============================================
type WaveStyle = 'gentle' | 'dramatic' | 'organic' | 'sharp'

interface ColorfulDividerProps {
  className?: string
  colors?: string[]
  style?: WaveStyle
  position?: 'top' | 'bottom'
  flip?: boolean
  height?: number
}

const wavePaths: Record<WaveStyle, string> = {
  gentle: 'M0,32 C320,64 640,0 960,32 C1280,64 1440,16 1440,32 L1440,64 L0,64 Z',
  dramatic: 'M0,48 C240,96 480,0 720,48 C960,96 1200,0 1440,48 L1440,64 L0,64 Z',
  organic: 'M0,40 C180,60 360,20 540,40 C720,60 900,20 1080,40 C1260,60 1350,30 1440,40 L1440,64 L0,64 Z',
  sharp: 'M0,32 L120,48 L240,24 L360,56 L480,28 L600,52 L720,20 L840,48 L960,32 L1080,52 L1200,24 L1320,48 L1440,32 L1440,64 L0,64 Z'
}

export const ColorfulDivider: React.FC<ColorfulDividerProps> = ({
  className,
  colors = GRADIENTS.sunset,
  style = 'gentle',
  position = 'bottom',
  flip = false,
  height = 64
}) => {
  const path = wavePaths[style]
  
  return (
    <div 
      className={cn('w-full relative', className)}
      style={{ height }}
    >
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        style={{
          [position]: 0,
          transform: flip ? 'scaleY(-1)' : undefined,
          transformOrigin: position === 'bottom' ? 'top' : 'bottom'
        }}
      >
        <defs>
          <linearGradient id={`divider-gradient-${position}-${style}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {colors.map((color, i) => (
              <stop
                key={i}
                offset={`${(i / (colors.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </linearGradient>
        </defs>
        
        <motion.path
          d={path}
          fill={`url(#divider-gradient-${position}-${style})`}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  )
}

// ============================================
// GRADIENT CARD COMPONENT
// ============================================
interface GradientCardProps {
  children?: React.ReactNode
  className?: string
  gradientColors?: string[]
  hoverEffect?: 'glow' | 'lift' | 'scale' | 'rotate'
  glassIntensity?: 'light' | 'medium' | 'heavy'
  icon?: React.ReactNode
  title?: string
  description?: string
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  className,
  gradientColors = GRADIENTS.galaxy,
  hoverEffect = 'glow',
  glassIntensity = 'medium',
  icon,
  title,
  description
}) => {
  const [isHovered, setIsHovered] = useState(false)
  
  const glassStyles = {
    light: 'bg-white/10 backdrop-blur-sm',
    medium: 'bg-white/20 backdrop-blur-md',
    heavy: 'bg-white/30 backdrop-blur-lg'
  }

  const hoverVariants = {
    glow: {
      boxShadow: isHovered 
        ? `0 0 40px ${gradientColors[0]}40, 0 0 80px ${gradientColors[1] || gradientColors[0]}20`
        : '0 4px 20px rgba(0,0,0,0.1)',
      y: isHovered ? -5 : 0
    },
    lift: {
      y: isHovered ? -10 : 0,
      boxShadow: isHovered 
        ? '0 20px 40px rgba(0,0,0,0.2)'
        : '0 4px 20px rgba(0,0,0,0.1)'
    },
    scale: {
      scale: isHovered ? 1.02 : 1,
      boxShadow: isHovered 
        ? '0 10px 30px rgba(0,0,0,0.15)'
        : '0 4px 20px rgba(0,0,0,0.1)'
    },
    rotate: {
      rotateX: isHovered ? 2 : 0,
      rotateY: isHovered ? 2 : 0,
      boxShadow: isHovered 
        ? '0 20px 40px rgba(0,0,0,0.2)'
        : '0 4px 20px rgba(0,0,0,0.1)'
    }
  }

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl p-[2px] overflow-hidden group cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: 1000 }}
      animate={{
        y: hoverEffect === 'glow' ? (isHovered ? -5 : 0) : hoverEffect === 'lift' ? (isHovered ? -10 : 0) : 0,
        scale: hoverEffect === 'scale' ? (isHovered ? 1.02 : 1) : 1,
        rotateX: hoverEffect === 'rotate' ? (isHovered ? 2 : 0) : 0,
        rotateY: hoverEffect === 'rotate' ? (isHovered ? 2 : 0) : 0,
        boxShadow: isHovered 
          ? hoverEffect === 'glow' 
            ? `0 0 40px ${gradientColors[0]}40, 0 0 80px ${gradientColors[1] || gradientColors[0]}20`
            : `0 20px 40px rgba(0,0,0,0.2)`
          : '0 4px 20px rgba(0,0,0,0.1)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated Gradient Border */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${gradientColors.join(', ')})`,
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      {/* Card Content Container */}
      <div className={cn(
        'relative rounded-2xl h-full',
        glassStyles[glassIntensity]
      )}>
        {/* Inner Shine Effect on Hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${isHovered ? '30% 30%' : '50% 50%'}, rgba(255,255,255,0.2), transparent 70%)`
          }}
        />
        
        {/* Card Content */}
        <div className="relative z-10 p-6">
          {icon && (
            <motion.div 
              className="mb-4"
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              {icon}
            </motion.div>
          )}
          
          {title && (
            <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
          )}
          
          {description && (
            <p className="text-white/70 text-sm leading-relaxed">{description}</p>
          )}
          
          {children}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// COLORFUL BADGE COMPONENT
// ============================================
interface ColorfulBadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'gradient-text' | 'gradient-bg' | 'outline' | 'filled'
  colors?: string[]
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  pulse?: boolean
  animated?: boolean
}

export const ColorfulBadge: React.FC<ColorfulBadgeProps> = ({
  children,
  className,
  variant = 'gradient-bg',
  colors = GRADIENTS.candy,
  size = 'md',
  icon,
  pulse = false,
  animated = true
}) => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  const renderContent = () => {
    switch (variant) {
      case 'gradient-text':
        return (
          <span
            className={cn('font-semibold inline-flex items-center gap-1.5', sizes[size], className)}
            style={{
              backgroundImage: `linear-gradient(135deg, ${colors.join(', ')})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {icon && <span>{icon}</span>}
            {children}
          </span>
        )
      
      case 'gradient-bg':
        return (
          <motion.span
            className={cn(
              'rounded-full font-medium inline-flex items-center gap-1.5 text-white shadow-lg',
              sizes[size],
              className
            )}
            style={{
              background: animated 
                ? `linear-gradient(135deg, ${colors.join(', ')})`
                : undefined,
              backgroundSize: '200% 200%',
            }}
            animate={animated ? {
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
            } : undefined}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            {pulse && (
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${colors.join(', ')})`
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {icon && <span>{icon}</span>}
              {children}
            </span>
          </motion.span>
        )
      
      case 'outline':
        return (
          <motion.span
            className={cn(
              'rounded-full font-medium inline-flex items-center gap-1.5 border-2',
              sizes[size],
              className
            )}
            style={{
              borderColor: colors[0],
              color: colors[0]
            }}
            whileHover={{
              backgroundColor: `${colors[0]}20`,
              scale: 1.05
            }}
          >
            {icon && <span>{icon}</span>}
            {children}
          </motion.span>
        )
      
      case 'filled':
        return (
          <motion.span
            className={cn(
              'rounded-full font-medium inline-flex items-center gap-1.5 text-white',
              sizes[size],
              className
            )}
            style={{
              backgroundColor: colors[0]
            }}
            whileHover={{
              scale: 1.05,
              backgroundColor: colors[1] || colors[0]
            }}
          >
            {icon && <span>{icon}</span>}
            {children}
          </motion.span>
        )
      
      default:
        return null
    }
  }

  return (
    <span className="relative inline-block">
      {renderContent()}
    </span>
  )
}

// ============================================
// PRESET COMBINATIONS
// ============================================

// Hero Section with Aurora Background
export const HeroSection: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <section className={cn('min-h-screen relative', className)}>
    <AuroraBackground className="absolute inset-0" />
    <div className="relative z-10 container mx-auto px-4 py-20">
      {children}
    </div>
  </section>
)

// Feature Cards Grid with Mesh Gradient
export const FeaturesSection: React.FC<{
  features: Array<{
    icon: React.ReactNode
    title: string
    description: string
    gradientColors?: string[]
  }>
  className?: string
}> = ({ features, className }) => (
  <section className={cn('py-20 relative', className)}>
    <MeshGradient className="absolute inset-0" colors={[...GRADIENTS.forest, ...GRADIENTS.ocean]} />
    <div className="relative z-10 container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <GradientCard
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradientColors={[...(feature.gradientColors || Object.values(GRADIENTS)[index % Object.values(GRADIENTS).length])]}
            />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

// CTA Section with Rainbow Gradient
export const CTASection: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <section className={cn('py-20 relative', className)}>
    <RainbowGradient 
      className="absolute inset-0 rounded-3xl" 
      showParticles 
      particleCount={30}
    />
    <div className="relative z-10 container mx-auto px-4 py-16 text-center">
      {children}
    </div>
  </section>
)

// ============================================
// DEFAULT EXPORT
// ============================================

const ColorfulSections = {
  RainbowGradient,
  MeshGradient,
  AuroraBackground,
  ColorfulDivider,
  GradientCard,
  ColorfulBadge,
  HeroSection,
  FeaturesSection,
  CTASection,
  GRADIENTS
}

export default ColorfulSections

// Re-export icons for convenience
export { Sparkles, Palette, Waves, Star, Zap, Heart, Flame, Gem }
