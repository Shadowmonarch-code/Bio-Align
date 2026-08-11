'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  ExternalLink,
  Info,
  BookOpen,
  Download,
  Calculator
} from 'lucide-react'

// ============================================================================
// ORIGINAL TOOL REDIRECTS - AMMI & GxE Analysis Tools
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

const AMMI_TOOLS: ToolRedirect[] = [
  {
    id: 'ammisoft',
    name: 'AMMISOFT',
    description: 'Software for Additive Main Effects and Multiplicative Interaction analysis. Performs AMMI family of models including AMMI1, AMMI2, and AMMIF.',
    url: 'https://www.cimmyt.org/products/ammisoft/',
    organization: 'CIMMYT',
    type: 'Desktop Software',
    features: ['AMMI1', 'AMMI2', 'AMMIF', 'Biplot analysis', 'Stability statistics']
  },
  {
    id: 'ggebiplot',
    name: 'GGEbiplot',
    description: 'GGE Biplot analysis software by Dr. Weikai Yan. Complete GGE biplot functionality for genotype-by-environment data analysis.',
    url: 'https://www.ggebiplot.com/',
    organization: 'University of Guelph',
    type: 'Desktop Software',
    features: ['Which-Won-Where', 'Mean vs Stability', 'Discriminating power', 'Ideal genotype']
  },
  {
    id: 'plantbreeding-r',
    name: 'plantbreeding (R Package)',
    description: 'Comprehensive R package for plant breeding analysis including AMMI, GGE, BLUP, and spatial analysis.',
    url: 'https://cran.r-project.org/web/packages/plantbreeding/index.html',
    organization: 'CRAN / R Community',
    type: 'R Package',
    features: ['AMMI', 'GGE Biplot', 'BLUP', 'Mixed models', 'Spatial correction']
  },
  {
    id: 'metan-r',
    name: 'metan (R Package)',
    description: 'Multi-Environment Trial Analysis - R package for analyzing data from multi-environment trials.',
    url: 'https://tiagoolivoto.github.io/metan/',
    organization: 'Tiago Olivoto',
    type: 'R Package',
    features: ['AMMI', 'GGE', 'WAAS', 'Blup', 'Index selection', 'Graphics']
  }
]

const STATISTICAL_TOOLS: ToolRedirect[] = [
  {
    id: 'sas-mixed',
    name: 'SAS PROC MIXED/GLIMMIX',
    description: 'Industry-standard statistical software for mixed model analysis in plant breeding trials.',
    url: 'https://support.sas.com/documentation/onlinedoc/stat/141/mixed.pdf',
    organization: 'SAS Institute',
    type: 'Commercial Software',
    features: ['REML', 'BLUP', 'Random effects', 'Covariance structures', 'Multi-trait']
  },
  {
    id: 'asreml',
    name: 'ASReml',
    description: 'Advanced statistical software for fitting linear mixed models using residual maximum likelihood (REML).',
    url: 'https://vsni.co.uk/software/asreml/',
    organization: 'VSN International',
    type: 'Commercial Software',
    features: ['REML', 'Pedigree analysis', 'Spatial models', 'GxE interaction', 'Genomic prediction']
  },
  {
    id: 'genstat',
    name: 'GenStat',
    description: 'Comprehensive statistical software for agricultural research with specialized plant breeding modules.',
    url: 'https://www.vsni.co.uk/software/genstat/',
    organization: 'VSN International',
    type: 'Commercial Software',
    features: ['ANOVA', 'REML', 'Design generation', 'QTL analysis', 'Multivariate']
  },
  {
    id: 'r-agricolae',
    name: 'agricolae (R)',
    description: 'R package for experimental design and analysis in agriculture. Includes AMMI, GGE, and stability analysis.',
    url: 'https://cran.r-project.org/web/packages/agricolae/index.html',
    organization: 'CRAN',
    type: 'R Package',
    features: ['Experimental design', 'AMMI', 'GGE', 'Comparisons', 'Stability indices']
  }
]

const ONLINE_CALCULATORS: ToolRedirect[] = [
  {
    id: 'online-ammi',
    name: 'Online AMMI Calculator',
    description: 'Web-based AMMI analysis tool for quick G×E interaction studies without software installation.',
    url: 'https://shiny.agr.hokudai.ac.jp/myk_sapporo/ammi/',
    organization: 'Hokkaido University',
    type: 'Web Application',
    features: ['Upload CSV', 'AMMI analysis', 'Biplot visualization', 'Export results']
  },
  {
    id: 'gge-shiny',
    name: 'GGE Shiny App',
    description: 'Interactive web application for GGE biplot analysis using R Shiny framework.',
    url: 'https://julianhago.shinyapps.io/GGE_biplot/',
    organization: 'Academic',
    type: 'Web Application',
    features: ['Interactive plots', 'Multiple functions', 'Data upload', 'Download figures']
  }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AMMIAnalysisModule() {
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
          <LineChart className="h-8 w-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">AMMI & GGE Analysis</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Professional tools for Additive Main Effects and Multiplicative Interaction (AMMI) 
          and Genotype × Environment (G×E) analysis. Redirects to official software.
        </p>
      </motion.div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">About AMMI & GGE Analysis</h4>
              <p className="text-sm text-blue-700 mt-1">
                AMMI combines ANOVA with Principal Components Analysis to analyze G×E interactions. 
                GGE biplots visualize both genotype main effects and G×E interactions for cultivar evaluation.
                These are essential tools in multi-environment trial (MET) analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AMMI Tools Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Dedicated AMMI/GGE Software
        </h3>

        {AMMI_TOOLS.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {tool.name}
                      <Badge variant={tool.type === 'R Package' ? 'default' : 'secondary'}>
                        {tool.type}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </div>
                  <BookOpen className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
                <p className="text-xs text-emerald-600 font-medium">{tool.organization}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {tool.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => openTool(tool.url)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open {tool.name}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Statistical Software Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          General Statistical Software (with AMMI support)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STATISTICAL_TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {tool.name}
                    <Badge variant="outline" className="text-xs">{tool.type}</Badge>
                  </CardTitle>
                  <p className="text-xs text-gray-500">{tool.organization}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tool.features.slice(0, 4).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => openTool(tool.url)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Visit Website
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Online Calculators */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Online Web Applications (No Installation)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ONLINE_CALCULATORS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-green-200 bg-green-50 hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {tool.name}
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                      Free Online
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-green-700">{tool.organization}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                  <Button
                    onClick={() => openTool(tool.url)}
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Launch App
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learning Resources */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg">Learning Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'AMMI Tutorial (PDF)', url: 'https://www.cimmyt.org/wp-content/uploads/2016/06/AMMIinCIMMYT.pdf', org: 'CIMMYT' },
              { name: 'GGE Biplot Book', url: 'https://www.ggebiplot.com/book/', org: 'Weikai Yan' },
              { name: 'MET Analysis Guide', url: 'https://www.plantbreeding.org/?page_id=49', org: 'Plant Breeding E-Learning' },
            ].map((resource) => (
              <Button
                key={resource.name}
                variant="outline"
                onClick={() => openTool(resource.url)}
                className="justify-start h-auto py-2 px-3"
              >
                <div className="text-left">
                  <div className="font-medium text-sm">{resource.name}</div>
                  <div className="text-xs text-gray-500">{resource.org}</div>
                </div>
                <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AMMIAnalysisModule
