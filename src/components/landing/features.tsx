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
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white dark:bg-black">
      {/* Subtle background grid */}
      <div className="absolute inset-0 fine-grid" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            Everything You Need for{' '}
            <span className="text-gradient-primary">Bioinformatics</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-slate-400 leading-relaxed">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
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
              <div className="relative h-full p-6 rounded-2xl border border-gray-200/50 dark:border-white/[0.06] bg-white dark:bg-black backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-green-primary/10 dark:hover:shadow-green-primary/20 hover:border-green-primary/20 dark:hover:border-green-primary/30 transition-all duration-300 overflow-hidden">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-primary/5 dark:from-green-primary/10 via-transparent to-transparent rounded-2xl" />
                </div>

                {/* Icon Container */}
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-green-primary to-green-dark flex items-center justify-center mb-4 shadow-lg shadow-green-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-dark dark:group-hover:text-green-bright transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 right-0 w-1 h-8 bg-gradient-to-b from-green-primary to-transparent rounded-br" />
                  <div className="absolute top-0 right-0 w-8 h-1 bg-gradient-to-l from-green-primary to-transparent rounded-br" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
