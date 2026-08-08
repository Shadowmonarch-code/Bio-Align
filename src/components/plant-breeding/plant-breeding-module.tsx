'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Dna, 
  Calculator, 
  FlaskConical, 
  GitBranch, 
  ArrowRightLeft, 
  ListChecks, 
  Users, 
  Microscope,
  Leaf,
  ChevronRight,
  Info
} from 'lucide-react'

// Import sub-components
import GeneticParametersCalculator from './genetic-parameters'
import ExperimentalDesignAnalyzer from './experimental-design'
import CorrelationRegressionAnalysis from './correlation-regression'
import PathAnalysisComponent from './path-analysis'
import SelectionIndexCalculator from './selection-index'
import DiversityAnalysisComponent from './diversity-analysis'
import PopulationGeneticsAnalyzer from './population-genetics'

// Sample data for testing
export const SAMPLE_YIELD_DATA = [
  ['Genotype', 'Rep1', 'Rep2', 'Rep3'],
  ['G1', 4520, 4380, 4610],
  ['G2', 3890, 4020, 3750],
  ['G3', 4210, 4350, 4180],
  ['G4', 3980, 4120, 4050],
  ['G5', 4780, 4650, 4890],
  ['G6', 4420, 4510, 4380],
  ['G7', 3650, 3780, 3590],
  ['G8', 4150, 4280, 4120],
  ['G9', 4890, 4750, 4980],
  ['G10', 4320, 4450, 4280]
]

export const SAMPLE_MULTI_TRAIT_DATA = [
  ['Genotype', 'PlantHeight', 'PanicleLength', 'GrainsPerPanicle', '1000GrainWt', 'Yield'],
  ['G1', 105, 24, 145, 22.5, 4.8],
  ['G2', 92, 21, 128, 20.1, 3.9],
  ['G3', 98, 23, 138, 21.8, 4.3],
  ['G4', 88, 20, 122, 19.5, 3.7],
  ['G5', 112, 26, 155, 24.2, 5.2],
  ['G6', 101, 23, 140, 22.0, 4.5],
  ['G7', 85, 19, 115, 18.8, 3.4],
  ['G8', 96, 22, 135, 21.2, 4.2],
  ['G9', 115, 27, 160, 25.0, 5.5],
  ['G10', 99, 24, 142, 22.3, 4.6]
]

export const SAMPLE_GENOTYPE_DATA = [
  'AA', 'Aa', 'aa', 'AA', 'Aa', 'Aa', 'aa', 'aa',
  'AA', 'Aa', 'AA', 'aa', 'Aa', 'AA', 'Aa', 'aa',
  'aa', 'AA', 'Aa', 'Aa', 'aa', 'AA', 'Aa', 'aa'
]

interface PlantBreedingModuleProps {
  className?: string
}

const analysisTabs = [
  {
    id: 'genetic-params',
    label: 'Genetic Parameters',
    icon: Calculator,
    description: 'Calculate variance components, heritability & genetic advance',
    color: 'from-red-500 to-rose-500'
  },
  {
    id: 'experimental-design',
    label: 'Experimental Design',
    icon: FlaskConical,
    description: 'CRD, RCBD & Factorial ANOVA analysis',
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'correlation-regression',
    label: 'Correlation & Regression',
    icon: GitBranch,
    description: 'Multi-trait correlation matrix & regression models',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'path-analysis',
    label: 'Path Analysis',
    icon: ArrowRightLeft,
    description: 'Direct & indirect effects with path diagram',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'selection-index',
    label: 'Selection Index',
    icon: ListChecks,
    description: 'Smith, Base Index & Desired Gains methods',
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: 'diversity-analysis',
    label: 'Diversity Analysis',
    icon: Users,
    description: 'Distance matrix, clustering & PCA biplot',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'population-genetics',
    label: 'Population Genetics',
    icon: Microscope,
    description: 'Allele frequencies, HWE test & diversity indices',
    color: 'from-pink-500 to-rose-500'
  }
]

export default function PlantBreedingModule({ className }: PlantBreedingModuleProps) {
  const [activeTab, setActiveTab] = useState('genetic-params')

  return (
    <div className={`w-full ${className || ''}`}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
            <Dna className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold gradient-text">
              Plant Breeding Analysis Module
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Professional quantitative genetics tools for crop improvement research
            </p>
          </div>
        </div>
        
        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary" className="gap-1">
            <Leaf className="h-3 w-3" />
            Variance Components
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <FlaskConical className="h-3 w-3" />
            ANOVA Analysis
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <GitBranch className="h-3 w-3" />
            Path Coefficients
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            Diversity Indices
          </Badge>
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Navigation - Responsive */}
        <div className="mb-6">
          {/* Desktop horizontal tabs */}
          <div className="hidden md:block">
            <TabsList className="grid grid-cols-7 w-full h-auto gap-1 p-1 bg-muted/50">
              {analysisTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-1 py-3 px-2 text-xs font-medium data-[state=active]:shadow-md transition-all"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="truncate max-w-full">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {/* Mobile vertical cards */}
          <div className="md:hidden space-y-2">
            {analysisTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  activeTab === tab.id 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${tab.color}`}>
                  <tab.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm">{tab.label}</div>
                  <div className="text-xs text-muted-foreground">{tab.description}</div>
                </div>
                <ChevronRight className={`h-4 w-4 transition-transform ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="genetic-params" className="mt-0">
              <GeneticParametersCalculator />
            </TabsContent>
            
            <TabsContent value="experimental-design" className="mt-0">
              <ExperimentalDesignAnalyzer />
            </TabsContent>
            
            <TabsContent value="correlation-regression" className="mt-0">
              <CorrelationRegressionAnalysis />
            </TabsContent>
            
            <TabsContent value="path-analysis" className="mt-0">
              <PathAnalysisComponent />
            </TabsContent>
            
            <TabsContent value="selection-index" className="mt-0">
              <SelectionIndexCalculator />
            </TabsContent>
            
            <TabsContent value="diversity-analysis" className="mt-0">
              <DiversityAnalysisComponent />
            </TabsContent>
            
            <TabsContent value="population-genetics" className="mt-0">
              <PopulationGeneticsAnalyzer />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Footer info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-6 p-4 bg-muted/30 rounded-lg border"
      >
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">About this module</p>
            <p>
              All calculations follow standard methodologies from Snedecor & Cochran (Statistical Methods), 
              Gomez & Gomez (Statistical Procedures for Agricultural Research), and Falconer & Mackay 
              (Introduction to Quantitative Genetics). Results are for research purposes.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
