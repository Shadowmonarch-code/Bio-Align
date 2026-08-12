'use client';

import { motion } from 'framer-motion';
import { Database, Globe, FlaskConical, Dna } from 'lucide-react';

// Partner database logos (text-based since we don't have actual images)
const partners = [
  { name: 'NCBI', fullName: 'National Center for Biotechnology Information', icon: Database },
  { name: 'UniProt', fullName: 'Universal Protein Resource', icon: Dna },
  { name: 'PDB', fullName: 'Protein Data Bank', icon: Globe },
  { name: 'Ensembl', fullName: 'Genome Browser', icon: Database },
  { name: 'KEGG', fullName: 'Kyoto Encyclopedia of Genes and Genomes', icon: FlaskConical },
  { name: 'Reactome', fullName: 'Pathway Database', icon: Dna },
  { name: 'EMBL-EBI', fullName: 'European Bioinformatics Institute', icon: Globe },
  { name: 'SwissProt', fullName: 'Protein Knowledgebase', icon: Database },
  { name: 'AlphaFold', fullName: 'AI Protein Structure', icon: Dna },
  { name: 'Pfam', fullName: 'Protein Families Database', icon: Database },
  { name: 'InterPro', fullName: 'Protein Domains & Families', icon: Globe },
  { name: 'STRING', fullName: 'Protein Interaction Network', icon: Dna },
  { name: 'GEO', fullName: 'Gene Expression Omnibus', icon: Database },
  { name: 'ClinVar', fullName: 'Clinical Variants', icon: FlaskConical },
  { name: 'dbSNP', fullName: 'Single Nucleotide Polymorphisms', icon: Database },
  { name: 'GO', fullName: 'Gene Ontology', icon: Globe },
];

// Duplicate partners for seamless infinite scroll
const duplicatedPartners = [...partners, ...partners];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function PartnersSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-background">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/50 mb-4"
          >
            <Database className="w-3.5 h-3.5" />
            Trusted Integration
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
            Integrated with{' '}
            <span className="text-emerald-500">Leading Databases</span>
          </h2>
          <p className="max-w-xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            Direct access to the world's most comprehensive biological data repositories for your research.
          </p>
        </motion.div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Gradient masks for smooth fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div className="overflow-hidden py-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex animate-marquee"
            >
              {duplicatedPartners.map((partner, index) => (
                <PartnerLogo key={`${partner.name}-${index}`} partner={partner} />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
        >
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Real-time sync</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>15+ databases</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Dna className="w-4 h-4" />
              <span>API access</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Custom styles for marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 40s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

// Individual Partner Logo Component
function PartnerLogo({ partner }: { partner: typeof partners[0] }) {
  const Icon = partner.icon;

  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      className="group flex-shrink-0 mx-3 md:mx-5 flex flex-col items-center justify-center p-4 md:p-6 rounded-xl 
                 bg-card/60 backdrop-blur-sm border border-border/50 
                 hover:border-primary/30 hover:bg-card
                 transition-all duration-300 min-w-[100px] md:min-w-[130px]"
      title={partner.fullName}
    >
      {/* Logo Icon */}
      <div className="relative mb-2 md:mb-3 grayscale group-hover:grayscale-0 transition-all duration-300">
        <Icon className="w-6 h-6 md:w-8 md:h-8 text-gray-500 group-hover:text-emerald-500 transition-colors duration-300" />
        
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-emerald-500/30 scale-150 -z-10" />
      </div>

      {/* Logo Name */}
      <span className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400 
                       group-hover:text-foreground transition-colors duration-300 tracking-wide">
        {partner.name}
      </span>

      {/* Hover underline effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-0.5 bg-emerald-500 rounded-full transition-all duration-300" />
    </a>
  );
}
