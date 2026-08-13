'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { HelpCircle, FileText, Shield, DollarSign, GitBranch, Code, Users, Database, Smartphone, Rocket } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  icon: React.ElementType
}

const faqItems: FAQItem[] = [
  {
    id: 'what-is-bioalign',
    question: 'What is BioAlign?',
    answer:
      'BioAlign is a comprehensive, cloud-based bioinformatics platform that brings together over 50 specialized tools for sequence analysis, protein analysis, genomics, transcriptomics, phylogenetics, molecular docking, and more. It\'s designed to streamline your research workflow by eliminating the need to switch between multiple tools and platforms.',
    icon: HelpCircle
  },
  {
    id: 'file-formats',
    question: 'What file formats are supported?',
    answer:
      'BioAlign supports all major bioinformatics file formats including FASTA, FASTQ, GenBank, EMBL, PDB, VCF, BAM/SAM, BED, GFF/GTF, Newick (phylogenetic trees), CSV/TSV, and many more. Our intelligent auto-detection system automatically recognizes file types and suggests appropriate analysis tools.',
    icon: FileText
  },
  {
    id: 'data-security',
    question: 'Is my data secure?',
    answer:
      'Absolutely. Security is our top priority. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II certified and fully GDPR compliant. Your research data is stored in geographically distributed data centers with automatic backups. We never share or sell your data, and you maintain full ownership of all your analyses and results.',
    icon: Shield
  },
  {
    id: 'free-tier',
    question: 'Can I use BioAlign for free?',
    answer:
      'Yes! BioAlign offers a generous free tier that includes access to core analysis tools, up to 5 projects, 1GB of storage, and basic visualization features. This is perfect for students, individual researchers, or anyone wanting to explore the platform. For advanced features like AI assistance, team collaboration, API access, and higher storage limits, check out our Pro and Enterprise plans.',
    icon: DollarSign
  },
  {
    id: 'comparison',
    question: 'How does it compare to other tools?',
    answer:
      'Unlike single-purpose tools or complex command-line software, BioAlign provides a unified, intuitive interface for all major bioinformatics tasks. Key advantages include: seamless integration between tools (output from one becomes input for another), built-in visualization and publication-ready figure generation, AI-powered guidance, real-time collaboration, and no installation or maintenance required. Many researchers report 3-5x productivity gains compared to traditional workflows.',
    icon: GitBranch
  },
  {
    id: 'api-access',
    question: 'Do you offer API access?',
    answer:
      'Yes, we provide a comprehensive RESTful API with full documentation, SDKs for Python, R, and JavaScript, and webhook support for automated workflows. The API allows you to programmatically submit jobs, retrieve results, manage projects, and integrate BioAlign into your existing pipelines. API access is available on Pro and Enterprise plans.',
    icon: Code
  },
  {
    id: 'collaboration',
    question: 'Can I collaborate with my team?',
    answer:
      'Collaboration is a core feature of BioAlign. You can create shared workspaces, invite team members with role-based permissions (Admin, Editor, Viewer), leave comments on analyses, track version history, and see real-time updates when teammates make changes. Enterprise plans also include SSO integration, audit logs, and advanced admin controls.',
    icon: Users
  },
  {
    id: 'databases',
    question: 'What databases are integrated?',
    answer:
      'BioAlign seamlessly connects to all major biological databases including NCBI (GenBank, PubMed, BLAST), UniProt, PDB, Ensembl, KEGG, Reactome, GO, Pfam, InterPro, RefSeq, dbSNP, ClinVar, and more. You can search, retrieve, and analyze data directly within the platform without manual downloads or format conversions.',
    icon: Database
  },
  {
    id: 'mobile-support',
    question: 'Is there mobile support?',
    answer:
      'Yes! BioAlign offers responsive web access that works beautifully on tablets and mobile devices. While computationally intensive analyses run on our servers, you can monitor job progress, view results, manage projects, and collaborate with your team from any device. We also offer native iOS and Android apps for quick status checks and notifications.',
    icon: Smartphone
  },
  {
    id: 'getting-started',
    question: 'How do I get started?',
    answer:
      'Getting started is easy! Simply sign up for a free account (email, Google, or GitHub), and you\'ll be guided through an interactive tutorial that covers the basics. Our documentation includes video tutorials, step-by-step guides, and example workflows. For personalized help, join our community Slack channel or schedule a demo with our team. Most users complete their first analysis within 10 minutes of signing up!',
    icon: Rocket
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const
    }
  }
}

export default function FAQSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[red-primary]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[red-primary]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Frequently Asked{' '}
            <span className="text-[red-primary]">Questions</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Everything you need to know about BioAlign. Can&apos;t find what you&apos;re looking for?
            Feel free to contact our support team.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <AccordionItem
                  value={item.id}
                  className="group border border-border/50 bg-card/70 backdrop-blur-xl rounded-xl px-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 data-[state=open]:shadow-lg data-[state=open]:border-primary/30 data-[state=open]:bg-card/90 overflow-hidden"
                >
                  <AccordionTrigger className="py-5 text-left hover:no-underline group">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[red-primary]/10 to-[red-primary]/5 flex items-center justify-center group-data-[state=open]:from-[red-primary] group-data-[state=open]:to-[red-dark] transition-all duration-300">
                        <item.icon className="w-5 h-5 text-[red-primary] group-data-[state=open]:text-white transition-colors duration-300" />
                      </div>
                      <span className="font-semibold text-base sm:text-lg text-foreground group-hover:text-[red-primary] transition-colors duration-300">
                        {item.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pl-14 pr-4">
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[red-primary]/5 via-white/80 to-orange-500/5 dark:from-[red-primary]/10 dark:via-gray-900/40 dark:to-orange-500/5 backdrop-blur-sm border border-border/50">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <p className="text-foreground font-medium">
                Still have questions?
              </p>
              <button className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[red-primary] hover:bg-[#9B0F1A] rounded-lg shadow-md shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-300 hover:-translate-y-0.5">
                Contact Support
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
            <span className="hidden sm:block w-px h-8 bg-border" />
            <p className="text-sm text-muted-foreground">
              Or join our{' '}
              <a href="#" className="text-[red-primary] hover:underline font-medium">
                Community Slack
              </a>{' '}
              for instant help
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
