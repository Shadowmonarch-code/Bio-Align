'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, Quote } from 'lucide-react'

interface Testimonial {
  name: string
  title: string
  institution: string
  initials: string
  quote: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Dr. Sarah Chen',
    title: 'Computational Biologist',
    institution: 'Stanford University',
    initials: 'SC',
    quote:
      'BioAlign has transformed how our lab handles sequence analysis. The unified interface and powerful visualization tools have cut our analysis time by 60%. It\'s become indispensable for our research workflow.'
  },
  {
    name: 'Prof. James Mueller',
    title: 'Genomics Researcher',
    institution: 'MIT',
    initials: 'JM',
    quote:
      'After trying dozens of bioinformatics tools, BioAlign stands out with its intuitive design and comprehensive feature set. The integration with major databases is seamless, and the AI assistant is remarkably helpful.'
  },
  {
    name: 'Dr. Aisha Patel',
    title: 'Bioinformatics Lead',
    institution: 'EMBL-EBI',
    initials: 'AP',
    quote:
      'As someone who has worked in bioinformatics for over a decade, I\'m impressed by BioAlign\'s attention to detail. The platform handles complex analyses that would normally require multiple specialized tools.'
  },
  {
    name: 'Dr. Carlos Rodriguez',
    title: 'Structural Biology',
    institution: 'Harvard Medical School',
    initials: 'CR',
    quote:
      'The molecular docking and protein structure prediction capabilities are exceptional. Our team uses BioAlign daily for drug discovery research, and the results consistently match or exceed dedicated software.'
  },
  {
    name: 'Dr. Yuki Tanaka',
    title: 'Transcriptomics Expert',
    institution: 'RIKEN',
    initials: 'YT',
    quote:
      'BioAlign\'s RNA-seq pipeline is incredibly robust. From raw data to publication-ready figures, everything flows smoothly. The differential expression analysis features are particularly well-designed.'
  },
  {
    name: 'Dr. Emma Williams',
    title: 'PhD Student',
    institution: 'Oxford University',
    initials: 'EW',
    quote:
      'As a graduate student, I appreciate how BioAlign lowers the barrier to advanced bioinformatics. The learning curve is gentle, documentation is excellent, and the free tier lets me explore without limitations.'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
}

function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: rating }).map((_, i) => (
        <Star
          key={i}
          className="w-4 h-4 fill-amber-400 text-amber-400"
          strokeWidth={0}
        />
      ))}
    </div>
  )
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      className="group relative h-full"
    >
      <div className="relative h-full p-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-emerald-500/8 dark:hover:shadow-red-500/10 hover:border-emerald-300/50 dark:hover:border-red-700/40 transition-all duration-300 overflow-hidden">
        {/* Gradient glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 dark:from-red-950/30 via-transparent to-teal-50/30 dark:to-orange-950/20 rounded-2xl" />
        </div>

        {/* Quote icon */}
        <div className="relative mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-red-950/40 dark:to-orange-950/20 flex items-center justify-center group-hover:from-emerald-200 dark:group-hover:from-red-900/50 group-hover:to-teal-100 dark:group-hover:to-orange-900/30 transition-colors duration-300">
            <Quote className="w-5 h-5 text-emerald-600 dark:text-red-400" />
          </div>
        </div>

        {/* Star rating */}
        <div className="relative mb-4">
          <StarRating />
        </div>

        {/* Quote text - Clear readable */}
        <blockquote className="relative mb-6">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 italic">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </blockquote>

        {/* Author info - High contrast */}
        <div className="relative flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800/80">
          <Avatar className="h-11 w-11 ring-2 ring-emerald-200/50 dark:ring-red-800/40 group-hover:ring-emerald-400/60 dark:group-hover:ring-red-600/50 transition-all duration-300">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-red-500 dark:to-orange-600 text-white font-semibold text-sm">
              {testimonial.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-emerald-700 dark:group-hover:text-red-400 transition-colors duration-300">
              {testimonial.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
              {testimonial.title}
            </p>
            <p className="text-xs text-emerald-600 dark:text-red-400 font-medium truncate mt-0.5">
              {testimonial.institution}
            </p>
          </div>
        </div>

        {/* Subtle corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 right-0 w-1 h-8 bg-gradient-to-b from-emerald-500 dark:from-red-500 to-transparent rounded-br" />
          <div className="absolute top-0 right-0 w-8 h-1 bg-gradient-to-l from-emerald-500 dark:from-red-500 to-transparent rounded-br" />
        </div>
      </div>
    </motion.div>
  )
}

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Rich background gradient decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-400/5 dark:bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-teal-400/5 dark:bg-orange-500/5 rounded-full blur-3xl" />
        
        {/* Animated subtle particles - Deterministic positions to avoid hydration mismatch */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-emerald-300/30 dark:bg-red-400/25"
            style={{
              left: `${15 + (i * 13) % 70}%`,
              top: `${12 + (i * 17) % 75}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.4, 1],
              y: [0, -25, 0],
            }}
            transition={{
              duration: 5 + i * 0.8,
              repeat: Infinity,
              delay: i * 0.9,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-emerald-50 dark:bg-red-950/40 text-emerald-700 dark:text-red-300 border border-emerald-200/50 dark:border-red-800/30 mb-6">
            <Star className="w-4 h-4 fill-current" />
            Testimonials
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            Trusted by{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-red-500 dark:to-orange-400 bg-clip-text text-transparent">
              Researchers Worldwide
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Join thousands of scientists who have transformed their research workflow.
            See what leading experts say about their experience with BioAlign.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </motion.div>

        {/* Trust indicators - Enhanced card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-6 px-8 rounded-2xl bg-white dark:bg-zinc-950 backdrop-blur-sm border border-gray-200/60 dark:border-zinc-800/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['SC', 'JM', 'AP', 'CR'].map((initials) => (
                  <div
                    key={initials}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-red-500 dark:to-orange-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-zinc-950"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                <span className="text-gray-900 dark:text-white font-bold">4.9/5</span> average rating
              </span>
            </div>
            <div className="h-7 w-px bg-gray-200 dark:bg-zinc-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <StarRating rating={5} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                <span className="text-gray-900 dark:text-white font-bold">2,500+</span> reviews
              </span>
            </div>
            <div className="h-7 w-px bg-gray-200 dark:bg-zinc-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                <span className="text-gray-900 dark:text-white font-bold">98%</span> satisfaction
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
