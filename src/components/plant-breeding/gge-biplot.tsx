'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ScatterChart, 
  PieChart, 
  TrendingUp, 
  Info, 
  Upload, 
  Download,
  Calculator,
  AlertCircle,
  FileText,
  BarChart3,
  Target,
  Compass,
  Star,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { mean, variance, fDistributionCDF } from '@/lib/statistics-engine'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface PCAxis {
  axis: number
  singularValue: number
  eigenvalue: number
  variancePercent: number
  cumulativePercent: number
}

interface GenotypeCoordinate {
  genotype: string
  pc1: number
  pc2: number
  pc3?: number
  meanYield: number
  stabilityMeasure: number
  stabilityRank: number
  meanRank: number
  idealDistance: number
  category: string
}

interface EnvironmentCoordinate {
  environment: string
  pc1: number
  pc2: number
  pc3?: number
  meanYield: number
  vectorLength: number
  discriminatingPower: string
  representativeness: number
  idealEnvDistance: number
}

interface WhichWonWhereEntry {
  sector: number
  winningGenotype: string
  environments: string[]
  vertexGenotypes: string[]
}

interface GGEBiplotResult {
  // Data info
  genotypes: string[]
  environments: string[]
  dataMatrix: number[][]
  
  // Centered matrix (G + GE)
  centeredMatrix: number[][]
  environmentMeans: number[]
  
  // SVD results
  singularValues: number[]
  pcAxes: PCAxis[]
  
  // Coordinates
  genotypeCoords: GenotypeCoordinate[]
  environmentCoords: EnvironmentCoordinate[]
  
  // Which-won-where
  whichWonWhere: WhichWonWhereEntry[]
  
  // Ideal points
  idealGenotype: { pc1: number; pc2: number }
  idealEnvironment: { pc1: number; pc2: number }
  
  // ANOVA summary
  anova: {
    totalSS: number
    environmentSS: number
    ggeSS: number
    ggePercent: number
  }
  
  // Scaling method used
  scalingMethod: 'symmetric' | 'genotype' | 'environment'
}

type BiplotView = 'whichWonWhere' | 'meanVsStability' | 'discriminatingVsRepresent' | 'idealGenotype' | 'idealEnvironment'

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
// MATRIX UTILITIES FOR SVD COMPUTATION
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
 * Compute Singular Value Decomposition using power iteration with deflation
 * Returns U, singular values array, and V transpose
 */
function computeSVD(
  matrix: number[][]
): { U: number[][]; S: number[]; Vt: number[][] } {
  const m = matrix.length
  const n = matrix[0]?.length || 0
  
  if (m === 0 || n === 0) {
    return { U: [], S: [], Vt: [] }
  }
  
  // Work with A^T * A for numerical stability
  const AtA = matrixMultiply(matrixTranspose(matrix), matrix)
  const size = Math.min(m, n)
  
  const eigenvalues: number[] = []
  const eigenvectors: number[][] = []
  
  let workingMatrix = copyMatrix(AtA)
  
  for (let iter = 0; iter < size; iter++) {
    let v = new Array(n).fill(0)
    v[iter < n ? iter : 0] = 1
    
    for (let powerIter = 0; powerIter < 100; powerIter++) {
      const Av = eigenvectors.length > 0 && iter > 0 
        ? deflateVector(matrixMultiply(workingMatrix, v), eigenvectors, eigenvalues)
        : matrixMultiplyVector(workingMatrix, v)
      
      const norm = Math.sqrt(Av.reduce((sum, x) => sum + x * x, 0))
      if (norm < 1e-10) break
      
      v = Av.map(x => x / norm)
    }
    
    const Av = matrixMultiplyVector(workingMatrix, v)
    const eigenvalue = v.reduce((sum, vi, i) => sum + vi * Av[i], 0)
    
    if (eigenvalue > 1e-10) {
      eigenvalues.push(Math.max(0, eigenvalue))
      eigenvectors.push(v)
      
      // Deflate
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
  
  // Compute U = A * V * Σ^(-1)
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

function deflateVector(
  v: number[], 
  eigenvectors: number[][], 
  eigenvalues: number[]
): number[] {
  let result = [...v]
  for (let k = 0; k < eigenvectors.length; k++) {
    const dot = v.reduce((sum, vi, i) => sum + vi * eigenvectors[k][i], 0)
    for (let i = 0; i < v.length; i++) {
      result[i] -= dot * eigenvalues[k] * eigenvectors[k][i]
    }
  }
  return result
}

/**
 * Calculate angle between two vectors in radians
 */
function angleBetween(v1: [number, number], v2: [number, number]): number {
  const dot = v1[0] * v2[0] + v1[1] * v2[1]
  const norm1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2)
  const norm2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2)
  if (norm1 < 1e-10 || norm2 < 1e-10) return 0
  return Math.acos(Math.max(-1, Math.min(1, dot / (norm1 * norm2))))
}

/**
 * Calculate cross product (for determining sector)
 */
function crossProduct(v1: [number, number], v2: [number, number]): number {
  return v1[0] * v2[1] - v1[1] * v2[0]
}

// ============================================================================
// GGE BILOT ANALYSIS FUNCTION
// ============================================================================

/**
 * Perform complete GGE Biplot Analysis based on Yan & Kang (2003) methodology
 * 
 * Key concept: GGE Biplot = "Genotype main effect + Genotype × Environment interaction"
 * This is different from AMMI which analyzes only the G×E interaction.
 * 
 * Steps:
 * 1. Center data by environment means (remove environment main effect)
 * 2. SVD of the centered (G+GE) matrix
 * 3. Calculate coordinates for genotypes and environments
 * 4. Determine which-won-where pattern
 */
function performGGEBiplotAnalysis(
  genotypeNames: string[],
  environmentNames: string[],
  dataMatrix: number[][],
  scalingMethod: 'symmetric' | 'genotype' | 'environment' = 'symmetric'
): GGEBiplotResult {
  const g = genotypeNames.length
  const e = environmentNames.length
  const N = g * e
  
  // Step 1: Calculate environment means and center the data
  const environmentMeans: number[] = []
  const centeredMatrix: number[][] = []
  
  for (let j = 0; j < e; j++) {
    let envSum = 0
    for (let i = 0; i < g; i++) {
      envSum += dataMatrix[i][j]
    }
    environmentMeans.push(envSum / g)
  }
  
  // Center by environment means: Y_ij - Ȳ_j
  // This removes environment main effect, leaving G + GE
  let totalCenteredSS = 0
  for (let i = 0; i < g; i++) {
    centeredMatrix[i] = []
    for (let j = 0; j < e; j++) {
      const centered = dataMatrix[i][j] - environmentMeans[j]
      centeredMatrix[i][j] = centered
      totalCenteredSS += centered ** 2
    }
  }
  
  // Step 2: Total SS and Environment SS for reference
  const grandMean = dataMatrix.flat().reduce((a, b) => a + b, 0) / N
  let totalSS = 0
  for (let i = 0; i < g; i++) {
    for (let j = 0; j < e; j++) {
      totalSS += (dataMatrix[i][j] - grandMean) ** 2
    }
  }
  
  let environmentSS = 0
  for (let j = 0; j < e; j++) {
    environmentSS += g * (environmentMeans[j] - grandMean) ** 2
  }
  
  const ggeSS = totalCenteredSS
  
  // Step 3: SVD of centered (G+GE) matrix
  const { U, S, Vt } = computeSVD(centeredMatrix)
  
  // Step 4: Calculate variance explained
  const numPCs = Math.min(S.length, Math.min(g, e))
  let cumulativeVariance = 0
  const pcAxes: PCAxis[] = []
  
  for (let k = 0; k < numPCs; k++) {
    const eigenvalue = S[k] ** 2
    const variancePercent = (eigenvalue / ggeSS) * 100
    cumulativeVariance += variancePercent
    
    pcAxes.push({
      axis: k + 1,
      singularValue: S[k],
      eigenvalue,
      variancePercent,
      cumulativePercent: cumulativeVariance
    })
  }
  
  // Step 5: Calculate coordinates based on scaling method
  // Symmetric scaling: sqrt(lambda) for both
  // Genotype-focused: full lambda to genotype
  // Environment-focused: full lambda to environment
  
  let genotypeScaling: number[]
  let environmentScaling: number[]
  
  if (scalingMethod === 'symmetric') {
    const sqrtS = S.map(s => Math.sqrt(s))
    genotypeScaling = sqrtS
    environmentScaling = sqrtS
  } else if (scalingMethod === 'genotype') {
    genotypeScaling = S.map(s => s)
    environmentScaling = S.map(s => 1)
  } else {
    genotypeScaling = S.map(s => 1)
    environmentScaling = S.map(s => s)
  }
  
  // Step 6: Calculate genotype coordinates
  const genotypeMeans: number[] = []
  for (let i = 0; i < g; i++) {
    let sum = 0
    for (let j = 0; j < e; j++) {
      sum += dataMatrix[i][j]
    }
    genotypeMeans.push(sum / e)
  }
  
  const genotypeCoords: GenotypeCoordinate[] = []
  for (let i = 0; i < g; i++) {
    const pc1 = (U[i]?.[0] || 0) * (genotypeScaling[0] || 0)
    const pc2 = (U[i]?.[1] || 0) * (genotypeScaling[1] || 0)
    const pc3 = (U[i]?.[2] || 0) * (genotypeScaling[2] || 0)
    
    // Stability measure: distance from origin in PC space
    // In GGE biplot, stability is inversely related to this distance
    const stabilityMeasure = Math.sqrt(pc1 ** 2 + pc2 ** 2)
    
    // Mean yield rank (higher is better)
    const meanYield = genotypeMeans[i]
    
    // Ideal genotype distance: distance from "ideal" point
    // The ideal genotype has highest mean AND perfect stability
    // We'll calculate this after determining the ideal point
    
    let category: string
    if (stabilityMeasure < 50) category = 'Very Stable'
    else if (stabilityMeasure < 100) category = 'Stable'
    else if (stabilityMeasure < 200) category = 'Moderate'
    else if (stabilityMeasure < 350) category = 'Unstable'
    else category = 'Very Unstable'
    
    genotypeCoords.push({
      genotype: genotypeNames[i],
      pc1,
      pc2,
      pc3,
      meanYield,
      stabilityMeasure,
      stabilityRank: 0,
      meanRank: 0,
      idealDistance: 0,
      category
    })
  }
  
  // Rank genotypes by mean yield and stability
  const sortedByMean = [...genotypeCoords].sort((a, b) => b.meanYield - a.meanYield)
  sortedByMean.forEach((g, idx) => {
    const original = genotypeCoords.find(gc => gc.genotype === g.genotype)
    if (original) original.meanRank = idx + 1
  })
  
  const sortedByStability = [...genotypeCoords].sort((a, b) => a.stabilityMeasure - b.stabilityMeasure)
  sortedByStability.forEach((g, idx) => {
    const original = genotypeCoords.find(gc => gc.genotype === g.genotype)
    if (original) original.stabilityRank = idx + 1
  })
  
  // Step 7: Calculate environment coordinates
  const environmentCoords: EnvironmentCoordinate[] = []
  for (let j = 0; j < e; j++) {
    const pc1 = (Vt[0]?.[j] || 0) * (environmentScaling[0] || 0)
    const pc2 = (Vt[1]?.[j] || 0) * (environmentScaling[1] || 0)
    const pc3 = (Vt[2]?.[j] || 0) * (environmentScaling[2] || 0)
    
    // Vector length = discriminating power
    const vectorLength = Math.sqrt(pc1 ** 2 + pc2 ** 2)
    
    let discriminatingPower: string
    if (vectorLength > 150) discriminatingPower = 'High'
    else if (vectorLength > 80) discriminatingPower = 'Moderate'
    else discriminatingPower = 'Low'
    
    // Representativeness: correlation with average environment
    // Average environment has coordinates at average of all env coordinates
    // For now, use proximity to origin as proxy (will refine after all coords calculated)
    
    environmentCoords.push({
      environment: environmentNames[j],
      pc1,
      pc2,
      pc3,
      meanYield: environmentMeans[j],
      vectorLength,
      discriminatingPower,
      representativeness: 0,
      idealEnvDistance: 0
    })
  }
  
  // Calculate representativeness (angle with average environment axis)
  const avgEnvPC1 = environmentCoords.reduce((sum, e) => sum + e.pc1, 0) / e
  const avgEnvPC2 = environmentCoords.reduce((sum, e) => sum + e.pc2, 0) / e
  const avgEnvVector: [number, number] = [avgEnvPC1, avgEnvPC2]
  const avgEnvNorm = Math.sqrt(avgEnvPC1 ** 2 + avgEnvPC2 ** 2)
  
  for (const env of environmentCoords) {
    const envVector: [number, number] = [env.pc1, env.pc2]
    const cosAngle = avgEnvNorm > 1e-10 
      ? (envVector[0] * avgEnvVector[0] + envVector[1] * avgEnvVector[1]) / (Math.sqrt(envVector[0] ** 2 + envVector[1] ** 2) * avgEnvNorm)
      : 1
    env.representativeness = Math.max(-1, Math.min(1, cosAngle))
  }
  
  // Step 8: Determine ideal genotype point
  // Ideal genotype: one with highest mean performance AND absolute stability
  // Located at the intersection of "ideal" position - longest vector in positive PC1 direction
  // that also has minimum PC2 (stability)
  
  // Find the genotype with maximum PC1 (mean performance proxy in symmetric scaling)
  const maxPC1 = Math.max(...genotypeCoords.map(g => g.pc1))
  const minAbsPC2AmongTop = Math.min(
    ...genotypeCoords
      .filter(g => g.pc1 > maxPC1 * 0.8)
      .map(g => Math.abs(g.pc2))
  )
  
  // Ideal genotype is at the "arrow head" position
  const idealGenotype = {
    pc1: maxPC1 * 1.15,  // Extend slightly beyond best genotype
    pc2: 0               // Perfect stability
  }
  
  // Calculate distances to ideal genotype
  for (const geno of genotypeCoords) {
    const dx = geno.pc1 - idealGenotype.pc1
    const dy = geno.pc2 - idealGenotype.pc2
    geno.idealDistance = Math.sqrt(dx ** 2 + dy ** 2)
  }
  
  // Step 9: Determine ideal environment point
  // Ideal environment: high discriminating power + high representativeness
  // Located in direction of average environment with long vector
  const idealEnvironment = {
    pc1: avgEnvPC1 * 1.3,
    pc2: avgEnvPC2 * 1.3
  }
  
  // Calculate distances to ideal environment
  for (const env of environmentCoords) {
    const dx = env.pc1 - idealEnvironment.pc1
    const dy = env.pc2 - idealEnvironment.pc2
    env.idealEnvDistance = Math.sqrt(dx ** 2 + dy ** 2)
  }
  
  // Step 10: Which-Won-Where analysis
  // Draw convex hull around genotypes, determine sectors, assign environments
  const whichWonWhere = performWhichWonWhere(genotypeCoords, environmentCoords)
  
  return {
    genotypes: genotypeNames,
    environments: environmentNames,
    dataMatrix,
    centeredMatrix,
    environmentMeans,
    singularValues: S,
    pcAxes,
    genotypeCoords,
    environmentCoords,
    whichWonWhere,
    idealGenotype,
    idealEnvironment,
    anova: {
      totalSS,
      environmentSS,
      ggeSS,
      ggePercent: (ggeSS / totalSS) * 100
    },
    scalingMethod
  }
}

/**
 * Perform Which-Won-Where analysis using polygon view approach
 * Based on Yan et al. (2000) methodology
 */
function performWhichWonWhere(
  genotypeCoords: GenotypeCoordinate[],
  environmentCoords: EnvironmentCoordinate[]
): WhichWonWhereEntry[] {
  if (genotypeCoords.length < 3) {
    return [{
      sector: 1,
      winningGenotype: genotypeCoords[0]?.genotype || '',
      environments: environmentCoords.map(e => e.environment),
      vertexGenotypes: genotypeCoords.map(g => g.genotype)
    }]
  }
  
  // Find convex hull vertices (genotypes on the outer boundary)
  const points = genotypeCoords.map(g => ({ x: g.pc1, y: g.pc2, name: g.genotype }))
  const hullIndices = convexHull(points)
  const vertexGenotypes = hullIndices.map(i => genotypeCoords[i].genotype)
  
  // Determine sectors from the origin through each vertex
  // Each sector is defined by perpendicular bisectors of adjacent hull edges
  const sectors: { startAngle: number; endAngle: number; vertex: string }[] = []
  
  for (let i = 0; i < hullIndices.length; i++) {
    const currIdx = hullIndices[i]
    const nextIdx = hullIndices[(i + 1) % hullIndices.length]
    
    const currPoint = points[currIdx]
    const nextPoint = points[nextIdx]
    
    // Angle to current vertex
    const angleCurr = Math.atan2(currPoint.y, currPoint.x)
    const angleNext = Math.atan2(nextPoint.y, nextPoint.x)
    
    // Sector midpoint (direction to winning area)
    let startAngle: number
    let endAngle: number
    
    if (i === 0) {
      // First sector: from previous vertex's bisector to current bisector
      const prevIdx = hullIndices[hullIndices.length - 1]
      const prevPoint = points[prevIdx]
      const anglePrev = Math.atan2(prevPoint.y, prevPoint.x)
      
      startAngle = (anglePrev + angleCurr) / 2
      if (angleCurr > anglePrev) startAngle += Math.PI
      
      endAngle = (angleCurr + angleNext) / 2
      if (angleNext < angleCurr) endAngle += Math.PI
    } else {
      const prevIdx = hullIndices[i - 1]
      const prevPoint = points[prevIdx]
      const anglePrev = Math.atan2(prevPoint.y, prevPoint.x)
      
      startAngle = (anglePrev + angleCurr) / 2
      endAngle = (angleCurr + angleNext) / 2
    }
    
    sectors.push({
      startAngle,
      endAngle,
      vertex: genotypeCoords[currIdx].genotype
    })
  }
  
  // Assign each environment to a sector
  const results: Map<string, { winner: string; sector: number; vertices: string[] }> = new Map()
  
  for (const env of environmentCoords) {
    const envAngle = Math.atan2(env.pc2, env.pc1)
    
    let assignedSector = 0
    let minAngleDiff = Infinity
    
    for (let s = 0; s < sectors.length; s++) {
      const sector = sectors[s]
      
      // Normalize angles for comparison
      let angleDiff = Math.abs(envAngle - (sector.startAngle + sector.endAngle) / 2)
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff
      
      if (angleDiff < minAngleDiff) {
        minAngleDiff = angleDiff
        assignedSector = s
      }
    }
    
    results.set(env.environment, {
      winner: sectors[assignedSector]?.vertex || genotypeCoords[0].genotype,
      sector: assignedSector + 1,
      vertices: vertexGenotypes
    })
  }
  
  // Group by winning genotype
  const winnerMap = new Map<string, string[]>()
  for (const [, value] of results) {
    if (!winnerMap.has(value.winner)) {
      winnerMap.set(value.winner, [])
    }
  }
  
  for (const [envName, value] of results) {
    winnerMap.get(value.winner)?.push(envName)
  }
  
  // Build final result
  const whichWonWhere: WhichWonWhereEntry[] = []
  let sectorNum = 1
  
  for (const [winner, envs] of winnerMap) {
    whichWonWhere.push({
      sector: sectorNum++,
      winningGenotype: winner,
      environments: envs.sort(),
      vertexGenotypes: vertexGenotypes
    })
  }
  
  // Sort by sector number
  whichWonWhere.sort((a, b) => a.sector - b.sector)
  
  // If no sectors determined, put everything in one
  if (whichWonWhere.length === 0) {
    whichWonWhere.push({
      sector: 1,
      winningGenotype: genotypeCoords.sort((a, b) => b.meanYield - a.meanYield)[0]?.genotype || '',
      environments: environmentCoords.map(e => e.environment),
      vertexGenotypes: vertexGenotypes
    })
  }
  
  return whichWonWhere
}

/**
 * Compute convex hull using Graham scan algorithm
 * Returns indices of points forming the convex hull
 */
function convexHull(points: { x: number; y: number; name: string }[]): number[] {
  if (points.length <= 2) return points.map((_, i) => i)
  
  // Find lowest point (by y, then by x)
  let lowest = 0
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < points[lowest].y || 
        (points[i].y === points[lowest].y && points[i].x < points[lowest].x)) {
      lowest = i
    }
  }
  
  // Sort by polar angle from lowest point
  const start = points[lowest]
  const sorted = points
    .map((p, i) => ({ ...p, originalIndex: i }))
    .filter((_, i) => i !== lowest)
    .sort((a, b) => {
      const angleA = Math.atan2(a.y - start.y, a.x - start.x)
      const angleB = Math.atan2(b.y - start.y, b.x - start.x)
      return angleA - angleB
    })
  
  // Build hull
  const hull: number[] = [lowest]
  
  for (const p of sorted) {
    while (hull.length > 1) {
      const top = points[hull[hull.length - 1]]
      const nextToTop = points[hull[hull.length - 2]]
      
      // Cross product to check orientation
      const cross = (top.x - nextToTop.x) * (p.y - top.y) - (top.y - nextToTop.y) * (p.x - top.x)
      
      if (cross <= 0) {
        hull.pop()
      } else {
        break
      }
    }
    hull.push(p.originalIndex)
  }
  
  return hull
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GGEBiplotAnalysis() {
  const [rawData, setRawData] = useState(SAMPLE_DATA)
  const [result, setResult] = useState<GGEBiplotResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<BiplotView>('whichWonWhere')
  const [scalingMethod, setScalingMethod] = useState<'symmetric' | 'genotype' | 'environment'>('symmetric')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse CSV data
  const parseData = useCallback((text: string): { genotypes: string[]; environments: string[]; matrix: number[][] } | null => {
    try {
      const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0)
      
      if (lines.length < 3) {
        setError('Data must have at least 2 genotypes and 2 environments')
        return null
      }
      
      // Parse header
      const header = lines[0].split(',').map(h => h.trim())
      const environments = header.slice(1) // Skip first column (Genotype)
      
      if (environments.length < 2) {
        setError('Must have at least 2 environments')
        return null
      }
      
      // Parse data rows
      const genotypes: string[] = []
      const matrix: number[][] = []
      
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim())
        
        if (cols.length !== header.length) {
          setError(`Row ${i + 1}: Column count mismatch (expected ${header.length}, got ${cols.length})`)
          return null
        }
        
        genotypes.push(cols[0])
        const values: number[] = []
        
        for (let j = 1; j < cols.length; j++) {
          const val = parseFloat(cols[j])
          if (isNaN(val)) {
            setError(`Row ${i + 1}, Column ${j + 1}: Invalid number "${cols[j]}"`)
            return null
          }
          values.push(val)
        }
        
        matrix.push(values)
      }
      
      if (genotypes.length < 2) {
        setError('Must have at least 2 genotypes')
        return null
      }
      
      return { genotypes, environments, matrix: matrix }
    } catch (err) {
      setError(`Parse error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return null
    }
  }, [])

  // Run analysis
  const runAnalysis = useCallback(() => {
    setError(null)
    setIsLoading(true)
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const parsed = parseData(rawData)
        if (!parsed) {
          setIsLoading(false)
          return
        }
        
        const analysisResult = performGGEBiplotAnalysis(
          parsed.genotypes,
          parsed.environments,
          parsed.matrix,
          scalingMethod
        )
        
        setResult(analysisResult)
        setIsLoading(false)
      } catch (err) {
        setError(`Analysis error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setIsLoading(false)
      }
    }, 100)
  }, [rawData, parseData, scalingMethod])

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (text) {
        setRawData(text)
      }
    }
    reader.readAsText(file)
  }, [])

  // Export results to CSV
  const exportCSV = useCallback(() => {
    if (!result) return
    
    let csv = ''
    
    // Section 1: Genotype coordinates
    csv += 'GENOTYPE COORDINATES\n'
    csv += 'Genotype,PC1,PC2,PC3,MeanYield,Stability,StabilityRank,MeanRank,IdealDistance,Category\n'
    for (const g of result.genotypeCoords) {
      csv += `${g.genotype},${g.pc1.toFixed(4)},${g.pc2.toFixed(4)},${(g.pc3 ?? 0).toFixed(4)},${g.meanYield.toFixed(2)},${g.stabilityMeasure.toFixed(4)},${g.stabilityRank},${g.meanRank},${g.idealDistance.toFixed(4)},${g.category}\n`
    }
    
    csv += '\nENVIRONMENT COORDINATES\n'
    csv += 'Environment,PC1,PC2,PC3,MeanYield,VectorLength,DiscriminatingPower,Representativeness,IdealDistance\n'
    for (const e of result.environmentCoords) {
      csv += `${e.environment},${e.pc1.toFixed(4)},${e.pc2.toFixed(4)},${(e.pc3 ?? 0).toFixed(4)},${e.meanYield.toFixed(2)},${e.vectorLength.toFixed(4)},${e.discriminatingPower},${e.representativeness.toFixed(4)},${e.idealEnvDistance.toFixed(4)}\n`
    }
    
    csv += '\nVARIANCE EXPLAINED\n'
    csv += 'Axis,SingularValue,Eigenvalue,VariancePercent,CumulativePercent\n'
    for (const pc of result.pcAxes) {
      csv += `${pc.axis},${pc.singularValue.toFixed(4)},${pc.eigenvalue.toFixed(4)},${pc.variancePercent.toFixed(2)},${pc.cumulativePercent.toFixed(2)}\n`
    }
    
    csv += '\nWHICH-WON-WHERE\n'
    csv += 'Sector,WinningGenotype,Environments\n'
    for (const www of result.whichWonWhere) {
      csv += `${www.sector},"${www.winningGenotype}","${www.environments.join(';')}"\n`
    }
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gge-biplot-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [result])

  // SVG Biplot rendering
  const renderBiplot = useCallback((view: BiplotView) => {
    if (!result) return null
    
    const width = 500
    const height = 400
    const padding = 50
    const plotWidth = width - 2 * padding
    const plotHeight = height - 2 * padding
    
    // Get all points to determine scale
    let allPoints: { x: number; y: number }[] = []
    
    result.genotypeCoords.forEach(g => {
      allPoints.push({ x: g.pc1, y: g.pc2 })
    })
    result.environmentCoords.forEach(e => {
      allPoints.push({ x: e.pc1, y: e.pc2 })
    })
    
    // Add ideal points based on view
    if (view === 'idealGenotype') {
      allPoints.push({ x: result.idealGenotype.pc1, y: result.idealGenotype.pc2 })
    }
    if (view === 'idealEnvironment') {
      allPoints.push({ x: result.idealEnvironment.pc1, y: result.idealEnvironment.pc2 })
    }
    
    // Calculate scale with some padding
    const xs = allPoints.map(p => p.x)
    const ys = allPoints.map(p => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    
    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1
    const scale = Math.min(plotWidth / rangeX, plotHeight / rangeY) * 0.85
    
    const centerX = padding + plotWidth / 2
    const centerY = padding + plotHeight / 2
    
    const toSVGX = (val: number) => centerX + (val - (minX + maxX) / 2) * scale
    const toSVGY = (val: number) => centerY - (val - (minY + maxY) / 2) * scale
    
    // Color palette for genotypes
    const genotypeColors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
      '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899',
      '#f43f5e', '#84cc16', '#10b981', '#0ea5e9', '#6366f1'
    ]
    
    // Generate sector polygons for which-won-where
    const renderSectors = () => {
      if (view !== 'whichWonWhere' || !result) return null
      
      const hullPoints = [...result.genotypeCoords]
        .sort((a, b) => Math.atan2(b.pc2, b.pc1) - Math.atan2(a.pc2, a.pc1))
      
      const pathData = hullPoints.map((p, i) => {
        const x = toSVGX(p.pc1)
        const y = toSVGY(p.pc2)
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
      }).join(' ') + ' Z'
      
      return (
        <path
          d={pathData}
          fill="rgba(59, 130, 246, 0.08)"
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth={1}
          strokeDasharray="4,4"
        />
      )
    }
    
    // Render mean axis arrow for mean vs stability view
    const renderMeanAxis = () => {
      if (view !== 'meanVsStability' && view !== 'idealGenotype') return null
      
      // Arrow pointing right (average environment direction / mean performance)
      const arrowLen = Math.max(...result.genotypeCoords.map(g => g.pc1)) * 1.1
      const x1 = toSVGX(0)
      const y1 = toSVGY(0)
      const x2 = toSVGX(arrowLen)
      const y2 = toSVGY(0)
      
      return (
        <g>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f97316" strokeWidth={2} markerEnd="url(#arrowhead-orange)" />
          <text x={x2 + 5} y={y2 - 5} fill="#f97316" fontSize={11} fontWeight="bold">Mean</text>
        </g>
      )
    }
    
    // Render ideal genotype marker
    const renderIdealGenotype = () => {
      if (view !== 'idealGenotype' || !result) return null
      
      const x = toSVGX(result.idealGenotype.pc1)
      const y = toSVGY(result.idealGenotype.pc2)
      
      return (
        <g>
          <circle cx={x} cy={y} r={8} fill="none" stroke="#22c55e" strokeWidth={2} />
          <line x1={x - 12} y1={y - 12} x2={x + 12} y2={y + 12} stroke="#22c55e" strokeWidth={2} />
          <line x1={x + 12} y1={y - 12} x2={x - 12} y2={y + 12} stroke="#22c55e" strokeWidth={2} />
          <text x={x + 12} y={y - 8} fill="#22c55e" fontSize={10} fontWeight="bold">Ideal</text>
          
          {/* Draw lines from ideal to all genotypes */}
          {result.genotypeCoords.map((g, i) => (
            <line
              key={`ideal-line-${i}`}
              x1={x}
              y1={y}
              x2={toSVGX(g.pc1)}
              y2={toSVGY(g.pc2)}
              stroke="rgba(34, 197, 94, 0.2)"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          ))}
        </g>
      )
    }
    
    // Render ideal environment marker
    const renderIdealEnvironment = () => {
      if (view !== 'idealEnvironment' || !result) return null
      
      const x = toSVGX(result.idealEnvironment.pc1)
      const y = toSVGY(result.idealEnvironment.pc2)
      
      return (
        <g>
          <polygon
            points={`${x},${y - 10} ${x + 9},${y + 7} ${x - 9},${y + 7}`}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth={2}
          />
          <text x={x + 12} y={y + 5} fill="#8b5cf6" fontSize={10} fontWeight="bold">Ideal Env</text>
          
          {/* Draw lines from ideal to all environments */}
          {result.environmentCoords.map((e, i) => (
            <line
              key={`ideal-env-line-${i}`}
              x1={x}
              y1={y}
              x2={toSVGX(e.pc1)}
              y2={toSVGY(e.pc2)}
              stroke="rgba(139, 92, 246, 0.2)"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          ))}
        </g>
      )
    }
    
    // Render average environment axis
    const renderAvgEnvAxis = () => {
      if (view !== 'discriminatingVsRepresent' && view !== 'idealEnvironment') return null
      
      const avgPC1 = result.environmentCoords.reduce((s, e) => s + e.pc1, 0) / result.environmentCoords.length
      const avgPC2 = result.environmentCoords.reduce((s, e) => s + e.pc2, 0) / result.environmentCoords.length
      const len = Math.sqrt(avgPC1 ** 2 + avgPC2 ** 2)
      const scaleLen = len * 1.3
      
      const x1 = toSVGX(0)
      const y1 = toSVGY(0)
      const x2 = toSVGX(avgPC1 / len * scaleLen)
      const y2 = toSVGY(avgPC2 / len * scaleLen)
      
      return (
        <g>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8b5cf6" strokeWidth={2} markerEnd="url(#arrowhead-purple)" />
          <text x={x2 + 5} y={y2 - 5} fill="#8b5cf6" fontSize={11} fontWeight="bold">Avg Env</text>
        </g>
      )
    }
    
    return (
      <svg width={width} height={height} className="w-full h-auto bg-white rounded-lg border">
        <defs>
          <marker id="arrowhead-orange" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
          </marker>
          <marker id="arrowhead-purple" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
          </marker>
        </defs>
        
        {/* Background grid */}
        <rect x={padding} y={padding} width={plotWidth} height={plotHeight} fill="#fafafa" rx={4} />
        <line x1={toSVGX(0)} y1={padding} x2={toSVGX(0)} y2={padding + plotHeight} stroke="#e5e7eb" strokeWidth={1} />
        <line x1={padding} y1={toSVGY(0)} x2={padding + plotWidth} y2={toSVGY(0)} stroke="#e5e7eb" strokeWidth={1} />
        
        {/* View-specific elements */}
        {renderSectors()}
        {renderMeanAxis()}
        {renderAvgEnvAxis()}
        {renderIdealGenotype()}
        {renderIdealEnvironment()}
        
        {/* Environment vectors */}
        {result.environmentCoords.map((env, i) => {
          const x = toSVGX(env.pc1)
          const y = toSVGY(env.pc2)
          return (
            <g key={`env-${i}`}>
              <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="#3b82f6" strokeWidth={1.5} />
              <circle cx={x} cy={y} r={5} fill="#3b82f6" stroke="white" strokeWidth={1.5} />
              <text x={x + 8} y={y - 5} fill="#3b82f6" fontSize={11} fontWeight={600}>{env.environment}</text>
            </g>
          )
        })}
        
        {/* Genotype points */}
        {result.genotypeCoords.map((geno, i) => {
          const x = toSVGX(geno.pc1)
          const y = toSVGY(geno.pc2)
          const color = genotypeColors[i % genotypeColors.length]
          return (
            <g key={`geno-${i}`}>
              <circle cx={x} cy={y} r={7} fill={color} stroke="white" strokeWidth={2} />
              <text x={x + 10} y={y + 4} fill={color} fontSize={11} fontWeight={600}>{geno.genotype}</text>
            </g>
          )
        })}
        
        {/* Origin marker */}
        <circle cx={centerX} cy={centerY} r={3} fill="#374151" />
        
        {/* Axis labels */}
        <text x={width - padding} y={height - 10} fill="#6b7280" fontSize={11} textAlign="end">PC1 ({result.pcAxes[0]?.variancePercent.toFixed(1)}%)</text>
        <text x={padding + 5} y={padding - 10} fill="#6b7280" fontSize={11}>PC2 ({result.pcAxes[1]?.variancePercent.toFixed(1)}%)</text>
      </svg>
    )
  }, [result])

  // View descriptions
  const viewDescriptions: Record<BiplotView, { title: string; description: string; icon: React.ReactNode }> = {
    whichWonWhere: {
      title: 'Which-Won-Where',
      description: 'Identifies winning genotypes in each mega-environment sector. Useful for cultivar recommendation and mega-environment delineation.',
      icon: <ScatterChart className="w-4 h-4" />
    },
    meanVsStability: {
      title: 'Mean vs Stability',
      description: 'Evaluates genotypes based on mean performance (PC1) vs stability (PC2). Ideal genotypes are toward the right with small PC2.',
      icon: <TrendingUp className="w-4 h-4" />
    },
    discriminatingVsRepresent: {
      title: 'Discriminating vs Representative',
      description: 'Evaluates test environments. Ideal environments have long vectors (high discrimination) and small angle with Avg-Env axis (high representativeness).',
      icon: <Compass className="w-4 h-4" />
    },
    idealGenotype: {
      title: 'Ideal Genotype',
      description: 'Shows the ideal genotype position (highest mean + perfectly stable). Distance from ideal ranks overall genotype merit.',
      icon: <Star className="w-4 h-4" />
    },
    idealEnvironment: {
      title: 'Ideal Environment',
      description: 'Shows the ideal test environment position (most discriminating + most representative). Useful for selecting trial locations.',
      icon: <Target className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg text-white">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">GGE Biplot Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">
              Genotype + Genotype × Environment Interaction Biplot (Yan & Kang, 2003)
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
          Mega-Environment Analysis
        </Badge>
      </motion.div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>GGE Biplot</strong> visualizes both genotype main effects (G) and genotype × environment interactions (GE).</p>
              <p>Unlike AMMI which separates G and GE, GGE biplot combines them because both are relevant for cultivar evaluation.</p>
              <p className="text-xs mt-2">Data format: Rows = Genotypes, Columns = Environments, Values = Trait measurements (e.g., yield)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Data Input
          </CardTitle>
          <CardDescription>
            Enter your multi-environment trial data or load sample data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="paste" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Paste Data
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload CSV
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="paste" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="data-input">Data Matrix (CSV Format)</Label>
                <Textarea
                  id="data-input"
                  placeholder={`Paste your data here...\n\nFormat:\nGenotype,Env1,Env2,Env3,Env4\nG1,3200,2850,3100,2980\nG2,2800,3100,2750,3050\n...`}
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  className="mt-2 font-mono text-sm min-h-[180px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRawData(SAMPLE_DATA)}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Load Sample Data
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4 mt-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {rawData && rawData !== SAMPLE_DATA && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  File loaded successfully ({rawData.split(`\n`).length - 1} data rows)
                </p>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Scaling Method Selection */}
          <div className="mt-6 pt-4 border-t">
            <Label className="text-sm font-medium text-gray-700">Biplot Scaling Method</Label>
            <div className="flex gap-2 mt-2">
              {[
                { value: 'symmetric' as const, label: 'Symmetric (SG)', desc: 'Equal weight to genotypes & environments' },
                { value: 'genotype' as const, label: 'Genotype Focused', desc: 'Better genotype comparison' },
                { value: 'environment' as const, label: 'Environment Focused', desc: 'Better environment comparison' }
              ].map(method => (
                <Button
                  key={method.value}
                  variant={scalingMethod === method.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScalingMethod(method.value)}
                  className="flex flex-col items-start h-auto py-2 px-3"
                  title={method.desc}
                >
                  <span className="font-medium">{method.label}</span>
                  <span className="text-xs opacity-70">{method.desc}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Run Analysis Button */}
          <div className="mt-6 pt-4 border-t">
            <Button
              onClick={runAnalysis}
              disabled={isLoading || !rawData.trim()}
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Running GGE Analysis...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Run GGE Biplot Analysis
                </>
              )}
            </Button>
          </div>
          
          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-4 pb-4">
                  <div className="text-2xl font-bold text-blue-700">{result.genotypes.length}</div>
                  <div className="text-xs text-blue-600 font-medium">Genotypes</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="pt-4 pb-4">
                  <div className="text-2xl font-bold text-green-700">{result.environments.length}</div>
                  <div className="text-xs text-green-600 font-medium">Environments</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardContent className="pt-4 pb-4">
                  <div className="text-2xl font-bold text-purple-700">
                    {(result.pcAxes[0]?.variancePercent + result.pcAxes[1]?.variancePercent || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-purple-600 font-medium">PC1+PC2 Explained</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                <CardContent className="pt-4 pb-4">
                  <div className="text-2xl font-bold text-orange-700">{result.whichWonWhere.length}</div>
                  <div className="text-xs text-orange-600 font-medium">Mega-Environments</div>
                </CardContent>
              </Card>
            </div>

            {/* Variance Explained */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Principal Components - Variance Explained
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PC Axis</TableHead>
                      <TableHead>Singular Value</TableHead>
                      <TableHead>Eigenvalue</TableHead>
                      <TableHead>Variance (%)</TableHead>
                      <TableHead>Cumulative (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.pcAxes.slice(0, 5).map(pc => (
                      <TableRow key={pc.axis}>
                        <TableCell className="font-medium">PC{pc.axis}</TableCell>
                        <TableCell>{pc.singularValue.toFixed(4)}</TableCell>
                        <TableCell>{pc.eigenvalue.toFixed(4)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-indigo-600"
                                style={{ width: `${Math.min(pc.variancePercent, 100)}%` }}
                              />
                            </div>
                            <span>{pc.variancePercent.toFixed(2)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{pc.cumulativePercent.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <strong>GGE Sum of Squares:</strong> {result.anova.ggeSS.toFixed(2)}{' '}
                  <span className="ml-4">
                    (<strong>{result.anova.ggePercent.toFixed(1)}%</strong> of total variation)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Biplot Visualization */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ScatterChart className="w-5 h-5 text-emerald-600" />
                    GGE Biplot Visualization
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportCSV}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>
                <CardDescription>
                  {viewDescriptions[activeView].description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* View Selector */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Object.keys(viewDescriptions) as BiplotView[]).map(view => (
                    <Button
                      key={view}
                      variant={activeView === view ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveView(view)}
                      className="flex items-center gap-2"
                    >
                      {viewDescriptions[view].icon}
                      {viewDescriptions[view].title}
                    </Button>
                  ))}
                </div>
                
                {/* Biplot SVG */}
                <div className="flex justify-center overflow-x-auto py-4">
                  {renderBiplot(activeView)}
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Genotypes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Environments</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-0.5 bg-orange-500" />
                    <span>Mean Axis</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-0.5 bg-purple-500" />
                    <span>Avg-Env Axis</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Genotype Rankings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Genotype Performance Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Rank</TableHead>
                          <TableHead>Genotype</TableHead>
                          <TableHead className="text-right">Mean Yield</TableHead>
                          <TableHead className="text-right">Stability</TableHead>
                          <TableHead className="text-right">Ideal Dist.</TableHead>
                          <TableHead>Category</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...result.genotypeCoords]
                          .sort((a, b) => a.idealDistance - b.idealDistance)
                          .slice(0, 15)
                          .map((g, i) => (
                            <TableRow key={g.genotype}>
                              <TableCell className="font-medium">
                                {i < 3 ? (
                                  <Badge variant={i === 0 ? 'default' : 'secondary'} className={
                                    i === 0 ? 'bg-yellow-500 text-yellow-900' :
                                    i === 1 ? 'bg-gray-300 text-gray-700' :
                                    'bg-amber-600 text-amber-50'
                                  }>
                                    {i + 1}
                                  </Badge>
                                ) : (
                                  i + 1
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{g.genotype}</TableCell>
                              <TableCell className="text-right font-mono">{g.meanYield.toFixed(1)}</TableCell>
                              <TableCell className="text-right font-mono">{g.stabilityMeasure.toFixed(1)}</TableCell>
                              <TableCell className="text-right font-mono">{g.idealDistance.toFixed(1)}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="secondary" 
                                  className={
                                    g.category === 'Very Stable' ? 'bg-green-100 text-green-700' :
                                    g.category === 'Stable' ? 'bg-green-50 text-green-600' :
                                    g.category === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                                    g.category === 'Unstable' ? 'bg-orange-100 text-orange-700' :
                                    'bg-red-100 text-red-700'
                                  }
                                >
                                  {g.category}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Environment Evaluation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    Environment Evaluation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Environment</TableHead>
                          <TableHead className="text-right">Mean</TableHead>
                          <TableHead className="text-right">Discrim.</TableHead>
                          <TableHead className="text-right">Repre.</TableHead>
                          <TableHead className="text-right">Ideal Dist.</TableHead>
                          <TableHead>Rating</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...result.environmentCoords]
                          .sort((a, b) => a.idealEnvDistance - b.idealEnvDistance)
                          .map(env => (
                            <TableRow key={env.environment}>
                              <TableCell className="font-medium">{env.environment}</TableCell>
                              <TableCell className="text-right font-mono">{env.meanYield.toFixed(1)}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary" className={
                                  env.discriminatingPower === 'High' ? 'bg-green-100 text-green-700' :
                                  env.discriminatingPower === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }>
                                  {env.discriminatingPower}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono">{env.representativeness.toFixed(3)}</TableCell>
                              <TableCell className="text-right font-mono">{env.idealEnvDistance.toFixed(1)}</TableCell>
                              <TableCell>
                                {env.idealEnvDistance < 50 ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600 inline" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-400 inline" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Which-Won-Where Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ScatterChart className="w-4 h-4 text-purple-600" />
                  Which-Won-Where Classification
                </CardTitle>
                <CardDescription>
                  Each sector represents a potential mega-environment where specific genotypes perform best
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Sector</TableHead>
                      <TableHead>Winning Genotype</TableHead>
                      <TableHead>Favorable Environments</TableHead>
                      <TableHead className="w-24">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.whichWonWhere.map(www => (
                      <TableRow key={www.sector}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            S{www.sector}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-purple-700">
                          {www.winningGenotype}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {www.environments.map(env => (
                              <Badge key={env} variant="secondary" className="text-xs">
                                {env}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {www.environments.length}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Coordinate Tables for Export */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Genotype Coordinates */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Genotype Coordinates (PC Scores)</CardTitle>
                  <CardDescription>
                    For external plotting tools (R ggbiplot, Python matplotlib, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Genotype</TableHead>
                          <TableHead className="text-right font-mono">PC1</TableHead>
                          <TableHead className="text-right font-mono">PC2</TableHead>
                          <TableHead className="text-right font-mono">PC3</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.genotypeCoords.map(g => (
                          <TableRow key={g.genotype}>
                            <TableCell className="font-medium">{g.genotype}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{g.pc1.toFixed(4)}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{g.pc2.toFixed(4)}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{(g.pc3 ?? 0).toFixed(4)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Environment Coordinates */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Environment Coordinates (PC Scores)</CardTitle>
                  <CardDescription>
                    For external plotting tools (R ggbiplot, Python matplotlib, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Environment</TableHead>
                          <TableHead className="text-right font-mono">PC1</TableHead>
                          <TableHead className="text-right font-mono">PC2</TableHead>
                          <TableHead className="text-right font-mono">PC3</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.environmentCoords.map(e => (
                          <TableRow key={e.environment}>
                            <TableCell className="font-medium">{e.environment}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{e.pc1.toFixed(4)}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{e.pc2.toFixed(4)}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{(e.pc3 ?? 0).toFixed(4)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Methodology Reference */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Reference:</strong> Yan, W. & Kang, M.S. (2003). GGE Biplot Analysis: A Graphical Tool for Breeders, Geneticists, and Agronomists. CRC Press.</p>
                    <p><strong>GGE Concept:</strong> Since genotype main effect (G) and G×E interaction are equally important for cultivar evaluation, they should not be separated. The GGE biplot analyzes G + GE together.</p>
                    <p><strong>Data Centering:</strong> Y<sub>ij</sub> - Ȳ<sub>j</sub> (centering by environment means removes environment main effect while preserving G and GE)</p>
                    <p><strong>Interpretation:</strong> 
                      • <strong>Which-Won-Where:</strong> Polygon view shows best genotype per sector • 
                      <strong>Mean vs Stability:</strong> PC1 ≈ mean performance, PC2 ≈ stability • 
                      <strong>Ideal Genotype:</strong> Highest mean + most stable (farthest right on average environment axis)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
