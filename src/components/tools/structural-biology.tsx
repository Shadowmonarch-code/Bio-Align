'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import {
  Atom,
  ExternalLink,
  Info,
  BookOpen,
  Globe
} from 'lucide-react'

// ============================================================================
// ORIGINAL TOOL REDIRECTS - Structural Biology Tools
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

const STRUCTURE_TOOLS: ToolRedirect[] = [
  // Primary Structure Resources
  {
    id: 'rcsb-pdb',
    name: 'RCSB Protein Data Bank (PDB)',
    description: 'The single worldwide archive of experimentally determined 3D structures of proteins, nucleic acids, and complex assemblies.',
    url: 'https://www.rcsb.org/',
    organization: 'RCSB / Rutgers',
    type: 'Database (Official)',
    features: ['3D structures', 'X-ray', 'NMR', 'Cryo-EM', 'Visualization']
  },
  {
    id: 'alphafold',
    name: 'AlphaFold Protein Structure Database',
    description: 'AI-predicted protein structures by DeepMind. Covers nearly all catalogued proteins with high accuracy predictions.',
    url: 'https://alphafold.ebi.ac.uk/',
    organization: 'DeepMind / EMBL-EBI',
    type: 'Database (Official)',
    features: ['AI predictions', 'pLDDT scores', 'MSA depth', 'Download PDB files']
  },
  {
    id: 'pdbj-emdb',
    name: 'EMDataResource (EMDB)',
    description: 'Archive for 3D cryo-electron microscopy maps and models of macromolecular complexes.',
    url: 'https://www.ebi.ac.uk/emdb/',
    organization: 'EMBL-EBI / PDBe',
    type: 'Database (Official)',
    features: ['Cryo-EM maps', '3D volumes', 'Model deposition']
  },

  // Visualization & Analysis Software
  {
    id: 'pymol',
    name: 'PyMOL',
    description: 'Molecular visualization system for creating publication-quality 3D images of small molecules and biological macromolecules.',
    url: 'https://pymol.org/2/',
    organization: 'Schrodinger',
    type: 'Software (Free/Open Source)',
    features: ['3D visualization', 'Rendering', 'Animation', 'Scripting']
  },
  {
    id: 'ucsf-chimerax',
    name: 'UCSF ChimeraX',
    description: 'Next-generation molecular visualization program for interactive exploration and analysis of molecular structures.',
    url: 'https://www.cgl.ucsf.edu/chimerax/',
    organization: 'UCSF RBVI',
    type: 'Free Software',
    features: ['Interactive 3D', 'Analysis tools', 'Maps', 'Customization']
  },
  {
    id: 'mol*',
    name: 'Mol*',
    description: 'Open-source toolkit for 3D visualization and analysis of large biomolecular structures. Used in RCSB.org.',
    url: 'https://molstar.org/viewer/',
    organization: 'Seisenberger Group / RCSB',
    type: 'Web Application + Desktop',
    features: ['Web viewer', 'Large structures', 'Volume rendering', 'Extensions']
  },

  // Prediction Tools
  {
    id: 'swiss-model',
    name: 'SWISS-MODEL',
    description: 'Automated homology modeling server for predicting 3D structures of proteins using comparative modeling.',
    url: 'https://swissmodel.expasy.org/',
    organization: 'SIB / ExPASy',
    type: 'Web Application (Official)',
    features: ['Homology modeling', 'Template search', 'Model quality', 'Deep learning']
  },
  {
    id: 'i-tasser',
    name: 'I-TASSER',
    description: 'Iterative Threading ASSEmbly Refinement server for protein structure prediction. CASP competition winner.',
    url: 'https://zhanglab.cc/t/I-TASSER/',
    organization: 'University of Michigan',
    type: 'Web Application (Free)',
    features: ['Ab initio', 'Threading', 'Ligand binding', 'Function prediction']
  }
]

const STRUCTURE_DATABASES = [
  { name: 'PDBe (Europe)', url: 'https://www.ebi.ac.uk/pdbe/', desc: 'European PDB archive' },
  { name: 'PDBe-KB', url: 'https://www.ebi.ac.uk/pdbe/pdbe-kb/', desc: 'Knowledge base' },
  { name: 'wwPDB', url: 'https://www.wwpdb.org/', desc: 'Worldwide PDB' },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StructuralBiologyModule() {
  const openTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Atom className="h-8 w-8 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-900">Structural Biology</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Professional structural biology tools including PDB databases, AlphaFold, 
          structure viewers, and homology modeling.
        </p>
      </motion.div>

      {/* Info Banner */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-indigo-900">About Structural Biology</h4>
              <p className="text-sm text-indigo-700 mt-1">
                Structural biology determines the 3D arrangement of atoms in biomolecules. 
                Key resources include:
              </p>
              <ul className="list-disc list-inside text-sm text-indigo-700 mt-2 space-y-1">
                <li><strong>Experimental:</strong> X-ray crystallography, NMR, Cryo-EM</li>
                <li><strong>Predicted:</strong> AlphaFold AI models, Homology models</li>
                <li><strong>Visualization:</strong> PyMOL, ChimeraX, Mol*</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured - PDB */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Atom className="h-7 w-7 text-blue-600" />
              RCSB Protein Data Bank
              <Badge className="bg-blue-100 text-blue-800">Primary Database</Badge>
            </CardTitle>
            <p className="text-gray-700 text-base mt-2">
              The single worldwide archive for experimentally-determined 3D structures 
              of proteins and nucleic acids. Over 200,000 structures available.
            </p>
            <p className="text-sm text-blue-700 font-medium mt-1">Rutgers University / Worldwide PDB</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {['X-ray Structures', 'NMR', 'Cryo-EM', '3D Viewer', 'Search', 'Download'].map((t) => (
                  <Badge key={t} variant="outline" className="justify-center py-1">{t}</Badge>
                ))}
              </div>
              <Button onClick={() => openTool('https://www.rcsb.org/')} size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                <ExternalLink className="h-5 w-5 mr-2" />
                Open PDB (Official)
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Featured - AlphaFold */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              AlphaFold DB
              <Badge className="bg-green-100 text-green-800">AI Predictions</Badge>
            </CardTitle>
            <p className="text-gray-700">
              Revolutionary AI system by DeepMind that predicts protein structures with atomic accuracy. 
              Covers nearly all known proteins.
            </p>
            <p className="text-sm text-green-700 font-medium">DeepMind / EMBL-EBI</p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => openTool('https://alphafold.ebi.ac.uk/')} size="lg" className="w-full bg-green-600 hover:bg-green-700 py-3">
              <ExternalLink className="h-5 w-5 mr-2" />
              Open AlphaFold DB (Official)
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* All Tools */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Structure Analysis & Visualization Tools
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STRUCTURE_TOOLS.slice(3).map((tool) => (
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
                  <Button onClick={() => openTool(tool.url)} size="sm" variant="outline" className="w-full">
                    <ExternalLink className="h-3 w-3 mr-1" />Open Tool
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Additional Databases */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" />Additional Structure Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STRUCTURE_DATABASES.map((db) => (
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

export default StructuralBiologyModule
