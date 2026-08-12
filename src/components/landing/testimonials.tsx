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
          className="w-4 h-4 fill-[#C1121F] text-[#C1121F]"
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
      <div className="relative h-full p-6 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 overflow-hidden">
        {/* Gradient glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#C1121F]/5 via-transparent to-transparent rounded-2xl" />
        </div>

        {/* Quote icon */}
        <div className="relative mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C1121F]/10 to-[#C1121F]/5 flex items-center justify-center group-hover:from-[#C1121F]/20 group-hover:to-[#C1121F]/10 transition-colors duration-300">
            <Quote className="w-5 h-5 text-[#C1121F]" />
          </div>
        </div>

        {/* Star rating */}
        <div className="relative mb-4">
          <StarRating />
        </div>

        {/* Quote text */}
        <blockquote className="relative mb-6">
          <p className="text-sm leading-relaxed text-muted-foreground italic">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </blockquote>

        {/* Author info */}
        <div className="relative flex items-center gap-3 pt-4 border-t border-border/50">
          <Avatar className="h-11 w-11 ring-2 ring-[#C1121F]/20 group-hover:ring-[#C1121F]/40 transition-all duration-300">
            <AvatarFallback className="bg-gradient-to-br from-[#C1121F] to-[#9B1B30] text-white font-semibold text-sm">
              {testimonial.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate group-hover:text-[#C1121F] transition-colors duration-300">
              {testimonial.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {testimonial.title}
            </p>
            <p className="text-xs text-[#C1121F]/80 font-medium truncate">
              {testimonial.institution}
            </p>
          </div>
        </div>

        {/* Subtle corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 right-0 w-1 h-8 bg-gradient-to-b from-[#C1121F] to-transparent rounded-br" />
          <div className="absolute top-0 right-0 w-8 h-1 bg-gradient-to-l from-[#C1121F] to-transparent rounded-br" />
        </div>
      </div>
    </motion.div>
  )
}

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#C1121F]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#C1121F]/5 rounded-full blur-3xl" />
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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Trusted by{' '}
            <span className="text-[#C1121F]">Researchers Worldwide</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
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

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-6 px-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['SC', 'JM', 'AP', 'CR'].map((initials) => (
                  <div
                    key={initials}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C1121F] to-[#9B1B30] flex items-center justify-center text-white text-xs font-bold ring-2 ring-background"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                <span className="text-foreground font-bold">4.9/5</span> average rating
              </span>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <StarRating rating={5} />
              <span className="text-sm font-medium text-muted-foreground">
                <span className="text-foreground font-bold">2,500+</span> reviews
              </span>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-3.5 h-3.5 fill-[#C1121F] text-[#C1121F]"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                <span className="text-foreground font-bold">98%</span> satisfaction
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
