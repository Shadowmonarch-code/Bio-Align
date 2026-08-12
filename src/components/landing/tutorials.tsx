'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Play, 
  Clock, 
  BarChart3, 
  Dna, 
  FlaskConical,
  FileText,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Code,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Tutorials data
const tutorials = [
  {
    id: 'beginner',
    title: 'Beginner Tutorials',
    icon: BookOpen,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-600 dark:text-green-400',
    items: [
      {
        title: 'Getting Started with BioAlign',
        duration: '10 min',
        level: 'Beginner',
        description: 'Learn the basics of navigating the platform, uploading files, and running your first analysis.',
        steps: ['Create your account', 'Upload a FASTA file', 'Run BLAST analysis', 'Interpret results'],
      },
      {
        title: 'Understanding Sequence Formats',
        duration: '15 min',
        level: 'Beginner',
        description: 'Master FASTA, FASTQ, GenBank, and other common bioinformatics file formats.',
        steps: ['FASTA format basics', 'Quality scores in FASTQ', 'GenBank annotations', 'Format conversion'],
      },
      {
        title: 'Your First BLAST Search',
        duration: '20 min',
        level: 'Beginner',
        description: 'Step-by-step guide to performing and interpreting BLAST sequence similarity searches.',
        steps: ['Select database', 'Configure parameters', 'Run search', 'Analyze results'],
      },
    ],
  },
  {
    id: 'intermediate',
    title: 'Intermediate Tutorials',
    icon: Code,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-600 dark:text-blue-400',
    items: [
      {
        title: 'Multiple Sequence Alignment',
        duration: '25 min',
        level: 'Intermediate',
        description: 'Learn how to align multiple sequences using ClustalW, MUSCLE, and MAFFT algorithms.',
        steps: ['Prepare sequences', 'Choose algorithm', 'Configure alignment', 'Visualize results'],
      },
      {
        title: 'Primer Design with BioAlign',
        duration: '30 min',
        level: 'Intermediate',
        description: 'Design PCR primers with optimal melting temperatures, GC content, and specificity.',
        steps: ['Input target sequence', 'Set parameters', 'Check specificity', 'Export primers'],
      },
      {
        title: 'Phylogenetic Tree Construction',
        distance: '35 min',
        level: 'Intermediate',
        description: 'Build evolutionary trees from sequence data using various methods.',
        steps: ['Multiple alignment', 'Choose model', 'Build tree', 'Bootstrap analysis'],
      },
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Tutorials',
    icon: FlaskConical,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-600 dark:text-purple-400',
    items: [
      {
        title: 'RNA-seq Analysis Pipeline',
        duration: '45 min',
        level: 'Advanced',
        description: 'Complete workflow for analyzing RNA sequencing data from raw reads to differential expression.',
        steps: ['Quality control', 'Read alignment', 'Quantification', 'DEG analysis'],
      },
      {
        title: 'Variant Calling & Annotation',
        duration: '40 min',
        level: 'Advanced',
        description: 'Identify genetic variants from NGS data and annotate their functional impact.',
        steps: ['Preprocess BAM files', 'Call variants', 'Filter variants', 'Annotate with VEP'],
      },
      {
        title: 'Protein Structure Prediction',
        duration: '50 min',
        level: 'Advanced',
        description: 'Predict protein structures using AlphaFold and analyze structural features.',
        steps: ['Prepare sequence', 'Run prediction', 'Analyze domains', 'Validate model'],
      },
    ],
  },
];

// Video resources
const videoResources = [
  { title: 'BioAlign Platform Overview', url: '#', duration: '5:30' },
  { title: 'BLAST Analysis Deep Dive', url: '#', duration: '12:45' },
  { title: 'Working with AI Assistant', url: '#', duration: '8:20' },
  { title: 'Data Visualization Tips', url: '#', duration: '10:15' },
];

interface TutorialsProps {
  onBack?: () => void;
}

export default function TutorialsSection({ onBack }: TutorialsProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 text-white py-16"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 text-white/70 hover:text-white hover:bg-white/10"
            >
              ← Back to Home
            </Button>
          )}
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="size-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Tutorials</h1>
              <p className="text-white/70 mt-1">Learn bioinformatics step by step</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-8 mt-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">9+</p>
              <p className="text-white/60 text-sm">Tutorials</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">4h+</p>
              <p className="text-white/60 text-sm">Content</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">3</p>
              <p className="text-white/60 text-sm">Levels</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Tutorial Categories */}
        {tutorials.map((category) => (
          <motion.section
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            id={category.id}
            className="scroll-mt-24"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`size-10 rounded-xl ${category.bgColor} flex items-center justify-center`}>
                <category.icon className={`size-5 ${category.textColor}`} />
              </div>
              <h2 className="text-2xl font-bold">{category.title}</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${category.color} text-white`}>
                {category.items.length} tutorials
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((tutorial, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="bg-card border rounded-xl overflow-hidden hover:border-emerald-500/30 hover:shadow-lg transition-all group"
                >
                  {/* Card Header */}
                  <div className={`h-2 bg-gradient-to-r ${category.color}`} />
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold group-hover:text-emerald-500 transition-colors line-clamp-2">
                        {tutorial.title}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {tutorial.description}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {tutorial.duration}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        tutorial.level === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        tutorial.level === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {tutorial.level}
                      </span>
                    </div>
                    
                    {/* Steps Preview */}
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">What you'll learn:</p>
                      {(tutorial.steps || []).slice(0, 3).map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-emerald-500 group-hover:text-white cursor-pointer"
                    >
                      Start Learning
                      <ChevronRight className="size-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}

        {/* Video Resources Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white"
        >
          <div className="flex items-center gap-3 mb-6">
            <Play className="size-6 text-red-500" />
            <h2 className="text-2xl font-bold">Video Resources</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {videoResources.map((video, idx) => (
              <a
                key={idx}
                href={video.url}
                className="group block bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all no-underline"
              >
                <div className="aspect-video bg-black/30 rounded-lg mb-3 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <Play className="size-10 text-white/50 group-hover:text-red-500 transition-colors" />
                </div>
                <h4 className="font-medium text-sm group-hover:text-emerald-500 transition-colors">{video.title}</h4>
                <p className="text-xs text-white/50">{video.duration}</p>
              </a>
            ))}
          </div>
        </motion.section>

        {/* Pro Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-emerald-500/10 to-orange-500/10 border border-emerald-500/20 rounded-2xl p-6 flex gap-4"
        >
          <Lightbulb className="size-6 text-emerald-500 shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Learning Path Recommendation</h3>
            <p className="text-muted-foreground text-sm">
              We recommend starting with beginner tutorials even if you have experience, as they introduce BioAlign-specific workflows. 
              Complete each level before moving to the next for best results.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
