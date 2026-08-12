'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import {
  CircleDot,
  ExternalLink,
  Info,
  BookOpen,
  Globe
} from 'lucide-react'

// ============================================================================
// ORIGINAL TOOL REDIRECTS - Genomics Tools
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

const GENOMICS_TOOLS: ToolRedirect[] = [
  // Primary Genome Browsers
  {
    id: 'ensembl',
    name: 'Ensembl Genome Browser',
    description: 'Comprehensive genome browser for vertebrate and other eukaryotic species with gene annotation, variation, and comparative genomics.',
    url: 'https://www.ensembl.org/',
    organization: 'EMBL-EBI / Wellcome Sanger Institute',
    type: 'Database (Official)',
    features: ['Gene annotation', 'Variation', 'Comparative genomics', 'REST API', 'BioMart']
  },
  {
    id: 'ucsc-genome-browser',
    name: 'UCSC Genome Browser',
    description: 'Highly customizable genome browser with extensive track data for human and model organisms.',
    url: 'https://genome.ucsc.edu/',
    organization: 'UC Santa Cruz (UCSC)',
    type: 'Database (Official)',
    features: ['Custom tracks', 'Table Browser', 'BLAT', 'Session sharing']
  },
  {
    id: 'ncbi-genome-data-viewer',
    name: 'NCBI Genome Data Viewer (GDV)',
    description: 'NCBI full-featured genome browser for RefSeq assemblies with integrated visualization tools.',
    url: 'https://www.ncbi.nlm.nih.gov/genome/gdv/browser/',
    organization: 'NCBI / NIH',
    type: 'Web Application (Official)',
    features: ['RefSeq genomes', 'Graphical view', 'Sequence download', 'BLAST integration']
  },

  // Analysis Platforms
  {
    id: 'galaxy-project',
    name: 'Galaxy Project',
    description: 'Open, web-based platform for accessible, reproducible, and transparent computational biomedical research.',
    url: 'https://usegalaxy.org/',
    organization: 'Galaxy Community / Penn State',
    type: 'Platform (Free)',
    features: ['Workflow builder', 'Tool integration', 'History', 'Visualization', 'Training']
  },
  {
    id: 'ncbi-variation-services',
    name: 'NCBI Variation Services',
    description: 'Explore genetic variation including SNPs, CNVs, and structural variants across populations.',
    url: 'https://www.ncbi.nlm.nih.gov/snp/',
    organization: 'NCBI / NIH',
    type: 'Database (Official)',
    features: ['dbSNP', 'ClinVar', 'GEO', 'SRA', 'Variant analysis']
  }
]

const GENOME_BROWSERS = [
  { name: 'Ensembl Plants', url: 'https://plants.ensembl.org/', desc: 'Plant genomes' },
  { name: 'Gramene', url: 'https://gramene.org/', desc: 'Comparative plant genomics' },
  { name: 'Phytozome', url: 'https://phytozome-next.jgi.doe.gov/', desc: 'Plant comparative genomics' },
  { name: 'NCBI Assembly', url: 'https://www.ncbi.nlm.nih.gov/assembly/', desc: 'Genome assemblies' },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GenomicsModule() {
  const openTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CircleDot className="h-8 w-8 text-teal-600" />
          <h2 className="text-3xl font-bold text-gray-900">Genomics</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Professional genomics resources including genome browsers, variant databases, 
          and bioinformatics analysis platforms.
        </p>
      </motion.div>

      {/* Info Banner */}
      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-teal-900">About Genomics</h4>
              <p className="text-sm text-teal-700 mt-1">
                Genomics is the study of complete sets of DNA (genomes). Key resources include:
              </p>
              <ul className="list-disc list-inside text-sm text-teal-700 mt-2 space-y-1">
                <li><strong>Genome browsers:</strong> Visualize genes, variants, regulatory elements</li>
                <li><strong>Variation databases:</strong> SNPs, mutations, population genetics</li>
                <li><strong>Analysis platforms:</strong> Galaxy for reproducible workflows</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured - Ensembl */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-teal-400 bg-gradient-to-r from-teal-50 to-cyan-50 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <CircleDot className="h-7 w-7 text-teal-600" />
              Ensembl Genome Browser
              <Badge className="bg-teal-100 text-teal-800">Primary Resource</Badge>
            </CardTitle>
            <p className="text-gray-700 text-base mt-2">
              Comprehensive genome annotation resource with extensive APIs and 
              comparative genomics capabilities.
            </p>
            <p className="text-sm text-teal-700 font-medium mt-1">EMBL-EBI / Wellcome Trust Sanger Institute</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {['Gene Annotation', 'Variation Data', 'Comparative Genomics', 'REST API', 'BioMart'].map((t) => (
                  <Badge key={t} variant="outline" className="justify-center py-1">{t}</Badge>
                ))}
              </div>
              <Button onClick={() => openTool('https://www.ensembl.org/')} size="lg" className="w-full bg-teal-600 hover:bg-teal-700 text-lg py-3">
                <ExternalLink className="h-5 w-5 mr-2" />
                Open Ensembl (Official)
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* All Tools Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Genomics Resources & Tools
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GENOMICS_TOOLS.slice(1).map((tool) => (
            <motion.div key={tool.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{tool.name}</CardTitle>
                  <Badge variant="outline" className="w-fit text-xs">{tool.type}</Badge>
                  <p className="text-xs text-gray-500 mt-1">{tool.organization}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tool.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tool.features.slice(0, 3).map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                  <Button onClick={() => openTool(tool.url)} size="sm" className="w-full bg-teal-600 hover:bg-teal-700">
                    <ExternalLink className="h-3 w-3 mr-1" />Open Resource
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Specialized Genome Browsers */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" />Specialized Genome Browsers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {GENOME_BROWSERS.map((db) => (
              <Button key={db.name} variant="outline" onClick={() => openTool(db.url)} className="justify-start h-auto py-3 px-4">
                <div className="text-left">
                  <div className="font-medium text-sm">{db.name}</div>
                  <div className="text-xs text-gray-500">{db.desc}</div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto flex-shrink-0" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Galaxy Platform - Featured */}
      <Card className="border-purple-300 bg-gradient-to-r from-purple-50 to-violet-50 hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            Galaxy Analysis Platform
            <Badge className="bg-purple-100 text-purple-800">Free & Open Source</Badge>
          </CardTitle>
          <p className="text-gray-600">
            Web-based platform for reproducible computational research. No installation required - run 
            thousands of bioinformatics tools in your browser.
          </p>
          <p className="text-sm text-purple-700 font-medium">Galaxy Community / Penn State University</p>
        </CardHeader>
        <CardContent>
          <Button onClick={() => openTool('https://usegalaxy.org/')} size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
            <ExternalLink className="h-5 w-5 mr-2" />
            Launch Galaxy Platform (Official)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default GenomicsModule
