'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import {
  Target,
  ExternalLink,
  Info,
  BookOpen,
  Globe
} from 'lucide-react'

// ============================================================================
// ORIGINAL TOOL REDIRECTS - Molecular Docking Tools
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

const DOCKING_TOOLS: ToolRedirect[] = [
  // Primary Docking Software
  {
    id: 'autodock-vina',
    name: 'AutoDock Vina',
    description: 'Open-source molecular docking and virtual screening program. Industry standard for academic research.',
    url: 'http://vina.scripps.edu/',
    organization: 'Scripps Research Institute',
    type: 'Free Software (Official)',
    features: ['Molecular docking', 'Virtual screening', 'Multi-core', 'Python API', 'Fast']
  },
  {
    id: 'swissdock',
    name: 'SwissDock',
    description: 'Free web service for protein-ligand docking powered by EADock DSS algorithm.',
    url: 'http://www.swissdock.ch/docking',
    organization: 'SIB Swiss Institute of Bioinformatics',
    type: 'Web Application (Free)',
    attributes: ['No installation', 'EADock DSS', 'Multiple modes', 'Results download'],
    features: ['Protein-ligand', 'Flexible docking', 'Binding poses', 'Energy scores']
  },
  {
    id: 'haddock',
    name: 'HADDOCK Web Server',
    description: 'High Ambiguity Driven DOCKing for protein-protein docking with data-driven ambiguity restraints.',
    url: 'https://alcazar.science.uu.nl/services/HADDOCK2.4/haddockserver/',
    organization: 'Utrecht University / Bonvin Lab',
    type: 'Web Application (Free)',
    features: ['Protein-protein', 'Data-driven', 'Ambiguity interaction', 'CASP-CAPRI winner']
  },

  // Additional Tools
  {
    id: 'patchdock',
    name: 'PatchDock',
    description: 'Geometric docking algorithm for molecular surface complementarity. Fast rigid-body docking.',
    url: 'https://bioinfo3d.cs.tau.ac.il/PatchDock/php.php',
    organization: 'Tel Aviv University',
    type: 'Web Application (Free)',
    features: ['Rigid docking', 'Surface matching', 'Fast', 'FiberDock refinement']
  },
  {
    id: 'zdock',
    name: 'ZDOCK Server',
    description: 'FFT-based protein docking server for predicting protein complexes using shape complementarity.',
    url: 'https://zdock.umassmed.edu/',
    organization: 'UMass Medical School',
    type: 'Web Application (Free)',
    features: ['Protein docking', 'ZDOCK 3.0.2', 'IRAD', 'PPI prediction']
  }
]

const DOCKING_RESOURCES = [
  { name: 'AutoDock Tools', url: 'http://autodock.scripps.edu/', desc: 'Preparation tools' },
  { name: 'PyRx', url: 'https://pyrx.sourceforge.io/', desc: 'Virtual screening' },
  { name: 'DockingServer', url: 'https://dockingserver.com/', desc: 'Commercial-grade docking' },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MolecularDockingModule() {
  const openTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target className="h-8 w-8 text-orange-600" />
          <h2 className="text-3xl font-bold text-gray-900">Molecular Docking</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Professional molecular docking tools for predicting how small molecules 
          bind to protein targets.
        </p>
      </motion.div>

      {/* Info Banner */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-orange-900">About Molecular Docking</h4>
              <p className="text-sm text-orange-700 mt-1">
                Molecular docking predicts the preferred orientation of a molecule when 
                bound to another. Applications include:
              </p>
              <ul className="list-disc list-inside text-sm text-orange-700 mt-2 space-y-1">
                <li><strong>Drug discovery:</strong> Virtual screening of compound libraries</li>
                <li><strong>Lead optimization:</strong> Understanding binding modes</li>
                <li><strong>Enzyme mechanisms:</strong> Substrate positioning analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured - AutoDock Vina */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Target className="h-7 w-7 text-green-600" />
              AutoDock Vina
              <Badge className="bg-green-100 text-green-800">Industry Standard</Badge>
            </CardTitle>
            <p className="text-gray-700 text-base mt-2">
              The most widely used open-source molecular docking software. Free, fast, 
              and accurate - used in thousands of publications.
            </p>
            <p className="text-sm text-green-700 font-medium mt-1">Scripps Research Institute</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {['Molecular Docking', 'Virtual Screening', 'Multi-Core', 'Python API', 'Cross-Platform'].map((t) => (
                  <Badge key={t} variant="outline" className="justify-center py-1">{t}</Badge>
                ))}
              </div>
              <Button onClick={() => openTool('http://vina.scripps.edu/')} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
                <ExternalLink className="h-5 w-5 mr-2" />
                Download AutoDock Vina (Official)
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* All Tools */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Docking & Binding Prediction Tools
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCKING_TOOLS.slice(1).map((tool) => (
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
                    {(tool.features || tool.attributes || []).slice(0, 3).map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                  <Button onClick={() => openTool(tool.url)} size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                    <ExternalLink className="h-3 w-3 mr-1" />Open Tool
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" />Additional Docking Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DOCKING_RESOURCES.map((r) => (
              <Button key={r.name} variant="outline" onClick={() => openTool(r.url)} className="justify-start h-auto py-3 px-4">
                <div className="text-left">
                  <div className="font-medium text-sm">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.desc}</div>
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

export default MolecularDockingModule
