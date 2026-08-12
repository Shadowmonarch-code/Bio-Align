'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ExternalLink,
  Info,
  BookOpen,
  Globe
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
          <Search className="h-8 w-8 text-red-600" />
          <h2 className="text-3xl font-bold text-gray-900">BLAST Search</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Access official BLAST (Basic Local Alignment Search Tool) services from NCBI 
          and EMBL-EBI for authentic sequence similarity searches.
        </p>
      </motion.div>

      {/* Info Banner */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-900">About BLAST</h4>
              <p className="text-sm text-red-700 mt-1">
                BLAST finds regions of local similarity between sequences. The program compares 
                nucleotide or protein sequences to sequence databases and calculates the statistical 
                significance of matches.
              </p>
              <p className="text-sm font-medium text-red-700 mt-2">
                Key concepts: <strong>E-value</strong> (significance), <strong>% Identity</strong>, 
                <strong>Bit score</strong>, <strong>Alignment length</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured - Main NCBI BLAST */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Search className="h-7 w-7 text-green-600" />
              NCBI BLAST
              <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">Official Source</Badge>
            </CardTitle>
            <p className="text-gray-700 text-base mt-2">
              The world's primary resource for finding similarities between biological sequences. 
              Used by millions of researchers worldwide.
            </p>
            <p className="text-sm text-green-700 font-medium mt-1">National Center for Biotechnology Information (NIH)</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Available BLAST Programs:</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {['blastn', 'blastp', 'blastx', 'tblastn', 'tblastx', 'Primer-BLAST', 'IgBLAST'].map((t) => (
                    <Badge key={t} variant="outline" className="justify-center py-1">{t}</Badge>
                  ))}
                </div>
              </div>
              <Button onClick={() => openTool('https://blast.ncbi.nlm.nih.gov/Blast.cgi')} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
                <ExternalLink className="h-5 w-5 mr-2" />
                Open NCBI BLAST (Official)
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Other BLAST Services */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Additional BLAST Services & Variants
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BLAST_TOOLS.slice(1).map((tool) => (
            <motion.div key={tool.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {tool.name}
                    {tool.type.includes('Official') && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Official</Badge>
                    )}
                  </CardTitle>
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
                  <Button onClick={() => openTool(tool.url)} size="sm" className="w-full bg-red-600 hover:bg-red-700">
                    <ExternalLink className="h-3 w-3 mr-1" />Open Tool
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Databases Reference */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" />Common BLAST Databases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BLAST_DATABASES.map((db) => (
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

      {/* Learning Resources */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5" />Learning Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {BLAST_TUTORIALS.map((r) => (
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

export default BlastSearchModule
