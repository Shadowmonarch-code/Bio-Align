'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkles,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Play,
  Loader2,
  Brain,
  BarChart3,
  LineChart,
  ScatterChart,
  PieChart,
  Activity,
  TrendingUp,
  Zap,
  FileText,
  Download,
  RefreshCw,
  Lightbulb,
  Target,
  Layers,
  Eye,
  ThumbsUp,
  Clock,
  Shield,
  ArrowRight,
  Info,
  Copy,
  Check,
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DatasetInspection {
  rowCount: number
  columnCount: number
  numericColumns: string[]
  categoricalColumns: string[]
  possibleGroupingVar: string | null
  possibleResponseVars: string[]
  detectedDesign: 'unknown' | 'CRD' | 'RCBD' | 'factorial' | 'observational'
  replicationCount: number | null
  treatmentCount: number | null
  missingValues: { column: string; count: number; percent: number }[]
  outlierColumns: string[]
  issues: string[]
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface AnalysisRecommendation {
  id: string
  name: string
  description: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  category: 'descriptive' | 'inferential' | 'multivariate' | 'breeding'
  estimatedTime: string
  icon: React.ReactNode
}

export interface VisualizationRecommendation {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  suitableFor: string[]
}

export interface AnalysisResult {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  result?: Record<string, unknown>
  error?: string
  explanation?: string
}

// ============================================================================
// SAMPLE DATA FOR DEMONSTRATION
// ============================================================================

const SAMPLE_DATASET = [
  { Genotype: 'G1', Block: 1, Yield: 4.5, Height: 120, Biomass: 15.2, Protein: 12.5, DaysToFlower: 65 },
  { Genotype: 'G1', Block: 2, Yield: 4.8, Height: 125, Biomass: 16.1, Protein: 13.0, DaysToFlower: 67 },
  { Genotype: 'G1', Block: 3, Yield: 4.6, Height: 118, Biomass: 14.8, Protein: 12.8, DaysToFlower: 64 },
  { Genotype: 'G2', Block: 1, Yield: 5.2, Height: 135, Biomass: 18.5, Protein: 14.2, DaysToFlower: 62 },
  { Genotype: 'G2', Block: 2, Yield: 5.5, Height: 140, Biomass: 19.2, Protein: 14.8, DaysToFlower: 63 },
  { Genotype: 'G2', Block: 3, Yield: 5.3, Height: 132, Biomass: 17.9, Protein: 14.0, DaysToFlower: 61 },
  { Genotype: 'G3', Block: 1, Yield: 3.8, Height: 110, Biomass: 13.1, Protein: 11.5, DaysToFlower: 70 },
  { Genotype: 'G3', Block: 2, Yield: 4.0, Height: 115, Biomass: 13.8, Protein: 11.8, DaysToFlower: 72 },
  { Genotype: 'G3', Block: 3, Yield: 3.9, Height: 112, Biomass: 13.4, Protein: 11.6, DaysToFlower: 71 },
  { Genotype: 'G4', Block: 1, Yield: 6.1, Height: 148, Biomass: 21.0, Protein: 15.5, DaysToFlower: 58 },
  { Genotype: 'G4', Block: 2, Yield: 6.4, Height: 152, Biomass: 22.1, Protein: 16.0, DaysToFlower: 59 },
  { Genotype: 'G4', Block: 3, Yield: 6.2, Height: 145, Biomass: 20.5, Protein: 15.7, DaysToFlower: 57 },
  { Genotype: 'G5', Block: 1, Yield: 4.9, Height: 128, Biomass: 16.8, Protein: 13.5, DaysToFlower: 64 },
  { Genotype: 'G5', Block: 2, Yield: 5.1, Height: 130, Biomass: 17.2, Protein: 13.8, DaysToFlower: 65 },
  { Genotype: 'G5', Block: 3, Yield: 5.0, Height: 126, Biomass: 16.5, Protein: 13.3, DaysToFlower: 63 },
  { Genotype: 'G6', Block: 1, Yield: 4.2, Height: 118, Biomass: 14.5, Protein: 12.2, DaysToFlower: 68 },
  { Genotype: 'G6', Block: 2, Yield: 4.4, Height: 122, Biomass: 15.1, Protein: 12.6, DaysToFlower: 69 },
  { Genotype: 'G6', Block: 3, Yield: null as unknown as number, Height: 120, Biomass: 14.8, Protein: 12.4, DaysToFlower: 67 },
  { Genotype: 'G7', Block: 1, Yield: 5.7, Height: 142, Biomass: 19.8, Protein: 14.9, DaysToFlower: 60 },
  { Genotype: 'G7', Block: 2, Yield: 5.9, Height: 145, Biomass: 20.5, Protein: 15.2, DaysToFlower: 61 },
  { Genotype: 'G7', Block: 3, Yield: 5.8, Height: 140, Biomass: 20.0, Protein: 15.0, DaysToFlower: 59 },
  { Genotype: 'G8', Block: 1, Yield: 4.6, Height: 124, Biomass: 15.8, Protein: 13.0, DaysToFlower: 66 },
  { Genotype: 'G8', Block: 2, Yield: 4.7, Height: 126, Biomass: 16.2, Protein: 13.2, DaysToFlower: 67 },
  { Genotype: 'G8', Block: 3, Yield: 4.5, Height: 122, Biomass: 15.5, Protein: 12.9, DaysToFlower: 65 },
  { Genotype: 'G9', Block: 1, Yield: 5.4, Height: 138, Biomass: 18.8, Protein: 14.5, DaysToFlower: 61 },
  { Genotype: 'G9', Block: 2, Yield: 5.6, Height: 140, Biomass: 19.4, Protein: 14.8, DaysToFlower: 62 },
  { Genotype: 'G9', Block: 3, Yield: null as unknown as number, Height: 136, Biomass: 18.6, Protein: 14.3, DaysToFlower: 60 },
  { Genotype: 'G10', Block: 1, Yield: 4.3, Height: 116, Biomass: 14.2, Protein: 12.0, DaysToFlower: 69 },
  { Genotype: 'G10', Block: 2, Yield: 4.5, Height: 120, Biomass: 14.9, Protein: 12.4, DaysToFlower: 70 },
  { Genotype: 'G10', Block: 3, Yield: 4.4, Height: 118, Biomass: 14.5, Protein: 12.2, DaysToFlower: 68 },
]

// ============================================================================
// DATA INSPECTION ENGINE
// ============================================================================

function inspectDataset(data: Record<string, unknown>[]): DatasetInspection {
  if (!data || data.length === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      numericColumns: [],
      categoricalColumns: [],
      possibleGroupingVar: null,
      possibleResponseVars: [],
      detectedDesign: 'unknown',
      replicationCount: null,
      treatmentCount: null,
      missingValues: [],
      outlierColumns: [],
      issues: ['No data provided'],
      dataQuality: 'poor',
    }
  }

  const columns = Object.keys(data[0])
  const numericColumns: string[] = []
  const categoricalColumns: string[] = []

  // Classify columns
  columns.forEach((col) => {
    const values = data.map((row) => row[col]).filter((v) => v !== null && v !== undefined)
    const numericValues = values.filter((v) => typeof v === 'number' && !isNaN(v as number))
    
    if (numericValues.length > values.length * 0.8) {
      numericColumns.push(col)
    } else if (values.length > 0) {
      categoricalColumns.push(col)
    }
  })

  // Detect missing values
  const missingValues: { column: string; count: number; percent: number }[] = []
  columns.forEach((col) => {
    const missing = data.filter((row) => row[col] === null || row[col] === undefined).length
    if (missing > 0) {
      missingValues.push({
        column: col,
        count: missing,
        percent: Math.round((missing / data.length) * 1000) / 10,
      })
    }
  })

  // Detect outliers using IQR method for numeric columns
  const outlierColumns: string[] = []
  numericColumns.forEach((col) => {
    const values = data
      .map((row) => row[col])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v))
      .sort((a, b) => a - b)
    
    if (values.length >= 4) {
      const q1 = values[Math.floor(values.length * 0.25)]
      const q3 = values[Math.floor(values.length * 0.75)]
      const iqr = q3 - q1
      const lowerBound = q1 - 1.5 * iqr
      const upperBound = q3 + 1.5 * iqr
      
      const outliers = values.filter((v) => v < lowerBound || v > upperBound)
      if (outliers.length > 0) {
        outlierColumns.push(col)
      }
    }
  })

  // Identify possible grouping variable (categorical with multiple levels)
  let possibleGroupingVar: string | null = null
  let treatmentCount: number | null = null

  for (const col of categoricalColumns) {
    const uniqueValues = new Set(data.map((row) => row[col]))
    if (uniqueValues.size >= 3 && uniqueValues.size <= data.length * 0.5) {
      possibleGroupingVar = col
      treatmentCount = uniqueValues.size
      break
    }
  }

  // Identify response variables (numeric columns that aren't identifiers)
  const possibleResponseVars = numericColumns.filter(
    (col) => !col.toLowerCase().includes('id') && !col.toLowerCase().includes('index')
  )

  // Detect experimental design
  let detectedDesign: DatasetInspection['detectedDesign'] = 'observational'
  let replicationCount: number | null = null

  if (possibleGroupingVar && categoricalColumns.includes('Block')) {
    detectedDesign = 'RCBD'
    const blockCounts = new Map<string, number>()
    data.forEach((row) => {
      const block = row['Block']
      blockCounts.set(String(block), (blockCounts.get(String(block)) || 0) + 1)
    })
    replicationCount = blockCounts.size > 0 ? Array.from(blockCounts.values())[0] : null
  } else if (possibleGroupingVar && !categoricalColumns.includes('Block')) {
    detectedDesign = 'CRD'
    const groupCounts = new Map<string, number>()
    data.forEach((row) => {
      const group = row[possibleGroupingVar]
      groupCounts.set(String(group), (groupCounts.get(String(group)) || 0) + 1)
    })
    replicationCount = groupCounts.size > 0 ? Math.min(...Array.from(groupCounts.values())) : null
  }

  // Generate issues list
  const issues: string[] = []
  
  if (missingValues.length > 0) {
    const totalMissing = missingValues.reduce((sum, m) => sum + m.count, 0)
    issues.push(`${totalMissing} missing value(s) found across ${missingValues.length} column(s)`)
  }
  
  if (outlierColumns.length > 0) {
    issues.push(`Potential outliers detected in ${outlierColumns.join(', ')}`)
  }
  
  if (data.length < 30) {
    issues.push(`Small sample size (${data.length} rows). Results may have limited statistical power.`)
  }

  // Determine overall data quality
  let dataQuality: DatasetInspection['dataQuality'] = 'excellent'
  const totalMissingPercent = missingValues.reduce((sum, m) => sum + m.percent, 0)
  
  if (totalMissingPercent > 10 || issues.length > 3) {
    dataQuality = 'poor'
  } else if (totalMissingPercent > 5 || issues.length > 2) {
    dataQuality = 'fair'
  } else if (totalMissingPercent > 0 || issues.length > 0) {
    dataQuality = 'good'
  }

  return {
    rowCount: data.length,
    columnCount: columns.length,
    numericColumns,
    categoricalColumns,
    possibleGroupingVar,
    possibleResponseVars,
    detectedDesign,
    replicationCount,
    treatmentCount,
    missingValues,
    outlierColumns,
    issues,
    dataQuality,
  }
}

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

function generateRecommendations(inspection: DatasetInspection): AnalysisRecommendation[] {
  const recommendations: AnalysisRecommendation[] = []

  // Always recommend descriptive statistics
  recommendations.push({
    id: 'descriptive',
    name: 'Descriptive Statistics',
    description: 'Calculate means, standard deviations, ranges, and CVs for all traits',
    reason: 'Fundamental first step for any analysis - understand your data distribution',
    priority: 'high',
    category: 'descriptive',
    estimatedTime: '< 30s',
    icon: <BarChart3 className="h-4 w-4" />,
  })

  // If experimental design detected - recommend ANOVA
  if (inspection.detectedDesign === 'RCBD') {
    recommendations.push({
      id: 'rcbd-anova',
      name: 'RCBD ANOVA',
      description: `Test significance of ${inspection.possibleGroupingVar || 'treatment'} differences with block adjustment`,
      reason: `Detected RCBD design with ${inspection.treatmentCount} treatments and ${inspection.replicationCount} replications`,
      priority: 'high',
      category: 'inferential',
      estimatedTime: '< 1 min',
      icon: <Activity className="h-4 w-4" />,
    })
  } else if (inspection.detectedDesign === 'CRD') {
    recommendations.push({
      id: 'crd-anova',
      name: 'CRD ANOVA',
      description: `Test significance of ${inspection.possibleGroupingVar || 'treatment'} differences`,
      reason: `Detected CRD design with ${inspection.treatmentCount} treatments`,
      priority: 'high',
      category: 'inferential',
      estimatedTime: '< 1 min',
      icon: <Activity className="h-4 w-4" />,
    })
  }

  // If multiple numeric traits - recommend correlation
  if (inspection.numericColumns.length >= 3) {
    recommendations.push({
      id: 'correlation',
      name: 'Correlation Analysis',
      description: `Examine trait relationships with significance testing and heatmap visualization`,
      reason: `${inspection.numericColumns.length} numeric traits available for correlation analysis`,
      priority: 'high',
      category: 'multivariate',
      estimatedTime: '< 1 min',
      icon: <ScatterChart className="h-4 w-4" />,
    })

    // Recommend path analysis if yield-like variable exists
    const yieldLikeVar = inspection.possibleResponseVars.find(
      (v) => v.toLowerCase().includes('yield') || v.toLowerCase().includes('weight')
    )
    if (yieldLikeVar && inspection.possibleResponseVars.length >= 3) {
      recommendations.push({
        id: 'path-analysis',
        name: 'Path Analysis',
        description: `Decompose correlations into direct and indirect effects on ${yieldLikeVar}`,
        reason: `Multiple traits available to analyze causal pathways to ${yieldLikeVar}`,
        priority: 'medium',
        category: 'breeding',
        estimatedTime: '~ 2 min',
        icon: <Target className="h-4 w-4" />,
      })
    }
  }

  // If multiple genotypes/treatments - recommend comparison
  if ((inspection.treatmentCount ?? 0) >= 5) {
    recommendations.push({
      id: 'means-comparison',
      name: 'Means Comparison',
      description: 'Pairwise comparisons with multiple test correction (LSD, HSD, Tukey)',
      reason: `${inspection.treatmentCount} treatments enable meaningful post-hoc comparisons`,
      priority: 'high',
      category: 'inferential',
      estimatedTime: '< 1 min',
      icon: <TrendingUp className="h-4 w-4" />,
    })
  }

  // Multivariate analyses for larger datasets
  if (inspection.numericColumns.length >= 4 && inspection.rowCount >= 20) {
    recommendations.push({
      id: 'pca',
      name: 'Principal Component Analysis',
      description: 'Reduce dimensionality and visualize genotype clustering patterns',
      reason: `${inspection.numericColumns.length} variables suitable for dimensionality reduction`,
      priority: 'medium',
      category: 'multivariate',
      estimatedTime: '~ 1 min',
      icon: <Layers className="h-4 w-4" />,
    })

    recommendations.push({
      id: 'cluster-analysis',
      name: 'Cluster Analysis',
      description: 'Hierarchical grouping of observations based on trait similarities',
      reason: `${inspection.rowCount} observations can be grouped by similarity patterns`,
      priority: 'medium',
      category: 'multivariate',
      estimatedTime: '~ 2 min',
      icon: <PieChart className="h-4 w-4" />,
    })
  }

  // Breeding-specific recommendations
  if (inspection.possibleResponseVars.length >= 3 && inspection.possibleGroupingVar) {
    recommendations.push({
      id: 'selection-index',
      name: 'Selection Index',
      description: 'Construct Smith-Hazel or base index for multi-trait selection',
      reason: 'Multiple response traits suitable for selection index construction',
      priority: 'medium',
      category: 'breeding',
      estimatedTime: '~ 2 min',
      icon: <Zap className="h-4 w-4" />,
    })

    recommendations.push({
      id: 'genetic-parameters',
      name: 'Genetic Parameters',
      description: 'Estimate variance components, heritability, and genetic correlations',
      reason: 'Experimental design allows estimation of genetic parameters',
      priority: 'medium',
      category: 'breeding',
      estimatedTime: '~ 2 min',
      icon: <DnaIcon className="h-4 w-4" />,
    })
  }

  // GGE biplot recommendation
  if (
    inspection.categoricalColumns.some((c) =>
      c.toLowerCase().includes('environment') || c.toLowerCase().includes('location') || c.toLowerCase().includes('year')
    ) ||
    (inspection.treatmentCount ?? 0) >= 8
  ) {
    recommendations.push({
      id: 'gge-biplot',
      name: 'GGE Biplot',
      description: 'Visualize genotype × environment interaction patterns',
      reason: 'Multi-environment or large genotype set suitable for GGE analysis',
      priority: 'low',
      category: 'breeding',
      estimatedTime: '~ 3 min',
      icon: <LineChart className="h-4 w-4" />,
    })
  }

  return recommendations
}

function generateVisualizationRecommendations(inspection: DatasetInspection): VisualizationRecommendation[] {
  const visualizations: VisualizationRecommendation[] = []

  // Always useful
  visualizations.push({
    id: 'bar-chart',
    name: 'Trait Comparison Bar Chart',
    description: 'Compare mean values across treatments/genotypes',
    icon: <BarChart3 className="h-5 w-5" />,
    suitableFor: ['descriptive', 'inferential'],
  })

  if (inspection.numericColumns.length >= 3) {
    visualizations.push({
      id: 'heatmap',
      name: 'Correlation Heatmap',
      description: 'Visualize correlation matrix with color intensity',
      icon: <div className="h-5 w-5 grid grid-cols-2 gap-[1px]">
        <div className="bg-red-500 rounded-sm" />
        <div className="bg-yellow-500 rounded-sm" />
        <div className="bg-green-500 rounded-sm" />
        <div className="bg-blue-500 rounded-sm" />
      </div>,
      suitableFor: ['correlation', 'multivariate'],
    })
  }

  if (inspection.possibleGroupingVar) {
    visualizations.push({
      id: 'boxplot',
      name: 'Box Plot by Treatment',
      description: 'Show distribution and outliers per group',
      icon: <Activity className="h-5 w-5" />,
      suitableFor: ['descriptive', 'inferential'],
    })
  }

  if (inspection.numericColumns.length >= 4) {
    visualizations.push({
      id: 'pca-biplot',
      name: 'PCA Biplot',
      description: 'Visualize observations and variables in reduced space',
      icon: <ScatterChart className="h-5 w-5" />,
      suitableFor: ['pca', 'multivariate'],
    })

    visualizations.push({
      id: 'dendrogram',
      name: 'Cluster Dendrogram',
      description: 'Hierarchical tree showing similarity relationships',
      icon: <div className="h-5 w-5 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M12 3v18M12 3l-4 4M12 3l4 4M8 21H4M16 21h4M8 14H4M16 14h4" />
        </svg>
      </div>,
      suitableFor: ['cluster-analysis', 'multivariate'],
    })
  }

  visualizations.push({
    id: 'scatter-matrix',
    name: 'Scatter Plot Matrix',
    description: 'Pairwise scatter plots for all numeric variables',
    icon: <ScatterChart className="h-5 w-5" />,
    suitableFor: ['correlation', 'multivariate'],
  })

  return visualizations
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function DnaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 15c6.667-6 13.333 0 20-6" />
      <path d="M2 9c6.667 6 13.333 0 20 6" />
      <path d="M12 3v1M12 20v1M3 12h1M20 12h1" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function DataQualityBadge({ quality }: { quality: DatasetInspection['dataQuality'] }) {
  const config = {
    excellent: { label: 'Excellent', variant: 'default' as const, color: 'text-green-600 bg-green-50 border-green-200' },
    good: { label: 'Good', variant: 'secondary' as const, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    fair: { label: 'Fair', variant: 'outline' as const, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    poor: { label: 'Needs Attention', variant: 'destructive' as const, color: 'text-red-600 bg-red-50 border-red-200' },
  }

  const c = config[quality]

  return (
    <Badge variant={c.variant} className={`${c.color} border font-medium`}>
      {quality === 'excellent' && <CheckCircle2 className="h-3 w-3 mr-1" />}
      {quality === 'good' && <CheckCircle2 className="h-3 w-3 mr-1" />}
      {quality === 'fair' && <AlertTriangle className="h-3 w-3 mr-1" />}
      {quality === 'poor' && <XCircle className="h-3 w-3 mr-1" />}
      {c.label}
    </Badge>
  )
}

function DesignBadge({ design }: { design: DatasetInspection['detectedDesign'] }) {
  const config = {
    unknown: { label: 'Unknown Design', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    CRD: { label: 'CRD (Completely Randomized)', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    RCBD: { label: 'RCBD (Randomized Complete Block)', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    factorial: { label: 'Factorial Design', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    observational: { label: 'Observational Study', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  }

  const c = config[design]

  return (
    <Badge variant="outline" className={`${c.color} border font-medium`}>
      <Database className="h-3 w-3 mr-1" />
      {c.label}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { label: 'Recommended', color: 'bg-red-50 text-red-700 border-red-200', icon: <ThumbsUp className="h-3 w-3" /> },
    medium: { label: 'Optional', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Info className="h-3 w-3" /> },
    low: { label: 'Advanced', color: 'bg-gray-50 text-gray-600 border-gray-200', icon: <Lightbulb className="h-3 w-3" /> },
  }

  const c = config[priority]

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.color}`}>
      {c.icon}
      {c.label}
    </span>
  )
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    descriptive: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    inferential: 'bg-violet-50 text-violet-700 border-violet-200',
    multivariate: 'bg-pink-50 text-pink-700 border-pink-200',
    breeding: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <Badge variant="outline" className={`${colors[category] || 'bg-gray-50 text-gray-600 border-gray-200'} border text-xs capitalize`}>
      {category}
    </Badge>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface AnalyzeMyDataProps {
  data?: Record<string, unknown>[]
  onAnalysisComplete?: (results: AnalysisResult[]) => void
  compact?: boolean
}

export default function AnalyzeMyData({ 
  data = SAMPLE_DATASET, 
  onAnalysisComplete,
  compact = false 
}: AnalyzeMyDataProps) {
  // State management
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRunningAnalyses, setIsRunningAnalyses] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<string>>(new Set())
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [aiExplanation, setAiExplanation] = useState<Record<string, string>>({})
  const [isLoadingExplanation, setIsLoadingExplanation] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Run inspection
  const inspection = useMemo(() => inspectDataset(data), [data])

  // Generate recommendations based on inspection
  const recommendations = useMemo(() => generateRecommendations(inspection), [inspection])
  const visualizationRecs = useMemo(() => generateVisualizationRecommendations(inspection), [inspection])

  // Steps for wizard
  const steps = [
    { title: 'Inspect', icon: <Eye className="h-4 w-4" /> },
    { title: 'Review', icon: <Brain className="h-4 w-4" /> },
    { title: 'Execute', icon: <Play className="h-4 w-4" /> },
    { title: 'Results', icon: <FileText className="h-4 w-4" /> },
  ]

  // Initialize selected analyses (auto-select high priority)
  React.useEffect(() => {
    const initialSelected = new Set(
      recommendations.filter((r) => r.priority === 'high').map((r) => r.id)
    )
    setSelectedAnalyses(initialSelected)
  }, [recommendations])

  // Toggle analysis selection
  const toggleAnalysis = useCallback((id: string) => {
    setSelectedAnalyses((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Select/Deselect all
  const selectAll = useCallback(() => {
    setSelectedAnalyses(new Set(recommendations.map((r) => r.id)))
  }, [recommendations])

  const deselectAll = useCallback(() => {
    setSelectedAnalyses(new Set())
  }, [])

  // Start analysis process
  const startAnalysis = useCallback(async () => {
    setIsAnalyzing(true)
    
    // Animate through inspection steps
    for (let i = 0; i <= 2; i++) {
      setCurrentStep(i)
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
    
    await new Promise((resolve) => setTimeout(resolve, 300))
    setIsAnalyzing(false)
  }, [])

  // Generate mock results for demonstration (defined before runAnalyses to avoid hoisting issues)
  const generateMockResult = React.useCallback((analysisId: string): Record<string, unknown> => {
    switch (analysisId) {
      case 'descriptive':
        return {
          type: 'table',
          headers: ['Trait', 'Mean', 'Std Dev', 'Min', 'Max', 'CV%'],
          rows: [
            ['Yield (t/ha)', '4.97', '0.72', '3.80', '6.40', '14.5'],
            ['Height (cm)', '129.2', '11.3', '110', '152', '8.7'],
            ['Biomass (g)', '17.2', '2.5', '13.1', '22.1', '14.5'],
            ['Protein (%)', '13.5', '1.3', '11.5', '16.0', '9.6'],
            ['Days to Flower', '63.8', '4.1', '57', '72', '6.4'],
          ],
          summary: '5 quantitative traits analyzed across 25 observations',
        }
      case 'rcbd-anova':
      case 'crd-anova':
        return {
          type: 'anova_table',
          title: 'Analysis of Variance for Yield',
          headers: ['Source', 'df', 'SS', 'MS', 'F-value', 'Pr>F'],
          rows: [
            ['Treatment', '9', '12.456', '1.384', '28.47', '<0.0001***'],
            ['Block', '2', '0.234', '0.117', '2.41', '0.1152'],
            ['Error', '18', '0.876', '0.049', '', ''],
            ['Total', '29', '13.566', '', '', ''],
          ],
          interpretation: 'Highly significant differences among genotypes (p < 0.001)',
          cv: '4.44%',
          rSquared: '93.54%',
        }
      case 'correlation':
        return {
          type: 'correlation_matrix',
          title: 'Pearson Correlation Coefficients',
          matrix: [
            ['', 'Yield', 'Height', 'Biomass', 'Protein', 'Days'],
            ['Yield', '1.00', '0.95**', '0.98**', '0.89**', '-0.92**'],
            ['Height', '0.95**', '1.00', '0.94**', '0.82**', '-0.88**'],
            ['Biomass', '0.98**', '0.94**', '1.00', '0.91**', '-0.90**'],
            ['Protein', '0.89**', '0.82**', '0.91**', '1.00', '-0.85**'],
            ['Days', '-0.92**', '-0.88**', '-0.90**', '-0.85**', '1.00'],
          ],
          note: '** Significant at p < 0.01',
        }
      case 'path-analysis':
        return {
          type: 'path_coefficients',
          title: 'Path Coefficient Analysis (Yield as Dependent Variable)',
          directEffects: { Height: 0.28, Biomass: 0.52, Protein: 0.18, DaysToFlower: -0.15 },
          residualEffect: 0.08,
          rSquared: '0.94',
          interpretation: 'Biomass has the strongest direct effect on yield (0.52)',
        }
      case 'means-comparison':
        return {
          type: 'grouping',
          title: 'Genotype Grouping by LSD Test (α=0.05)',
          groups: [
            { genotype: 'G4', mean: 6.23, group: 'A' },
            { genotype: 'G7', mean: 5.80, group: 'AB' },
            { genotype: 'G9', mean: 5.50, group: 'BC' },
            { genotype: 'G2', mean: 5.33, group: 'CD' },
            { genotype: 'G5', mean: 5.00, group: 'DE' },
            { genotype: 'G8', mean: 4.60, group: 'EF' },
            { genotype: 'G10', mean: 4.40, group: 'FG' },
            { genotype: 'G6', mean: 4.33, group: 'FG' },
            { genotype: 'G1', mean: 4.63, group: 'EF' },
            { genotype: 'G3', mean: 3.90, group: 'G' },
          ],
          lsd: 0.42,
          cv: '4.44%',
        }
      case 'pca':
        return {
          type: 'pca_results',
          title: 'Principal Component Analysis',
          eigenvalues: [
            { pc: 'PC1', eigenvalue: 4.12, variance: 82.4, cumulative: 82.4 },
            { pc: 'PC2', eigenvalue: 0.62, variance: 12.4, cumulative: 94.8 },
            { pc: 'PC3', eigenvalue: 0.18, variance: 3.6, cumulative: 98.4 },
          ],
          loadings: [
            { trait: 'Yield', pc1: 0.49, pc2: -0.12 },
            { trait: 'Height', pc1: 0.47, pc2: 0.28 },
            { trait: 'Biomass', pc1: 0.49, pc2: -0.05 },
            { trait: 'Protein', pc1: 0.45, pc2: 0.42 },
            { trait: 'Days', pc1: -0.47, pc2: -0.23 },
          ],
          interpretation: 'First two PCs explain 94.8% of total variation',
        }
      default:
        return {
          type: 'summary',
          message: `Analysis "${analysisId}" completed successfully.`,
          timestamp: new Date().toISOString(),
        }
    }
  }, [])

  // Run selected analyses
  const runAnalyses = useCallback(async () => {
    if (selectedAnalyses.size === 0) return

    setIsRunningAnalyses(true)
    setCurrentStep(2)

    // Initialize results
    const initialResults: AnalysisResult[] = Array.from(selectedAnalyses).map((id) => ({
      id,
      name: recommendations.find((r) => r.id === id)?.name || id,
      status: 'pending',
      progress: 0,
    }))
    setAnalysisResults(initialResults)

    // Simulate running each analysis
    for (let i = 0; i < initialResults.length; i++) {
      const result = initialResults[i]
      
      // Update to running
      setAnalysisResults((prev) =>
        prev.map((r) => (r.id === result.id ? { ...r, status: 'running' as const, progress: 10 } : r))
      )
      
      // Simulate progress
      for (let progress = 20; progress <= 90; progress += 20) {
        await new Promise((resolve) => setTimeout(resolve, 150))
        setAnalysisResults((prev) =>
          prev.map((r) => (r.id === result.id ? { ...r, progress } : r))
        )
      }
      
      await new Promise((resolve) => setTimeout(resolve, 200))
      
      // Complete
      setAnalysisResults((prev) =>
        prev.map((r) =>
          r.id === result.id
            ? {
                ...r,
                status: 'completed' as const,
                progress: 100,
                result: generateMockResult(result.id),
              }
            : r
        )
      )
    }

    await new Promise((resolve) => setTimeout(resolve, 300))
    setCurrentStep(3)
    setShowResults(true)
    setIsRunningAnalyses(false)

    onAnalysisComplete?.(analysisResults)
  }, [selectedAnalyses, recommendations, onAnalysisComplete, analysisResults, generateMockResult])

  // Get AI explanation
  const getAIExplanation = async (result: AnalysisResult) => {
    setIsLoadingExplanation(result.id)
    
    // Simulate AI explanation generation
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    const explanations: Record<string, string> = {
      descriptive: `## Descriptive Statistics Summary 📊

Your dataset contains **25 observations** across **10 genotypes** with **3 replications** each.

### Key Findings:

| Trait | Insight |
|-------|---------|
| **Yield** | Ranges from 3.8 to 6.4 t/ha (moderate variability, CV=14.5%) |
| **Height** | Strong positive correlation with yield (r=0.95) |
| **Biomass** | Highest correlation with yield (r=0.98) |

### Recommendations:
- Consider **G4** as top performer (mean yield: 6.23 t/ha)
- **G3** shows lowest performance but may have other desirable traits
- Data quality is **good** with only 2 missing values`,

      'rcbd-anova': `## ANOVA Interpretation 🔬

### Statistical Significance:
The analysis reveals **highly significant differences** among genotypes (**F = 28.47, p < 0.0001**).

### What This Means:
1. ✅ **Treatment effect is real** - The observed differences are not due to chance
2. ✅ **Block effect is non-significant** (p = 0.115) - Blocking was appropriate but blocks were homogeneous
3. ✅ **High R² (93.5%)** - The model explains most variation in yield

### Practical Implications:
- You can confidently select superior genotypes
- The LSD value (0.42 t/ha) can be used for pairwise comparisons
- Consider G4, G7, and G9 as your elite selection candidates`,

      'correlation': `## Correlation Analysis Insights 🔗

### Strong Positive Correlations:
- **Yield ↔ Biomass**: r = 0.98 (nearly perfect!)
- **Yield ↔ Height**: r = 0.95 (very strong)
- **Yield ↔ Protein**: r = 0.89 (strong)

### Negative Correlations:
- **Yield ↔ Days to Flower**: r = -0.92 (earlier flowering → higher yield)

### Breeding Implications:
1. **Selection efficiency**: Selecting for biomass will indirectly improve yield
2. **Early maturity**: Associated with higher yield - good for short-season environments
3. **Trade-off warning**: Very strong correlations may indicate redundancy in measurements

### Suggested Next Step:
Run **Path Analysis** to decompose these correlations into direct vs indirect effects!`,

      default: `## AI Analysis Explanation 🤖

This analysis was performed using BioAlign's intelligent recommendation engine.

### Methodology:
- Appropriate statistical tests were selected based on your data structure
- Significance level: α = 0.05
- Multiple comparison corrections applied where needed

### Quality Checks:
✅ Sample size adequate for analysis
✅ Assumptions verified (normality, homogeneity)
✅ Outliers identified and handled appropriately

Need more details? Ask me a specific question about this result!`,
    }

    const explanation = explanations[result.id] || explanations.default
    
    setAiExplanation((prev) => ({ ...prev, [result.id]: explanation }))
    setIsLoadingExplanation(null)
  }

  // Copy result to clipboard
  const copyResult = async (result: AnalysisResult) => {
    try {
      const text = JSON.stringify(result.result, null, 2)
      await navigator.clipboard.writeText(text)
      setCopiedId(result.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Clipboard API may fail
    }
  }

  // Reset analysis
  const resetAnalysis = () => {
    setShowResults(false)
    setCurrentStep(0)
    setAnalysisResults([])
    setAiExplanation({})
  }

  // Compact mode - just show button
  if (compact) {
    return (
      <Button
        onClick={startAnalysis}
        disabled={isAnalyzing}
        className="relative overflow-hidden bg-gradient-to-r from-[#C1121F] via-[#A00E19] to-[#C1121F] 
                   text-white shadow-lg shadow-[#C1121F]/25 hover:shadow-xl hover:shadow-[#C1121F]/35
                   transition-all duration-300 group"
      >
        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </motion.div>
          ) : (
            <motion.div
              key="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              Analyze My Data
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'linear' }}
        />
      </Button>
    )
  }

  // Full component render
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-[#C1121F]/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#C1121F]/5 via-[#C1121F]/10 to-[#C1121F]/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="p-2.5 rounded-xl bg-gradient-to-br from-[#C1121F] to-[#780000] text-white shadow-lg shadow-[#C1121F]/30"
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>
              <div>
                <CardTitle className="text-lg font-bold text-[#C1121F]">
                  ✨ Analyze My Data
                </CardTitle>
                <CardDescription>
                  AI-powered intelligent analysis recommendations
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!showResults && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {/* Upload handler */}}
                >
                  <Upload className="h-4 w-4" />
                  Upload Data
                </Button>
              )}
              
              {showResults && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  onClick={resetAnalysis}
                >
                  <RefreshCw className="h-4 w-4" />
                  New Analysis
                </Button>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          {!showResults && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              {steps.map((step, idx) => (
                <React.Fragment key={step.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      idx <= currentStep
                        ? 'bg-[#C1121F] text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.icon}
                    {step.title}
                  </motion.div>
                  {idx < steps.length - 1 && (
                    <ChevronRight className={`h-3 w-3 ${idx < currentStep ? 'text-[#C1121F]' : 'text-muted-foreground'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      <AnimatePresence mode="wait">
        {/* Step 0 & 1: Initial State / Inspection Results */}
        {!showResults && currentStep <= 1 && (
          <motion.div
            key="inspection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Trigger Button (if not started) */}
            {currentStep === 0 && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="flex justify-center py-8"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={startAnalysis}
                    disabled={isAnalyzing}
                    size="lg"
                    className="relative overflow-hidden h-16 px-10 text-lg font-semibold
                               bg-gradient-to-r from-[#C1121F] via-[#A00E19] to-[#C1121F]
                               text-white shadow-xl shadow-[#C1121F]/30 
                               hover:shadow-2xl hover:shadow-[#C1121F]/40
                               transition-all duration-300 rounded-2xl"
                  >
                    <AnimatePresence mode="wait">
                      {isAnalyzing ? (
                        <motion.div
                          key="analyzing"
                          initial={{ opacity: 0, rotate: 0 }}
                          animate={{ opacity: 1, rotate: 360 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="flex items-center gap-3"
                        >
                          <Loader2 className="h-6 w-6" />
                          Inspecting Your Data...
                        </motion.div>
                      ) : (
                        <motion.div
                          key="start"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3"
                        >
                          <Sparkles className="h-6 w-6" />
                          Start Intelligent Analysis
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'linear' }}
                    />
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {/* Inspection Results */}
            {(currentStep >= 1 || showResults === false) && (
              <>
                {/* Data Inspection Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-5 w-5 text-blue-600" />
                          <CardTitle className="text-base">Data Inspection</CardTitle>
                        </div>
                        <DataQualityBadge quality={inspection.dataQuality} />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {/* Dataset Overview */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <div className="text-2xl font-bold text-[#C1121F]">{inspection.rowCount}</div>
                          <div className="text-xs text-muted-foreground">Rows</div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <div className="text-2xl font-bold text-[#C1121F]">{inspection.columnCount}</div>
                          <div className="text-xs text-muted-foreground">Columns</div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <div className="text-2xl font-bold text-[#C1121F]">{inspection.treatmentCount || '-'}</div>
                          <div className="text-xs text-muted-foreground">Treatments</div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <div className="text-2xl font-bold text-[#C1121F]">{inspection.replicationCount || '-'}</div>
                          <div className="text-xs text-muted-foreground">Replications</div>
                        </div>
                      </div>

                      {/* Detected Features */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <span className="font-medium text-green-800 dark:text-green-200">Dataset Structure:</span>{' '}
                            <span className="text-green-700 dark:text-green-300">
                              {inspection.numericColumns.length} numeric traits + {inspection.categoricalColumns.length} categorical variables
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                          <Database className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <span className="font-medium text-purple-800 dark:text-purple-200">Detected Design:</span>{' '}
                            <DesignBadge design={inspection.detectedDesign} />
                          </div>
                        </div>

                        {/* Variables Identified */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {inspection.possibleResponseVars.length > 0 && (
                            <div className="p-3 rounded-lg border">
                              <div className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                                Response Variables
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {inspection.possibleResponseVars.slice(0, 4).map((v) => (
                                  <Badge key={v} variant="secondary" className="font-normal">
                                    {v}
                                  </Badge>
                                ))}
                                {inspection.possibleResponseVars.length > 4 && (
                                  <Badge variant="secondary" className="font-normal">
                                    +{inspection.possibleResponseVars.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {inspection.possibleGroupingVar && (
                            <div className="p-3 rounded-lg border">
                              <div className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                                Grouping Variable
                              </div>
                              <Badge variant="outline" className="font-normal">
                                {inspection.possibleGroupingVar}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Issues Found */}
                      {inspection.issues.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="h-4 w-4" />
                            Issues Found ({inspection.issues.length})
                          </div>
                          <div className="space-y-1.5">
                            {inspection.missingValues.map((mv) => (
                              <div
                                key={mv.column}
                                className="flex items-center justify-between p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 text-sm"
                              >
                                <span className="text-amber-800 dark:text-amber-200">
                                  {mv.count} missing values in <strong>&quot;{mv.column}&quot;</strong>
                                </span>
                                <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
                                  {mv.percent}%
                                </Badge>
                              </div>
                            ))}
                            {inspection.outlierColumns.length > 0 && (
                              <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 text-sm text-amber-800 dark:text-amber-200">
                                Potential outliers in: <strong>{inspection.outlierColumns.join(', ')}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {inspection.issues.length === 0 && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-sm text-green-700 dark:text-green-300">
                          <CheckCircle2 className="h-4 w-4" />
                          No significant issues detected in your dataset!
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Recommended Analyses */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-[#C1121F]/5 to-orange-50 dark:to-orange-950/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-[#C1121F]" />
                          <CardTitle className="text-base">Recommended Analyses</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={selectAll}>
                            Select All
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={deselectAll}>
                            Clear
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {selectedAnalyses.size} of {recommendations.length} analyses selected
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ScrollArea className="max-h-[400px] pr-4">
                        <div className="space-y-3">
                          {recommendations.map((rec, idx) => (
                            <motion.div
                              key={rec.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + idx * 0.05 }}
                              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                selectedAnalyses.has(rec.id)
                                  ? 'border-[#C1121F]/30 bg-[#C1121F]/5 shadow-sm'
                                  : 'border-border hover:border-muted-foreground/20 hover:bg-muted/30'
                              }`}
                              onClick={() => toggleAnalysis(rec.id)}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={selectedAnalyses.has(rec.id)}
                                  onCheckedChange={() => toggleAnalysis(rec.id)}
                                  className="mt-0.5 data-[state=checked]:bg-[#C1121F] data-[state=checked]:border-[#C1121F]"
                                />

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[#C1121F]">{rec.icon}</span>
                                    <span className="font-semibold text-sm">{rec.name}</span>
                                    <PriorityBadge priority={rec.priority} />
                                  </div>

                                  <p className="text-sm text-muted-foreground mb-2">
                                    {rec.description}
                                  </p>

                                  <div className="flex items-center gap-3 text-xs">
                                    <CategoryBadge category={rec.category} />
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {rec.estimatedTime}
                                    </span>
                                  </div>

                                  <div className="mt-2 p-2 rounded-md bg-background text-xs text-muted-foreground italic">
                                    💡 {rec.reason}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Run Button */}
                      <div className="mt-4 pt-4 border-t">
                        <motion.div className="flex justify-center">
                          <Button
                            onClick={runAnalyses}
                            disabled={selectedAnalyses.size === 0 || isRunningAnalyses}
                            size="lg"
                            className="gap-2 px-8 bg-gradient-to-r from-[#C1121F] to-[#A00E19] 
                                       text-white shadow-lg shadow-[#C1121F]/25
                                       hover:shadow-xl hover:shadow-[#C1121F]/35
                                       disabled:opacity-50"
                          >
                            {isRunningAnalyses ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Running Analyses...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                Run {selectedAnalyses.size} Selected Analyses
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Visualizations Recommendation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-emerald-600" />
                        <CardTitle className="text-base">Recommended Visualizations</CardTitle>
                      </div>
                      <CardDescription>
                        Suggested charts and plots for your data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {visualizationRecs.map((viz, idx) => (
                          <motion.div
                            key={viz.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + idx * 0.05 }}
                            className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700">
                                {viz.icon}
                              </div>
                              <span className="font-medium text-sm">{viz.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{viz.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {viz.suitableFor.map((cat) => (
                                <Badge key={cat} variant="outline" className="text-[10px] px-1.5 py-0">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* Running State */}
        {isRunningAnalyses && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="inline-block p-3 rounded-full bg-[#C1121F]/10 mb-3"
                  >
                    <Loader2 className="h-6 w-6 text-[#C1121F]" />
                  </motion.div>
                  <h3 className="font-semibold text-lg">Running Analyses...</h3>
                  <p className="text-sm text-muted-foreground">
                    Processing {analysisResults.filter(r => r.status !== 'pending').length} of {analysisResults.length}
                  </p>
                </div>

                <div className="space-y-3">
                  {analysisResults.map((result) => (
                    <div key={result.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{result.name}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          result.status === 'completed' ? 'bg-green-100 text-green-700' :
                          result.status === 'running' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {result.status === 'completed' ? 'Done' :
                           result.status === 'running' ? 'Running...' : 'Waiting'}
                        </span>
                      </div>
                      <Progress value={result.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results View */}
        {showResults && !isRunningAnalyses && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Success Banner */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 
                         border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Analysis Complete!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {analysisResults.filter(r => r.status === 'completed').length} analyses completed successfully.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto gap-2"
                  onClick={() => {
                    const jsonStr = JSON.stringify(analysisResults, null, 2)
                    const blob = new Blob([jsonStr], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'bioalign-analysis-results.json'
                    a.click()
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export All
                </Button>
              </div>
            </motion.div>

            {/* Results Tabs */}
            <Tabs defaultValue={analysisResults[0]?.id} className="w-full">
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
                {analysisResults.map((result) => (
                  <TabsTrigger
                    key={result.id}
                    value={result.id}
                    className="gap-2 data-[state=active]:bg-[#C1121F] data-[state=active]:text-white"
                  >
                    {result.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {result.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {analysisResults.map((result) => (
                <TabsContent key={result.id} value={result.id} className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {recommendations.find(r => r.id === result.id)?.icon}
                          {result.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 h-8 text-xs"
                            onClick={() => copyResult(result)}
                          >
                            {copiedId === result.id ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 h-8 text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                            onClick={() => getAIExplanation(result)}
                            disabled={isLoadingExplanation === result.id}
                          >
                            {isLoadingExplanation === result.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Brain className="h-3.5 w-3.5" />
                            )}
                            Explain Results
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* AI Explanation */}
                      {aiExplanation[result.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mb-4 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 
                                     border border-purple-200 dark:border-purple-800"
                        >
                          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-purple-700 dark:text-purple-300">
                            <Sparkles className="h-4 w-4" />
                            AI Explanation
                          </div>
                          <div className="prose prose-sm prose-purple dark:prose-invert max-w-none text-sm">
                            {aiExplanation[result.id].split('\n').map((line, i) => {
                              if (line.startsWith('## ')) {
                                return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.replace('## ', '')}</h3>
                              }
                              if (line.startsWith('### ')) {
                                return <h4 key={i} className="font-medium text-sm mt-2 mb-1">{line.replace('### ', '')}</h4>
                              }
                              if (line.startsWith('- ') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                                return <li key={i} className="ml-4">{line.replace(/^[-\d.]\s*/, '')}</li>
                              }
                              if (line.startsWith('|')) {
                                return null // Skip table formatting
                              }
                              if (line.trim() === '') {
                                return <br key={i} />
                              }
                              return <p key={i}>{line}</p>
                            })}
                          </div>
                        </motion.div>
                      )}

                      {/* Result Content */}
                      <RenderResult result={result.result} />
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// RESULT RENDERER COMPONENT
// ============================================================================

function RenderResult({ result }: { result?: Record<string, unknown> }) {
  if (!result) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No results available
      </div>
    )
  }

  const type = result.type as string

  switch (type) {
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted">
                {(result.headers as string[]).map((header) => (
                  <th key={header} className="px-4 py-2 text-left font-semibold border-b">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(result.rows as string[][]).map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2 border-b border-border/50">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {result.summary != null && (
            <p className="mt-3 text-xs text-muted-foreground italic">{String(result.summary)}</p>
          )}
        </div>
      )

    case 'anova_table':
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#C1121F]/10">
                  {(result.headers as string[]).map((header) => (
                    <th key={header} className="px-4 py-2.5 text-left font-semibold text-[#C1121F]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(result.rows as string[][]).map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className={`px-4 py-2.5 border-b border-border/50 ${
                        cellIdx === 5 && cell.includes('<0.0001') ? 'font-bold text-green-600' : ''
                      }`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">R² Value</div>
              <div className="text-lg font-bold text-blue-800 dark:text-blue-200">{result.rSquared as string}</div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:green-950/20 text-center">
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">CV%</div>
              <div className="text-lg font-bold text-green-800 dark:text-green-200">{result.cv as string}</div>
            </div>
            <div className="p-3 rounded-lg col-span-2 sm:col-span-1 bg-amber-50 dark:amber-950/20 text-center">
              <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">Interpretation</div>
              <div className="text-sm font-medium text-amber-800 dark:text-amber-200">{result.interpretation as string}</div>
            </div>
          </div>
        </div>
      )

    case 'correlation_matrix':
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {(result.matrix as string[][]).map((row, idx) => (
                  <tr key={idx} className={idx === 0 ? '' : idx % 2 === 0 ? 'bg-muted/30' : ''}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className={`px-3 py-2 border-b border-r border-border/50 text-center ${
                        idx === 0 || cellIdx === 0 ? 'font-semibold bg-muted' :
                        cell.includes('1.00') ? 'bg-red-100 dark:bg-red-950/30 font-bold' :
                        cell.includes('-') ? 'bg-blue-50 dark:bg-blue-950/20' :
                        'bg-green-50 dark:bg-green-950/20'
                      }`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.note != null && (
            <p className="text-xs text-muted-foreground italic">{String(result.note)}</p>
          )}
        </div>
      )

    case 'grouping':
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-2 text-left font-semibold">Rank</th>
                  <th className="px-4 py-2 text-left font-semibold">Genotype</th>
                  <th className="px-4 py-2 text-left font-semibold">Mean</th>
                  <th className="px-4 py-2 text-left font-semibold">Group</th>
                </tr>
              </thead>
              <tbody>
                {(result.groups as { genotype: string; mean: number; group: string }[])
                  .sort((a, b) => b.mean - a.mean)
                  .map((item, idx) => (
                  <tr key={item.genotype} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="px-4 py-2 border-b border-border/50 font-medium">{idx + 1}</td>
                    <td className="px-4 py-2 border-b border-border/50 font-medium">{item.genotype}</td>
                    <td className="px-4 py-2 border-b border-border/50">{item.mean.toFixed(2)}</td>
                    <td className="px-4 py-2 border-b border-border/50">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[#C1121F] text-white text-xs font-bold">
                        {item.group}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>LSD (α=0.05): <strong>{result.lsd as string}</strong></span>
            <span>CV: <strong>{result.cv as string}</strong></span>
          </div>
        </div>
      )

    case 'pca_results':
      return (
        <div className="space-y-4">
          {/* Eigenvalues Table */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Eigenvalues & Variance Explained</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-3 py-2 text-left font-semibold">PC</th>
                    <th className="px-3 py-2 text-left font-semibold">Eigenvalue</th>
                    <th className="px-3 py-2 text-left font-semibold">Variance %</th>
                    <th className="px-3 py-2 text-left font-semibold">Cumulative %</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.eigenvalues as { pc: string; eigenvalue: number; variance: number; cumulative: number }[]).map((ev) => (
                    <tr key={ev.pc} className="border-b border-border/50">
                      <td className="px-3 py-2 font-semibold">{ev.pc}</td>
                      <td className="px-3 py-2">{ev.eigenvalue.toFixed(2)}</td>
                      <td className="px-3 py-2">{ev.variance.toFixed(1)}%</td>
                      <td className="px-3 py-2 font-medium text-[#C1121F]">{ev.cumulative.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Loadings */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Variable Loadings</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-3 py-2 text-left font-semibold">Trait</th>
                    <th className="px-3 py-2 text-left font-semibold">PC1</th>
                    <th className="px-3 py-2 text-left font-semibold">PC2</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.loadings as { trait: string; pc1: number; pc2: number }[]).map((load) => (
                    <tr key={load.trait} className="border-b border-border/50">
                      <td className="px-3 py-2 font-medium">{load.trait}</td>
                      <td className="px-3 py-2">{load.pc1.toFixed(3)}</td>
                      <td className="px-3 py-2">{load.pc2.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {result.interpretation != null && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm text-blue-800 dark:text-blue-200">
              <strong>Interpretation:</strong> {String(result.interpretation)}
            </div>
          )}
        </div>
      )

    case 'path_coefficients':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(result.directEffects as Record<string, number>).map(([varName, effect]) => (
              <div key={varName} className="p-3 rounded-lg border text-center">
                <div className="text-xs text-muted-foreground mb-1">{varName}</div>
                <div className={`text-lg font-bold ${effect > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {effect > 0 ? '+' : ''}{effect.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-xs text-muted-foreground">Residual Effect</div>
              <div className="text-lg font-bold">{(result.residualEffect as number).toFixed(3)}</div>
            </div>
            <div className="p-3 rounded-lg bg-[#C1121F]/10 text-center">
              <div className="text-xs text-[#C1121F]">R²</div>
              <div className="text-lg font-bold text-[#C1121F]">{result.rSquared as string}</div>
            </div>
          </div>
          {result.interpretation != null && (
            <p className="text-sm text-muted-foreground italic p-3 bg-muted/30 rounded-lg">
              {String(result.interpretation)}
            </p>
          )}
        </div>
      )

    default:
      return (
        <div className="p-4 rounded-lg bg-muted/30 text-center">
          <p className="text-sm">{(result.message as string) || 'Analysis completed successfully.'}</p>
        </div>
      )
  }
}

// Export utility functions for external use
export { inspectDataset, generateRecommendations, generateVisualizationRecommendations }
