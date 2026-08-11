'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  ExternalLink,
  Info,
  BookOpen,
  Calculator,
  Globe
} from 'lucide-react'

// ============================================================================
// ORIGINAL TOOL REDIRECTS - G×E Interaction Analysis Tools
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

const STABILITY_TOOLS: ToolRedirect[] = [
  {
    id: 'stability-r',
    name: 'stability (R Package)',
    description: 'Comprehensive R package for calculating various stability parameters including Shukla, Eberhart-Russell, AMMI, and more.',
    url: 'https://cran.r-project.org/web/packages/stability/index.html',
    organization: 'CRAN',
    type: 'R Package',
    features: ['Shukla stability', 'Eberhart-Russell', 'Lin & Binns', 'AMMI stability', '10+ indices']
  },
  {
    id: 'metan-stability',
    name: 'metan (R) - Stability Module',
    description: 'Multi-Environment Trial Analysis with comprehensive stability statistics and WAAS index.',
    url: 'https://tiagoolivoto.github.io/metan/articles/vignettes_stability.html',
    organization: 'Tiago Olivoto',
    type: 'R Package',
    features: ['WAAS/WAASB', 'Stability indices', 'Ranking', 'Correlation analysis', 'Plots']
  },
  {
    id: 'agricolae-stability',
    name: 'agricolae (R)',
    description: 'Agricultural research package with extensive stability analysis functions for plant breeding data.',
    url: 'https://cran.r-project.org/web/packages/agricolae/vignettes/tutorial_agri.pdf',
    organization: 'Universidad Nacional del Trujillo',
    type: 'R Package',
    features: ['Regression method', 'AMMI', 'GGE', 'Comparisons', 'Experimental design']
  }
]

const STATISTICAL_SOFTWARE: ToolRedirect[] = [
  {
    id: 'sas-ge',
    name: 'SAS for G×E Analysis',
    description: 'Industry-standard statistical software with comprehensive mixed model capabilities for G×E analysis.',
    url: 'https://support.sas.com/documentation/onlinedoc/stat/',
    organization: 'SAS Institute',
    type: 'Commercial Software',
    features: ['PROC MIXED', 'PROC GLIMMIX', 'Random regression', 'REML/BLUP', 'Factor analytic']
  },
  {
    id: 'asreml-ge',
    name: 'ASReml',
    description: 'Advanced REML software for complex G×E models including factor analytic and multi-trait analysis.',
    url: 'https://vsni.co.uk/software/asreml/',
    organization: 'VSN International',
    type: 'Commercial Software',
    features: ['Factor analytic', 'Spatial models', 'Pedigree', 'Genomic prediction', 'MET analysis']
  },
  {
    id: 'genstat-ge',
    name: 'GenStat - G×E Module',
    description: 'Statistical software with dedicated plant breeding modules for genotype by environment interaction studies.',
    url: 'https://www.vsni.co.uk/software/genstat/',
    organization: 'VSN International',
    type: 'Commercial Software',
    features: ['GGE biplot', 'AMMI', 'Mixed models', 'QTL × E', 'Design generation']
  }
]

const ONLINE_TOOLS: ToolRedirect[] = [
  {
    id: 'shiny-met',
    name: 'MET Shiny App',
    description: 'Web-based Multi-Environment Trial analysis tool with stability statistics and visualization.',
    url: 'https://tiagoolivoto.shinyapps.io/metan/',
    organization: 'Tiago Olivoto',
    type: 'Web Application',
    features: ['Upload CSV', 'Multiple analyses', 'Interactive plots', 'Export results']
  },
  {
    id: 'gge-shiny',
    name: 'GGE Biplot Online',
    description: 'Online GGE biplot tool with stability visualization and environment characterization.',
    url: 'https://julianhago.shinyapps.io/GGE_biplot/',
    organization: 'Academic',
    type: 'Web Application',
    features: ['GGE biplot', 'Stability view', 'Which-won-where', 'No installation']
  }
]

const STABILITY_INDICES = [
  { name: 'Shukla\'s Stability Variance', desc: 'Covariance of interaction effects' },
  { name: 'Eberhart-Russell', desc: 'Regression-based stability' },
  { name: 'Finlay-Wilkinson', desc: 'Joint regression analysis' },
  { name: 'Wricke\'s Ecovalence', desc: 'Contribution to G×E sum of squares' },
  { name: 'Pinthus\' Coefficient', desc: 'Regression coefficient (bi)' },
  { name: 'AMMI Stability Value', desc: 'Based on IPCA scores' },
  { name: 'Yield Stability Index (YSI)', desc: 'Combines mean and stability rank' },
  { name: 'WAAS Index', desc: 'Weighted average of absolute scores' },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GXEModule() {
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
          <TrendingUp className="h-8 w-8 text-orange-600" />
          <h2 className="text-3xl font-bold text-gray-900">G×E Interaction Analysis</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Professional tools for Genotype × Environment interaction analysis and 
          stability parameter estimation.
        </p>
      </motion.div>

      {/* Info Banner */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-orange-900">Understanding G×E Interaction</h4>
              <p className="text-sm text-orange-700 mt-1">
                Genotype × Environment (G×E) interaction occurs when genotypes respond differently 
                across environments. Understanding this is crucial for:
              </p>
              <ul className="list-disc list-inside text-sm text-orange-700 mt-2 space-y-1">
                <li>Identifying widely adapted vs. specifically adapted genotypes</li>
                <li>Determining optimal test locations for breeding programs</li>
                <li>Making cultivar recommendations for specific target environments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Online Tools - Quick Access */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Quick Access - Web Applications (Try Now)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ONLINE_TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-green-300 bg-green-50 hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {tool.name}
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Free Online
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-green-700">{tool.organization}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tool.features.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => openTool(tool.url)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Launch App Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* R Packages */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          R Packages for Stability Analysis
        </h3>

        {STABILITY_TOOLS.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {tool.name}
                      <Badge variant="secondary">{tool.type}</Badge>
                    </CardTitle>
                    <p className="text-gray-600">{tool.description}</p>
                  </div>
                  <BookOpen className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
                <p className="text-sm text-emerald-600 font-medium">{tool.organization}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Available Stability Indices:</h5>
                    <div className="flex flex-wrap gap-2">
                      {tool.features.map((feature) => (
                        <Badge key={feature} variant="outline">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => openTool(tool.url)}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Commercial Software */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Enterprise Statistical Software
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATISTICAL_SOFTWARE.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
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

      {/* Stability Indices Reference */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Common Stability Parameters Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STABILITY_INDICES.map((item) => (
              <div key={item.name} className="bg-white rounded p-3 border border-gray-200">
                <h5 className="font-medium text-sm text-gray-800">{item.name}</h5>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GXEModule
