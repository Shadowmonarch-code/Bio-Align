'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import {
  TreePine,
  ExternalLink,
  Info,
  BookOpen,
  Globe
} from 'lucide-react'

// ============================================================================
// ORIGINAL TOOL REDIRECTS - Phylogenetics Tools
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

const PHYLO_TOOLS: ToolRedirect[] = [
  // Primary Tools
  {
    id: 'mega',
    name: 'MEGA Software',
    description: 'Molecular Evolutionary Genetics Analysis - Comprehensive free software for phylogenetic analysis and evolutionary studies.',
    url: 'https://www.megasoftware.net/',
    organization: 'Temple University / ASU',
    type: 'Free Desktop Software',
    features: ['ML trees', 'NJ trees', 'UPGMA', 'Clock tests', 'Selection detection', 'Timetrees']
  },
  {
    id: 'iqtree',
    name: 'IQ-TREE',
    description: 'Efficient tree inference with ultrafast model selection and bootstrap. One of the most accurate phylogenetic programs.',
    url: 'http://iqtree.org/',
    organization: 'Vietnam Academy / Bielefeld University',
    type: 'Free Software (Web + Desktop)',
    features: ['Maximum Likelihood', 'ModelFinder', 'Ultrafast bootstrap', 'Partition models']
  },
  {
    id: 'phyml-online',
    name: 'PhyML Online',
    description: 'Maximum likelihood phylogeny based on General Time Reversible model. Available as web service.',
    url: 'https://www.atgc-montpellier.fr/phyml-online/',
    organization: 'CNRS / Montpellier',
    type: 'Web Application (Free)',
    features: ['ML phylogeny', 'GTR model', 'Bootstrap', 'Branch support']
  },
  {
    id: 'ebi-phylogeny',
    name: 'EMBL-EBI Phylogeny',
    description: 'Simple Phylogy web service for quick phylogenetic tree construction from multiple sequence alignments.',
    url: 'https://www.ebi.ac.uk/Tools/phylogeny/simple_phylogeny/',
    organization: 'EMBL-EBI',
    type: 'Web Application (Free)',
    features: ['Simple phylogeny', 'NJ method', 'Fast', 'No installation']
  },

  // Tree Visualization & Analysis
  {
    id: 'itol',
    name: 'iTOL (Interactive Tree Of Life)',
    description: 'Online tool for display, annotation, and management of phylogenetic trees. Beautiful publication-ready figures.',
    url: 'https://itol.embl.de/',
    organization: 'EMBL Heidelberg',
    type: 'Web Application (Free tier)',
    features: ['Tree visualization', 'Annotation', 'Publication figures', 'Interactive']
  },
  {
    id: 'figtree',
    name: 'FigTree',
    description: 'Graphical viewer of phylogenetic trees. Annotate and export beautiful tree figures.',
    url: 'http://tree.bio.ed.ac.uk/software/figtree/',
    organization: 'Andrew Rambaut Institute',
    type: 'Free Software',
    features: ['Tree viewing', 'Annotation', 'Export formats', 'Color coding']
  },
  {
    id: 'archaeopteryx',
    name: 'Archaopteryx',
    description: 'Software for visualizing and manipulating phylogenetic trees with advanced annotation capabilities.',
    url: 'https://sites.google.com/site/cmzmans/archaeopteryx-tool',
    organization: 'CZ MZANS',
    type: 'Free Software',
    features: ['Advanced editing', 'Metadata visualization', 'Batch processing']
  }
]

const TREE_SERVERS = [
  { name: 'MAFFT + QuickTree', url: 'https://mafft.cbrc.jp/alignment/server/', desc: 'Alignment + Tree' },
  { name: 'Phylogeny.fr', url: 'http://www.phylogeny.fr/', desc: 'Complete workflow' },
  { name: 'T-REX Server', url: 'https://www.trex.uqam.ca/', desc: 'Reticulate evolution' },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PhylogeneticsModule() {
  const openTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TreePine className="h-8 w-8 text-green-700" />
          <h2 className="text-3xl font-bold text-gray-900">Phylogenetics</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Professional phylogenetic analysis tools for building and visualizing 
          evolutionary trees from molecular sequence data.
        </p>
      </motion.div>

      {/* Info Banner */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-900">About Phylogenetic Analysis</h4>
              <p className="text-sm text-green-700 mt-1">
                Phylogenetics reconstructs evolutionary relationships among organisms or genes.
                Essential for understanding:
              </p>
              <ul className="list-disc list-inside text-sm text-green-700 mt-2 space-y-1">
                <li><strong>Evolutionary history:</strong> How species are related</li>
                <li><strong>Molecular evolution:</strong> Gene family origins</li>
                <li><strong>Epidemiology:</strong> Disease outbreak tracking</li>
                <li><strong>Taxonomy:</strong> Species classification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured - MEGA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <TreePine className="h-7 w-7 text-green-600" />
              MEGA Software
              <Badge className="bg-green-100 text-green-800">Most Popular</Badge>
            </CardTitle>
            <p className="text-gray-700 text-base mt-2">
              The most widely used software for molecular evolutionary genetics analysis. 
              Free, comprehensive, and regularly updated.
            </p>
            <p className="text-sm text-green-700 font-medium mt-1">Temple University / Arizona State University</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {['ML Trees', 'NJ Trees', 'Clock Tests', 'Selection Detection', 'Timetrees', 'Data Explorer'].map((t) => (
                  <Badge key={t} variant="outline" className="justify-center py-1">{t}</Badge>
                ))}
              </div>
              <Button onClick={() => openTool('https://www.megasoftware.net/')} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
                <ExternalLink className="h-5 w-5 mr-2" />
                Download MEGA (Official)
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Other Tools */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Phylogenetic Analysis Tools
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PHYLO_TOOLS.slice(1).map((tool) => (
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
                  <Button onClick={() => openTool(tool.url)} size="sm" className="w-full bg-green-700 hover:bg-green-800">
                    <ExternalLink className="h-3 w-3 mr-1" />Open Tool
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Online Servers */}
      <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" />Online Workflow Servers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TREE_SERVERS.map((s) => (
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

export default PhylogeneticsModule
