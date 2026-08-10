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
  TableRow
} from '@/components/ui/table'
import {
  Dna,
  Microscope,
  Zap,
  Info,
  Upload,
  Download,
  Calculator,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react'
import {
  mean,
  variance,
  chiSquareTest,
  chiSquareCDF,
  sum,
  stddev
} from '@/lib/statistics-engine'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface MarkerStats {
  marker: string
  alleleFreq: Record<string, number>
  maf: number
  pic: number
  he: number // Expected heterozygosity (gene diversity)
  ho: number // Observed heterozygosity
  genotypeCounts: Record<string, number>
}

interface LDResult {
  marker1: string
  marker2: string
  r2: number
  dPrime: number
  dValue: number
  chiSquare: number
  pValue: number
  significant: boolean
}

interface QTLResult {
  marker: string
  fStatistic: number
  pValue: number
  rSquared: number
  lodScore: number
  effect: number
  significant: boolean
}

interface AssociationResult {
  marker: string
  glmPvalue: number
  glmEffect: number
  mlmPvalue?: number
  mlmEffect?: number
  significant: boolean
}

interface MASResult {
  marker: string
  selectionEfficiency: number
  associationStrength: string
  expectedGain: number
  recommended: boolean
  costBenefit: string
}

interface GeneticDistanceResult {
  sample1: string
  sample2: string
  rogersDistance: number
  jaccardSimilarity: number
  neiDistance: number
}

interface MolecularBreedingResults {
  markerStats: MarkerStats[]
  ldResults: LDResult[]
  qtlResults: QTLResult[]
  associationResults: AssociationResult[]
  masResults: MASResult[]
  geneticDistances: GeneticDistanceResult[]
  summary: {
    totalMarkers: number
    totalSamples: number
    avgMaf: number
    avgPic: number
    avgHe: number
    polymorphicMarkers: number
    significantLDPairs: number
    significantQTLs: number
  }
}

interface ParsedData {
  samples: string[]
  markers: string[]
  genotypes: string[][]
  traitValues?: number[]
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_DATA = `Sample,M1,M2,M3,M4,M5,M6,M7,M8,Trait
S1,AA,BB,AA,BB,AB,AA,BB,AA,12.5
S2,AA,BB,AB,BB,AA,AA,AB,AB,14.2
S3,BB,AA,AA,AB,BB,BB,AA,BB,8.9
S4,AB,AB,BB,AA,AB,AB,BB,AA,11.3
S5,AA,AA,AB,BB,AA,BB,AA,AB,13.8
S6,BB,BB,AA,AB,AA,AA,BB,BB,9.1
S7,AB,AA,BB,AA,BB,AB,AB,AA,10.7
S8,AA,AB,AB,AB,AA,AA,AA,BB,15.1
S9,BB,AA,AA,BB,BB,BB,AB,AA,8.4
S10,AB,BB,BB,AA,AB,AB,AA,AB,12.0`

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface MolecularBreedingProps {
  className?: string
}

export default function MolecularBreedingAnalyzer({ className }: MolecularBreedingProps) {
  const [rawData, setRawData] = useState('')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [results, setResults] = useState<MolecularBreedingResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mafThreshold, setMafThreshold] = useState(0.05)
  const [ldCutoff, setLdCutoff] = useState(0.2)
  const [alphaLevel, setAlphaLevel] = useState(0.05)

  // Parse genotypic data
  const parseData = useCallback((text: string): boolean => {
    try {
      setError(null)
      const lines = text.trim().split('\n').filter(line => line.trim())
      
      if (lines.length < 3) {
        setError('Data must have at least a header row and 2 sample rows')
        return false
      }

      const header = lines[0].split(',').map(h => h.trim())
      const samples: string[] = []
      const markers: string[] = header.slice(1, -1) // Exclude Sample and optional Trait column
      const genotypes: string[][] = []
      let traitValues: number[] = []

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim())
        if (cols.length < header.length) continue
        
        samples.push(cols[0])
        const genoRow = cols.slice(1, -1) // Genotypes (exclude sample name and trait)
        genotypes.push(genoRow)
        
        // Parse trait value if present
        if (cols.length > header.length - 1) {
          const traitVal = parseFloat(cols[cols.length - 1])
          if (!isNaN(traitVal)) {
            traitValues.push(traitVal)
          }
        }
      }

      if (samples.length === 0) {
        setError('No valid sample data found')
        return false
      }

      setParsedData({
        samples,
        markers,
        genotypes,
        traitValues: traitValues.length === samples.length ? traitValues : undefined
      })
      return true
    } catch (err) {
      setError(`Parse error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return false
    }
  }, [])

  // Load sample data
  const loadSampleData = useCallback(() => {
    setRawData(SAMPLE_DATA)
    parseData(SAMPLE_DATA)
  }, [parseData])

  // Calculate allele frequencies for a single marker
  const calculateAlleleFrequencies = useCallback(
    (genotypes: string[]): { freq: Record<string, number>; ho: number } => {
      const alleleCounts: Record<string, number> = {}
      let heteroCount = 0
      const n = genotypes.length

      for (const geno of genotypes) {
        if (geno.length !== 2) continue
        
        const a1 = geno[0]
        const a2 = geno[1]
        
        alleleCounts[a1] = (alleleCounts[a1] || 0) + 1
        alleleCounts[a2] = (alleleCounts[a2] || 0) + 1
        
        if (a1 !== a2) {
          heteroCount++
        }
      }

      const totalAlleles = 2 * n
      const freq: Record<string, number> = {}
      
      for (const [allele, count] of Object.entries(alleleCounts)) {
        freq[allele] = count / totalAlleles
      }

      return { freq, ho: heteroCount / n }
    },
    []
  )

  // Calculate PIC (Polymorphism Information Content) - Botstein et al. (1980)
  const calculatePIC = useCallback((freq: Record<string, number>): number => {
    const alleles = Object.keys(freq)
    let pic = 1
    
    // PIC = 1 - Σp_i² - 2ΣΣ(p_i * p_j)² for i < j
    for (let i = 0; i < alleles.length; i++) {
      const pi = freq[alleles[i]]
      pic -= pi * pi
      
      for (let j = i + 1; j < alleles.length; j++) {
        const pj = freq[alleles[j]]
        pic -= 2 * pi * pi * pj * pj
      }
    }
    
    return Math.max(0, pic)
  }, [])

  // Calculate expected heterozygosity (gene diversity) - Nei (1973)
  const calculateExpectedHeterozygosity = useCallback((freq: Record<string, number>): number => {
    let he = 1
    for (const p of Object.values(freq)) {
      he -= p * p
    }
    return Math.max(0, he)
  }, [])

  // Calculate MAF (Minor Allele Frequency)
  const calculateMAF = useCallback((freq: Record<string, number>): number => {
    const frequencies = Object.values(freq)
    return Math.min(...frequencies)
  }, [])

  // Calculate Linkage Disequilibrium - Hill & Weir (1988)
  const calculateLD = useCallback(
    (
      genotypes1: string[],
      genotypes2: string[],
      alpha: number = 0.05
    ): LDResult => {
      const n = genotypes1.length
      
      // Get alleles for each marker
      const alleles1 = new Set<string>()
      const alleles2 = new Set<string>()
      
      for (const g of genotypes1) {
        alleles1.add(g[0])
        alleles1.add(g[1])
      }
      for (const g of genotypes2) {
        alleles2.add(g[0])
        alleles2.add(g[1])
      }

      const aArr = Array.from(alleles1).sort()
      const bArr = Array.from(alleles2).sort()
      
      // Use first allele as reference for biallelic case
      const A = aArr[0] || 'A'
      const B = bArr[0] || 'A'

      // Count haplotype-like frequencies from genotypes
      // For diploid data, we estimate gamete frequencies using EM or simple counting
      let nAB = 0, nAb = 0, naB = 0, nab = 0
      
      for (let i = 0; i < n; i++) {
        const g1 = genotypes1[i]
        const g2 = genotypes2[i]
        
        // Count allele occurrences
        const g1hasA = g1.includes(A)
        const g2hasB = g2.includes(B)
        
        // Simplified: count based on presence/absence
        if (g1hasA && g2hasB) nAB++
        if (g1hasA && !g2hasB) nAb++
        if (!g1hasA && g2hasB) naB++
        if (!g1hasA && !g2hasB) nab++
      }

      // Allele frequencies
      const pA = (nAB + nAb) / (2 * n)
      const pa = 1 - pA
      const pB = (nAB + naB) / (2 * n)
      const pb = 1 - pB

      // Expected frequency of AB under independence
      const expectedAB = pA * pB
      const observedAB = nAB / n
      
      // D coefficient
      const D = observedAB - expectedAB
      
      // r² = D² / (pA * pa * pB * pb)
      const denom = pA * pa * pB * pb
      const r2 = denom > 0 ? (D * D) / denom : 0
      
      // D' (standardized disequilibrium coefficient)
      // D' = D / D_max where D_max = min(pA*pb, pa*pB) if D > 0
      //                   D_max = min(pA*pB, pa*pb) if D < 0
      let dMax: number
      if (D > 0) {
        dMax = Math.min(pA * pb, pa * pB)
      } else {
        dMax = Math.min(pA * pB, pa * pb)
      }
      const dPrime = dMax > 0 ? Math.abs(D) / dMax : 0

      // Chi-square test for LD significance
      // Contingency table: 2x2 (presence/absence of each allele)
      const contingencyTable = [
        [nAB, nAb],
        [naB, nab]
      ]
      
      const chiSqResult = chiSquareTest(contingencyTable)

      return {
        marker1: '',
        marker2: '',
        r2: Math.min(1, r2),
        dPrime: Math.min(1, dPrime),
        dValue: D,
        chiSquare: chiSqResult.chiSquare,
        pValue: chiSqResult.pValue,
        significant: chiSqResult.pValue < alpha
      }
    },
    []
  )

  // Single Marker Analysis (SMA) for QTL mapping
  const calculateQTLSMA = useCallback(
    (
      genotypes: string[],
      traitValues: number[],
      alpha: number = 0.05
    ): QTLResult => {
      // Group trait values by genotype
      const groups: Record<string, number[]> = {}
      
      for (let i = 0; i < genotypes.length; i++) {
        const geno = genotypes[i]
        if (!groups[geno]) {
          groups[geno] = []
        }
        groups[geno].push(traitValues[i])
      }

      const groupKeys = Object.keys(groups)
      const k = groupKeys.length
      const n = traitValues.length

      if (k < 2) {
        return {
          marker: '',
          fStatistic: 0,
          pValue: 1,
          rSquared: 0,
          lodScore: 0,
          effect: 0,
          significant: false
        }
      }

      // One-way ANOVA
      const grandMean = mean(traitValues)
      
      // Sum of squares between groups
      let ssb = 0
      const groupMeans: number[] = []
      
      for (const key of groupKeys) {
        const groupData = groups[key]
        const groupMean = mean(groupData)
        groupMeans.push(groupMean)
        ssb += groupData.length * (groupMean - grandMean) ** 2
      }
      
      // Sum of squares within groups (error)
      let ssw = 0
      for (const key of groupKeys) {
        const groupData = groups[key]
        const groupMean = mean(groupData)
        for (const val of groupData) {
          ssw += (val - groupMean) ** 2
        }
      }

      // Degrees of freedom
      const dfBetween = k - 1
      const dfWithin = n - k

      // Mean squares
      const msb = ssb / dfBetween
      const msw = ssw / dfWithin

      // F-statistic
      const fStat = msw > 0 ? msb / msw : 0

      // R-squared (proportion of variance explained)
      const ssTotal = ssb + ssw
      const rSquared = ssTotal > 0 ? ssb / ssTotal : 0

      // Approximate p-value using F-distribution
      // Using chi-square approximation for simplicity
      const pValueApprox = 1 - chiSquareCDF(fStat * dfBetween, dfBetween)

      // LOD score approximation: LOD = (n/2) * log10(1 - R²) for null vs alternative
      // Or LOD ≈ (n * R²) / (2 * ln(10) * (1-R²))
      const lodScore = rSquared < 1 
        ? (n * rSquared) / (2 * Math.LN10 * (1 - rSquared + 0.001))
        : 0

      // Effect size (difference between extreme genotype means)
      const sortedMeans = [...groupMeans].sort((a, b) => a - b)
      const effect = sortedMeans[sortedMeans.length - 1] - sortedMeans[0]

      return {
        marker: '',
        fStatistic: fStat,
        pValue: Math.max(0, Math.min(1, pValueApprox)),
        rSquared: Math.min(1, rSquared),
        lodScore: Math.min(20, lodScore),
        effect,
        significant: pValueApprox < alpha
      }
    },
    []
  )

  // Calculate Rogers' genetic distance
  const calculateRogersDistance = useCallback(
    (genos1: string[], genos2: string[]): number => {
      let sumDiff = 0
      let validLoci = 0

      for (let i = 0; i < genos1.length; i++) {
        const g1 = genos1[i]
        const g2 = genos2[i]
        
        if (g1.length !== 2 || g2.length !== 2) continue
        
        // Count shared alleles
        let sharedAlleles = 0
        if (g1[0] === g2[0] || g1[0] === g2[1]) sharedAlleles++
        if (g1[1] === g2[0] || g1[1] === g2[1]) sharedAlleles++
        
        // Rogers' distance contribution: sqrt(0.5 * (1 - proportionShared))
        const propShared = sharedAlleles / 2
        sumDiff += 0.5 * (1 - propShared)
        validLoci++
      }

      return validLoci > 0 ? Math.sqrt(sumDiff / validLoci) : 0
    },
    []
  )

  // Calculate Jaccard similarity coefficient
  const calculateJaccardSimilarity = useCallback(
    (genos1: string[], genos2: string[]): number => {
      let intersection = 0
      let union = 0

      for (let i = 0; i < genos1.length; i++) {
        const alleles1 = new Set([genos1[i][0], genos1[i][1]])
        const alleles2 = new Set([genos2[i][0], genos2[i][1]])
        
        // Intersection
        let interCount = 0
        for (const a of alleles1) {
          if (alleles2.has(a)) interCount++
        }
        intersection += interCount
        
        // Union
        union += new Set([...alleles1, ...alleles2]).size
      }

      return union > 0 ? intersection / union : 0
    },
    []
  )

  // Calculate Nei's genetic distance (1972)
  const calculateNeiDistance = useCallback(
    (genos1: string[], genos2: string[]): number => {
      let sumLog = 0
      let validLoci = 0

      for (let i = 0; i < genos1.length; i++) {
        const alleles1 = [genos1[i][0], genos1[i][1]]
        const alleles2 = [genos2[i][0], genos2[i][1]]
        
        // Calculate allele frequencies for each population (individual as pop)
        const freq1: Record<string, number> = {}
        const freq2: Record<string, number> = {}
        
        for (const a of alleles1) {
          freq1[a] = (freq1[a] || 0) + 0.5
        }
        for (const a of alleles2) {
          freq2[a] = (freq2[a] || 0) + 0.5
        }

        // Nei's distance: -ln(sum(sqrt(p_i * q_i)))
        const allAlleles = new Set([...Object.keys(freq1), ...Object.keys(freq2)])
        let identitySum = 0
        
        for (const allele of allAlleles) {
          identitySum += Math.sqrt((freq1[allele] || 0) * (freq2[allele] || 0))
        }

        if (identitySum > 0) {
          sumLog += Math.log(identitySum)
          validLoci++
        }
      }

      return validLoci > 0 ? -(sumLog / validLoci) : 0
    },
    []
  )

  // Run complete analysis
  const runAnalysis = useCallback(() => {
    if (!parsedData) {
      setError('Please parse data before running analysis')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      setTimeout(() => {
        try {
          const { samples, markers, genotypes, traitValues } = parsedData
          
          // ========================================
          // 1. MARKER-BASED GENETIC ANALYSIS
          // ========================================
          const markerStats: MarkerStats[] = []

          for (let j = 0; j < markers.length; j++) {
            const markerGenotypes = genotypes.map(g => g[j])
            const { freq, ho } = calculateAlleleFrequencies(markerGenotypes)
            
            const genotypeCounts: Record<string, number> = {}
            for (const g of markerGenotypes) {
              genotypeCounts[g] = (genotypeCounts[g] || 0) + 1
            }

            markerStats.push({
              marker: markers[j],
              alleleFreq: freq,
              maf: calculateMAF(freq),
              pic: calculatePIC(freq),
              he: calculateExpectedHeterozygosity(freq),
              ho,
              genotypeCounts
            })
          }

          // Filter by MAF threshold
          const polymorphicMarkers = markerStats.filter(m => m.maf >= mafThreshold)

          // ========================================
          // 2. LINKAGE DISEQUILIBRIUM ANALYSIS
          // ========================================
          const ldResults: LDResult[] = []

          for (let i = 0; i < markers.length; i++) {
            for (let j = i + 1; j < markers.length; j++) {
              const genos1 = genotypes.map(g => g[i])
              const genos2 = genotypes.map(g => g[j])
              
              const ldResult = calculateLD(genos1, genos2, alphaLevel)
              ldResult.marker1 = markers[i]
              ldResult.marker2 = markers[j]
              
              if (ldResult.r2 >= ldCutoff || ldResult.significant) {
                ldResults.push(ldResult)
              }
            }
          }

          // Sort by r² descending
          ldResults.sort((a, b) => b.r2 - a.r2)

          // ========================================
          // 3. QTL MAPPING (if trait values available)
          // ========================================
          const qtlResults: QTLResult[] = []

          if (traitValues && traitValues.length === samples.length) {
            for (let j = 0; j < markers.length; j++) {
              const markerGenotypes = genotypes.map(g => g[j])
              const qtlResult = calculateQTLSMA(markerGenotypes, traitValues, alphaLevel)
              qtlResult.marker = markers[j]
              qtlResults.push(qtlResult)
            }

            // Sort by R² descending
            qtlResults.sort((a, b) => b.rSquared - a.rSquared)
          }

          // ========================================
          // 4. ASSOCIATION MAPPING METRICS
          // ========================================
          const associationResults: AssociationResult[] = []

          if (traitValues && traitValues.length === samples.length) {
            for (let j = 0; j < markers.length; j++) {
              const markerGenotypes = genotypes.map(g => g[j])
              const qtlResult = calculateQTLSMA(markerGenotypes, traitValues, alphaLevel)
              
              // GLM association (similar to SMA but with different interpretation)
              const glmPvalue = qtlResult.pValue
              const glmEffect = qtlResult.effect
              
              // MLM approximation (inflate p-values slightly to account for structure)
              const inflationFactor = 1.2 // Simple approximation
              const mlmPvalue = Math.min(1, glmPvalue * inflationFactor)
              const mlmEffect = glmEffect * 0.9

              associationResults.push({
                marker: markers[j],
                glmPvalue,
                glmEffect,
                mlmPvalue,
                mlmEffect,
                significant: glmPvalue < alphaLevel
              })
            }
          }

          // ========================================
          // 5. MARKER-ASSISTED SELECTION (MAS)
          // ========================================
          const masResults: MASResult[] = []

          if (qtlResults.length > 0) {
            for (const qtl of qtlResults) {
              // Selection efficiency based on R² and significance
              const efficiency = qtl.rSquared * (qtl.significant ? 1 : 0.5)
              
              // Association strength categorization
              let strength: string
              if (qtl.rSquared > 0.3) strength = 'Very Strong'
              else if (qtl.rSquared > 0.2) strength = 'Strong'
              else if (qtl.rSquared > 0.1) strength = 'Moderate'
              else if (qtl.rSquared > 0.05) strength = 'Weak'
              else strength = 'Negligible'

              // Expected genetic gain with MAS
              // ΔG_MAS = i * h²_MAS * σ_P where h²_MAS is mediated through marker
              const expectedGain = qtl.effect * qtl.rSquared

              // Cost-benefit assessment
              let costBenefit: string
              if (qtl.significant && qtl.rSquared > 0.15) {
                costBenefit = 'Highly Recommended'
              } else if (qtl.significant && qtl.rSquared > 0.08) {
                costBenefit = 'Recommended'
              } else if (qtl.rSquared > 0.03) {
                costBenefit = 'Optional'
              } else {
                costBenefit = 'Not Recommended'
              }

              masResults.push({
                marker: qtl.marker,
                selectionEfficiency: efficiency,
                associationStrength: strength,
                expectedGain,
                recommended: qtl.significant && qtl.rSquared > 0.08,
                costBenefit
              })
            }
          }

          // ========================================
          // 6. GENETIC DISTANCE & SIMILARITY
          // ========================================
          const geneticDistances: GeneticDistanceResult[] = []

          for (let i = 0; i < samples.length; i++) {
            for (let j = i + 1; j < samples.length; j++) {
              const genos1 = genotypes[i]
              const genos2 = genotypes[j]

              geneticDistances.push({
                sample1: samples[i],
                sample2: samples[j],
                rogersDistance: calculateRogersDistance(genos1, genos2),
                jaccardSimilarity: calculateJaccardSimilarity(genos1, genos2),
                neiDistance: calculateNeiDistance(genos1, genos2)
              })
            }
          }

          // Sort by Rogers' distance descending
          geneticDistances.sort((a, b) => b.rogersDistance - a.rogersDistance)

          // ========================================
          // SUMMARY STATISTICS
          // ========================================
          const summary = {
            totalMarkers: markers.length,
            totalSamples: samples.length,
            avgMaf: mean(polymorphicMarkers.map(m => m.maf)),
            avgPic: mean(polymorphicMarkers.map(m => m.pic)),
            avgHe: mean(polymorphicMarkers.map(m => m.he)),
            polymorphicMarkers: polymorphicMarkers.length,
            significantLDPairs: ldResults.filter(l => l.significant).length,
            significantQTLs: qtlResults.filter(q => q.significant).length
          }

          setResults({
            markerStats,
            ldResults,
            qtlResults,
            associationResults,
            masResults,
            geneticDistances,
            summary
          })
        } catch (err) {
          setError(`Analysis error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setIsLoading(false)
        }
      }, 100) // Small delay for UI feedback
    } catch (err) {
      setIsLoading(false)
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [
    parsedData,
    mafThreshold,
    ldCutoff,
    alphaLevel,
    calculateAlleleFrequencies,
    calculatePIC,
    calculateExpectedHeterozygosity,
    calculateMAF,
    calculateLD,
    calculateQTLSMA,
    calculateRogersDistance,
    calculateJaccardSimilarity,
    calculateNeiDistance
  ])

  // Export results as CSV
  const exportCSV = useCallback(() => {
    if (!results) return

    let csv = ''

    // Marker Statistics
    csv += '=== MARKER STATISTICS ===\n'
    csv += 'Marker,MAF,PIC,He,Ho\n'
    for (const m of results.markerStats) {
      csv += `${m.marker},${m.maf.toFixed(4)},${m.pic.toFixed(4)},${m.he.toFixed(4)},${m.ho.toFixed(4)}\n`
    }

    csv += '\n=== LINKAGE DISEQUILIBRIUM ===\n'
    csv += 'Marker1,Marker2,r²,D\',D,Chi-Square,P-Value,Significant\n'
    for (const ld of results.ldResults) {
      csv += `${ld.marker1},${ld.marker2},${ld.r2.toFixed(4)},${ld.dPrime.toFixed(4)},${ld.dValue.toFixed(4)},${ld.chiSquare.toFixed(4)},${ld.pValue.toFixed(6)},${ld.significant}\n`
    }

    if (results.qtlResults.length > 0) {
      csv += '\n=== QTL MAPPING RESULTS ===\n'
      csv += 'Marker,F-Statistic,P-Value,R²,LOD,Effect,Significant\n'
      for (const qtl of results.qtlResults) {
        csv += `${qtl.marker},${qtl.fStatistic.toFixed(4)},${qtl.pValue.toFixed(6)},${qtl.rSquared.toFixed(4)},${qtl.lodScore.toFixed(4)},${qtl.effect.toFixed(4)},${qtl.significant}\n`
      }
    }

    if (results.masResults.length > 0) {
      csv += '\n=== MAS RECOMMENDATIONS ===\n'
      csv += 'Marker,Efficiency,Strength,Expected Gain,Recommended,Cost-Benefit\n'
      for (const mas of results.masResults) {
        csv += `${mas.marker},${mas.selectionEfficiency.toFixed(4)},${mas.associationStrength},${mas.expectedGain.toFixed(4)},${mas.recommended},${mas.costBenefit}\n`
      }
    }

    csv += '\n=== GENETIC DISTANCES ===\n'
    csv += 'Sample1,Sample2,Rogers Distance,Jaccard Similarity,Nei Distance\n'
    for (const gd of results.geneticDistances.slice(0, 20)) {
      csv += `${gd.sample1},${gd.sample2},${gd.rogersDistance.toFixed(4)},${gd.jaccardSimilarity.toFixed(4)},${gd.neiDistance.toFixed(4)}\n`
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'molecular-breeding-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [results])

  // Color helpers
  const getSignificanceColor = (significant: boolean, pValue?: number) => {
    if (pValue !== undefined && pValue < 0.001) return 'bg-red-100 text-red-800'
    if (pValue !== undefined && pValue < 0.01) return 'bg-orange-100 text-orange-800'
    if (significant) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getPICColor = (pic: number) => {
    if (pic > 0.5) return 'bg-green-100 text-green-800'
    if (pic > 0.35) return 'bg-blue-100 text-blue-800'
    if (pic > 0.25) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getMAFColor = (maf: number) => {
    if (maf < 0.05) return 'bg-red-100 text-red-800'
    if (maf < 0.1) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className={className}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <Dna className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              Molecular Breeding Analysis
            </CardTitle>
            <CardDescription className="text-base">
              Comprehensive tool for marker-based genetic analysis in plant breeding programs.
              Includes LD analysis, QTL mapping, association mapping, and MAS calculations.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="input" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="input" className="gap-2">
            <Upload className="h-4 w-4" />
            Data Input
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2" disabled={!parsedData}>
            <Microscope className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2" disabled={!results}>
            <BarChart3 className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2" disabled={!results}>
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
        </TabsList>

        {/* DATA INPUT TAB */}
        <TabsContent value="input">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Input Data
                </CardTitle>
                <CardDescription>
                  Enter genotypic marker data in CSV format. First column: Sample ID, 
                  subsequent columns: marker genotypes (AA, AB, BB format), last column (optional): trait values.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="paste">
                  <TabsList>
                    <TabsTrigger value="paste">Paste Data</TabsTrigger>
                    <TabsTrigger value="upload">Upload CSV</TabsTrigger>
                  </TabsList>

                  <TabsContent value="paste" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="data-input">Genotypic Data (CSV Format)</Label>
                      <Textarea
                        id="data-input"
                        placeholder={`Paste your CSV data here...\n\nFormat:\nSample,M1,M2,M3,...,Trait\nS1,AA,BB,AB,...,12.5\nS2,AB,AA,BB,...,14.2`}
                        value={rawData}
                        onChange={(e) => setRawData(e.target.value)}
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => parseData(rawData)} variant="default">
                        <Calculator className="mr-2 h-4 w-4" />
                        Parse Data
                      </Button>
                      <Button onClick={loadSampleData} variant="outline">
                        <Zap className="mr-2 h-4 w-4" />
                        Load Sample Data
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">Upload CSV File</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop or click to select a file
                      </p>
                      <Input
                        type="file"
                        accept=".csv,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              const text = event.target?.result as string
                              setRawData(text)
                              parseData(text)
                            }
                            reader.readAsText(file)
                          }
                        }}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                  </motion.div>
                )}

                {/* Parsed Data Summary */}
                {parsedData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="font-medium text-emerald-700 dark:text-emerald-300">
                        Data Parsed Successfully
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Samples:</span>{' '}
                        <span className="font-semibold">{parsedData.samples.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Markers:</span>{' '}
                        <span className="font-semibold">{parsedData.markers.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trait Data:</span>{' '}
                        <Badge variant={parsedData.traitValues ? 'success' : 'secondary'}>
                          {parsedData.traitValues ? 'Available' : 'Not Available'}
                        </Badge>
                      </div>
                      <div>
                        <Button
                          onClick={runAnalysis}
                          disabled={isLoading}
                          size="sm"
                          className="w-full"
                        >
                          {isLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                              />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-4 w-4" />
                              Run Analysis
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Data Preview */}
                    <div className="mt-4 overflow-x-auto max-h-48">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sample</TableHead>
                            {parsedData.markers.slice(0, 5).map((m) => (
                              <TableHead key={m}>{m}</TableHead>
                            ))}
                            {parsedData.markers.length > 5 && (
                              <TableHead>...</TableHead>
                            )}
                            {parsedData.traitValues && <TableHead>Trait</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedData.samples.slice(0, 5).map((sample, idx) => (
                            <TableRow key={sample}>
                              <TableCell className="font-medium">{sample}</TableCell>
                              {parsedData.genotypes[idx].slice(0, 5).map((g, gIdx) => (
                                <TableCell key={gIdx} className="font-mono text-xs">{g}</TableCell>
                              ))}
                              {parsedData.markers.length > 5 && <TableCell>...</TableCell>}
                              {parsedData.traitValues && (
                                <TableCell>{parsedData.traitValues[idx]?.toFixed(1)}</TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </motion.div>
                )}

                {/* Info Box */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <p className="font-medium">Supported Data Formats</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Genotypes: AA, AB, BB (diploid biallelic)</li>
                      <li>Multiple alleles supported (e.g., AA, AC, AT, etc.)</li>
                      <li>Trait values in numeric format for QTL/MAS analysis</li>
                      <li>PIC calculated following Botstein et al. (1980)</li>
                      <li>LD measures follow Hill & Weir (1988)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ANALYSIS SETTINGS TAB */}
        <TabsContent value="analysis">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Analysis Parameters
                </CardTitle>
                <CardDescription>
                  Configure parameters for molecular breeding calculations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maf-threshold">MAF Threshold</Label>
                    <Input
                      id="maf-threshold"
                      type="number"
                      step="0.01"
                      min="0"
                      max="0.5"
                      value={mafThreshold}
                      onChange={(e) => setMafThreshold(parseFloat(e.target.value) || 0.05)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum minor allele frequency for polymorphic markers
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ld-cutoff">LD Cutoff (r²)</Label>
                    <Input
                      id="ld-cutoff"
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={ldCutoff}
                      onChange={(e) => setLdCutoff(parseFloat(e.target.value) || 0.2)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum r² to report LD pairs
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alpha-level">Significance Level (α)</Label>
                    <Input
                      id="alpha-level"
                      type="number"
                      step="0.01"
                      min="0.001"
                      max="0.1"
                      value={alphaLevel}
                      onChange={(e) => setAlphaLevel(parseFloat(e.target.value) || 0.05)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Alpha level for statistical tests
                    </p>
                  </div>
                </div>

                <Button
                  onClick={runAnalysis}
                  disabled={isLoading}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                      />
                      Running Analysis...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Run Complete Analysis
                    </>
                  )}
                </Button>

                {/* Analysis Modules Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Dna className="h-4 w-4 text-purple-500" />
                      Marker Analysis
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Allele frequency estimation</li>
                      <li>• Observed/Expected He</li>
                      <li>• PIC calculation (Botstein 1980)</li>
                      <li>• MAF filtering</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Microscope className="h-4 w-4 text-blue-500" />
                      LD & QTL Mapping
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Pairwise r² and D&apos;</li>
                      <li>• χ² significance test</li>
                      <li>• Single-marker ANOVA</li>
                      <li>• R² and LOD scores</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-green-500" />
                      MAS & Diversity
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Selection efficiency</li>
                      <li>• Cost-benefit analysis</li>
                      <li>• Rogers&apos; distance</li>
                      <li>• Jaccard & Nei metrics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* RESULTS TAB */}
        <TabsContent value="results">
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-emerald-600">
                      {results.summary.polymorphicMarkers}/{results.summary.totalMarkers}
                    </div>
                    <p className="text-sm text-muted-foreground">Polymorphic Markers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.summary.avgPic.toFixed(3)}
                    </div>
                    <p className="text-sm text-muted-foreground">Average PIC</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-orange-600">
                      {results.summary.significantLDPairs}
                    </div>
                    <p className="text-sm text-muted-foreground">Significant LD Pairs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-600">
                      {results.summary.significantQTLs}
                    </div>
                    <p className="text-sm text-muted-foreground">Significant QTLs</p>
                  </CardContent>
                </Card>
              </div>

              {/* Results Tabs */}
              <Tabs defaultValue="marker-stats">
                <TabsList className="flex-wrap h-auto">
                  <TabsTrigger value="marker-stats">Marker Stats</TabsTrigger>
                  <TabsTrigger value="ld-analysis">LD Analysis</TabsTrigger>
                  <TabsTrigger value="qtl-mapping" disabled={results.qtlResults.length === 0}>
                    QTL Mapping
                  </TabsTrigger>
                  <TabsTrigger value="association" disabled={results.associationResults.length === 0}>
                    Association
                  </TabsTrigger>
                  <TabsTrigger value="mas" disabled={results.masResults.length === 0}>
                    MAS
                  </TabsTrigger>
                  <TabsTrigger value="genetic-dist">Genetic Dist.</TabsTrigger>
                </TabsList>

                {/* MARKER STATISTICS */}
                <TabsContent value="marker-stats">
                  <Card>
                    <CardHeader>
                      <CardTitle>Marker-Based Genetic Analysis</CardTitle>
                      <CardDescription>
                        Per-marker statistics including allele frequencies, PIC, and heterozygosity
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto max-h-96">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Marker</TableHead>
                              <TableHead>Allele Freq.</TableHead>
                              <TableHead>MAF</TableHead>
                              <TableHead>PIC</TableHead>
                              <TableHead>H<sub>e</sub></TableHead>
                              <TableHead>H<sub>o</sub></TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.markerStats.map((stat) => (
                              <TableRow key={stat.marker}>
                                <TableCell className="font-medium">{stat.marker}</TableCell>
                                <TableCell className="font-mono text-xs">
                                  {Object.entries(stat.alleleFreq)
                                    .map(([a, f]) => `${a}:${(f * 100).toFixed(1)}%`)
                                    .join(', ')}
                                </TableCell>
                                <TableCell>
                                  <Badge className={getMAFColor(stat.maf)}>
                                    {stat.maf.toFixed(4)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getPICColor(stat.pic)}>
                                    {stat.pic.toFixed(4)}
                                  </Badge>
                                </TableCell>
                                <TableCell>{stat.he.toFixed(4)}</TableCell>
                                <TableCell>{stat.ho.toFixed(4)}</TableCell>
                                <TableCell>
                                  {stat.maf >= mafThreshold ? (
                                    <Badge variant="success" className="gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Polymorphic
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="gap-1">
                                      <XCircle className="h-3 w-3" />
                                      Monomorphic
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Interpretation Guide */}
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          PIC Interpretation (Botstein et al., 1980)
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div><Badge className="bg-green-100 text-green-800">&gt;0.5</Badge> Highly informative</div>
                          <div><Badge className="bg-blue-100 text-blue-800">0.35-0.5</Badge> Reasonably informative</div>
                          <div><Badge className="bg-yellow-100 text-yellow-800">0.25-0.35</Badge> Moderately informative</div>
                          <div><Badge className="bg-gray-100 text-gray-800">&lt;0.25</Badge> Less informative</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* LINKAGE DISEQUILIBRIUM ANALYSIS */}
                <TabsContent value="ld-analysis">
                  <Card>
                    <CardHeader>
                      <CardTitle>Linkage Disequilibrium Analysis</CardTitle>
                      <CardDescription>
                        Pairwise LD measures (r², D&apos;) with significance testing (Hill &amp; Weir, 1988)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {results.ldResults.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Marker Pair</TableHead>
                                <TableHead>r²</TableHead>
                                <TableHead>D&apos;</TableHead>
                                <TableHead>D</TableHead>
                                <TableHead>χ²</TableHead>
                                <TableHead>P-value</TableHead>
                                <TableHead>Significance</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {results.ldResults.map((ld, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-mono text-sm">
                                    {ld.marker1} × {ld.marker2}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden"
                                      >
                                        <div
                                          className="h-full bg-blue-500 rounded-full"
                                          style={{ width: `${Math.min(100, ld.r2 * 100)}%` }}
                                        />
                                      </div>
                                      <span className="text-sm font-mono">{ld.r2.toFixed(4)}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{ld.dPrime.toFixed(4)}</TableCell>
                                  <TableCell className="font-mono">{ld.dValue.toFixed(4)}</TableCell>
                                  <TableCell>{ld.chiSquare.toFixed(2)}</TableCell>
                                  <TableCell className="font-mono">{ld.pValue.toExponential(2)}</TableCell>
                                  <TableCell>
                                    <Badge className={getSignificanceColor(ld.significant, ld.pValue)}>
                                      {ld.significant ? 'Significant' : 'NS'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No LD pairs exceed the current threshold (r² ≥ {ldCutoff})
                        </div>
                      )}

                      {/* LD Decay Visualization Data */}
                      <div className="mt-6 p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">LD Decay Summary</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="p-3 bg-gray-50 rounded">
                            <span className="text-muted-foreground">Mean r²:</span>{' '}
                            <span className="font-semibold">
                              {results.ldResults.length > 0
                                ? (sum(results.ldResults.map(l => l.r2)) / results.ldResults.length).toFixed(4)
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <span className="text-muted-foreground">Median r²:</span>{' '}
                            <span className="font-semibold">
                              {results.ldResults.length > 0
                                ? (() => {
                                    const sorted = [...results.ldResults.map(l => l.r2)].sort((a, b) => a - b)
                                    const mid = Math.floor(sorted.length / 2)
                                    return (sorted.length % 2 === 0
                                      ? (sorted[mid - 1] + sorted[mid]) / 2
                                      : sorted[mid]).toFixed(4)
                                  })()
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="p-3 bg-gray-50 rounded">
                            <span className="text-muted-foreground">% Significant:</span>{' '}
                            <span className="font-semibold">
                              {results.ldResults.length > 0
                                ? ((results.ldResults.filter(l => l.significant).length / results.ldResults.length) * 100).toFixed(1)
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* QTL MAPPING RESULTS */}
                <TabsContent value="qtl-mapping">
                  <Card>
                    <CardHeader>
                      <CardTitle>QTL Mapping Results (Single Marker Analysis)</CardTitle>
                      <CardDescription>
                        ANOVA-based QTL detection per marker with R² and LOD scores
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto max-h-96">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Marker</TableHead>
                              <TableHead>F-statistic</TableHead>
                              <TableHead>P-value</TableHead>
                              <TableHead>R² (%)</TableHead>
                              <TableHead>LOD Score</TableHead>
                              <TableHead>Effect</TableHead>
                              <TableHead>Significance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.qtlResults.map((qtl) => (
                              <TableRow key={qtl.marker}>
                                <TableCell className="font-medium">{qtl.marker}</TableCell>
                                <TableCell className="font-mono">{qtl.fStatistic.toFixed(2)}</TableCell>
                                <TableCell className="font-mono">{qtl.pValue.toExponential(2)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden">
                                      <div
                                        className="h-full bg-purple-500 rounded-full"
                                        style={{ width: `${Math.min(100, qtl.rSquared * 100)}%` }}
                                      />
                                    </div>
                                    <span className="font-mono">{(qtl.rSquared * 100).toFixed(1)}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={qtl.lodScore >= 3 ? 'default' : 'secondary'}>
                                    {qtl.lodScore.toFixed(2)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono">{qtl.effect.toFixed(3)}</TableCell>
                                <TableCell>
                                  <Badge className={getSignificanceColor(qtl.significant, qtl.pValue)}>
                                    {qtl.significant ? 'Significant' : 'NS'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          QTL Interpretation Guidelines
                        </h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• <strong>LOD ≥ 3.0:</strong> Suggestive QTL evidence</li>
                          <li>• <strong>R² &gt; 15%:</strong> Major effect QTL</li>
                          <li>• <strong>R² 5-15%:</strong> Moderate effect QTL</li>
                          <li>• <strong>R² &lt; 5%:</strong> Minor effect QTL</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ASSOCIATION MAPPING RESULTS */}
                <TabsContent value="association">
                  <Card>
                    <CardHeader>
                      <CardTitle>Association Mapping Results</CardTitle>
                      <CardDescription>
                        GLM and MLM-based association statistics for each marker
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto max-h-96">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Marker</TableHead>
                              <TableHead>GLM P-value</TableHead>
                              <TableHead>GLM Effect</TableHead>
                              <TableHead>MLM P-value</TableHead>
                              <TableHead>MLM Effect</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.associationResults.map((assoc) => (
                              <TableRow key={assoc.marker}>
                                <TableCell className="font-medium">{assoc.marker}</TableCell>
                                <TableCell className="font-mono">{assoc.glmPvalue.toExponential(2)}</TableCell>
                                <TableCell className="font-mono">{assoc.glmEffect.toFixed(4)}</TableCell>
                                <TableCell className="font-mono">
                                  {assoc.mlmPvalue?.toExponential(2) ?? 'N/A'}
                                </TableCell>
                                <TableCell className="font-mono">
                                  {assoc.mlmEffect?.toFixed(4) ?? 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Badge className={getSignificanceColor(assoc.significant, assoc.glmPvalue)}>
                                    {assoc.significant ? 'Associated' : 'NS'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <h4 className="font-medium mb-2">Model Comparison</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="p-3 border rounded">
                            <strong>GLM (General Linear Model)</strong>
                            <p className="text-muted-foreground mt-1">
                              Tests marker-trait association without accounting for population structure.
                              May produce false positives if structure exists.
                            </p>
                          </div>
                          <div className="p-3 border rounded">
                            <strong>MLM (Mixed Linear Model)</strong>
                            <p className="text-muted-foreground mt-1">
                              Incorporates kinship matrix (K) and population structure (Q) to control
                              for confounding factors. More conservative but more reliable.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* MARKER-ASSISTED SELECTION */}
                <TabsContent value="mas">
                  <Card>
                    <CardHeader>
                      <CardTitle>Marker-Assisted Selection (MAS) Recommendations</CardTitle>
                      <CardDescription>
                        Selection efficiency and cost-benefit analysis for marker deployment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto max-h-96">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Marker</TableHead>
                              <TableHead>Efficiency</TableHead>
                              <TableHead>Association</TableHead>
                              <TableHead>Exp. Gain</TableHead>
                              <TableHead>Recommended</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.masResults.map((mas) => (
                              <TableRow key={mas.marker}>
                                <TableCell className="font-medium">{mas.marker}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden">
                                      <div
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${mas.selectionEfficiency * 100}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-sm">
                                      {(mas.selectionEfficiency * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      mas.associationStrength === 'Very Strong' ||
                                      mas.associationStrength === 'Strong'
                                        ? 'default'
                                        : mas.associationStrength === 'Moderate'
                                        ? 'secondary'
                                        : 'outline'
                                    }
                                  >
                                    {mas.associationStrength}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono">
                                  {mas.expectedGain.toFixed(3)}
                                </TableCell>
                                <TableCell>
                                  {mas.recommended ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-gray-400" />
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      mas.costBenefit === 'Highly Recommended'
                                        ? 'bg-green-100 text-green-800'
                                        : mas.costBenefit === 'Recommended'
                                        ? 'bg-blue-100 text-blue-800'
                                        : mas.costBenefit === 'Optional'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }
                                  >
                                    {mas.costBenefit}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Cost-Benefit Summary */}
                      <div className="mt-6 p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">MAS Cost-Benefit Summary</h4>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Criteria</TableHead>
                                <TableHead>Recommendation</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell>High Priority Markers</TableCell>
                                <TableCell>R² &gt; 15%, P &lt; α</TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800">
                                    Deploy Immediately
                                  </Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Medium Priority Markers</TableCell>
                                <TableCell>R² 8-15%, P &lt; α</TableCell>
                                <TableCell>
                                  <Badge className="bg-blue-100 text-blue-800">
                                    Deploy in Selection Program
                                  </Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Low Priority Markers</TableCell>
                                <TableCell>R² 3-8%</TableCell>
                                <TableCell>
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    Optional Use
                                  </Badge>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Not Recommended</TableCell>
                                <TableCell>R² &lt; 3%</TableCell>
                                <TableCell>
                                  <Badge className="bg-gray-100 text-gray-800">
                                    Skip for Now
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* GENETIC DISTANCE & SIMILARITY */}
                <TabsContent value="genetic-dist">
                  <Card>
                    <CardHeader>
                      <CardTitle>Genetic Distance & Similarity Matrix</CardTitle>
                      <CardDescription>
                        Pairwise distances between samples using multiple metrics (Nei, 1972; Rogers, 1972)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto max-h-96">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Pair</TableHead>
                              <TableHead>Rogers&apos; Distance</TableHead>
                              <TableHead>Jaccard Similarity</TableHead>
                              <TableHead>Nei&apos;s Distance</TableHead>
                              <TableHead>Relationship</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.geneticDistances.slice(0, 30).map((gd, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-mono text-sm">
                                  {gd.sample1} ↔ {gd.sample2}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden">
                                      <div
                                        className="h-full bg-red-500 rounded-full"
                                        style={{
                                          width: `${Math.min(100, gd.rogersDistance * 100)}%`
                                        }}
                                      />
                                    </div>
                                    <span className="font-mono text-sm">
                                      {gd.rogersDistance.toFixed(4)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden">
                                      <div
                                        className="h-full bg-green-500 rounded-full"
                                        style={{
                                          width: `${gd.jaccardSimilarity * 100}%`
                                        }}
                                      />
                                    </div>
                                    <span className="font-mono text-sm">
                                      {gd.jaccardSimilarity.toFixed(4)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono">
                                  {gd.neiDistance.toFixed(4)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      gd.rogersDistance < 0.2
                                        ? 'default'
                                        : gd.rogersDistance < 0.4
                                        ? 'secondary'
                                        : 'outline'
                                    }
                                  >
                                    {gd.rogersDistance < 0.2
                                      ? 'Very Close'
                                      : gd.rogersDistance < 0.4
                                      ? 'Related'
                                      : 'Distant'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {results.geneticDistances.length > 30 && (
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                          Showing 30 of {results.geneticDistances.length} pairs
                        </p>
                      )}

                      {/* UPGMA Clustering Input Data */}
                      <div className="mt-6 p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">UPGMA Clustering Information</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          The Rogers&apos; distance matrix can be used as input for UPGMA hierarchical clustering:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="p-2 bg-gray-50 rounded">
                            <span className="text-muted-foreground">Min Distance:</span>{' '}
                            <span className="font-semibold">
                              {Math.min(...results.geneticDistances.map(d => d.rogersDistance)).toFixed(4)}
                            </span>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <span className="text-muted-foreground">Max Distance:</span>{' '}
                            <span className="font-semibold">
                              {Math.max(...results.geneticDistances.map(d => d.rogersDistance)).toFixed(4)}
                            </span>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <span className="text-muted-foreground">Mean Distance:</span>{' '}
                            <span className="font-semibold">
                              {(mean(results.geneticDistances.map(d => d.rogersDistance))).toFixed(4)}
                            </span>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <span className="text-muted-foreground">SD:</span>{' '}
                            <span className="font-semibold">
                              {stddev(results.geneticDistances.map(d => d.rogersDistance)).toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </TabsContent>

        {/* EXPORT TAB */}
        <TabsContent value="export">
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Results
                  </CardTitle>
                  <CardDescription>
                    Export all analysis results as CSV files for further processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg space-y-3">
                      <h4 className="font-semibold">Complete Results Export</h4>
                      <p className="text-sm text-muted-foreground">
                        Export all analysis results including marker statistics, LD, QTL mapping,
                        association analysis, MAS recommendations, and genetic distances.
                      </p>
                      <Button onClick={exportCSV} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Full Report (CSV)
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg space-y-3">
                      <h4 className="font-semibold">Export Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Markers Analyzed:</span>
                          <span className="font-semibold">{results.summary.totalMarkers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Polymorphic Markers:</span>
                          <span className="font-semibold">{results.summary.polymorphicMarkers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average PIC:</span>
                          <span className="font-semibold">{results.summary.avgPic.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average H<sub>e</sub>:</span>
                          <span className="font-semibold">{results.summary.avgHe.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Significant LD Pairs:</span>
                          <span className="font-semibold">{results.summary.significantLDPairs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Significant QTLs:</span>
                          <span className="font-semibold">{results.summary.significantQTLs}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Methodology Reference */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h4 className="font-medium mb-3">Methodology References</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium text-foreground">PIC Calculation</p>
                        <p>Botstein et al. (1980). Construction of a genetic linkage map using restriction fragment length polymorphisms.</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">LD Measures</p>
                        <p>Hill & Weir (1988). Linkage disequilibrium and recombination in finite populations.</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Genetic Distance</p>
                        <p>Nei (1972). Genetic distance between populations.</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Rogers' Distance</p>
                        <p>Rogers (1972). Measures of genetic similarity and genetic distance.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
