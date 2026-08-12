'use client'

import { motion } from 'framer-motion'
import { 
  Search, 
  MousePointerClick, 
  ExternalLink, 
  BookOpen,
  ArrowRight,
  Lightbulb,
  Rocket,
  Target,
  CheckCircle2,
  ChevronRight,
  Dna,
  FlaskConical,
  BarChart3,
  Users,
  Globe
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
}

// Step interface for getting started
interface Step {
  number: number
  icon: React.ElementType
  title: string
  description: string
  tips?: string[]
}

// Tool category interface
interface ToolCategory {
  icon: React.ElementType
  title: string
  description: string
  tools: string[]
  color: string
}

// Navigation step interface
interface NavStep {
  icon: React.ElementType
  title: string
  description: string
  action: string
}

// Tip interface
interface Tip {
  icon: React.ElementType
  title: string
  content: string
}

// FAQ item interface
interface FAQItem {
  id: string
  question: string
  answer: string
}

// Getting Started Steps
const gettingStartedSteps: Step[] = [
  {
    number: 1,
    icon: Globe,
    title: 'Create Your Account',
    description: 'Sign up for free using your email, Google, or GitHub account. No credit card required to get started with our comprehensive bioinformatics toolkit.',
    tips: [
      'Use your institutional email for academic benefits',
      'Enable two-factor authentication for security',
      'Complete your profile for personalized recommendations'
    ]
  },
  {
    number: 2,
    icon: Search,
    title: 'Explore Available Tools',
    description: 'Browse our extensive library of 50+ bioinformatics tools organized by category. Use the search function or filter by analysis type to find exactly what you need.',
    tips: [
      'Try the AI-powered tool recommender',
      'Bookmark frequently used tools for quick access',
      'Check out featured workflows for inspiration'
    ]
  },
  {
    number: 3,
    icon: MousePointerClick,
    title: 'Upload Your Data',
    description: 'Upload your sequences, structures, or datasets in any supported format. Our intelligent system auto-detects file types and suggests appropriate analysis tools.',
    tips: [
      'Supported formats: FASTA, FASTQ, GenBank, PDB, VCF, and more',
      'Maximum file size: 500MB (Pro: 2GB)',
      'Drag and drop or use direct database import'
    ]
  },
  {
    number: 4,
    icon: Rocket,
    title: 'Run Analysis & Get Results',
    description: 'Configure your analysis parameters and launch the job. Monitor progress in real-time, then explore interactive results with publication-ready visualizations.',
    tips: [
      'Results are stored securely for 30 days (free) / 1 year (Pro)',
      'Export in multiple formats including PDF, SVG, and raw data',
      'Share results with collaborators via secure links'
    ]
  }
]

// Tool Categories
const toolCategories: ToolCategory[] = [
  {
    icon: Dna,
    title: 'Sequence Analysis',
    description: 'DNA/RNA sequence tools for alignment, translation, and pattern discovery',
    tools: ['BLAST', 'Multiple Alignment', 'ORF Finder', 'Primer Design', 'Motif Search'],
    color: 'from-[#C1121F] to-[#A01D2C]'
  },
  {
    icon: FlaskConical,
    title: 'Protein Analysis',
    description: 'Structure prediction, properties calculation, and domain identification',
    tools: ['Structure Prediction', 'Physicochemical Properties', 'Domain Finder', 'TMHMM'],
    color: 'from-[#C1121F] to-[#7A1420]'
  },
  {
    icon: BarChart3,
    title: 'Genomics & Expression',
    description: 'Genome browsing, variant analysis, and transcriptomics pipelines',
    tools: ['Genome Browser', 'Variant Calling', 'RNA-seq Analysis', 'DEG Analysis'],
    color: 'from-[#9B1B30] to-[#7A1420]'
  },
  {
    icon: Users,
    title: 'Phylogenetics & Evolution',
    description: 'Tree building, evolutionary analysis, and species comparison',
    tools: ['Tree Builder', 'Bootstrap Analysis', 'Distance Matrix', 'Consensus Tree'],
    color: 'from-[#C1121F] to-[#8B1528]'
  }
]

// Navigation Steps
const navigationSteps: NavStep[] = [
  {
    icon: BookOpen,
    title: 'Use the Main Navigation',
    description: 'Access all major sections from the top navigation bar including Tools, Projects, Documentation, and Community resources.',
    action: 'Click on any nav item to expand sub-menus'
  },
  {
    icon: Target,
    title: 'Tool Discovery Page',
    description: 'Browse tools by category, popularity, or recent updates. Each tool card shows key features and estimated runtime.',
    action: 'Use filters to narrow down by organism, data type, or analysis type'
  },
  {
    icon: ExternalLink,
    title: 'Quick Actions Panel',
    description: 'Access recently used tools, ongoing jobs, and saved projects from the sidebar for efficient workflow management.',
    action: 'Pin your favorite tools for instant access'
  }
]

// Tips for Best Results
const bestTips: Tip[] = [
  {
    icon: Lightbulb,
    title: 'Start Simple, Then Refine',
    content: 'Begin with default parameters for your first analysis. Once you understand the baseline results, adjust parameters systematically to optimize for your specific research questions.'
  },
  {
    icon: CheckCircle2,
    title: 'Validate Your Data First',
    content: 'Always run quality control checks before main analyses. Use our built-in QC tools to identify issues like low-quality sequences, contamination, or format errors early.'
  },
  {
    icon: ArrowRight,
    title: 'Chain Analyses Together',
    content: 'Our pipeline feature lets you connect output from one tool as input to another. Build reproducible workflows that save time and ensure consistency across projects.'
  },
  {
    icon: Rocket,
    title: 'Leverage AI Assistance',
    content: 'Our AI copilot can help interpret results, suggest next steps, and even recommend optimal parameters based on your data characteristics and research goals.'
  }
]

// FAQ Items
const faqItems: FAQItem[] = [
  {
    id: 'account-setup',
    question: 'How do I set up my account and what are the requirements?',
    answer: 'Creating an account is simple and free! Just click "Sign Up" and choose your preferred method: email/password, Google OAuth, or GitHub authentication. No special requirements needed—just a valid email address. Academic users can verify their status for extended free tier benefits including additional storage and premium tool access.'
  },
  {
    id: 'file-upload',
    question: 'What files can I upload and how do I prepare them?',
    answer: 'We support all major bioinformatics formats: FASTA, FASTQ, GenBank, EMBL, PDB, VCF, BAM/SAM, BED, GFF/GTF, Newick trees, CSV/TSV, and more. Files should be properly formatted and under the size limit (500MB free, 2GB Pro). Our auto-detection will identify the format, but you can also specify it manually. For large datasets, consider using our direct database import from NCBI, UniProt, or Ensembl.'
  },
  {
    id: 'tool-selection',
    question: 'How do I choose the right tool for my analysis?',
    answer: 'Each tool page includes detailed descriptions, example use cases, and input/output specifications. Use our AI-powered tool recommender—simply describe your goal and upload a sample of your data, and we\'ll suggest the best options. You can also browse by category, compare similar tools side-by-side, or check our pre-built workflow templates for common analysis types.'
  },
  {
    id: 'results-interpretation',
    question: 'How do I interpret and export my results?',
    answer: 'Results are presented with interactive visualizations, downloadable tables, and detailed explanations. Each result includes an interpretation guide specific to that analysis type. Export options include publication-ready figures (PDF, SVG, PNG), raw data files, and shareable interactive reports. Our AI assistant can also help explain complex results in plain language.'
  },
  {
    id: 'troubleshooting',
    question: 'What if my analysis fails or gives unexpected results?',
    answer: 'First, check the job log for error messages and warnings. Common issues include unsupported characters in sequences, files exceeding size limits, or incompatible parameter combinations. Our help documentation includes troubleshooting guides for each tool. If you need further assistance, contact support or post in our community forum—we typically respond within hours.'
  },
  {
    id: 'collaboration',
    question: 'Can I work with my team on the same project?',
    answer: 'Absolutely! Collaboration is a core feature. Create shared workspaces, invite team members with role-based permissions (Admin, Editor, Viewer), and see real-time changes. Comments and annotations can be added to any analysis. Enterprise plans include advanced features like SSO, audit logs, and centralized billing.'
  }
]

export default function HowToUseGuide() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C1121F]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C1121F]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C1121F]/10 text-[#C1121F] text-sm font-medium mb-6"
          >
            <BookOpen className="w-4 h-4" />
            User Guide
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            How to{' '}
            <span className="text-[#C1121F]">Get Started</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Follow these step-by-step guides to make the most of our bioinformatics platform.
            From your first analysis to advanced workflows — we&apos;ve got you covered.
          </p>
        </motion.div>

        {/* Getting Started Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mb-24"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Getting Started
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              New to BioAlign? Follow these four simple steps to run your first analysis in minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {gettingStartedSteps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: 'easeOut' }
                }}
                className="group relative"
              >
                <div className="relative h-full p-6 lg:p-8 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 overflow-hidden">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C1121F]/5 via-transparent to-transparent rounded-2xl" />
                  </div>

                  {/* Step Number & Icon */}
                  <div className="flex items-start gap-5 mb-5">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C1121F] to-[#9B1B30] flex items-center justify-center shadow-lg shadow-[#C1121F]/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <step.icon className="w-7 h-7 text-white" strokeWidth={2} />
                      </div>
                      {/* Step Number Badge */}
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#C1121F] text-white text-sm font-bold flex items-center justify-center shadow-md">
                        {step.number}
                      </div>
                    </div>

                    <div className="flex-1 pt-1">
                      <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#C1121F] transition-colors duration-300">
                        {step.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Tips */}
                  {step.tips && (
                    <div className="space-y-2 pl-[68px]">
                      {step.tips.map((tip, tipIndex) => (
                        <motion.div
                          key={tipIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: tipIndex * 0.1 + 0.2 }}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <ChevronRight className="w-3 h-3 text-[#C1121F] mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-1 h-8 bg-gradient-to-b from-[#C1121F] to-transparent rounded-br" />
                    <div className="absolute top-0 right-0 w-8 h-1 bg-gradient-to-l from-[#C1121F] to-transparent rounded-br" />
                  </div>
                </div>

                {/* Connector line (except last item on desktop) */}
                {index < gettingStartedSteps.length - 1 && index % 2 === 0 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-[#C1121F]/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Understanding Tool Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <motion.div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Understanding Tool Categories
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our tools are organized into intuitive categories to help you find exactly what you need.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {toolCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                <div className="h-full p-6 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 overflow-hidden">
                  {/* Gradient header bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${category.color} opacity-80`} />

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <category.icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#C1121F] transition-colors duration-300">
                    {category.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Tools list */}
                  <div className="flex flex-wrap gap-1.5">
                    {category.tools.map((tool) => (
                      <span
                        key={tool}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-[#C1121F]/10 text-[#C1121F]/80 group-hover:bg-[#C1121F]/15 transition-colors duration-300"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How to Navigate Tools Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mb-24"
        >
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              How to Navigate Tools
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Learn the most efficient ways to find and access the tools you need.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {navigationSteps.map((navStep, index) => (
              <motion.div
                key={navStep.title}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                <div className="h-full p-6 lg:p-8 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300">
                  {/* Icon with decorative ring */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 w-16 h-16 rounded-full bg-[#C1121F]/10 group-hover:bg-[#C1121F]/20 transition-colors duration-300 animate-pulse-slow" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#C1121F] to-[#9B1B30] flex items-center justify-center shadow-lg shadow-[#C1121F]/20 group-hover:scale-110 transition-transform duration-300">
                      <navStep.icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="text-xl font-semibold text-foreground mb-3 group-hover:text-[#C1121F] transition-colors duration-300">
                    {navStep.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {navStep.description}
                  </p>

                  {/* Action hint */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-[#C1121F]/5 group-hover:bg-[#C1121F]/10 transition-colors duration-300">
                    <ChevronRight className="w-4 h-4 text-[#C1121F] mt-0.5 flex-shrink-0" />
                    <span className="text-xs font-medium text-[#C1121F]/90">
                      {navStep.action}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips for Best Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mb-24"
        >
          <motion.div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-sm font-medium mb-4">
              <Lightbulb className="w-4 h-4" />
              Pro Tips
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Tips for Best Results
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Expert recommendations to maximize the quality and efficiency of your analyses.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bestTips.map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group"
              >
                <div className="h-full p-6 lg:p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-900/60 dark:to-gray-900/40 backdrop-blur-xl shadow-sm hover:shadow-xl hover:shadow-[#C1121F]/10 hover:border-[#C1121F]/20 transition-all duration-300 relative overflow-hidden">
                  {/* Decorative background element */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-[#C1121F]/5 group-hover:bg-[#C1121F]/10 transition-colors duration-300" />

                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#C1121F]/10 to-[#C1121F]/5 flex items-center justify-center group-hover:from-[#C1121F] group-hover:to-[#9B1B30] transition-all duration-300">
                        <tip.icon className="w-6 h-6 text-[#C1121F] group-hover:text-white transition-colors duration-300" strokeWidth={2} />
                      </div>

                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#C1121F] transition-colors duration-300">
                          {tip.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tip.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Accordion Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <motion.div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Frequently Asked Questions
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Quick answers to common questions about using BioAlign effectively.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <AccordionItem
                    value={item.id}
                    className="group border border-border/50 bg-card/70 backdrop-blur-xl rounded-xl px-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 data-[state=open]:shadow-lg data-[state=open]:border-primary/30 data-[state=open]:bg-card/90 overflow-hidden"
                  >
                    <AccordionTrigger className="py-5 text-left hover:no-underline group">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#C1121F]/10 flex items-center justify-center text-[#C1121F] font-bold text-sm group-data-[state=open]:from-[#C1121F] group-data-[state=open]:to-[#9B1B30] group-data-[state=open]:text-white transition-all duration-300">
                          Q{index + 1}
                        </div>
                        <span className="font-semibold text-base sm:text-lg text-foreground group-hover:text-[#C1121F] transition-colors duration-300 text-left">
                          {item.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 pl-12 pr-4">
                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                        {item.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#C1121F] via-[#A01D2C] to-[#7A1420] p-8 sm:p-12 lg:p-16 text-center">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <Rocket className="w-8 h-8 text-white" strokeWidth={2} />
              </motion.div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Start Your Analysis?
              </h3>
              <p className="max-w-xl mx-auto text-white/80 mb-8 text-lg">
                Join thousands of researchers who trust BioAlign for their bioinformatics needs.
                Get started in minutes with our free tier.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 rounded-xl transition-all duration-300">
                  View Documentation
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
