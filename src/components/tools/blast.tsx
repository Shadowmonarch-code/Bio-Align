'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import QuickStartGuide from '@/components/ui/quick-start-guide'
import {
  Search,
  ExternalLink,
  Info,
  BookOpen,
  Globe,
  FileText,
  Database,
  Settings,
  Play,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

// ============================================================================
// ORIGINAL TOOL REDIRECTS - BLAST Search Tools
// ============================================================================

interface ToolRedirect {
  id: string
  name: string
  description: string
  url: string
  organization: string
  type: string
  features: string[]
}

const BLAST_TOOLS: ToolRedirect[] = [
  // NCBI BLAST (Primary)
  {
    id: 'ncbi-blast-main',
    name: 'NCBI BLAST',
    description: 'The original and most comprehensive BLAST service. Search against GenBank, RefSeq, PDB, and other NCBI databases.',
    url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi',
    organization: 'NCBI / NIH',
    type: 'Web Application (Official)',
    features: ['blastn', 'blastp', 'blastx', 'tblastn', 'tblastx', 'Primer-BLAST', 'IgBLAST']
  },
  
  // EMBL-EBI BLAST
  {
    id: 'ebi-blast',
    name: 'EMBL-EBI BLAST',
    description: 'European BLAST service with access to European databases (EMBL-ENA, UniProt) and additional features.',
    url: 'https://www.ebi.ac.uk/Tools/sss/ncbiblast/',
    organization: 'EMBL-EBI',
    type: 'Web Application (Official)',
    features: ['Multiple databases', 'Job history', 'REST API', 'Batch submission', 'Programmatic access']
  },

  // Specialized BLAST Tools
  {
    id: 'primer-blast',
    name: 'NCBI Primer-BLAST',
    description: 'Design PCR primers using BLAST to check specificity against NCBI databases.',
    url: 'https://www.ncbi.nlm.nih.gov/tools/primer-blast/',
    organization: 'NCBI / NIH',
    type: 'Web Application (Official)',
    features: ['Primer design', 'Specificity check', 'Template structures', 'Exon-intron boundaries']
  },
  {
    id: 'igblast',
    name: 'NCBI IgBLAST',
    description: 'Specialized BLAST for immunoglobulin sequences. Analyze antibody variable regions.',
    url: 'https://www.ncbi.nlm.nih.gov/projects/igblast/',
    organization: 'NCBI / NIH',
    type: 'Web Application (Official)',
    features: ['Immunoglobulins', 'V(D)J annotation', 'Germline comparison']
  },
  {
    id: 'cd-search',
    name: 'NCBI Conserved Domain Search (CD-Search)',
    description: 'Find conserved domains in protein sequences using RPS-BLAST against CDD database.',
    url: 'https://www.ncbi.nlm.nih.gov/Structure/cdd/wrpsb.cgi',
    organization: 'NCBI / NIH',
    type: 'Web Application (Official)',
    features: ['Domain search', 'Functional sites', '3D structure links', 'Taxonomy']
  },

  // Alternative BLAST Servers
  {
    id: 'blast-npsa',
    name: 'NCBI BLAST+ Command Line',
    description: 'Downloadable BLAST+ software for local high-throughput sequence similarity searches.',
    url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastDocs&DOC_TYPE=Download',
    organization: 'NCBI / NIH',
    type: 'Software Download (Free)',
    features: ['Local execution', 'High throughput', 'Custom databases', 'API included']
  },
  {
    id: 'wb-blast',
    name: 'WU-BLAST (Legacy)',
    description: 'Washington University BLAST - legacy version with some unique features still used in specialized applications.',
    url: 'https://blast.wustl.edu/',
    organization: 'Washington University',
    type: 'Web Application',
    features: ['Legacy format', 'E-value statistics', 'Specialized options']
  }
]

const BLAST_DATABASES = [
  { name: 'nr (Non-redundant proteins)', url: 'https://www.ncbi.nlm.nih.gov/refseq/about_nonredundantproteins/', desc: 'All protein sequences' },
  { name: 'nt (Nucleotide collection)', url: 'https://www.ncbi.nlm.nih.gov/nucleotide/', desc: 'All nucleotide sequences' },
  { name: 'RefSeq', url: 'https://www.ncbi.nlm.nih.gov/refseq/', desc: 'Curated reference sequences' },
  { name: 'PDB', url: 'https://www.rcsb.org/', desc: 'Protein Data Bank' },
  { name: 'Swiss-Prot', url: 'https://www.uniprot.org/', desc: 'Reviewed UniProt entries' },
]

const BLAST_TUTORIALS = [
  { name: 'NCBI BLAST Help Manual', url: 'https://www.ncbi.nlm.nih.gov/books/NBK1762/', desc: 'Official documentation' },
  { name: 'BLAST Tutorial (NCBI)', url: 'https://www.ncbi.nlm.nih.gov/Blast.cgi?CMD=Web&PAGE_TYPE=TutList', desc: 'Step-by-step tutorials' },
  { name: 'Understanding E-values', url: 'https://www.ncbi.nlm.nih.gov/BLAST/tutorial/Altschul-1.html', desc: 'Statistical significance' },
]

// Quick Start Steps for BLAST
const BLAST_QUICK_STEPS = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Prepare Sequence",
    description: "Get your query sequence ready",
    details: ["Paste sequence directly or upload FASTA file", "Minimum 5 characters recommended", "Supports nucleotide (A,T,G,C) and amino acid sequences"]
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Choose Program",
    description: "Select BLAST algorithm",
    details: ["blastn: Nucleotide vs Nucleotide", "blastp: Protein vs Protein", "blastx: Translated DNA vs Protein", "tblastn: Protein vs Translated DNA"]
  },
  {
    icon: <Settings className="w-5 h-5" />,
    title: "Select Database",
    description: "Pick target database to search",
    details: ["nr: Non-redundant proteins (most popular)", "nt: All nucleotide sequences", "RefSeq: Curated reference sequences", "PDB: Protein structures"]
  },
  {
    icon: <Play className="w-5 h-5" />,
    title: "Run & Analyze",
    description: "Execute search and review results",
    details: ["Click 'BLAST' button to start", "Results show in seconds to minutes", "Check E-value (<0.05 is significant)", "Review % identity and alignment"]
  }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BlastSearchModule() {
  const openTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
            <Search className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">BLAST Search</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          Access official BLAST (Basic Local Alignment Search Tool) services from NCBI 
          and EMBL-EBI for authentic sequence similarity searches.
        </p>
      </motion.div>

      {/* Quick Start Guide */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <QuickStartGuide 
          toolName="BLAST"
          steps={BLAST_QUICK_STEPS}
        />
      </motion.div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16" />
        <CardContent className="pt-6 relative">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm flex-shrink-0">
              <Info className="h-6 w-6 text-red-600" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                What is BLAST?
                <Badge className="bg-red-100 text-red-700 border-0">Essential Tool</Badge>
              </h4>
              <p className="text-gray-700 leading-relaxed">
                BLAST finds regions of local similarity between sequences. The program compares 
                nucleotide or protein sequences to sequence databases and calculates the statistical 
                significance of matches. It's one of the most widely used bioinformatics tools.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> E-value
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> % Identity
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Bit Score
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Alignment Length
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured - Main NCBI BLAST */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-xl">
                    <Search className="h-7 w-7 text-white" />
                  </div>
                  NCBI BLAST
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-green-500 text-white px-3 py-1 text-sm">⭐ Official Source</Badge>
                  <Badge variant="outline" className="border-green-300 text-green-700">Most Popular</Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">Free to Use</Badge>
                </div>
              </div>
            </div>
            <p className="text-gray-700 text-base mt-3 leading-relaxed">
              The world's primary resource for finding similarities between biological sequences. 
              Used by millions of researchers worldwide for gene identification, species comparison, and functional annotation.
            </p>
            <p className="text-sm text-green-800 font-semibold mt-2 flex items-center gap-1">
              <Globe className="w-4 h-4" /> National Center for Biotechnology Information (NIH)
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Available Programs */}
            <div className="bg-white/70 rounded-xl p-4">
              <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-green-600" />
                Available BLAST Programs:
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {['blastn', 'blastp', 'blastx', 'tblastn', 'tblastx', 'Primer-BLAST', 'IgBLAST'].map((t) => (
                  <Badge key={t} variant="outline" className="justify-center py-1.5 bg-white hover:bg-green-50 hover:border-green-300 transition-colors cursor-default">{t}</Badge>
                ))}
              </div>
            </div>
            
            {/* CTA Button */}
            <Button 
              onClick={() => openTool('https://blast.ncbi.nlm.nih.gov/Blast.cgi')} 
              size="lg" 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-4 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all group"
            >
              <ExternalLink className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
              Open NCBI BLAST (Official)
              <ArrowRight className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Other BLAST Services */}
      <div className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Additional BLAST Services & Variants</h3>
          <Badge variant="secondary" className="ml-auto">{BLAST_TOOLS.length - 1} tools available</Badge>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BLAST_TOOLS.slice(1).map((tool, index) => (
            <motion.div 
              key={tool.id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full group border-transparent hover:border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base group-hover:text-red-600 transition-colors">
                      {tool.name}
                    </CardTitle>
                    {tool.type.includes('Official') && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs shrink-0">Official</Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="w-fit text-xs mt-1 bg-gray-50">{tool.type}</Badge>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Globe className="w-3 h-3" />{tool.organization}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{tool.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tool.features.slice(0, 3).map((f) => (
                      <Badge key={f} variant="secondary" className="text-xs bg-gray-100 text-gray-700">{f}</Badge>
                    ))}
                  </div>
                  <Button 
                    onClick={() => openTool(tool.url)} 
                    size="sm" 
                    className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all group/btn"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    Open Tool
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Databases Reference */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 bg-amber-400 rounded-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              Common BLAST Databases
              <Badge variant="outline" className="ml-auto border-amber-300">Quick Access</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BLAST_DATABASES.map((db) => (
                <Button 
                  key={db.name} 
                  variant="outline" 
                  onClick={() => openTool(db.url)} 
                  className="justify-start h-auto py-3 px-4 bg-white/80 hover:bg-white hover:shadow-md hover:border-amber-300 transition-all group"
                >
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm text-gray-800 group-hover:text-amber-700 transition-colors">{db.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{db.desc}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0 text-amber-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Learning Resources */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              Learning Resources & Tutorials
              <Badge variant="outline" className="ml-auto border-indigo-300">Learn More</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {BLAST_TUTORIALS.map((r) => (
                <Button 
                  key={r.name} 
                  variant="outline" 
                  onClick={() => openTool(r.url)} 
                  className="justify-start h-auto py-3 px-4 bg-white/80 hover:bg-white hover:shadow-md hover:border-indigo-300 transition-all group"
                >
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm text-gray-800 group-hover:text-indigo-700 transition-colors">{r.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0 text-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default BlastSearchModule
