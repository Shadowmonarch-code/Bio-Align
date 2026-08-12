'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  ExternalLink,
  Info,
  BookOpen,
  Globe,
  Download
} from 'lucide-react'

// ============================================================================
// ORIGINAL TOOL REDIRECTS - Sequence Alignment Tools
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

const ALIGNMENT_TOOLS: ToolRedirect[] = [
  // Primary Web Tools
  {
    id: 'clustal-omega',
    name: 'Clustal Omega',
    description: 'Multiple sequence alignment program for proteins and DNA/RNA. Handles large numbers of sequences efficiently.',
    url: 'https://www.ebi.ac.uk/Tools/msa/clustalo/',
    organization: 'EMBL-EBI',
    type: 'Web Application (Free)',
    features: ['MSA', 'Fast', 'Large datasets', 'Profile alignment', 'Guides available']
  },
  {
    id: 'muscle',
    name: 'MUSCLE',
    description: 'Multiple sequence comparison by log-expectation. One of the highest-quality MSA algorithms available.',
    url: 'https://www.ebi.ac.uk/Tools/msa/muscle/',
    organization: 'EMBL-EBI',
    type: 'Web Application (Free)',
    features: ['High accuracy', 'MSA', 'Fast mode', 'Refinement']
  },
  {
    id: 'mafft',
    name: 'MAFFT',
    description: 'Multiple alignment using fast Fourier transform. Excellent for sequences with complex domain structures.',
    url: 'https://mafft.cbrc.jp/alignment/server/',
    organization: 'CBRC Japan',
    type: 'Web Application (Free)',
    features: ['FFT-based', 'Structural RNA', 'Large alignments', 'Multiple modes']
  },
  {
    id: 't-coffee',
    name: 'T-Coffee',
    description: 'Tree-based Consistency Objective Function for alignment Evaluation. Produces high-quality MSAs.',
    url: 'https://www.ebi.ac.uk/Tools/msa/tcoffee/',
    organization: 'EMBL-EBI / CNRS',
    type: 'Web Application (Free)',
    features: ['Consistency-based', 'Template modes', 'Evaluation scores']
  },

  // Pairwise Alignment
  {
    id: 'needle-wunsch',
    name: 'EMBOSS Needle',
    description: 'Global pairwise alignment using Needleman-Wunsch algorithm. Optimal global alignment of two sequences.',
    url: 'https://www.ebi.ac.uk/Tools/psa/emboss_needle/',
    organization: 'EMBL-EBI',
    type: 'Web Application (Free)',
    features: ['Global alignment', 'Needleman-Wunsch', 'Score matrix', 'Gap penalties']
  },
  {
    id: 'smith-waterman',
    name: 'EMBOSS Water',
    description: 'Local pairwise alignment using Smith-Waterman algorithm. Find best local matching regions.',
    url: 'https://www.ebi.ac.uk/Tools/psa/emboss_water/',
    organization: 'EMBL-EBI',
    type: 'Web Application (Free)',
    features: ['Local alignment', 'Smith-Waterman', 'Optimal local match']
  },

  // Desktop Software
  {
    id: 'mega-alignment',
    name: 'MEGA Software',
    description: 'Molecular Evolutionary Genetics Analysis - Comprehensive software for alignment and phylogenetics.',
    url: 'https://www.megasoftware.net/',
    organization: 'Temple University / ASU',
    type: 'Free Desktop Software',
    features: ['MSA', 'Phylogenetics', 'Evolutionary analysis', 'GUI']
  },
  {
    id: 'bioedit',
    name: 'BioEdit',
    description: 'Biological sequence alignment editor for Windows with integrated tools.',
    url: 'http://en.bio-soft.net/format/BioEdit.html',
    organization: 'Tom Hall',
    type: 'Free Windows Software',
    features: ['Sequence editor', 'Alignment', 'Annotation', 'Chromatograms']
  }
]

const ONLINE_SERVERS = [
  { name: 'Kalign', url: 'https://www.ebi.ac.uk/Tools/msa/kalign/', desc: 'Very fast MSA' },
  { name: 'MAVIS', url: 'https://www.ebi.ac.uk/Tools/msa/mavis/', desc: 'Multiple sequence alignment' },
  { name: 'ProbCons', url: 'https://probcons.stanford.edu/', desc: 'Probabilistic consistency' },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AlignmentModule() {
  const openTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Layers className="h-8 w-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900">Sequence Alignment</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Professional multiple and pairwise sequence alignment tools from EMBL-EBI 
          and other authoritative sources.
        </p>
      </motion.div>

      {/* Info Banner */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-purple-900">About Sequence Alignment</h4>
              <p className="text-sm text-purple-700 mt-1">
                Sequence alignment arranges DNA, RNA, or protein sequences to identify regions of similarity.
                Essential for:
              </p>
              <ul className="list-disc list-inside text-sm text-purple-700 mt-2 space-y-1">
                <li><strong>Homology detection:</strong> Finding evolutionary relationships</li>
                <li><strong>Domain identification:</strong> Discovering functional regions</li>
                <li><strong>Phylogenetics:</strong> Building evolutionary trees</li>
                <li><strong>Structure prediction:</strong> Template-based modeling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Tools - Clustal Omega */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Layers className="h-7 w-7 text-green-600" />
              Clustal Omega
              <Badge className="bg-green-100 text-green-800">Recommended</Badge>
            </CardTitle>
            <p className="text-gray-700 text-base">
              The most popular web-based multiple sequence alignment tool. Fast, accurate, and handles thousands of sequences.
            </p>
            <p className="text-sm text-green-700 font-medium">European Bioinformatics Institute (EMBL-EBI)</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {['Protein MSA', 'DNA/RNA MSA', 'Fast Mode', 'Profile Align', 'Guide Tree'].map((t) => (
                  <Badge key={t} variant="outline" className="justify-center py-1">{t}</Badge>
                ))}
              </div>
              <Button onClick={() => openTool('https://www.ebi.ac.uk/Tools/msa/clustalo/')} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
                <ExternalLink className="h-5 w-5 mr-2" />
                Open Clustal Omega (Official)
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Multiple Sequence Alignment */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Multiple Sequence Alignment (MSA)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALIGNMENT_TOOLS.slice(1, 4).map((tool) => (
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
                    {tool.features.slice(0, 3).map((f) => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}
                  </div>
                  <Button onClick={() => openTool(tool.url)} size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                    <ExternalLink className="h-3 w-3 mr-1" />Open Tool
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pairwise Alignment */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Pairwise Alignment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALIGNMENT_TOOLS.slice(4, 6).map((tool) => (
            <Card key={tool.id} className="hover:shadow-md transition-shadow h-full border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {tool.name}
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Global/Local</Badge>
                </CardTitle>
                <p className="text-xs text-blue-700">{tool.organization}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                <Button onClick={() => openTool(tool.url)} size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="h-3 w-3 mr-1" />Launch Tool
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Desktop Software */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Desktop Software (Download)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALIGNMENT_TOOLS.slice(6).map((tool) => (
            <Card key={tool.id} className="hover:shadow-md transition-shadow h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{tool.name}</CardTitle>
                <Badge variant="outline" className="w-fit text-xs">{tool.type}</Badge>
                <p className="text-xs text-gray-500 mt-1">{tool.organization}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tool.description}</p>
                <Button onClick={() => openTool(tool.url)} size="sm" variant="outline" className="w-full">
                  <ExternalLink className="h-3 w-3 mr-1" />Visit Website
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Servers */}
      <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" />Additional Alignment Servers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ONLINE_SERVERS.map((s) => (
              <Button key={s.name} variant="outline" onClick={() => openTool(s.url)} className="justify-start h-auto py-3 px-4">
                <div className="text-left">
                  <div className="font-medium text-sm">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.desc}</div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto flex-shrink-0" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AlignmentModule
