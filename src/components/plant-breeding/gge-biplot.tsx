'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ScatterChart,
  ExternalLink,
  Info,
  BookOpen,
  Globe,
  Download
} from 'lucide-react'

// ============================================================================
// ORIGINAL TOOL REDIRECTS - GGE Biplot Tools
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

const GGE_TOOLS: ToolRedirect[] = [
  {
    id: 'ggebiplot-official',
    name: 'GGEbiplot Software',
    description: 'The official GGEbiplot software by Dr. Weikai Yan. Complete implementation of all GGE biplot functions for genotype and environment evaluation.',
    url: 'https://www.ggebiplot.com/',
    organization: 'University of Guelph',
    type: 'Windows Software',
    features: ['Which-Won-Where', 'Mean vs Stability', 'Discriminating power', 'Ideal genotype', 'Environment ranking']
  },
  {
    id: 'gge-shiny-app',
    name: 'GGE Shiny Application',
    description: 'Interactive web-based GGE biplot analysis. Upload your data and generate publication-quality biplots directly in your browser.',
    url: 'https://julianhago.shinyapps.io/GGE_biplot/',
    organization: 'Academic',
    type: 'Web Application',
    features: ['Interactive plots', 'Multiple functions', 'CSV upload', 'Download figures', 'No installation']
  },
  {
    id: 'gge-metan',
    name: 'metan R Package',
    description: 'Multi-Environment Trial Analysis - Comprehensive R package with full GGE biplot functionality and WAAS analysis.',
    url: 'https://tiagoolivoto.github.io/metan/articles/vignettes_hybrid_gge.html',
    organization: 'Tiago Olivoto / CRAN',
    type: 'R Package',
    features: ['GGE biplot', 'WAAS index', 'BLUP', 'Weighted analysis', 'ggplot2 graphics']
  }
]

const STATISTICAL_PACKAGES: ToolRedirect[] = [
  {
    id: 'plantbreeding-r-gge',
    name: 'plantbreeding (R)',
    description: 'R package specifically designed for plant breeding data analysis with comprehensive GGE support.',
    url: 'https://cran.r-project.org/web/packages/plantbreeding/index.html',
    organization: 'CRAN / FALCRU',
    type: 'R Package',
    features: ['GGE biplot', 'AMMI', 'Mixed models', 'Spatial analysis', 'Selection indices']
  },
  {
    id: 'agricolae-r',
    name: 'agricolae (R)',
    description: 'Agricultural experimental design and analysis package with GGE and stability statistics.',
    url: 'https://cran.r-project.org/web/packages/agricolae/index.html',
    organization: 'Universidad Nacional del Trujillo',
    type: 'R Package',
    features: ['GGE', 'AMMI', 'Stability indices', 'Experimental designs', 'Comparisons']
  },
  {
    id: 'gge-compromise',
    name: 'GGEBiplotGUI (R)',
    description: 'Graphical user interface for GGE Biplots in R using Tcl/Tk. User-friendly interface for non-programmers.',
    url: 'https://cran.r-project.org/web/packages/GGEBiplotGUI/index.html',
    organization: 'CRAN',
    type: 'R Package (GUI)',
    features: ['GUI interface', 'All GGE functions', 'Export graphics', 'Easy to use']
  }
]

const ONLINE_RESOURCES = [
  { name: 'GGE Biplot Tutorial', url: 'https://www.ggebiplot.com/Introduction.htm', desc: 'Official tutorial' },
  { name: 'GGE Biplot Wikipedia', url: 'https://en.wikipedia.org/wiki/GGE_biplot', desc: 'Overview article' },
  { name: 'CIMMYT G×E Guide', url: 'https://www.cimmyt.org/publications/', desc: 'Research guide' },
  { name: 'Plant Breeding E-Learning', url: 'https://www.plantbreeding.org/?page_id=49', desc: 'Free course' },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GGEBiplotModule() {
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
          <ScatterChart className="h-8 w-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900">GGE Biplot Analysis</h2>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Access professional GGE Biplot tools for visualizing genotype main effects 
          and genotype × environment interactions.
        </p>
      </motion.div>

      {/* Info Banner */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-purple-900">What is GGE Biplot?</h4>
              <p className="text-sm text-purple-700 mt-1">
                GGE (Genotype + Genotype × Environment) biplot is a graphical method to visualize 
                both genotype main effects and G×E interactions simultaneously. It helps identify:
                which genotype performs best in which environment, the discriminating ability 
                of test environments, and ideal genotypes with high mean performance and stability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary GGE Tools */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <ScatterChart className="h-5 w-5" />
          Primary GGE Biplot Tools
        </h3>

        {GGE_TOOLS.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <Card className={`hover:shadow-lg transition-shadow ${tool.type === 'Web Application' ? 'border-green-300 bg-green-50' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {tool.name}
                      <Badge variant={tool.type.includes('Web') ? 'default' : 'secondary'}>
                        {tool.type}
                      </Badge>
                      {tool.type === 'Web Application' && (
                        <Badge className="bg-green-100 text-green-800">Try Now</Badge>
                      )}
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
                    <h5 className="font-medium text-gray-700 mb-2">Available Functions:</h5>
                    <div className="flex flex-wrap gap-2">
                      {tool.features.map((feature) => (
                        <Badge key={feature} variant="outline">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => openTool(tool.url)}
                    className={`w-full ${tool.type === 'Web Application' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {tool.type === 'Web Application' ? 'Launch App Now' : `Visit ${tool.name} Website`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* R Packages */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          R Packages for GGE Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATISTICAL_PACKAGES.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
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
                    View Package
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learning Resources */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Learning Resources & Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ONLINE_RESOURCES.map((resource) => (
              <Button
                key={resource.name}
                variant="outline"
                onClick={() => openTool(resource.url)}
                className="justify-start h-auto py-3 px-4"
              >
                <div className="text-left">
                  <div className="font-medium text-sm">{resource.name}</div>
                  <div className="text-xs text-gray-500">{resource.desc}</div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto flex-shrink-0" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5 text-orange-600" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li><strong>For immediate use:</strong> Click "Launch App Now" on the GGE Shiny Application above</li>
            <li><strong>Prepare your CSV:</strong> Format data with genotypes as rows, environments + traits as columns</li>
            <li><strong>Upload & analyze:</strong> The app will automatically generate all standard GGE biplots</li>
            <li><strong>For advanced users:</strong> Install GGEbiplot software or R packages for more control</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

export default GGEBiplotModule
