'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import {
  Microscope,
  ExternalLink,
  Info,
  BookOpen,
  Globe
} from 'lucide-react'

// ============================================================================
// ORIGINAL TOOL REDIRECTS - Protein Analysis Tools
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

const PROTEIN_TOOLS: ToolRedirect[] = [
  // ExPASy Tools (Primary)
  {
    id: 'protparam',
    name: 'ExPASy ProtParam',
    description: 'Compute physical and chemical parameters for protein sequences including molecular weight, pI, amino acid composition.',
    url: 'https://web.expasy.org/protparam/',
    organization: 'SIB Swiss Institute of Bioinformatics',
    type: 'Web Application (Official)',
    features: ['Molecular weight', 'pI', 'Amino acid composition', 'Instability index', 'Half-life', 'Aliphatic index']
  },
  {
    id: 'scanprosite',
    name: 'ScanProsite',
    description: 'Scan protein sequences against PROSITE patterns and profiles to find domains, families, and functional sites.',
    url: 'https://prosite.expasy.org/scanprosite/',
    organization: 'SIB / ExPASy',
    type: 'Web Application (Official)',
    features: ['Domain detection', 'Pattern scan', 'Profile search', 'Functional sites']
  },
  {
    id: 'compute-pi',
    name: 'Compute pI/Mw',
    description: 'Calculate isoelectric point and molecular weight for protein sequences using various algorithms.',
    url: 'https://web.expasy.org/compute_pi/',
    organization: 'SIB / ExPASy',
    type: 'Web Application (Official)',
    features: ['pI calculation', 'Molecular weight', 'Multiple methods']
  },

  // EMBL-EBI Tools
  {
    id: 'interproscan',
    name: 'InterProScan',
    description: 'Intergrated protein domain analysis using multiple member databases (PROSITE, Pfam, SMART, etc.).',
    url: 'https://www.ebi.ac.uk/interpro/search/sequence-search/',
    organization: 'EMBL-EBI',
    type: 'Web Application (Official)',
    features: ['Domain prediction', 'GO terms', 'Pathway mapping', 'Family classification']
  },
  {
    id: 'pfam',
    name: 'Pfam',
    description: 'Search protein sequences against Pfam database of protein families using hidden Markov models.',
    url: 'https://www.ebi.ac.uk/Tools/hmmer/',
    organization: 'EMBL-EBI / Wellcome Trust Sanger',
    type: 'Web Application (Official)',
    features: ['HMM search', 'Domain architecture', 'Family assignment']
  },

  // Structure & Function Prediction
  {
    id: 'phobius',
    name: 'Phobius',
    description: 'Predict transmembrane topology and signal peptides in protein sequences.',
    url: 'https://phobius.sbc.su.se/',
    organization: 'Stockholm Bioinformatics Center',
    type: 'Web Application',
    features: ['TM prediction', 'Signal peptide', 'Topology']
  },
  {
    id: 'tmhmm',
    name: 'TMHMM Server',
    description: 'Transmembrane helix prediction based on hidden Markov model. Industry standard for membrane proteins.',
    url: 'https://services.healthtech.dtu.dk/service.php?TMHMM-2.0',
    organization: 'DTU Denmark',
    type: 'Web Application',
    features: ['Transmembrane helices', 'Topology', 'Localization']
  }
]

const PROTEIN_DATABASES = [
  { name: 'UniProtKB', url: 'https://www.uniprot.org/', desc: 'Comprehensive protein resource' },
  { name: 'PDB', url: 'https://www.rcsb.org/', desc: 'Protein Data Bank' },
  { name: 'AlphaFold DB', url: 'https://alphafold.ebi.ac.uk/', desc: 'AI-predicted structures' },
  { name: 'Swiss-Model', url: 'https://swissmodel.expasy.org/', desc: 'Homology modeling' },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProteinAnalysisModule() {
  const openTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Microscope className="h-8 w-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900">Protein Analysis</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Professional protein analysis tools from ExPASy, EMBL-EBI, and other 
          authoritative bioinformatics sources.
        </p>
      </motion.div>

      {/* Info Banner */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-purple-900">About Protein Analysis</h4>
              <p className="text-sm text-purple-700 mt-1">
                Protein analysis tools help characterize protein sequences by computing:
              </p>
              <ul className="list-disc list-inside text-sm text-purple-700 mt-2 space-y-1">
                <li><strong>Physical properties:</strong> MW, pI, extinction coefficient</li>
                <li><strong>Structure:</strong> Domains, transmembrane regions, signal peptides</li>
                <li><strong>Function:</strong> GO annotations, pathway mapping</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured - ProtParam */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-purple-400 bg-gradient-to-r from-purple-50 to-violet-50 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Microscope className="h-7 w-7 text-purple-600" />
              ExPASy ProtParam
              <Badge className="bg-purple-100 text-purple-800">Most Popular</Badge>
            </CardTitle>
            <p className="text-gray-700 text-base mt-2">
              The gold standard for computing physical and chemical parameters of protein sequences.
              Used by millions of researchers worldwide.
            </p>
            <p className="text-sm text-purple-700 font-medium mt-1">SIB Swiss Institute of Bioinformatics</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {['Molecular Weight', 'Isoelectric Point', 'AA Composition', 'Instability Index', 'Half-life', 'Extinction Coeff'].map((t) => (
                  <Badge key={t} variant="outline" className="justify-center py-1">{t}</Badge>
                ))}
              </div>
              <Button onClick={() => openTool('https://web.expasy.org/proparam/')} size="lg" className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3">
                <ExternalLink className="h-5 w-5 mr-2" />
                Open ProtParam (Official)
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* All Tools */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          All Protein Analysis Tools
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROTEIN_TOOLS.slice(1).map((tool) => (
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
                  <Button onClick={() => openTool(tool.url)} size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                    <ExternalLink className="h-3 w-3 mr-1" />Open Tool
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Databases */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" />Major Protein Databases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PROTEIN_DATABASES.map((db) => (
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
    </div>
  )
}

export default ProteinAnalysisModule
