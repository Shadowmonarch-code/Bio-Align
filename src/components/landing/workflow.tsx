'use client'

import { motion } from 'framer-motion'
import { useRef } from 'react'
import {
  Upload,
  Wrench,
  Play,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

interface WorkflowStep {
  number: number
  icon: React.ElementType
  title: string
  description: string
  features: string[]
}

const workflowSteps: WorkflowStep[] = [
  {
    number: 1,
    icon: Upload,
    title: 'Upload Data',
    description: 'Drag & drop your files to get started',
    features: [
      'Drag & drop files (FASTA, FASTQ, VCF, etc.)',
      'Auto-detect format',
      'Preview & validate'
    ]
  },
  {
    number: 2,
    icon: Wrench,
    title: 'Choose Analysis',
    description: 'Select from our comprehensive tool library',
    features: [
      'Browse 50+ tools by category',
      'AI-recommended tools',
      'Pre-built workflows'
    ]
  },
  {
    number: 3,
    icon: Play,
    title: 'Run Analysis',
    description: 'Execute with cloud-powered performance',
    features: [
      'Cloud-powered execution',
      'Real-time progress tracking',
      'Background processing'
    ]
  },
  {
    number: 4,
    icon: BarChart3,
    title: 'Visualize Results',
    description: 'Explore your data with interactive tools',
    features: [
      'Interactive charts',
      '3D molecule viewers',
      'Exportable reports'
    ]
  },
  {
    number: 5,
    icon: Users,
    title: 'Collaborate & Share',
    description: 'Work together and publish your findings',
    features: [
      'Team workspaces',
      'Shareable links',
      'Publication-ready exports'
    ]
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
}

const stepVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
}

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 1.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      delay: 0.3
    }
  }
}

function StepCard({ step, index }: { step: WorkflowStep; index: number }) {
  const Icon = step.icon
  
  return (
    <motion.div
      variants={stepVariants}
      whileHover={{
        y: -12,
        scale: 1.02,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      className="group relative flex flex-col"
    >
      {/* Connection line indicator (desktop) */}
      {index < workflowSteps.length - 1 && (
        <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 z-0">
          <motion.div
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="h-full w-full bg-gradient-to-r from-[#C1121F]/40 via-[#C1121F]/20 to-transparent origin-left"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#C1121F]/60 via-[#C1121F]/30 to-transparent animate-pulse" style={{ animationDuration: '2s' }} />
        </div>
      )}

      {/* Main Card */}
      <div className="relative flex flex-col h-full p-6 sm:p-8 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:shadow-primary/15 hover:border-primary/30 transition-all duration-500 overflow-hidden z-10">
        {/* Background gradient glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#C1121F]/10 via-transparent to-purple-500/5 rounded-2xl" />
        </div>

        {/* Animated corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden rounded-tr-2xl">
          <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-[#C1121F] to-transparent" />
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#C1121F] to-transparent" />
          </div>
        </div>

        {/* Step Number & Icon Container */}
        <div className="relative flex items-center gap-4 mb-6">
          {/* Number Badge */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C1121F] to-[#9B1B30] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C1121F] to-[#9B1B30] flex items-center justify-center shadow-lg shadow-[#C1121F]/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Icon className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            
            {/* Step number overlay */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-[#C1121F] flex items-center justify-center">
              <span className="text-xs font-bold text-[#C1121F]">{step.number}</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-foreground group-hover:text-[#C1121F] transition-colors duration-300">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {step.description}
            </p>
          </div>
        </div>

        {/* Features List */}
        <ul className="relative space-y-3 mb-6 flex-grow">
          {step.features.map((feature, featureIndex) => (
            <motion.li
              key={featureIndex}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * featureIndex + 0.2, duration: 0.4 }}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C1121F] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
              <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
            </motion.li>
          ))}
        </ul>

        {/* Progress indicator bar */}
        <div className="relative pt-4 border-t border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Step {step.number} of 5</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i <= index ? 'bg-[#C1121F]' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Progress fill */}
          <div className="mt-2 h-1 bg-border/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${((index + 1) / 5) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="h-full bg-gradient-to-r from-[#C1121F] to-[#A41623] rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function VerticalConnector({ isLast }: { isLast: boolean }) {
  if (isLast) return null

  return (
    <div className="flex lg:hidden justify-center py-2 relative">
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        className="w-0.5 h-8 bg-gradient-to-b from-[#C1121F]/60 via-[#C1121F]/30 to-transparent origin-top"
      >
        {/* Animated pulse effect */}
        <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#C1121F]/40 animate-ping" style={{ animationDuration: '1.5s' }} />
        
        {/* Arrow indicator */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <ArrowRight className="w-4 h-4 text-[#C1121F] rotate-90 lg:rotate-0" />
        </div>
      </motion.div>
    </div>
  )
}

interface WorkflowSectionProps {
  onStartClick?: () => void;
}

export default function WorkflowSection({ onStartClick }: WorkflowSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#C1121F]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C1121F]/3 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="text-center mb-20"
        >
          {/* Label badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C1121F]/10 border border-[#C1121F]/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#C1121F] animate-pulse" />
            <span className="text-sm font-medium text-[#C1121F]">Research Pipeline</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground tracking-tight mb-6">
            Streamlined{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-[#C1121F] via-[#A41623] to-[#C1121F] bg-clip-text text-transparent">
                Research Workflow
              </span>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#C1121F] via-[#A41623] to-transparent rounded-full origin-left"
              />
            </span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
            From raw data to publication-ready results in minutes.
            Our intuitive workflow guides you through every step of your analysis.
          </p>
        </motion.div>

        {/* Desktop Horizontal Layout */}
        <div className="hidden lg:block relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-5 gap-6"
          >
            {workflowSteps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </motion.div>
        </div>

        {/* Mobile Vertical Layout */}
        <div className="lg:hidden max-w-md mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="space-y-4"
          >
            {workflowSteps.map((step, index) => (
              <div key={step.number}>
                <StepCard step={step} index={index} />
                <VerticalConnector isLast={index === workflowSteps.length - 1} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <div className="relative inline-flex flex-col items-center p-8 sm:p-12 rounded-3xl bg-card/70 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#C1121F]/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px]" />
            </div>

            {/* Content */}
            <div className="relative">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Ready to Accelerate Your Research?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Join thousands of researchers who trust BioAlign for their bioinformatics analyses.
              </p>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 20px 40px rgba(193, 18, 31, 0.35)'
                }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartClick}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[#C1121F] to-[#A41623] text-white font-semibold text-lg shadow-lg shadow-[#C1121F]/30 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
                <span>Start Your Analysis</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              {/* Trust indicators */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Free tier available</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
