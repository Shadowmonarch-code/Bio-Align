'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dna,
  Microscope,
  Zap,
  ExternalLink,
  Info,
  FileText,
  BarChart3,
  CheckCircle2,
  Globe
} from 'lucide-react'

// ============================================================================
// ORIGINAL TOOL REDIRECTS - Links to Official Scientific Tools
// ============================================================================

interface ToolRedirect {
  id: string
  name: string
  description: string
  url: string
  organization: string
  category: string
  features: string[]
}

const MOLECULAR_TOOLS: ToolRedirect[] = [
  {
    id: 'ncbi-blast',
    name: 'NCBI BLAST',
    description: 'Basic Local Alignment Search Tool - Find regions of similarity between biological sequences. The standard tool for sequence alignment and homology searching.',
    url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi',
    organization: 'NCBI / NIH',
    category: 'Sequence Analysis',
    features: ['Nucleotide BLAST', 'Protein BLAST', 'BLASTx', 'tBLASTn', 'Primer-BLAST']
  },
  {
    id: 'ensemble-blast',
    name: 'Ensembl BLAST',
    description: 'BLAST against Ensembl genome sequences. Search vertebrate and plant genomes with comprehensive annotation.',
    url: 'https://www.ensembl.org/Multi/Tools/Blast',
    organization: 'EBI / EMBL',
    category: 'Genome Analysis',
    features: ['Genome BLAST', 'Variant effect', 'Gene trees', 'Comparative genomics']
  },
  {
    id: 'blast-ngs',
    name: 'BLAST NGS',
    description: 'Next-Generation Sequencing BLAST analysis for high-throughput sequencing data.',
    url: 'https://ngs.ncbi.nlm.nih.gov/',
    organization: 'NCBI',
    category: 'NGS Analysis',
    features: ['SRA data', 'NGS BLAST', 'Read mapping', 'Variant calling']
  }
]

const MARKER_TOOLS: ToolRedirect[] = [
  {
    id: 'tasel',
    name: 'TASSEL',
    description: 'Trait Analysis by aSSociation, Evolution and Linkage - Software for genomic prediction and association mapping.',
    url: 'https://www.maizegenetics.net/tassel',
    organization: 'Maize Genetics',
    category: 'GWAS Analysis',
    features: ['GWAS', 'Genomic Selection', 'PCA', 'Kinship matrix', 'MLM/GLM']
  },
  {
    id: 'gapit',
    name: 'GAPIT (R Package)',
    description: 'Genome Association and Prediction Integrated Tool - Comprehensive R package for GWAS and genomic selection.',
    url: 'https://github.com/ZhiqiangTang1001/GAPIT',
    organization: 'USDA-ARS / Cornell',
    category: 'GWAS Analysis',
    features: ['MLM', 'FarmCPU', 'BLINK', 'Genomic Prediction', 'QTN detection']
  },
  {
    id: 'plink',
    name: 'PLINK',
    description: 'Whole genome association analysis toolset. Industry standard for SNP data analysis.',
    url: 'https://www.cog-genomics.org/plink/',
    organization: 'Harvard / MIT',
    category: 'SNP Analysis',
    features: ['Data management', 'Association tests', 'LD calculation', 'Population structure']
  }
]

const QTL_TOOLS: ToolRedirect[] = [
  {
    id: 'icimapping',
    name: 'ICIMapping',
    description: 'Integrated software for genetic linkage map construction and quantitative trait locus mapping.',
    url: 'http://www.isbreeding.net/software/default.aspx?type=detail&id=20',
    organization: 'CAAS China',
    category: 'QTL Mapping',
    features: ['BIP mapping', 'RIL mapping', 'DH population', 'BC population', 'Meta-QTL']
  },
  {
    id: 'qtlicartographer',
    name: 'QTLCartographer',
    description: 'Comprehensive QTL analysis software for mapping quantitative trait loci in experimental populations.',
    url: 'https://statgen.ncsu.edu/qtlcart/WQTLCart.htm',
    organization: 'NC State University',
    category: 'QTL Mapping',
    features: ['Composite Interval Mapping', 'Bayesian QTL', 'Permutation tests', 'CIM']
  },
  {
    id: 'rqtl',
    name: 'R/qtl',
    description: 'R package for QTL mapping in experimental crosses. Widely used for QTL analysis.',
    url: 'https://rqtl.org/',
    organization: 'Karl Broman Lab',
    category: 'QTL Mapping',
    features: ['Interval mapping', 'Multiple QTL', '2D scans', 'Haplotype analysis']
  }
]

const GENETIC_DIVERSITY_TOOLS: ToolRedirect[] = [
  {
    id: 'genalex',
    name: 'GenAlEx',
    description: 'Excel add-in for analysis of genetic data. Calculate diversity indices, F-statistics, and population structure.',
    url: 'https://biology-assets.anu.edu.au/GenAlEx/',
    organization: 'ANU Australia',
    category: 'Diversity Analysis',
    features: ['AMOVA', 'F-statistics', 'Genetic distance', 'PCA', 'Assignment tests']
  },
  {
    id: 'powermarker',
    name: 'PowerMarker',
    description: 'Integrated analysis environment for genetic marker data. Comprehensive molecular marker analysis.',
    url: 'https://statgen.ncsu.edu/powermarker/',
    organization: 'NC State University',
    category: 'Marker Analysis',
    features: ['Diversity indices', 'Heterozygosity', 'PIC', 'Phylogenetic tree', 'LD analysis']
  },
  {
    id: 'adegenet-r',
    name: 'adegenet (R)',
    description: 'R package for multivariate and spatial analysis of genetic data using ade4 framework.',
    url: 'https://adegenet.r-forge.r-project.org/',
    organization: 'R Community',
    category: 'Population Genetics',
    features: ['PCA', 'DAPC', 'Spatial genetics', 'SNP data', 'Haplotypes']
  }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MolecularBreedingModule() {
  const openTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Dna className="h-8 w-8 text-emerald-600" />
          <h2 className="text-3xl font-bold text-gray-900">Molecular Breeding Tools</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Access professional molecular breeding and bioinformatics tools. 
          Each tool redirects to its official source for authentic, research-grade results.
        </p>
      </motion.div>

      {/* Tool Categories */}
      <Tabs defaultValue="sequence" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sequence" className="flex items-center gap-2">
            <Microscope className="h-4 w-4" />
            Sequence Analysis
          </TabsTrigger>
          <TabsTrigger value="markers" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Marker Analysis
          </TabsTrigger>
          <TabsTrigger value="qtl" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            QTL Mapping
          </TabsTrigger>
          <TabsTrigger value="diversity" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Diversity
          </TabsTrigger>
        </TabsList>

        {/* Sequence Analysis Tools */}
        <TabsContent value="sequence" className="space-y-4 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Sequence Analysis Tools</h4>
              <p className="text-sm text-blue-700 mt-1">
                Official NCBI BLAST and other sequence alignment tools for DNA/protein sequence comparison.
              </p>
            </div>
          </div>

          {MOLECULAR_TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {tool.name}
                        <Badge variant="secondary">{tool.category}</Badge>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {tool.description}
                      </CardDescription>
                    </div>
                    <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{tool.organization}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Key Features:</h5>
                      <div className="flex flex-wrap gap-2">
                        {tool.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => openTool(tool.url)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open {tool.name} (Official)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Marker Analysis Tools */}
        <TabsContent value="markers" className="space-y-4 mt-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-purple-900">Marker & Association Analysis</h4>
              <p className="text-sm text-purple-700 mt-1">
                Professional tools for GWAS, SNP analysis, and molecular marker studies.
              </p>
            </div>
          </div>

          {MARKER_TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {tool.name}
                        <Badge variant="secondary">{tool.category}</Badge>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {tool.description}
                      </CardDescription>
                    </div>
                    <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{tool.organization}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Key Features:</h5>
                      <div className="flex flex-wrap gap-2">
                        {tool.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => openTool(tool.url)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open {tool.name} (Official)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* QTL Mapping Tools */}
        <TabsContent value="qtl" className="space-y-4 mt-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-orange-900">QTL Mapping Tools</h4>
              <p className="text-sm text-orange-700 mt-1">
                Specialized software for Quantitative Trait Locus identification and mapping.
              </p>
            </div>
          </div>

          {QTL_TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {tool.name}
                        <Badge variant="secondary">{tool.category}</Badge>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {tool.description}
                      </CardDescription>
                    </div>
                    <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{tool.organization}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Key Features:</h5>
                      <div className="flex flex-wrap gap-2">
                        {tool.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => openTool(tool.url)}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open {tool.name} (Official)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Genetic Diversity Tools */}
        <TabsContent value="diversity" className="space-y-4 mt-6">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-teal-900">Genetic Diversity & Population Analysis</h4>
              <p className="text-sm text-teal-700 mt-1">
                Tools for calculating diversity indices, population structure, and genetic distance.
              </p>
            </div>
          </div>

          {GENETIC_DIVERSITY_TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {tool.name}
                        <Badge variant="secondary">{tool.category}</Badge>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {tool.description}
                      </CardDescription>
                    </div>
                    <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{tool.organization}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Key Features:</h5>
                      <div className="flex flex-wrap gap-2">
                        {tool.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => openTool(tool.url)}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open {tool.name} (Official)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Additional Resources */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-600" />
            Additional Bioinformatics Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'NCBI Gene', url: 'https://www.ncbi.nlm.nih.gov/gene/', desc: 'Gene database' },
              { name: 'UniProt', url: 'https://www.uniprot.org/', desc: 'Protein database' },
              { name: 'Ensembl Plants', url: 'https://plants.ensembl.org/', desc: 'Plant genomes' },
              { name: 'Gramene', url: 'https://gramene.org/', desc: 'Comparative genomics' },
              { name: 'Phytozome', url: 'https://phytozome-next.jgi.doe.gov/', desc: 'Plant comparative genomics' },
              { name: 'BRAD', url: 'http://brad.cribi.pku.edu.cn/', desc: 'Brassicaceae database' },
            ].map((resource) => (
              <Button
                key={resource.name}
                variant="outline"
                onClick={() => openTool(resource.url)}
                className="justify-start h-auto py-3 px-4"
              >
                <div className="text-left">
                  <div className="font-medium">{resource.name}</div>
                  <div className="text-xs text-gray-500">{resource.desc}</div>
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

export default MolecularBreedingModule
