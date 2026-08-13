'use client'

import { motion } from 'framer-motion'
import {
  Dna,
  Microscope,
  CircleDot,
  FlaskConical,
  TreePine,
  Atom,
  Scissors,
  TestTube,
  Brain,
  Database,
  BarChart3,
  Users
} from 'lucide-react'

interface Feature {
  icon: React.ElementType
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: Dna,
    title: 'Sequence Analysis',
    description:
      'Pairwise & multiple alignment, BLAST, ORF finding, and translation tools for comprehensive DNA/RNA analysis.'
  },
  {
    icon: Microscope,
    title: 'Protein Analysis',
    description:
      'Structure prediction, physicochemical properties, domain identification, and motif discovery tools.'
  },
  {
    icon: CircleDot,
    title: 'Genomics',
    description:
      'Interactive genome browser, variant calling pipelines, SNP analysis, and functional annotation workflows.'
  },
  {
    icon: FlaskConical,
    title: 'Transcriptomics',
    description:
      'Complete RNA-seq pipeline with differential expression analysis, clustering, and heatmap visualization.'
  },
  {
    icon: TreePine,
    title: 'Phylogenetics',
    description:
      'Build evolutionary trees with multiple algorithms, bootstrap support analysis, and interactive visualization.'
  },
  {
    icon: Atom,
    title: 'Molecular Docking',
    description:
      'AutoDock integration for ligand-protein docking, binding energy calculations, and 3D visualization.'
  },
  {
    icon: Scissors,
    title: 'CRISPR Design',
    description:
      'Intelligent guide RNA design with off-target prediction, specificity scoring, and efficiency metrics.'
  },
  {
    icon: TestTube,
    title: 'Primer Tools',
    description:
      'Primer3 integration for primer design, PCR simulation, melting temperature calculation, and validation.'
  },
  {
    icon: Brain,
    title: 'AI Assistant',
    description:
      'Intelligent bioinformatics copilot that guides your analysis, suggests methods, and interprets results.'
  },
  {
    icon: Database,
    title: 'Database Integration',
    description:
      'Seamless connections to NCBI, UniProt, PDB, Ensembl, KEGG, and other major biological databases.'
  },
  {
    icon: BarChart3,
    title: 'Visualization',
    description:
      'Interactive charts, 3D molecular viewers, genome browsers, and publication-quality figure generation.'
  },
  {
    icon: Users,
    title: 'Collaboration',
    description:
      'Share projects with your team, real-time collaboration features, and organized team workspaces.'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
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

interface FeaturesSectionProps {
  onExploreClick?: () => void;
}

export default function FeaturesSection({ onExploreClick }: FeaturesSectionProps) {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-black dark:via-zinc-950 dark:to-black">
      {/* Rich background layers */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 fine-grid" />
        
        {/* Gradient orbs for visual interest */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/5 dark:bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-400/5 dark:bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-300/3 dark:bg-red-400/3 rounded-full blur-3xl" />
        
        {/* Subtle animated particles - Deterministic positions to avoid hydration mismatch */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400/30 dark:bg-red-400/30"
            style={{
              left: `${12 + (i * 11) % 76}%`,
              top: `${10 + (i * 14) % 78}%`,
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.5, 1],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="relative max-w-7xl mx-auto">
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
            <Sparkles className="w-4 h-4" />
            Powerful Features
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-red-500 dark:to-orange-400 bg-clip-text text-transparent">
              Bioinformatics
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            A comprehensive suite of powerful tools designed to accelerate your research.
            From sequence analysis to molecular docking — all in one unified platform.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: 'easeOut' }
              }}
              className="group relative"
            >
              <div className="relative h-full p-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-red-500/15 hover:border-emerald-300/60 dark:hover:border-red-700/50 transition-all duration-300 overflow-hidden">
                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 dark:from-red-950/40 via-transparent to-teal-50/30 dark:to-orange-950/20 rounded-2xl" />
                </div>

                {/* Icon Container - High visibility */}
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-red-500 dark:to-orange-600 flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20 dark:shadow-red-500/25 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>

                {/* Content - Clear text hierarchy */}
                <div className="relative">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-700 dark:group-hover:text-red-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>

                {/* Corner accent on hover */}
                <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 right-0 w-1 h-8 bg-gradient-to-b from-emerald-500 dark:from-red-500 to-transparent rounded-br" />
                  <div className="absolute top-0 right-0 w-8 h-1 bg-gradient-to-l from-emerald-500 dark:from-red-500 to-transparent rounded-br" />
                </div>

                {/* Bottom line accent */}
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-emerald-300/0 dark:via-red-600/0 to-transparent group-hover:via-emerald-400/60 dark:group-hover:via-red-500/60 transition-all duration-300 rounded-full" />
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom CTA hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-500">
            And many more powerful tools waiting for you{' '}
            <button 
              onClick={onExploreClick}
              className="text-emerald-600 dark:text-red-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
            >
              Explore all tools
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// Additional icons used
function Sparkles(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}

function ArrowRight(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14"/><path d="m12-7 7 7-7 7"/>
    </svg>
  );
}
