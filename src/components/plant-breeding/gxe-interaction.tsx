'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Info, 
  Upload, 
  Download, 
  Calculator,
  AlertCircle
} from 'lucide-react'
import { 
  mean, 
  variance, 
  simpleLinearRegression, 
  fDistributionCDF,
  pValueFromF,
  sumOfSquares
} from '@/lib/statistics-engine'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ANOVARow {
  source: string
  df: number
  ss: number
  ms: number
  f: number
  pValue: number
  significance: string
}

interface StabilityResult {
  genotype: string
  meanYield: number
  // Finlay-Wilkinson parameters
  regressionCoeff: number       // b_i
  deviationMS: number           // S²d_i
  rSquared: number              // R²
  // Eberhart-Russell parameters
  erClassification: string      // Based on b_i and S²d_i
  s2dFValue: number             // F-test for S²d significance
  s2dSignificance: string       // Significance of S²d
  // Shukla's stability variance
  shuklaVariance: number        // σ²_i
  // Wricke's ecovalence
  ecovalence: number            // W_i
  ecovalencePercent: number     // % contribution to G×E SS
  // AMMI Stability Value
  asv: number                   // ASV value
  // Overall ranking
  overallRank: number
  stabilityClass: 'Very Stable' | 'Stable' | 'Moderate' | 'Unstable' | 'Very Unstable'
}

interface EnvironmentIndex {
  environment: string
  index: number                 // Environmental index
  meanYield: number
  rank: number
}

interface GEXEResult {
  // Data info
  genotypes: string[]
  environments: string[]
  dataMatrix: number[][]
  
  // Basic statistics
  grandMean: number
  genotypeMeans: number[]
  environmentMeans: number[]
  
  // ANOVA results
  anova: ANOVARow[]
  
  // Environmental indices
  environmentalIndices: EnvironmentIndex[]
  
  // Stability results
  stabilityResults: StabilityResult[]
  
  // Summary statistics
  summary: {
    totalGenotypes: number
    totalEnvironments: number
    geSignificant: boolean
    mostStableGenotype: string
    mostResponsiveGenotype: string
  }
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_DATA = `Genotype,Env1,Env2,Env3,Env4
G1,3200,2850,3100,2980
G2,2800,3100,2750,3050
G3,3500,3200,3400,3300
G4,2900,2600,2850,2700
G5,3800,3500,3700,3600
G6,3100,3400,3050,3350
G7,2650,2400,2600,2500
G8,3350,3650,3300,3580
G9,3950,3700,3900,3800
G10,3000,2750,2950,2800`

// ============================================================================
// PARSING AND DATA UTILITIES
// ============================================================================

function parseCSVData(csvText: string): { genotypes: string[], environments: string[], dataMatrix: number[][] } | null {
  const lines = csvText.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  if (lines.length < 2) return null
  
  const headers = lines[0].split(',').map(h => h.trim())
  
  // First column is genotype names, rest are environments
  const environments = headers.slice(1)
  const genotypes: string[] = []
  const dataMatrix: number[][] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    
    if (values.length !== headers.length) continue
    
    const genotypeName = values[0]
    const yields = values.slice(1).map(v => parseFloat(v))
    
    // Validate all values are numbers
    if (yields.some(y => isNaN(y))) continue
    
    genotypes.push(genotypeName)
    dataMatrix.push(yields)
  }
  
  if (genotypes.length === 0 || environments.length === 0) return null
  
  return { genotypes, environments, dataMatrix }
}

// ============================================================================
// MATRIX OPERATIONS FOR SVD/AMMI
// ============================================================================

function matrixTranspose(matrix: number[][]): number[][] {
  if (matrix.length === 0) return []
  return matrix[0].map((_, colIdx) => matrix.map(row => row[colIdx]))
}

function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length
  const colsA = A[0]?.length || 0
  const colsB = B[0]?.length || 0
  
  const result: number[][] = []
  for (let i = 0; i < rowsA; i++) {
    result[i] = []
    for (let j = 0; j < colsB; j++) {
      let sum = 0
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j]
      }
      result[i][j] = sum
    }
  }
  return result
}

function copyMatrix(mat: number[][]): number[][] {
  return mat.map(row => [...row])
}

function matrixMultiplyVector(matrix: number[][], vec: number[]): number[] {
  return matrix.map(row => 
    row.reduce((sum, val, i) => sum + val * (vec[i] || 0), 0)
  )
}

/**
 * Compute SVD using power iteration method for AMMI analysis
 */
function computeSVD(matrix: number[][]): { U: number[][]; S: number[]; Vt: number[][] } {
  const m = matrix.length
  const n = matrix[0]?.length || 0
  
  if (m === 0 || n === 0) {
    return { U: [], S: [], Vt: [] }
  }
  
  const AtA = matrixMultiply(matrixTranspose(matrix), matrix)
  const size = Math.min(m, n)
  
  const eigenvalues: number[] = []
  const eigenvectors: number[][] = []
  
  let workingMatrix = copyMatrix(AtA)
  
  for (let iter = 0; iter < size; iter++) {
    let v = new Array(n).fill(0)
    v[iter < n ? iter : 0] = 1
    
    for (let powerIter = 0; powerIter < 100; powerIter++) {
      let Av = matrixMultiplyVector(workingMatrix, v)
      
      // Orthogonalize against previous eigenvectors
      for (const prevVec of eigenvectors) {
        const dot = v.reduce((sum, vi, i) => sum + vi * prevVec[i], 0)
        Av = Av.map((val, i) => val - dot * prevVec[i])
      }
      
      const norm = Math.sqrt(Av.reduce((sum, x) => sum + x * x, 0))
      if (norm < 1e-10) break
      
      v = Av.map(x => x / norm)
    }
    
    const Av = matrixMultiplyVector(workingMatrix, v)
    const eigenvalue = v.reduce((sum, vi, i) => sum + vi * Av[i], 0)
    
    if (eigenvalue > 1e-10) {
      eigenvalues.push(Math.max(0, eigenvalue))
      eigenvectors.push([...v])
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          workingMatrix[i][j] -= eigenvalue * v[i] * v[j]
        }
      }
    } else {
      break
    }
  }
  
  const S = eigenvalues.map(ev => Math.sqrt(ev))
  const V = eigenvectors.length > 0 ? matrixTranspose(eigenvectors) : []
  const Vt = matrixTranspose(V)
  
  const U: number[][] = []
  for (let i = 0; i < m; i++) {
    U[i] = []
    for (let j = 0; j < S.length; j++) {
      if (S[j] > 1e-10) {
        let sum = 0
        for (let k = 0; k < n; k++) {
          sum += matrix[i][k] * (V[k]?.[j] || 0)
        }
        U[i][j] = sum / S[j]
      } else {
        U[i][j] = 0
      }
    }
  }
  
  return { U, S, Vt }
}

// ============================================================================
// G×E ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Perform comprehensive Genotype × Environment Interaction Analysis
 * Implements multiple stability analysis methods:
 * - Finlay-Wilkinson (1963) Joint Regression Analysis
 * - Eberhart-Russell (1966) Stability Parameters
 * - Shukla (1972) Stability Variance
 * - Wricke (1962) Ecovalence
 * - AMMI Stability Value (ASV)
 */
function performGXEAnalysis(
  genotypeNames: string[],
  environmentNames: string[],
  dataMatrix: number[][]
): GEXEResult {
  const g = genotypeNames.length   // Number of genotypes
  const e = environmentNames.length // Number of environments
  const N = g * e                  // Total observations
  
  // ========================================================================
  // BASIC STATISTICS
  // ========================================================================
  
  // Calculate grand mean
  const allValues = dataMatrix.flat()
  const grandMean = mean(allValues)
  
  // Calculate genotype means (row means)
  const genotypeMeans = dataMatrix.map(row => mean(row))
  
  // Calculate environment means (column means)
  const environmentMeans: number[] = []
  for (let j = 0; j < e; j++) {
    const colValues = dataMatrix.map(row => row[j])
    environmentMeans.push(mean(colValues))
  }
  
  // ========================================================================
  // TWO-WAY ANOVA FOR G×E INTERACTION
  // ========================================================================
  
  // Sum of Squares calculations
  // Total SS
  const totalSS = sumOfSquares(allValues) - (Math.pow(allValues.reduce((a, b) => a + b, 0), 2) / N)
  
  // Genotype SS
  let genotypeSS = 0
  for (let i = 0; i < g; i++) {
    genotypeSS += e * Math.pow(genotypeMeans[i] - grandMean, 2)
  }
  
  // Environment SS
  let environmentSS = 0
  for (let j = 0; j < e; j++) {
    environmentSS += g * Math.pow(environmentMeans[j] - grandMean, 2)
  }
  
  // G×E Interaction SS (calculated as residual after main effects)
  let geSS = 0
  for (let i = 0; i < g; i++) {
    for (let j = 0; j < e; j++) {
      const observed = dataMatrix[i][j]
      const expected = grandMean + (genotypeMeans[i] - grandMean) + (environmentMeans[j] - grandMean)
      geSS += Math.pow(observed - expected, 2)
    }
  }
  
  // Degrees of freedom
  const dfGenotype = g - 1
  const dfEnvironment = e - 1
  const dfGE = (g - 1) * (e - 1)
  const dfTotal = N - 1
  
  // Mean Squares
  const MSgenotype = genotypeSS / dfGenotype
  const MSenvironment = environmentSS / dfEnvironment
  const MSge = geSS / dfGE
  
  // F-values (using GE MS as error term for this combined model)
  const Fgenotype = MSgenotype / MSge
  const Fenvironment = MSenvironment / MSge
  
  // P-values
  const pValueGenotype = 1 - fDistributionCDF(Fgenotype, dfGenotype, dfGE)
  const pValueEnvironment = 1 - fDistributionCDF(Fenvironment, dfEnvironment, dfGE)
  
  function getSignificance(p: number): string {
    if (p < 0.001) return '***'
    if (p < 0.01) return '**'
    if (p < 0.05) return '*'
    if (p < 0.1) return '.'
    return 'ns'
  }
  
  const anova: ANOVARow[] = [
    {
      source: 'Genotype',
      df: dfGenotype,
      ss: genotypeSS,
      ms: MSgenotype,
      f: Fgenotype,
      pValue: pValueGenotype,
      significance: getSignificance(pValueGenotype)
    },
    {
      source: 'Environment',
      df: dfEnvironment,
      ss: environmentSS,
      ms: MSenvironment,
      f: Fenvironment,
      pValue: pValueEnvironment,
      significance: getSignificance(pValueEnvironment)
    },
    {
      source: 'G × E Interaction',
      df: dfGE,
      ss: geSS,
      ms: MSge,
      f: NaN,  // No F-test for interaction without error term
      pValue: NaN,
      significance: '-'
    },
    {
      source: 'Total',
      df: dfTotal,
      ss: totalSS,
      ms: NaN,
      f: NaN,
      pValue: NaN,
      significance: '-'
    }
  ]
  
  // ========================================================================
  // ENVIRONMENTAL INDICES
  // ========================================================================
  
  // Environmental Index (I_j) = EnvMean_j - GrandMean
  const envIndices: EnvironmentIndex[] = environmentNames.map((name, idx) => ({
    environment: name,
    index: environmentMeans[idx] - grandMean,
    meanYield: environmentMeans[idx],
    rank: 1  // Will be updated below
  }))
  
  // Rank by environmental index (descending)
  envIndices.sort((a, b) => b.index - a.index)
  envIndices.forEach((env, idx) => env.rank = idx + 1)
  
  // Restore original order
  envIndices.sort((a, b) => 
    environmentNames.indexOf(a.environment) - environmentNames.indexOf(b.environment)
  )
  
  // ========================================================================
  // FINLAY-WILKINSON REGRESSION ANALYSIS (1963)
  // Regress each genotype's yield on environmental index
  // ========================================================================
  
  const finlayWilkinsonResults: Array<{
    b: number         // Regression coefficient
    s2d: number       // Deviation from regression (S²d)
    rSquared: number  // R² value
    intercept: number
  }> = []
  
  for (let i = 0; i < g; i++) {
    // X = environmental indices, Y = genotype yields across environments
    const xValues = environmentMeans.map(em => em - grandMean)  // Environmental indices
    const yValues = dataMatrix[i]  // Genotype i yields in each environment
    
    const regression = simpleLinearRegression(xValues, yValues)
    
    // Calculate deviation from regression (S²d)
    // S²d = Σ(Y_ij - Ŷ_ij)² / (e - 2)
    let devSumSq = 0
    for (let j = 0; j < e; j++) {
      const predicted = regression.coefficients[0] + regression.coefficients[1] * xValues[j]
      devSumSq += Math.pow(yValues[j] - predicted, 2)
    }
    const s2d = devSumSq / Math.max(1, e - 2)
    
    finlayWilkinsonResults.push({
      b: regression.coefficients[1],  // Slope = regression coefficient
      s2d: s2d,
      rSquared: regression.rSquared,
      intercept: regression.coefficients[0]
    })
  }
  
  // ========================================================================
  // EBERHART-RUSSELL STABILITY ANALYSIS (1966)
  // Uses same regression but adds interpretation framework
  // Ideal: b_i ≈ 1 and S²d_i not significantly different from 0
  // ========================================================================
  
  // Pooled deviation MS (error estimate)
  const pooledDevMS = finlayWilkinsonResults.reduce((sum, r) => sum + r.s2d, 0) / g
  const dfDeviation = g * (e - 2)  // Total df for deviations
  
  function getERClassification(b: number, s2d: number): string {
    const bCloseToOne = Math.abs(b - 1) < 0.2
    const s2dSmall = s2d < pooledDevMS * 2  // Less than 2x pooled MS
    
    if (bCloseToOne && s2dSmall) return 'Average stability, predictable'
    if (b < 0.8 && s2dSmall) return 'High stability, poor env specific'
    if (b > 1.2 && s2dSmall) return 'Low stability, responsive to good env'
    if (bCloseToOne && !s2dSmall) return 'Average response, unpredictable'
    if (b < 0.8 && !s2dSmall) return 'Below average, unstable'
    return 'Above average, unstable'
  }
  
  // ========================================================================
  // SHUKLA'S STABILITY VARIANCE (1972)
  // σ²_i = [(n-1)/(g-1)(n-2)] * ΣΣ(Y_ij - Ȳ_i. - Ȳ_.j + Ȳ..)²
  // Lower values indicate more stable genotypes
  // ========================================================================
  
  const shuklaFactor = ((e - 1) / ((g - 1) * (e - 2)))
  const shukaVariances: number[] = []
  
  for (let i = 0; i < g; i++) {
    let shuklaSum = 0
    for (let j = 0; j < e; j++) {
      const cellMean = dataMatrix[i][j]
      const genoMean = genotypeMeans[i]
      const envMean = environmentMeans[j]
      // Interaction effect for this cell
      const interactionEffect = cellMean - genoMean - envMean + grandMean
      shuklaSum += Math.pow(interactionEffect, 2)
    }
    shukaVariances.push(shuklaFactor * shuklaSum)
  }
  
  // ========================================================================
  // WRICKE'S ECOVALENCE (1962)
  // W_i = Σ_j(Ȳ_ij - Ȳ_i. - Ȳ_.j + Ȳ..)²
  // Contribution of each genotype to G×E sum of squares
  // ========================================================================
  
  const ecovalences: number[] = []
  
  for (let i = 0; i < g; i++) {
    let wSum = 0
    for (let j = 0; j < e; j++) {
      const cellMean = dataMatrix[i][j]
      const genoMean = genotypeMeans[i]
      const envMean = environmentMeans[j]
      const interactionEffect = cellMean - genoMean - envMean + grandMean
      wSum += Math.pow(interactionEffect, 2)
    }
    ecovalences.push(wSum)
  }
  
  // Calculate percentage contribution to G×E SS
  const totalEcovalence = ecovalences.reduce((a, b) => a + b, 0)
  const ecovalencePercents = ecovalences.map(w => (w / totalEcovalence) * 100)
  
  // ========================================================================
  // AMMI STABILITY VALUE (ASV)
  // ASV = √[(SS_IPCA1/SS_IPCA2 * IPCA1_score)² + (IPCA2_score)²]
  // Lower ASV = more stable
  // ========================================================================
  
  // Calculate interaction effects matrix (residuals after removing main effects)
  const interactionMatrix: number[][] = []
  for (let i = 0; i < g; i++) {
    interactionMatrix[i] = []
    for (let j = 0; j < e; j++) {
      const cellMean = dataMatrix[i][j]
      const genoEffect = genotypeMeans[i] - grandMean
      const envEffect = environmentMeans[j] - grandMean
      interactionMatrix[i][j] = cellMean - grandMean - genoEffect - envEffect
    }
  }
  
  // Perform SVD on interaction matrix
  const { U, S, Vt } = computeSVD(interactionMatrix)
  
  // Calculate ASV for each genotype
  const asvValues: number[] = []
  const ssIPCA1 = S.length > 0 ? Math.pow(S[0], 2) : 1
  const ssIPCA2 = S.length > 1 ? Math.pow(S[1], 2) : 1
  const weightFactor = ssIPCA1 / Math.max(ssIPCA2, 1)
  
  for (let i = 0; i < g; i++) {
    const ipca1Score = U[i]?.[0] || 0
    const ipca2Score = U[i]?.[1] || 0
    const asv = Math.sqrt(
      Math.pow(weightFactor * ipca1Score, 2) + Math.pow(ipca2Score, 2)
    )
    asvValues.push(asv)
  }
  
  // ========================================================================
  // COMPILE STABILITY RESULTS
  // ========================================================================
  
  const stabilityResults: StabilityResult[] = genotypeNames.map((name, i) => {
    const fw = finlayWilkinsonResults[i]
    
    // F-test for S²d significance (Eberhart-Russell)
    const s2dFValue = fw.s2d / Math.max(pooledDevMS, 0.001)
    const s2dPValue = 1 - fDistributionCDF(s2dFValue, e - 2, dfDeviation)
    
    // Determine overall stability class based on composite score
    // Combine multiple metrics into a single ranking score
    const bDeviation = Math.abs(fw.b - 1)  // Deviation from ideal b=1
    const normalizedS2d = fw.s2d / Math.max(...finlayWilkinsonResults.map(r => r.s2d), 1)
    const normalizedShukla = shukaVariances[i] / Math.max(...shukaVariances, 1)
    const normalizedWricke = ecovalences[i] / Math.max(...ecovalences, 1)
    const normalizedASV = asvValues[i] / Math.max(...asvValues, 1)
    
    // Composite instability score (higher = more unstable)
    const instabilityScore = (
      bDeviation * 0.2 +
      normalizedS2d * 0.2 +
      normalizedShukla * 0.2 +
      normalizedWricke * 0.2 +
      normalizedASV * 0.2
    )
    
    let stabilityClass: StabilityResult['stabilityClass']
    if (instabilityScore < 0.15) stabilityClass = 'Very Stable'
    else if (instabilityScore < 0.35) stabilityClass = 'Stable'
    else if (instabilityScore < 0.55) stabilityClass = 'Moderate'
    else if (instabilityScore < 0.75) stabilityClass = 'Unstable'
    else stabilityClass = 'Very Unstable'
    
    return {
      genotype: name,
      meanYield: genotypeMeans[i],
      regressionCoeff: fw.b,
      deviationMS: fw.s2d,
      rSquared: fw.rSquared,
      erClassification: getERClassification(fw.b, fw.s2d),
      s2dFValue: s2dFValue,
      s2dSignificance: getSignificance(s2dPValue),
      shuklaVariance: shukaVariances[i],
      ecovalence: ecovalences[i],
      ecovalencePercent: ecovalencePercents[i],
      asv: asvValues[i],
      overallRank: 0,  // Will be calculated below
      stabilityClass
    }
  })
  
  // Sort by composite stability and assign ranks
  stabilityResults.sort((a, b) => {
    // Primary sort by stability class (Very Stable first)
    const classOrder = { 'Very Stable': 0, 'Stable': 1, 'Moderate': 2, 'Unstable': 3, 'Very Unstable': 4 }
    const classDiff = classOrder[a.stabilityClass] - classOrder[b.stabilityClass]
    if (classDiff !== 0) return classDiff
    // Secondary sort by ASV (lower is better)
    return a.asv - b.asv
  })
  
  stabilityResults.forEach((r, idx) => r.overallRank = idx + 1)
  
  // Find most stable and most responsive genotypes
  const sortedByStability = [...stabilityResults].sort((a, b) => a.asv - b.asv)
  const sortedByResponse = [...stabilityResults].sort((a, b) => b.regressionCoeff - a.regressionCoeff)
  
  return {
    genotypes: genotypeNames,
    environments: environmentNames,
    dataMatrix,
    grandMean,
    genotypeMeans,
    environmentMeans,
    anova,
    environmentalIndices: envIndices,
    stabilityResults,
    summary: {
      totalGenotypes: g,
      totalEnvironments: e,
      geSignificant: pValueGenotype < 0.05 || pValueEnvironment < 0.05,
      mostStableGenotype: sortedByStability[0]?.genotype || '',
      mostResponsiveGenotype: sortedByResponse[0]?.genotype || ''
    }
  }
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

function exportResultsToCSV(result: GEXEResult): string {
  const lines: string[] = []
  
  // Header
  lines.push('G×E Interaction Analysis Results')
  lines.push('')
  
  // ANOVA Table
  lines.push('ANOVA TABLE')
  lines.push('Source,DF,SS,MS,F-value,P-value,Sig')
  result.anova.forEach(row => {
    lines.push(`${row.source},${row.df},${row.ss.toFixed(2)},${row.ms.toFixed(2)},${isNaN(row.f) ? '-' : row.f.toFixed(2)},${isNaN(row.pValue) ? '-' : row.pValue.toFixed(4)},${row.significance}`)
  })
  lines.push('')
  
  // Environmental Indices
  lines.push('ENVIRONMENTAL INDICES')
  lines.push('Environment,Environmental Index,Mean Yield,Rank')
  result.environmentalIndices.forEach(env => {
    lines.push(`${env.environment},${env.index.toFixed(2)},${env.meanYield.toFixed(2)},${env.rank}`)
  })
  lines.push('')
  
  // Stability Parameters
  lines.push('STABILITY PARAMETERS')
  lines.push('Rank,Genotype,Mean Yield,b (Reg Coef),S²d,R²,Shukla σ²,Wricke W,ASV,Stability Class')
  result.stabilityResults.sort((a, b) => a.overallRank - b.overallRank)
  result.stabilityResults.forEach(r => {
    lines.push(`${r.overallRank},${r.genotype},${r.meanYield.toFixed(2)},${r.regressionCoeff.toFixed(3)},${r.deviationMS.toFixed(2)},${r.rSquared.toFixed(4)},${r.shuklaVariance.toFixed(2)},${r.ecovalence.toFixed(2)},${r.asv.toFixed(3)},${r.stabilityClass}`)
  })
  
  return lines.join('\n')
}

// ============================================================================
// STABILITY CLASS BADGE COMPONENT
// ============================================================================

function StabilityBadge({ classification }: { classification: StabilityResult['stabilityClass'] }) {
  const config = {
    'Very Stable': { variant: 'default' as const, className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' },
    'Stable': { variant: 'secondary' as const, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    'Moderate': { variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    'Unstable': { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
    'Very Unstable': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 hover:bg-red-100' }
  }
  
  const { className } = config[classification]
  
  return (
    <Badge className={`font-medium ${className}`}>
      {classification}
    </Badge>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GXEInteractionAnalysis() {
  const [inputData, setInputData] = useState('')
  const [result, setResult] = useState<GEXEResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('results')

  // Handle sample data loading
  const handleLoadSampleData = useCallback(() => {
    setInputData(SAMPLE_DATA)
    setError(null)
  }, [])

  // Parse and analyze data
  const handleAnalyze = useCallback(() => {
    setError(null)
    setResult(null)
    
    // Parse CSV data
    const parsed = parseCSVData(inputData)
    
    if (!parsed) {
      setError('Failed to parse data. Please check the format:\n• First row must be headers: Genotype,Env1,Env2,...\n• Each subsequent row: GenotypeName,value1,value2,...\n• All values must be numeric')
      return
    }
    
    if (parsed.environments.length < 2) {
      setError('At least 2 environments are required for G×E analysis.')
      return
    }
    
    if (parsed.genotypes.length < 2) {
      setError('At least 2 genotypes are required for G×E analysis.')
      return
    }
    
    setIsCalculating(true)
    
    // Use setTimeout to allow UI to update before heavy calculation
    setTimeout(() => {
      try {
        const analysisResult = performGXEAnalysis(
          parsed.genotypes,
          parsed.environments,
          parsed.dataMatrix
        )
        setResult(analysisResult)
        setActiveTab('results')
      } catch (err) {
        setError(`Analysis error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`)
      } finally {
        setIsCalculating(false)
      }
    }, 50)
  }, [inputData])

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (text) {
        setInputData(text)
        setError(null)
      }
    }
    reader.readAsText(file)
  }, [])

  // Export results
  const handleExport = useCallback(() => {
    if (!result) return
    
    const csv = exportResultsToCSV(result)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gxe-analysis-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [result])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">G×E Interaction Analysis</CardTitle>
                <CardDescription>
                  Comprehensive stability and adaptation analysis using multiple methodologies
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Data Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              Data Input
            </CardTitle>
            <CardDescription>
              Enter your multi-environment trial data (Genotypes × Environments)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="paste" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="paste">Paste Data</TabsTrigger>
                <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              </TabsList>
              
              <TabsContent value="paste" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="data-input">Data (CSV Format)</Label>
                  <Textarea
                    id="data-input"
                    placeholder={`Genotype,Env1,Env2,Env3,Env4\nG1,3200,2850,3100,2980\nG2,2800,3100,2750,3050\n...`}
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleLoadSampleData} variant="outline" size="sm">
                    Load Sample Data
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4 mt-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a CSV file with your genotype × environment data
                  </p>
                  <Label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span>Choose File</span>
                    </Button>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {inputData && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    ✓ Data loaded successfully ({inputData.split('\n').length} rows)
                  </p>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <pre className="text-sm text-destructive whitespace-pre-wrap">{error}</pre>
              </div>
            )}
            
            {/* Analyze Button */}
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleAnalyze} 
                disabled={!inputData.trim() || isCalculating}
                size="lg"
                className="gap-2"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Run G×E Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Analysis Results
                  </CardTitle>
                  <CardDescription>
                    {result.summary.totalGenotypes} genotypes × {result.summary.totalEnvironments} environments | 
                    Grand Mean: {result.grandMean.toFixed(2)} | 
                    Most Stable: <span className="font-semibold text-emerald-600">{result.summary.mostStableGenotype}</span> |
                    Most Responsive: <span className="font-semibold text-blue-600">{result.summary.mostResponsiveGenotype}</span>
                  </CardDescription>
                </div>
                <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 lg:flex lg:flex-wrap lg:justify-start">
                  <TabsTrigger value="results">Stability Results</TabsTrigger>
                  <TabsTrigger value="anova">ANOVA</TabsTrigger>
                  <TabsTrigger value="environments">Environments</TabsTrigger>
                  <TabsTrigger value="methods">Methods Info</TabsTrigger>
                </TabsList>
                
                {/* Main Results Tab */}
                <TabsContent value="results" className="mt-4 space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-emerald-50 border-emerald-200">
                      <CardContent className="pt-4">
                        <div className="text-sm text-emerald-700 font-medium">Most Stable</div>
                        <div className="text-xl font-bold text-emerald-900">{result.summary.mostStableGenotype}</div>
                        <div className="text-xs text-emerald-600">Based on ASV & composite score</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="text-sm text-blue-700 font-medium">Most Responsive</div>
                        <div className="text-xl font-bold text-blue-900">{result.summary.mostResponsiveGenotype}</div>
                        <div className="text-xs text-blue-600">Highest regression coefficient</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="pt-4">
                        <div className="text-sm text-purple-700 font-mean">Grand Mean</div>
                        <div className="text-xl font-bold text-purple-900">{result.grandMean.toFixed(1)}</div>
                        <div className="text-xs text-purple-600">Overall mean yield</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="pt-4">
                        <div className="text-sm text-orange-700 font-medium">G×E Significant</div>
                        <div className="text-xl font-bold text-orange-900">
                          {result.summary.geSignificant ? 'Yes' : 'No'}
                        </div>
                        <div className="text-xs text-orange-600">Interaction detected</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Stability Parameters Table */}
                  <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead className="w-[50px]">Rank</TableHead>
                            <TableHead>Genotype</TableHead>
                            <TableHead className="text-right">Mean Yield</TableHead>
                            <TableHead className="text-right">
                              <TooltipWrapper content="Finlay-Wilkinson regression coefficient (b)">
                                b (Reg.)
                              </TooltipWrapper>
                            </TableHead>
                            <TableHead className="text-right">
                              <TooltipWrapper content="Deviation from regression (S²d)">
                                S²d
                              </TooltipWrapper>
                            </TableHead>
                            <TableHead className="text-right">R²</TableHead>
                            <TableHead className="text-right">
                              <TooltipWrapper content="Shukla's stability variance (σ²)">
                                Shukla σ²
                              </TooltipWrapper>
                            </TableHead>
                            <TableHead className="text-right">
                              <TooltipWrapper content="Wricke's ecovalence (W)">
                                Wricke W
                              </TooltipWrapper>
                            </TableHead>
                            <TableHead className="text-right">
                              <TooltipWrapper content="AMMI Stability Value">
                                ASV
                              </TooltipWrapper>
                            </TableHead>
                            <TableHead>Stability</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...result.stabilityResults]
                            .sort((a, b) => a.overallRank - b.overallRank)
                            .map((r) => (
                            <TableRow key={r.genotype}>
                              <TableCell className="font-medium">{r.overallRank}</TableCell>
                              <TableCell className="font-semibold">{r.genotype}</TableCell>
                              <TableCell className="text-right">{r.meanYield.toFixed(1)}</TableCell>
                              <TableCell className="text-right">
                                <span className={r.regressionCoeff > 1.1 ? 'text-blue-600' : r.regressionCoeff < 0.9 ? 'text-green-600' : ''}>
                                  {r.regressionCoeff.toFixed(3)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">{r.deviationMS.toFixed(1)}</TableCell>
                              <TableCell className="text-right">{r.rSquared.toFixed(4)}</TableCell>
                              <TableCell className="text-right">{r.shuklaVariance.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{r.ecovalence.toFixed(1)}</TableCell>
                              <TableCell className="text-right font-medium">{r.asv.toFixed(3)}</TableCell>
                              <TableCell>
                                <StabilityBadge classification={r.stabilityClass} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  {/* Interpretation Guide */}
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2 mb-2">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="text-sm text-muted-foreground">
                          <strong>Interpretation:</strong>{' '}
                          <strong>b ≈ 1</strong>: Average responsiveness to environments |{' '}
                          <strong>b &lt; 1</strong>: More stable, better performance in poor environments |{' '}
                          <strong>b &gt; 1</strong>: More responsive, better in favorable environments |{' '}
                          <strong>Lower ASV/Shukla/Wricke</strong> = More stable
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* ANOVA Tab */}
                <TabsContent value="anova" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Two-Way ANOVA for G×E Analysis</CardTitle>
                      <CardDescription>
                        Analysis of variance partitioning sources of variation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Source of Variation</TableHead>
                              <TableHead className="text-right">df</TableHead>
                              <TableHead className="text-right">SS</TableHead>
                              <TableHead className="text-right">MS</TableHead>
                              <TableHead className="text-right">F-value</TableHead>
                              <TableHead className="text-right">P-value</TableHead>
                              <TableHead>Sig.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.anova.map((row) => (
                              <TableRow key={row.source}>
                                <TableCell className="font-medium">{row.source}</TableCell>
                                <TableCell className="text-right">{row.df}</TableCell>
                                <TableCell className="text-right">{row.ss.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                  {isNaN(row.ms) ? '-' : row.ms.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isNaN(row.f) ? '-' : row.f.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isNaN(row.pValue) ? '-' : row.pValue.toFixed(4)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={row.significance === 'ns' ? 'outline' : 'secondary'}>
                                    {row.significance}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="mt-4 text-xs text-muted-foreground">
                        <p><strong>Note:</strong> Significance levels: *** p&lt;0.001, ** p&lt;0.01, * p&lt;0.05, . p&lt;0.1, ns = not significant</p>
                        <p>G×E Interaction tested using pooled error (deviations from regression)</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Environmental Indices Tab */}
                <TabsContent value="environments" className="mt-4 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Environmental Indices
                      </CardTitle>
                      <CardDescription>
                        Environmental index (I_j) = Environment mean - Grand mean. Positive values indicate favorable environments.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Environment</TableHead>
                              <TableHead className="text-right">Mean Yield</TableHead>
                              <TableHead className="text-right">Environmental Index (I_j)</TableHead>
                              <TableHead className="text-right">Rank</TableHead>
                              <TableHead>Interpretation</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...result.environmentalIndices]
                              .sort((a, b) => b.index - a.index)
                              .map((env) => (
                              <TableRow key={env.environment}>
                                <TableCell className="font-medium">{env.environment}</TableCell>
                                <TableCell className="text-right">{env.meanYield.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant={env.index > 0 ? 'default' : 'outline'} className={
                                    env.index > 50 ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' :
                                    env.index > 0 ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                    env.index > -50 ? 'bg-orange-100 text-orange-800 hover:bg-orange-100' :
                                    'bg-red-100 text-red-800 hover:bg-red-100'
                                  }>
                                    {env.index > 0 ? '+' : ''}{env.index.toFixed(2)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">{env.rank}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {env.index > 50 ? 'Highly Favorable' :
                                   env.index > 0 ? 'Favorable' :
                                   env.index > -50 ? 'Unfavorable' :
                                   'Highly Unfavorable'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Environment Means Visualization */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Environment Mean Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[...result.environmentalIndices]
                          .sort((a, b) => b.meanYield - a.meanYield)
                          .map((env, idx) => {
                          const maxMean = Math.max(...result.environmentalIndices.map(e => e.meanYield))
                          const widthPercent = (env.meanYield / maxMean) * 100
                          
                          return (
                            <div key={env.environment} className="flex items-center gap-3">
                              <div className="w-24 text-sm font-medium truncate">{env.environment}</div>
                              <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                                <div 
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/70 to-primary rounded-full flex items-center justify-end pr-2"
                                  style={{ width: `${widthPercent}%` }}
                                >
                                  <span className="text-xs text-primary-foreground font-medium">
                                    {env.meanYield.toFixed(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="w-16 text-right text-sm text-muted-foreground">
                                #{idx + 1}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Methods Information Tab */}
                <TabsContent value="methods" className="mt-4 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Stability Analysis Methods</CardTitle>
                      <CardDescription>
                        Overview of methodologies implemented in this analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Finlay-Wilkinson */}
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-blue-700 mb-2">
                          1. Finlay-Wilkinson Regression Analysis (1963)
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Regresses each genotype's mean performance on the environmental index.
                          The regression coefficient (b) measures responsiveness to environmental improvement.
                        </p>
                        <div className="bg-muted/50 rounded p-3 text-sm font-mono">
                          Y_ij = α_i + β_i × I_j + δ_ij
                        </div>
                        <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                          <li><strong>b = 1</strong>: Average stability, responds proportionally to environment</li>
                          <li><strong>b &lt; 1</strong>: Above average stability, performs relatively better in poor environments</li>
                          <li><strong>b &gt; 1</strong>: Below average stability, responds strongly to favorable conditions</li>
                          <li><strong>R²</strong>: Proportion of variation explained by linear regression</li>
                        </ul>
                      </div>
                      
                      {/* Eberhart-Russell */}
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-green-700 mb-2">
                          2. Eberhart-Russell Stability (1966)
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Extends Finlay-Wilkinson by adding deviation from regression (S²d) as a second parameter.
                          An ideal genotype has b_i ≈ 1 and S²d not significantly different from zero.
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          <li><strong>b_i</strong>: Regression coefficient (same as Finlay-Wilkinson)</li>
                          <li><strong>S²d_i</strong>: Deviation mean square from regression</li>
                          <li><strong>F-test</strong>: Tests if S²d is significantly different from pooled error</li>
                          <li>Ideal: High mean yield, b ≈ 1, non-significant S²d</li>
                        </ul>
                      </div>
                      
                      {/* Shukla's Variance */}
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-semibold text-purple-700 mb-2">
                          3. Shukla's Stability Variance (1972)
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Measures the contribution of each genotype to the G×E interaction sum of squares.
                          Based on the variance of genotype-environment interaction effects.
                        </p>
                        <div className="bg-muted/50 rounded p-3 text-sm font-mono">
                          σ²_i = [(n-1)/(g-1)(n-2)] × ΣΣ(Y_ij - Ȳ_i. - Ȳ_.j + Ȳ..)²
                        </div>
                        <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                          <li><strong>Lower σ²</strong>: More stable genotype (less G×E interaction)</li>
                          <li><strong>Higher σ²</strong>: More variable/unstable genotype</li>
                          <li>Can be used for formal hypothesis testing</li>
                        </ul>
                      </div>
                      
                      {/* Wricke's Ecovalence */}
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h4 className="font-semibold text-orange-700 mb-2">
                          4. Wricke's Ecovalence (1962)
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Measures the absolute contribution of each genotype to the G×E interaction.
                          Represents the sum of squared interaction effects for each genotype.
                        </p>
                        <div className="bg-muted/50 rounded p-3 text-sm font-mono">
                          W_i = Σ_j(Ȳ_ij - Ȳ_i. - Ȳ_.j + Ȳ..)²
                        </div>
                        <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                          <li><strong>Lower W_i</strong>: More stable (less contribution to G×E)</li>
                          <li><strong>% Contribution</strong>: Relative share of total G×E SS</li>
                          <li>Useful for identifying which genotypes drive interactions</li>
                        </ul>
                      </div>
                      
                      {/* AMMI Stability Value */}
                      <div className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-semibold text-red-700 mb-2">
                          5. AMMI Stability Value (ASV)
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Combines IPCA1 and IPCA2 scores from AMMI analysis into a single stability measure.
                          Accounts for the relative importance of each IPCA axis.
                        </p>
                        <div className="bg-muted/50 rounded p-3 text-sm font-mono">
                          ASV = √[(SS_IPCA1/SS_IPCA2 × IPCA1_score)² + (IPCA2_score)²]
                        </div>
                        <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                          <li><strong>Lower ASV</strong>: More stable genotype</li>
                          <li>Incorporates both major interaction axes</li>
                          <li>Weighted by variance explained by each axis</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// ============================================================================
// TOOLTIP HELPER COMPONENT
// ============================================================================

function TooltipWrapper({ children, content }: { children: React.ReactNode, content: string }) {
  const [show, setShow] = useState(false)
  
  return (
    <div 
      className="relative inline-flex items-center cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded shadow-md whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover" />
        </div>
      )}
    </div>
  )
}
