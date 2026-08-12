'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import {
  Dna,
  ExternalLink,
  Info,
  BookOpen,
  Globe,
  Download,
  Search,
  Code2,
  Languages,
  Percent,
  Scissors,
  FileText
} from 'lucide-react'

// ============================================================================
// ORIGINAL TOOL REDIRECTS - Sequence Analysis Tools
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

const SEQUENCE_TOOLS: ToolRedirect[] = [
  // NCBI Tools
  {
    id: 'ncbi-blast',
    name: 'NCBI BLAST',
    description: 'The gold standard for sequence similarity search. Find regions of local similarity between nucleotide or protein sequences.',
    url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi',
    organization: 'NCBI / NIH',
    type: 'Web Application',
    features: ['blastn', 'blastp', 'blastx', 'tblastn', 'tblastx', 'Primer-BLAST']
  },
  {
    id: 'ncbi-nuccore',
    name: 'NCBI Nucleotide Database',
    description: 'Search and retrieve nucleotide sequences from GenBank, RefSeq, TPA, and PDB.',
    url: 'https://www.ncbi.nlm.nih.gov/nuccore',
    organization: 'NCBI / NIH',
    type: 'Database',
    features: ['Sequence search', 'FASTA download', 'GenBank records', 'Gene information']
  },
  
  // EMBL-EBI Tools
  {
    id: 'ebi-blast',
    name: 'EMBL-EBI BLAST',
    description: 'European Bioinformatics Institute BLAST service with access to EMBL-ENA, UniProt, and other databases.',
    url: 'https://www.ebi.ac.uk/Tools/sss/ncbiblast/',
    organization: 'EMBL-EBI',
    type: 'Web Application',
    features: ['Multiple databases', 'Job history', 'REST API', 'Batch submission']
  },
  {
    id: 'ena-browser',
    name: 'European Nucleotide Archive (ENA)',
    description: "Europe's primary nucleotide sequence data resource. Browse, search, and download sequences.",
    url: 'https://www.ebi.ac.uk/ena/browser/home',
    organization: 'EMBL-EBI',
    type: 'Database',
    features: ['Read archive', 'Sequence browse', 'Taxonomy', 'Download']
  },

  // Specialized Tools
  {
    id: 'expasy-translate',
    name: 'ExPASy Translate Tool',
    description: 'Translate DNA/RNA sequences to protein sequences using different genetic codes.',
    url: 'https://web.expasy.org/translate/',
    organization: 'SIB / ExPASy',
    type: 'Web Application',
    features: ['Translation', 'All genetic codes', 'ORF finding', 'Reverse translation']
  },
  {
    id: 'expasy-protparam',
    name: 'ExPASy ProtParam',
    description: 'Compute physical and chemical parameters for protein sequences (molecular weight, pI, etc.).',
    url: 'https://web.expasy.org/protparam/',
    organization: 'SIB / ExPASy',
    type: 'Web Application',
    features: ['MW', 'pI', 'Amino acid composition', 'Instability index', 'Half-life']
  },
  {
    id: 'neb-cutter',
    name: 'NEBcutter v3.0',
    description: 'Find restriction enzyme sites in DNA sequences from New England Biolabs.',
    url: 'https://nebcutter.neb.com/NEBcutterHTML/NEBcutter.php',
    organization: 'New England Biolabs',
    type: 'Web Application',
    features: ['Restriction sites', 'Virtual digest', 'Commercial enzymes', 'Map view']
  },
  {
    id: 'orffinder-ncbi',
    name: 'NCBI ORF Finder',
    description: 'Identify open reading frames in DNA sequences using standard and alternative genetic codes.',
    url: 'https://www.ncbi.nlm.nih.gov/orffinder/',
    organization: 'NCBI / NIH',
    type: 'Web Application',
    features: ['ORF detection', 'Multiple codes', 'Translation', 'Export']
  }
]

const GC_CONTENT_TOOLS: ToolRedirect[] = [
  {
    id: 'gc-content-calculator',
    name: 'GC Content Calculator',
    description: 'Online tool for calculating GC content and base composition of DNA sequences.',
    url: 'https://www.bioinformatics.org/sms2/gc_content.html',
    organization: 'Bioinformatics.org',
    type: 'Web Application',
    features: ['GC%', 'Base composition', 'AT content', 'Instant results']
  }
]

const SEQUENCE_DATABASES = [
  { name: 'GenBank', url: 'https://www.ncbi.nlm.nih.gov/genbank/', desc: 'NIH sequence database' },
  { name: 'Ensembl', url: 'https://www.ensembl.org/', desc: 'Genome browser' },
  { name: 'UCSC Genome Browser', url: 'https://genome.ucsc.edu/', desc: 'Genome visualization' },
  { name: 'DDBJ', url: 'https://www.ddbj.nig.ac.jp/', desc: 'Japan nucleotide database' },
  { name: 'RefSeq', url: 'https://www.ncbi.nlm.nih.gov/refseq/', desc: 'Reference sequences' },
  { name: 'UniProt', url: 'https://www.uniprot.org/', desc: 'Protein database' },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SequenceAnalysisModule() {
  const openTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Dna className="h-8 w-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">Sequence Analysis</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Professional sequence analysis tools from NCBI, EMBL-EBI, ExPASy, and other 
          authoritative bioinformatics sources.
        </p>
      </motion.div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">About Sequence Analysis</h4>
              <p className="text-sm text-blue-700 mt-1">
                Sequence analysis is fundamental to modern molecular biology. These tools allow you to:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li><strong>Search:</strong> Find similar sequences using BLAST</li>
                <li><strong>Translate:</strong> Convert DNA/RNA to protein</li>
                <li><strong>Analyze:</strong> Calculate GC content, find ORFs, restriction sites</li>
                <li><strong>Retrieve:</strong> Access sequences from global databases</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Tools - BLAST & Search */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Sequence Search & Alignment
        </h3>

        {/* NCBI BLAST - Featured */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Search className="h-7 w-7 text-green-600" />
                NCBI BLAST
                <Badge className="bg-green-100 text-green-800 text-sm">Most Popular</Badge>
              </CardTitle>
              <p className="text-gray-700 text-base">
                The world's most widely used bioinformatics tool. Compare your sequence against millions of entries in the NCBI databases.
              </p>
              <p className="text-sm text-green-700 font-medium">National Center for Biotechnology Information (NIH)</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {['blastn (Nucleotide)', 'blastp (Protein)', 'blastx (Transl.)', 'tblastn', 'tblastx', 'Primer-BLAST'].map((t) => (
                    <Badge key={t} variant="outline" className="justify-center py-1">{t}</Badge>
                  ))}
                </div>
                <Button onClick={() => openTool('https://blast.ncbi.nlm.nih.gov/Blast.cgi')} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-lg py-3">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Open NCBI BLAST (Official)
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Other Search Tools */}
        {SEQUENCE_TOOLS.slice(1).map((tool, index) => (
          <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {tool.name}
                      <Badge variant={tool.type === 'Web Application' ? 'default' : 'secondary'}>{tool.type}</Badge>
                    </CardTitle>
                    <p className="text-gray-600">{tool.description}</p>
                  </div>
                  <BookOpen className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
                <p className="text-sm text-emerald-600 font-medium">{tool.organization}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {tool.features.map((f) => <Badge key={f} variant="outline">{f}</Badge>)}
                  </div>
                  <Button onClick={() => openTool(tool.url)} className="w-full bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="h-4 w-4 mr-2" />Open {tool.name} (Official)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Translation & Analysis Tools */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Translation & Analysis Tools
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEQUENCE_TOOLS.slice(5).map((tool) => (
            <motion.div key={tool.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{tool.name}</CardTitle>
                  <Badge variant="outline" className="w-fit text-xs">{tool.type}</Badge>
                  <p className="text-xs text-gray-500">{tool.organization}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tool.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tool.features.slice(0, 3).map((f) => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}
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

      {/* Quick Calculators */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Percent className="h-5 w-5" />
          Quick Online Calculators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GC_CONTENT_TOOLS.map((tool) => (
            <Card key={tool.id} className="border-purple-300 bg-purple-50 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {tool.name}
                  <Badge className="bg-purple-100 text-purple-800">Free</Badge>
                </CardTitle>
                <p className="text-xs text-purple-700">{tool.organization}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                <Button onClick={() => openTool(tool.url)} size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                  <ExternalLink className="h-3 w-3 mr-1" />Launch Calculator
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sequence Databases */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" />Major Sequence Databases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SEQUENCE_DATABASES.map((db) => (
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

export default SequenceAnalysisModule
