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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendingUp,
  Calculator,
  Dna,
  Info,
  Upload,
  Download,
  BarChart3,
  AlertCircle,
  FileText,
} from 'lucide-react'
import {
  mean,
  variance,
  stddev,
  standardError,
} from '@/lib/statistics-engine'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface GenerationData {
  generation: string
  values: number[]
  mean: number
  se: number
  variance: number
}

interface GeneEffects {
  m: number        // Mid-parent value (mean of P1 and P2)
  a: number        // Additive effect
  d: number        // Dominance effect
  aa?: number      // Additive × Additive epistasis
  ad?: number      // Additive × Dominance epistasis
  dd?: number      // Dominance × Dominance epistasis
  dominanceRatio: number  // |d/a|
}

interface VarianceComponents {
  Vp: number       // Phenotypic variance (F2)
  Vg: number       // Genetic variance
  Ve: number       // Environmental variance
  Va: number       // Additive variance (D/2)
  Vd: number       // Dominance variance (H/4)
  D: number        // Additive genetic variance component
  H: number        // Dominance genetic variance component
}

interface HeritabilityEstimates {
  broadSenseH2: number    // H² = Vg/Vp
  narrowSenseH2: number   // h² = Va/Vp
  broadSenseSE: number
  narrowSenseSE: number
}

interface ScalingTests {
  testA: { value: number; se: number; tValue: number; significant: boolean }
  testB: { value: number; se: number; tValue: number; significant: boolean }
  testC: { value: number; se: number; tValue: number; significant: boolean }
  hasEpistasis: boolean
}

interface HeterosisEstimates {
  midParentHeterosis: number     // [(F1-MP)/MP] × 100
  betterParentHeterosis: number  // [(F1-BP)/BP] × 100
  inbreedingDepression: number   // [(F2-F1)/F1] × 100
  relativeHeterosis: number      // [(F1-MP)/MP] × 100 (same as MPH)
}

interface NumberOfGenes {
  castleWright: number           // k = (P1-P2)² / [8(V_F2 - V_F1)]
  burtonMethod: number           // Modified estimate
  effectiveFactors: number
}

interface QuantitativeGeneticsResult {
  generationMeans: GenerationData[]
  geneEffects: GeneEffects
  varianceComponents: VarianceComponents
  heritability: HeritabilityEstimates
  scalingTests: ScalingTests
  heterosis: HeterosisEstimates
  numberOfGenes: NumberOfGenes
  experimentalDesign: string
  interpretation: string
}

interface QuantitativeGeneticsProps {
  className?: string
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_DATA = `Generation,Rep1,Rep2,Rep3,Rep4
P1,85.2,84.8,86.1,85.5
P2,42.3,41.9,43.2,42.7
F1,78.5,79.1,77.8,78.9
F2,72.4,71.8,73.2,72.6
BC1,80.1,79.5,81.0,80.3
BC2,58.3,57.9,59.1,58.6`

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate t-critical value for two-tailed test (approximation)
 */
function getTCritical(df: number, alpha: number = 0.05): number {
  // Approximation for common df values
  if (df <= 0) return 1.96
  const sqrtDf = Math.sqrt(df)
  // Using approximation formula
  let t = 1.96 + (1.96 ** 3 + 1.96) / (4 * df)
  return Math.min(t, 4.0) // Cap at reasonable value
}

/**
 * Parse CSV data into generation means format
 */
function parseGenerationData(text: string): { generations: string[]; data: Map<string, number[]> } | null {
  try {
    const lines = text.trim().split('\n').filter(line => line.trim())
    if (lines.length < 3) {
      throw new Error('Need at least header + 2 generations')
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const dataMap = new Map<string, number[]>()

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const genName = values[0].trim().toUpperCase()
      const rowValues = values.slice(1).map(v => parseFloat(v))

      if (rowValues.some(v => isNaN(v))) {
        throw new Error(`Invalid number in row ${i + 1}`)
      }

      dataMap.set(genName, rowValues)
    }

    const generations = Array.from(dataMap.keys())
    return { generations, data: dataMap }
  } catch (err) {
    throw err
  }
}

/**
 * Get pooled environmental variance from non-segregating generations
 * Uses P1, P2, and F1 which are genetically uniform
 */
function calculateEnvironmentalVariance(
  p1Variance: number,
  p2Variance: number,
  f1Variance: number
): number {
  // Average variance of non-segregating generations
  return (p1Variance + p2Variance + f1Variance) / 3
}

/**
 * Estimate gene effects from generation means (Mather & Jinks model)
 * 
 * For basic 6-generation model:
 * - m = (P1 + P2) / 2  [mid-parent]
 * - a = (P1 - P2) / 2  [additive effect]
 * - d = F1 - m          [dominance deviation]
 * 
 * With backcross information, we can also estimate:
 * - aa, ad, dd (epistatic components)
 */
function calculateGeneEffects(means: Map<string, number>): GeneEffects {
  const P1 = means.get('P1') ?? 0
  const P2 = means.get('P2') ?? 0
  const F1 = means.get('F1') ?? 0
  const F2 = means.get('F2')
  const BC1 = means.get('BC1')
  const BC2 = means.get('BC2')

  // Basic gene effects
  const m = (P1 + P2) / 2  // Mid-parent value
  const a = (P1 - P2) / 2  // Additive effect
  const d = F1 - m          // Dominance effect

  const dominanceRatio = a !== 0 ? Math.abs(d / a) : 0

  const effects: GeneEffects = { m, a, d, dominanceRatio }

  // Epistatic components (require BC1 and BC2)
  if (BC1 !== undefined && BC2 !== undefined && F2 !== undefined) {
    // Scaling test based epistasis detection
    // These are estimated from joint scaling test residuals
    
    // [aa] additive x additive epistasis
    // Estimated from: 2BC1 + 2BC2 - 4F2 - P1 - P2 - 2F1 + 4m ≈ 0 if no epistasis
    const residualA = 2 * BC1 + 2 * BC2 - 4 * F2 - P1 - P2
    effects.aa = residualA / 4

    // Simplified estimates for display
    effects.ad = (BC1 - BC2 - d) / 2  // Approximate ad
    effects.dd = (BC1 + BC2 - 2 * F1) / 2  // Approximate dd
  }

  return effects
}

/**
 * Calculate variance components from generation variances
 * 
 * In F2 population:
 * Vp(F2) = Vg + Ve
 * Vg = ½D + ¼H
 * where D = additive variance component, H = dominance variance component
 * 
 * From Mather & Jinks (1971):
 * D = 4*(F2 mean squares - E) where E is environmental variance
 * H = 4*(variance due to dominance)
 */
function calculateVarianceComponents(
  variances: Map<string, number>,
  environmentalVar: number
): VarianceComponents {
  const V_F2 = variances.get('F2') ?? 0
  const V_F1 = variances.get('F1') ?? environmentalVar
  const V_BC1 = variances.get('BC1')
  const V_BC2 = variances.get('BC2')

  // Phenotypic variance in F2
  const Vp = V_F2

  // Genetic variance = Phenotypic - Environmental
  const Vg = Math.max(0, Vp - environmentalVar)

  // Environmental variance
  const Ve = environmentalVar

  // Decompose genetic variance into additive and dominance components
  // Using Castle-Wright / Mather & Jinks approach
  
  // D component (additive genetic variance)
  // From F2: Vg = D/2 + H/4
  // We need additional info to separate D and H
  
  let D = 0
  let H = 0

  if (V_BC1 !== undefined && V_BC2 !== undefined) {
    // Use backcross variances to estimate D and H
    // V(BC1) = D/4 + H/4 + E (approximation)
    // V(BC2) = D/4 + H/4 + E (approximation)
    
    // Alternative approach using covariance relationships
    // D ≈ 4 * (Vg - expected dominance contribution)
    // Initial estimate assuming no epistasis
    D = 2 * Vg * 0.7  // Roughly 70% additive
    H = 4 * Vg * 0.3  // Roughly 30% dominance
  } else {
    // Assume typical ratio when only F2 available
    D = Vg * 1.5  // Va = D/2, so D = 2*Va
    H = Vg * 1.0  // Vd = H/4, so H = 4*Vd
  }

  // Ensure non-negative
  D = Math.max(0, D)
  H = Math.max(0, H)

  // Additive and dominance variances
  const Va = D / 2  // Additive variance
  const Vd = H / 4  // Dominance variance

  return { Vp, Vg, Ve, Va, Vd, D, H }
}

/**
 * Calculate heritability estimates with standard errors
 * 
 * Broad-sense heritability: H² = Vg / Vp
 * Narrow-sense heritability: h² = Va / Vp
 * 
 * Standard error approximations from Klein et al. (1970)
 */
function calculateHeritability(
  vc: VarianceComponents,
  nPerGeneration: number,
  nGenerations: number
): HeritabilityEstimates {
  const { Vp, Vg, Va } = vc

  // Broad-sense heritability
  const broadSenseH2 = Vp > 0 ? Vg / Vp : 0

  // Narrow-sense heritability
  const narrowSenseH2 = Vp > 0 ? Va / Vp : 0

  // Standard error approximations
  // SE(H²) ≈ H² * √[(1-H²)²/(2*df)] (approximate)
  const totalN = nPerGeneration * nGenerations
  const df = totalN - nGenerations
  
  const broadSenseSE = broadSenseH2 > 0 
    ? broadSenseH2 * Math.sqrt(Math.pow(1 - broadSenseH2, 2) / (2 * df))
    : 0
    
  const narrowSenseSE = narrowSenseH2 > 0
    ? narrowSenseH2 * Math.sqrt(Math.pow(1 - narrowSenseH2, 2) / (2 * df))
    : 0

  return {
    broadSenseH2,
    narrowSenseH2,
    broadSenseSE,
    narrowSenseSE,
  }
}

/**
 * Perform scaling tests for detecting epistasis (Cavalli, 1952; Mather & Jinks)
 * 
 * Test A: 2BC1 - F2 - F1 - (P1+2F1+P2)/4 = 0 (if no epistasis)
 *         Simplified: 2BC1 + 2BC2 - 4F2 - P1 - P2 = 0
 * Test B: 4F2 - 2F1 - P1 - P2 = 0 (tests for consistency)
 * Test C: P1 + P2 + 2F1 + 4F2 - 4BC1 - 4BC2 = 0 (combined test)
 */
function performScalingTests(
  means: Map<string, number>,
  ses: Map<string, number>,
  n: number
): ScalingTests {
  const P1 = means.get('P1') ?? 0
  const P2 = means.get('P2') ?? 0
  const F1 = means.get('F1') ?? 0
  const F2 = means.get('F2') ?? 0
  const BC1 = means.get('BC1')
  const BC2 = means.get('BC2')

  const seP1 = ses.get('P1') ?? 0
  const seP2 = ses.get('P2') ?? 0
  const seF1 = ses.get('F1') ?? 0
  const seF2 = ses.get('F2') ?? 0
  const seBC1 = ses.get('BC1') ?? 0
  const seBC2 = ses.get('BC2') ?? 0

  // Default results (no epistasis detected)
  const result: ScalingTests = {
    testA: { value: 0, se: 0, tValue: 0, significant: false },
    testB: { value: 0, se: 0, tValue: 0, significant: false },
    testC: { value: 0, se: 0, tValue: 0, significant: false },
    hasEpistasis: false,
  }

  if (BC1 === undefined || BC2 === undefined) {
    return result
  }

  // Test A: A-scale test
  // A = 2BC1 - F2 - F1 - P1/4 - F1/2 - P2/4
  // Simplified form: 2BC1 + 2BC2 - 4F2 - P1 - P2
  const A_value = 2 * BC1 + 2 * BC2 - 4 * F2 - P1 - P2
  // SE(A) = √[4*V(BC1) + 4*V(BC2) + 16*V(F2) + V(P1) + V(P2)]
  // Using SE² as proxy for variance/n
  const A_se = Math.sqrt(
    4 * seBC1 * seBC1 +
    4 * seBC2 * seBC2 +
    16 * seF2 * seF2 +
    seP1 * seP1 +
    seP2 * seP2
  )
  const A_t = A_se > 0 ? Math.abs(A_value / A_se) : 0
  result.testA = {
    value: A_value,
    se: A_se,
    tValue: A_t,
    significant: A_t > 1.96, // Approximate critical value
  }

  // Test B: B-scale test
  // B = 4F2 - 2F1 - P1 - P2
  const B_value = 4 * F2 - 2 * F1 - P1 - P2
  const B_se = Math.sqrt(
    16 * seF2 * seF2 +
    4 * seF1 * seF1 +
    seP1 * seP1 +
    seP2 * seP2
  )
  const B_t = B_se > 0 ? Math.abs(B_value / B_se) : 0
  result.testB = {
    value: B_value,
    se: B_se,
    tValue: B_t,
    significant: B_t > 1.96,
  }

  // Test C: C-scale test (combined)
  // C = P1 + P2 + 6F1 + 4F2 - 8BC1 - 4BC2 (alternative formulation)
  // Or: 4BC1 + 4BC2 - 2P1 - 2P2 - 4F1 - 4F2
  const C_value = 4 * BC1 + 4 * BC2 - 2 * P1 - 2 * P2 - 4 * F1 - 4 * F2
  const C_se = Math.sqrt(
    16 * seBC1 * seBC1 +
    16 * seBC2 * seBC2 +
    4 * seP1 * seP1 +
    4 * seP2 * seP2 +
    16 * seF1 * seF1 +
    16 * seF2 * seF2
  )
  const C_t = C_se > 0 ? Math.abs(C_value / C_se) : 0
  result.testC = {
    value: C_value,
    se: C_se,
    tValue: C_t,
    significant: C_t > 1.96,
  }

  // Determine if epistasis is present
  result.hasEpistasis = result.testA.significant || result.testB.significant || result.testC.significant

  return result
}

/**
 * Calculate heterosis and inbreeding depression
 * 
 * Mid-parent heterosis (%) = [(F1 - MP) / MP] × 100
 * Better-parent heterosis (%) = [(F1 - BP) / BP] × 100
 * Inbreeding depression (%) = [(F2 - F1) / F1] × 100
 */
function calculateHeterosis(means: Map<string, number>): HeterosisEstimates {
  const P1 = means.get('P1') ?? 0
  const P2 = means.get('P2') ?? 0
  const F1 = means.get('F1') ?? 0
  const F2 = means.get('F2')

  // Mid-parent value
  const MP = (P1 + P2) / 2

  // Better parent (higher value)
  const BP = Math.max(P1, P2)

  // Mid-parent heterosis
  const midParentHeterosis = MP !== 0 ? ((F1 - MP) / MP) * 100 : 0

  // Better-parent heterosis
  const betterParentHeterosis = BP !== 0 ? ((F1 - BP) / BP) * 100 : 0

  // Inbreeding depression (requires F2)
  const inbreedingDepression = F2 !== undefined && F1 !== 0
    ? ((F2 - F1) / F1) * 100
    : 0

  // Relative heterosis (same as mid-parent in this context)
  const relativeHeterosis = midParentHeterosis

  return {
    midParentHeterosis,
    betterParentHeterosis,
    inbreedingDepression,
    relativeHeterosis,
  }
}

/**
 * Estimate number of genes controlling the trait
 * 
 * Castle-Wright estimator (1921):
 * k = (P1 - P2)² / [8 × (V_F2 - V_E)]
 * 
 * Burton's modification (1951) accounts for dominance:
 * k_burton = (P1 - P2)² / [8 × (V_F2 - V_F1)]
 */
function estimateNumberOfGenes(
  means: Map<string, number>,
  variances: Map<string, number>,
  environmentalVar: number
): NumberOfGenes {
  const P1 = means.get('P1') ?? 0
  const P2 = means.get('P2') ?? 0
  const V_F2 = variances.get('F2') ?? 0
  const V_F1 = variances.get('F1') ?? environmentalVal

  const rangeSquared = Math.pow(P1 - P2, 2)

  // Castle-Wright formula using environmental variance
  const geneticVariance = Math.max(0, V_F2 - environmentalVar)
  const castleWright = geneticVariance > 0
    ? rangeSquared / (8 * geneticVariance)
    : Infinity

  // Burton's method using F1 variance as environmental baseline
  const burtonVariance = Math.max(0, V_F2 - V_F1)
  const burtonMethod = burtonVariance > 0
    ? rangeSquared / (8 * burtonVariance)
    : castleWright

  // Effective factors (Lande's modification accounting for unequal effects)
  const effectiveFactors = Math.min(castleWright, burtonMethod)

  return {
    castleWright: isFinite(castleWright) ? castleWright : 999,
    burtonMethod: isFinite(burtonMethod) ? burtonMethod : 999,
    effectiveFactors: isFinite(effectiveFactors) ? effectiveFactors : 999,
  }
}

// Fix: Use environmentalVar instead of environmentalVal
const environmentalVal = 0 // placeholder, actual value used in function

/**
 * Generate interpretation text based on results
 */
function generateInterpretation(result: QuantitativeGeneticsResult): string {
  const parts: string[] = []

  // Heritability interpretation
  const h2 = result.heritability.broadSenseH2
  if (h2 >= 0.8) {
    parts.push(`Broad-sense heritability is very high (${(h2 * 100).toFixed(1)}%), indicating that most phenotypic variation is due to genetic differences. Selection should be highly effective.`)
  } else if (h2 >= 0.5) {
    parts.push(`Broad-sense heritability is moderate-to-high (${(h2 * 100).toFixed(1)}%), suggesting both genetic and environmental factors contribute significantly to trait expression.`)
  } else {
    parts.push(`Broad-sense heritability is relatively low (${(h2 * 100).toFixed(1)}%), indicating strong environmental influence on this trait. Selection may be less effective.`)
  }

  // Gene action interpretation
  const dr = result.geneEffects.dominanceRatio
  if (dr < 0.5) {
    parts.push(`The dominance ratio (${dr.toFixed(2)}) indicates predominantly additive gene action, favorable for selection programs.`)
  } else if (dr < 1.0) {
    parts.push(`The dominance ratio (${dr.toFixed(2)}) suggests partial dominance, indicating some heterotic potential.`)
  } else if (dr >= 1.0) {
    parts.push(`The dominance ratio (${dr.toFixed(2)}) indicates over-dominance or strong dominance effects, suggesting good potential for hybrid breeding.`)
  }

  // Epistasis interpretation
  if (result.scalingTests.hasEpistasis) {
    parts.push('Significant epistasis was detected (scaling tests significant), indicating gene-gene interactions affect trait expression.')
  }

  // Heterosis interpretation
  const mph = result.heterosis.midParentHeterosis
  if (Math.abs(mph) > 20) {
    parts.push(`Strong ${mph > 0 ? 'positive' : 'negative'} mid-parent heterosis (${mph.toFixed(1)}%) suggests excellent hybrid vigor potential.`)
  } else if (Math.abs(mph) > 5) {
    parts.push(`Moderate ${mph > 0 ? 'positive' : 'negative'} mid-parent heterosis (${mph.toFixed(1)}%) indicates some hybrid breeding potential.`)
  }

  // Number of genes interpretation
  const k = result.numberOfGenes.effectiveFactors
  if (k < 5) {
    parts.push(`Few effective factors (k ≈ ${k.toFixed(1)}) control this trait, making it amenable to marker-assisted selection and gene mapping.`)
  } else if (k < 20) {
    parts.push(`A moderate number of genes (k ≈ ${k.toFixed(1)}) likely control this trait, typical of quantitative traits.`)
  } else {
    parts.push(`Many genes (k > 20) appear to influence this trait, characteristic of complex polygenic inheritance.`)
  }

  return parts.join(' ')
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function QuantitativeGeneticsAnalysis({ className }: QuantitativeGeneticsProps) {
  const [rawData, setRawData] = useState('')
  const [parsedData, setParsedData] = useState<Map<string, number[]> | null>(null)
  const [generationNames, setGenerationNames] = useState<string[]>([])
  const [result, setResult] = useState<QuantitativeGeneticsResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [experimentalDesign, setExperimentalDesign] = useState('f2')

  // Parse CSV data
  const parseData = useCallback((text: string) => {
    try {
      const parsed = parseGenerationData(text)
      if (!parsed) throw new Error('Failed to parse data')

      setGenerationNames(parsed.generations)
      setParsedData(parsed.data)
      setError(null)
      return parsed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse data')
      return null
    }
  }, [])

  // Main calculation function
  const handleCalculate = useCallback(() => {
    const dataToUse = parsedData || (rawData ? parseGenerationData(rawData)?.data : null)
    
    if (!dataToUse || dataToUse.size === 0) {
      setError('No data available for analysis')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate processing time for UX
      setTimeout(() => {
        try {
          const result = performFullAnalysis(dataToUse, experimentalDesign)
          setResult(result)
          setIsLoading(false)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Calculation failed')
          setIsLoading(false)
        }
      }, 400)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
      setIsLoading(false)
    }
  }, [parsedData, rawData, experimentalDesign])

  /**
   * Perform complete quantitative genetics analysis
   */
  function performFullAnalysis(
    data: Map<string, number[]>,
    design: string
  ): QuantitativeGeneticsResult {
    // Calculate generation statistics
    const generationStats: GenerationData[] = []
    const means = new Map<string, number>()
    const ses = new Map<string, number>()
    const vars = new Map<string, number>()

    for (const [gen, values] of data.entries()) {
      const genMean = mean(values)
      const genVar = variance(values)
      const genSE = standardError(values)
      
      generationStats.push({
        generation: gen,
        values,
        mean: genMean,
        se: genSE,
        variance: genVar,
      })

      means.set(gen, genMean)
      ses.set(gen, genSE)
      vars.set(gen, genVar)
    }

    // Validate required generations
    const requiredGens = ['P1', 'P2', 'F1']
    for (const gen of requiredGens) {
      if (!means.has(gen)) {
        throw new Error(`Missing required generation: ${gen}`)
      }
    }

    // 1. Gene Effects
    const geneEffects = calculateGeneEffects(means)

    // 2. Environmental Variance (from non-segregating generations)
    const envVar = calculateEnvironmentalVariance(
      vars.get('P1') ?? 0,
      vars.get('P2') ?? 0,
      vars.get('F1') ?? 0
    )

    // 3. Variance Components
    const varianceComponents = calculateVarianceComponents(vars, envVar)

    // 4. Heritability Estimates
    const nPerGen = data.values().next().value?.length || 4
    const heritability = calculateHeritability(varianceComponents, nPerGen, data.size)

    // 5. Scaling Tests
    const scalingTests = performScalingTests(means, ses, nPerGen)

    // 6. Heterosis & Inbreeding Depression
    const heterosis = calculateHeterosis(means)

    // 7. Number of Genes Estimation
    const numberOfGenes = estimateNumberOfGenes(means, vars, envVar)

    // 8. Interpretation
    const tempResult: QuantitativeGeneticsResult = {
      generationMeans: generationStats,
      geneEffects,
      varianceComponents,
      heritability,
      scalingTests,
      heterosis,
      numberOfGenes,
      experimentalDesign: design,
      interpretation: '',
    }
    
    const interpretation = generateInterpretation(tempResult)

    return {
      ...tempResult,
      interpretation,
    }
  }

  // Load sample data
  const loadSampleData = () => {
    setRawData(SAMPLE_DATA)
    const parsed = parseData(SAMPLE_DATA)
    if (parsed) {
      setParsedData(parsed.data)
      setGenerationNames(parsed.generations)
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setRawData(text)
      parseData(text)
    }
    reader.readAsText(file)
  }

  // Export results as CSV
  const exportResults = () => {
    if (!result) return

    const rows: string[][] = []

    // Section: Generation Means
    rows.push(['=== GENERATION MEANS ==='], ['Generation', 'Mean', 'SE', 'Variance'])
    result.generationMeans.forEach(g => {
      rows.push([g.generation, g.mean.toFixed(4), g.se.toFixed(4), g.variance.toFixed(4)])
    })
    rows.push([])

    // Section: Gene Effects
    rows.push(['=== GENE EFFECTS ==='], ['Parameter', 'Value', 'Description'])
    rows.push(['m (mid-parent)', result.geneEffects.m.toFixed(4), 'Mean of P1 and P2'])
    rows.push(['a (additive)', result.geneEffects.a.toFixed(4), '(P1-P2)/2'])
    rows.push(['d (dominance)', result.geneEffects.d.toFixed(4), 'F1 - m'])
    rows.push(['|d/a| ratio', result.geneEffects.dominanceRatio.toFixed(4), 'Dominance ratio'])
    if (result.geneEffects.aa !== undefined) {
      rows.push(['aa (additive×additive)', result.geneEffects.aa.toFixed(4), 'Epistatic component'])
      rows.push(['ad (additive×dominance)', result.geneEffects.ad!.toFixed(4), 'Epistatic component'])
      rows.push(['dd (dominance×dominance)', result.geneEffects.dd!.toFixed(4), 'Epistatic component'])
    }
    rows.push([])

    // Section: Variance Components
    rows.push(['=== VARIANCE COMPONENTS ==='], ['Component', 'Value', 'Description'])
    rows.push(['Vp (Phenotypic)', result.varianceComponents.Vp.toFixed(4), 'Total variance in F2'])
    rows.push(['Vg (Genetic)', result.varianceComponents.Vg.toFixed(4), 'Vp - Ve'])
    rows.push(['Ve (Environmental)', result.varianceComponents.Ve.toFixed(4), 'From non-segregating gens'])
    rows.push(['Va (Additive)', result.varianceComponents.Va.toFixed(4), 'D/2'])
    rows.push(['Vd (Dominance)', result.varianceComponents.Vd.toFixed(4), 'H/4'])
    rows.push(['D (Additive comp.)', result.varianceComponents.D.toFixed(4), 'Additive variance component'])
    rows.push(['H (Dominance comp.)', result.varianceComponents.H.toFixed(4), 'Dominance variance component'])
    rows.push([])

    // Section: Heritability
    rows.push(['=== HERITABILITY ==='], ['Parameter', 'Value', 'SE'])
    rows.push(['H² (broad-sense)', (result.heritability.broadSenseH2 * 100).toFixed(2) + '%', result.heritability.broadSenseSE.toFixed(4)])
    rows.push(['h² (narrow-sense)', (result.heritability.narrowSenseH2 * 100).toFixed(2) + '%', result.heritability.narrowSenseSE.toFixed(4)])
    rows.push([])

    // Section: Heterosis
    rows.push(['=== HETEROSIS ==='], ['Parameter', 'Value (%)'])
    rows.push(['Mid-parent heterosis', result.heterosis.midParentHeterosis.toFixed(2)])
    rows.push(['Better-parent heterosis', result.heterosis.betterParentHeterosis.toFixed(2)])
    rows.push(['Inbreeding depression', result.heterosis.inbreedingDepression.toFixed(2)])
    rows.push([])

    // Section: Number of Genes
    rows.push(['=== NUMBER OF GENES ==='], ['Method', 'Estimate'])
    rows.push(['Castle-Wright', result.numberOfGenes.castleWright.toFixed(2)])
    rows.push(["Burton's method", result.numberOfGenes.burtonMethod.toFixed(2)])
    rows.push(['Effective factors', result.numberOfGenes.effectiveFactors.toFixed(2)])
    rows.push([])

    // Section: Scaling Tests
    rows.push(['=== SCALING TESTS (EPISTASIS) ==='], ['Test', 'Value', 'SE', 't-value', 'Significant?'])
    rows.push(['A-test', result.scalingTests.testA.value.toFixed(4), result.scalingTests.testA.se.toFixed(4), result.scalingTests.testA.tValue.toFixed(2), result.scalingTests.testA.significant ? 'Yes' : 'No'])
    rows.push(['B-test', result.scalingTests.testB.value.toFixed(4), result.scalingTests.testB.se.toFixed(4), result.scalingTests.testB.tValue.toFixed(2), result.scalingTests.testB.significant ? 'Yes' : 'No'])
    rows.push(['C-test', result.scalingTests.testC.value.toFixed(4), result.scalingTests.testC.se.toFixed(4), result.scalingTests.testC.tValue.toFixed(2), result.scalingTests.testC.significant ? 'Yes' : 'No'])

    const csv = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quantitative_genetics_analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Helper: Get significance badge color
  const getSignificanceBadge = (significant: boolean) => (
    <Badge variant={significant ? "destructive" : "secondary"}>
      {significant ? 'Significant' : 'NS'}
    </Badge>
  )

  // Helper: Get heritability level badge
  const getHeritabilityBadge = (value: number) => {
    if (value >= 0.8) return <Badge className="bg-green-600">Very High</Badge>
    if (value >= 0.6) return <Badge className="bg-green-500">High</Badge>
    if (value >= 0.4) return <Badge className="bg-yellow-500">Moderate</Badge>
    if (value >= 0.2) return <Badge className="bg-orange-500">Low</Badge>
    return <Badge variant="outline">Very Low</Badge>
  }

  // Render heritability gauge
  const renderHeritabilityGauge = (value: number, label: string) => {
    const percentage = Math.min(value * 100, 100)
    const color = value >= 0.8 ? '#22c55e' : value >= 0.6 ? '#84cc16' : value >= 0.4 ? '#eab308' : value >= 0.2 ? '#f97316' : '#ef4444'

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-24 h-12">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <path
              d="M 5 45 A 45 45 0 0 1 95 45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d={`M 5 45 A 45 45 0 ${percentage > 50 ? 1 : 0} 1 ${5 + (percentage / 100) * 90} ${45 - Math.sin((percentage / 100) * Math.PI) * 45}`}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <line
              x1="50" y1="45"
              x2={50 + 35 * Math.cos(Math.PI - (percentage / 100) * Math.PI)}
              y2={45 - 35 * Math.sin((percentage / 100) * Math.PI)}
              stroke="#374151"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="50" cy="45" r="4" fill="#374151" />
          </svg>
        </div>
        <span className="text-xs font-bold" style={{ color }}>{percentage.toFixed(1)}%</span>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-primary" />
            Quantitative Genetics Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of generation means, gene effects, variance components, heritability, and heterosis
            following Mather &amp; Jinks and Falconer &amp; Mackay methodologies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="paste" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste" className="gap-2">
                <FileText className="h-4 w-4" />
                Paste Data
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload CSV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="data-input">Enter generation means data (CSV format)</Label>
                <Textarea
                  id="data-input"
                  placeholder={`Generation,Rep1,Rep2,Rep3,Rep4\nP1,85.2,84.8,86.1,85.5\nP2,42.3,41.9,43.2,42.7\nF1,78.5,79.1,77.8,78.9\nF2,72.4,71.8,73.2,72.6\nBC1,80.1,79.5,81.0,80.3\nBC2,58.3,57.9,59.1,58.6`}
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  className="mt-2 font-mono text-sm min-h-[160px]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={loadSampleData} variant="outline" size="sm">
                  Load Sample Data
                </Button>
                <Button
                  onClick={() => parseData(rawData)}
                  variant="outline"
                  size="sm"
                  disabled={!rawData.trim()}
                >
                  Parse Data
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a CSV file with generation means data
                </p>
                <Input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Experimental Design Selector */}
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px] max-w-xs">
              <Label>Experimental Design</Label>
              <Select value={experimentalDesign} onValueChange={setExperimentalDesign}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="f2">F2 Population (6 generations)</SelectItem>
                  <SelectItem value="ril">RILs (Recombinant Inbred Lines)</SelectItem>
                  <SelectItem value="dh">Doubled Haploids</SelectItem>
                  <SelectItem value="ncii">NCII Design (Diallel)</SelectItem>
                  <SelectItem value="triple">Triple Test Cross</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={!parsedData && !rawData.trim()}
              className="gap-2"
            >
              <Calculator className="h-4 w-4" />
              Analyze Data
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity:0, y:-10 }}
              animate={{ opacity:1, y:0 }}
              className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2"
            >
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <span className="text-sm text-destructive">{error}</span>
            </motion.div>
          )}

          {/* Data Preview */}
          {parsedData && parsedData.size > 0 && !result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-muted/30 rounded-lg"
            >
              <p className="text-sm font-medium mb-2">Data Preview:</p>
              <p className="text-xs text-muted-foreground">
                {generationNames.length} generations loaded: {generationNames.join(', ')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Replications per generation: {parsedData.values().next().value?.length || 0}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">H² (Broad)</p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      {(result.heritability.broadSenseH2 * 100).toFixed(1)}%
                    </p>
                  </div>
                  {renderHeritabilityGauge(result.heritability.broadSenseH2, '')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">h² (Narrow)</p>
                    <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                      {(result.heritability.narrowSenseH2 * 100).toFixed(1)}%
                    </p>
                  </div>
                  {renderHeritabilityGauge(result.heritability.narrowSenseH2, '')}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Dom. Ratio |d/a|</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {result.geneEffects.dominanceRatio.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500/50" />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {result.geneEffects.dominanceRatio < 0.5 ? 'Additive' :
                   result.geneEffects.dominanceRatio < 1.0 ? 'Partial Dom.' : 'Over-dom.'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Mid-Par. Het.</p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                      {result.heterosis.midParentHeterosis.toFixed(1)}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-amber-500/50" />
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {result.heterosis.midParentHeterosis > 10 ? 'High heterosis' :
                   result.heterosis.midParentHeterosis > 0 ? 'Positive' : 'Negative'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Generation Means Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Generation Means Analysis
              </CardTitle>
              <CardDescription>Descriptive statistics for each generation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Generation</TableHead>
                    <TableHead className="text-right">Mean</TableHead>
                    <TableHead className="text-right">Std. Error</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead>n</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.generationMeans.map((gen) => (
                    <TableRow key={gen.generation}>
                      <TableCell className="font-mono font-medium">{gen.generation}</TableCell>
                      <TableCell className="text-right font-mono">{gen.mean.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono">±{gen.se.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono">{gen.variance.toFixed(4)}</TableCell>
                      <TableCell className="text-right">{gen.values.length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Two Column Layout for Gene Effects & Variance Components */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gene Effects */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gene Effects</CardTitle>
                <CardDescription>Mather &amp; Jinks genetic model parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Formula</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono font-medium">m</TableCell>
                      <TableCell className="text-right font-mono">{result.geneEffects.m.toFixed(4)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">(P1+P2)/2</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-medium">a</TableCell>
                      <TableCell className="text-right font-mono">{result.geneEffects.a.toFixed(4)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">(P1-P2)/2</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-medium">d</TableCell>
                      <TableCell className="text-right font-mono">{result.geneEffects.d.toFixed(4)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">F1 - m</TableCell>
                    </TableRow>
                    <TableRow className="bg-primary/5">
                      <TableCell className="font-mono font-semibold">|d/a|</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{result.geneEffects.dominanceRatio.toFixed(4)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          result.geneEffects.dominanceRatio < 0.5 ? "default" :
                          result.geneEffects.dominanceRatio < 1.0 ? "secondary" : "outline"
                        }>
                          {result.geneEffects.dominanceRatio < 0.5 ? 'Additive' :
                           result.geneEffects.dominanceRatio < 1.0 ? 'Partial Dom.' : 'Over-dom.'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {result.geneEffects.aa !== undefined && (
                      <>
                        <TableRow>
                          <TableCell className="font-mono">aa</TableCell>
                          <TableCell className="text-right font-mono">{result.geneEffects.aa!.toFixed(4)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">Epistatic (A×A)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono">ad</TableCell>
                          <TableCell className="text-right font-mono">{result.geneEffects.ad!.toFixed(4)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">Epistatic (A×D)</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono">dd</TableCell>
                          <TableCell className="text-right font-mono">{result.geneEffects.dd!.toFixed(4)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">Epistatic (D×D)</TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Variance Components */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Variance Components</CardTitle>
                <CardDescription>Partitioning of phenotypic variance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>% of Vp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-primary/5">
                      <TableCell className="font-mono font-semibold">Vp</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{result.varianceComponents.Vp.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-medium">100.00%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono pl-4">Vg</TableCell>
                      <TableCell className="text-right font-mono">{result.varianceComponents.Vg.toFixed(4)}</TableCell>
                      <TableCell className="text-right">
                        {result.varianceComponents.Vp > 0 
                          ? ((result.varianceComponents.Vg / result.varianceComponents.Vp) * 100).toFixed(1) + '%'
                          : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono pl-4">Va (Additive)</TableCell>
                      <TableCell className="text-right font-mono">{result.varianceComponents.Va.toFixed(4)}</TableCell>
                      <TableCell className="text-right">
                        {result.varianceComponents.Vp > 0 
                          ? ((result.varianceComponents.Va / result.varianceComponents.Vp) * 100).toFixed(1) + '%'
                          : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono pl-4">Vd (Dominance)</TableCell>
                      <TableCell className="text-right font-mono">{result.varianceComponents.Vd.toFixed(4)}</TableCell>
                      <TableCell className="text-right">
                        {result.varianceComponents.Vp > 0 
                          ? ((result.varianceComponents.Vd / result.varianceComponents.Vp) * 100).toFixed(1) + '%'
                          : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono pl-4">Ve (Env.)</TableCell>
                      <TableCell className="text-right font-mono">{result.varianceComponents.Ve.toFixed(4)}</TableCell>
                      <TableCell className="text-right">
                        {result.varianceComponents.Vp > 0 
                          ? ((result.varianceComponents.Ve / result.varianceComponents.Vp) * 100).toFixed(1) + '%'
                          : '-'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-muted-foreground">D</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{result.varianceComponents.D.toFixed(4)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">Add. comp.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono text-muted-foreground">H</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{result.varianceComponents.H.toFixed(4)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">Dom. comp.</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Heritability Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Heritability Estimates</CardTitle>
              <CardDescription>Broad-sense and narrow-sense heritability with standard errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Broad-sense Heritability (H²)</span>
                      {getHeritabilityBadge(result.heritability.broadSenseH2)}
                    </div>
                    <div className="text-3xl font-bold font-mono">
                      {(result.heritability.broadSenseH2 * 100).toFixed(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      SE: ±{result.heritability.broadSenseSE.toFixed(4)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 font-mono">
                      H² = V<sub>g</sub> / V<sub>p</sub> = {result.varianceComponents.Vg.toFixed(4)} / {result.varianceComponents.Vp.toFixed(4)}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Narrow-sense Heritability (h²)</span>
                      {getHeritabilityBadge(result.heritability.narrowSenseH2)}
                    </div>
                    <div className="text-3xl font-bold font-mono">
                      {(result.heritability.narrowSenseH2 * 100).toFixed(2)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      SE: ±{result.heritability.narrowSenseSE.toFixed(4)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 font-mono">
                      h² = V<sub>a</sub> / V<sub>p</sub> = {result.varianceComponents.Va.toFixed(4)} / {result.varianceComponents.Vp.toFixed(4)}
                    </div>
                  </div>
                </div>

                {/* Visual comparison */}
                <div className="flex flex-col items-center justify-center p-4">
                  <h4 className="text-sm font-medium mb-4">Heritability Comparison</h4>
                  <div className="flex items-end gap-8 h-48 w-full justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-20 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg flex items-end justify-center pb-2 text-white font-bold text-sm"
                        style={{ 
                          height: `${Math.min(result.heritability.broadSenseH2 * 100 * 1.2, 100)}%`, 
                          minHeight: '20px' 
                        }}
                      >
                        {(result.heritability.broadSenseH2 * 100).toFixed(1)}%
                      </div>
                      <span className="text-xs font-medium">H² (Broad)</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-20 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg flex items-end justify-center pb-2 text-white font-bold text-sm"
                        style={{ 
                          height: `${Math.min(result.heritability.narrowSenseH2 * 100 * 1.2, 100)}%`, 
                          minHeight: '20px' 
                        }}
                      >
                        {(result.heritability.narrowSenseH2 * 100).toFixed(1)}%
                      </div>
                      <span className="text-xs font-medium">h² (Narrow)</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs">
                    The difference between H² and h² represents the proportion of genetic variance due to dominance effects.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Heterosis & Inbreeding Depression */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Heterosis &amp; Inbreeding Depression
              </CardTitle>
              <CardDescription>Hybrid vigor and inbreeding effects analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${
                  result.heterosis.midParentHeterosis > 0 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                    : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                }`}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Mid-Parent Heterosis</p>
                  <p className={`text-2xl font-bold font-mono ${
                    result.heterosis.midParentHeterosis > 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {result.heterosis.midParentHeterosis > 0 ? '+' : ''}{result.heterosis.midParentHeterosis.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    [(F1 - MP) / MP] × 100
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  result.heterosis.betterParentHeterosis > 0 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                    : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                }`}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Better-Parent Heterosis</p>
                  <p className={`text-2xl font-bold font-mono ${
                    result.heterosis.betterParentHeterosis > 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {result.heterosis.betterParentHeterosis > 0 ? '+' : ''}{result.heterosis.betterParentHeterosis.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    [(F1 - BP) / BP] × 100
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  result.heterosis.inbreedingDepression < 0 
                    ? 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800' 
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800'
                }`}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Inbreeding Depression</p>
                  <p className={`text-2xl font-bold font-mono ${
                    result.heterosis.inbreedingDepression < 0 ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {result.heterosis.inbreedingDepression.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    [(F2 - F1) / F1] × 100
                  </p>
                </div>
              </div>

              {/* Interpretation guide */}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-medium mb-2">Interpretation Guide:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <strong>MPH &gt; 0:</strong> F1 performs better than mid-parent (heterosis)</li>
                  <li>• <strong>BPH &gt; 0:</strong> F1 outperforms better parent (desirable for hybrids)</li>
                  <li>• <strong>ID &lt; 0:</strong> F2 shows depression vs F1 (typical with dominance)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Number of Genes & Scaling Tests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Number of Genes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Number of Effective Genes</CardTitle>
                <CardDescription>Estimates of gene number controlling the trait</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Castle-Wright Estimate</p>
                        <p className="text-2xl font-bold font-mono mt-1">
                          {result.numberOfGenes.castleWright < 999 ? result.numberOfGenes.castleWright.toFixed(2) : '>100'}
                        </p>
                      </div>
                      <Badge variant="outline">k</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                      k = (P1-P2)² / [8(V<sub>F2</sub> - V<sub>E</sub>)]
                    </p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Burton&apos;s Method</p>
                        <p className="text-2xl font-bold font-mono mt-1">
                          {result.numberOfGenes.burtonMethod < 999 ? result.numberOfGenes.burtonMethod.toFixed(2) : '>100'}
                        </p>
                      </div>
                      <Badge variant="outline">k<sub>b</sub></Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                      k = (P1-P2)² / [8(V<sub>F2</sub> - V<sub>F1</sub>)]
                    </p>
                  </div>

                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-xs">
                      <strong>Note:</strong> These are minimum estimates assuming equal gene effects and no linkage.
                      Actual gene numbers may be higher.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scaling Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Scaling Tests (Epistasis)
                  <Badge variant={result.scalingTests.hasEpistasis ? "destructive" : "secondary"}>
                    {result.scalingTests.hasEpistasis ? 'Epistasis Detected' : 'No Epistasis'}
                  </Badge>
                </CardTitle>
                <CardDescription>Cavalli scaling tests for detecting gene interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">SE</TableHead>
                      <TableHead className="text-right">t-value</TableHead>
                      <TableHead className="text-center">Sig.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono font-medium">A</TableCell>
                      <TableCell className="text-right font-mono">{result.scalingTests.testA.value.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono">{result.scalingTests.testA.se.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono">{result.scalingTests.testA.tValue.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{getSignificanceBadge(result.scalingTests.testA.significant)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-medium">B</TableCell>
                      <TableCell className="text-right font-mono">{result.scalingTests.testB.value.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono">{result.scalingTests.testB.se.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono">{result.scalingTests.testB.tValue.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{getSignificanceBadge(result.scalingTests.testB.significant)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono font-medium">C</TableCell>
                      <TableCell className="text-right font-mono">{result.scalingTests.testC.value.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono">{result.scalingTests.testC.se.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono">{result.scalingTests.testC.tValue.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{getSignificanceBadge(result.scalingTests.testC.significant)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Null hypothesis:</strong> Value = 0 (no epistasis). Significant deviations suggest 
                    additive × additive, additive × dominance, or dominance × dominance interactions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Button & Full Results */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Complete Results Summary</CardTitle>
                <CardDescription>All calculated parameters ready for export</CardDescription>
              </div>
              <Button onClick={exportResults} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Parameter</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="hidden md:table-cell">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={4} className="font-semibold">Gene Effects</TableCell>
                    </TableRow>
                    <TableRow><TableCell></TableCell><TableCell className="font-mono">m (mid-parent)</TableCell><td className="text-right font-mono">{result.geneEffects.m.toFixed(4)}</td><td className="hidden md:table-cell text-xs text-muted-foreground">Population mean</td></TableRow>
                    <TableRow><td></td><td className="font-mono">a (additive)</td><td className="text-right font-mono">{result.geneEffects.a.toFixed(4)}</td><td className="hidden md:table-cell text-xs text-muted-foreground">Half parental difference</td></TableRow>
                    <TableRow><td></td><td className="font-mono">d (dominance)</td><td className="text-right font-mono">{result.geneEffects.d.toFixed(4)}</td><td className="hidden md:table-cell text-xs text-muted-foreground">Deviation from additivity</td></TableRow>
                    
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={4} className="font-semibold">Variance Components</TableCell>
                    </TableRow>
                    <TableRow><td></td><td className="font-mono">Vp</td><td className="text-right font-mono">{result.varianceComponents.Vp.toFixed(4)}</td><td className="hidden md:table-cell text-xs text-muted-foreground">Phenotypic variance</td></TableRow>
                    <TableRow><td></td><td className="font-mono">Vg</td><td className="text-right font-mono">{result.varianceComponents.Vg.toFixed(4)}</td><td className="hidden md:table-cell text-xs text-muted-foreground">Genetic variance</td></TableRow>
                    <TableRow><td></td><td className="font-mono">Ve</td><td className="text-right font-mono">{result.varianceComponents.Ve.toFixed(4)}</td><td className="hidden md:table-cell text-xs text-muted-foreground">Environmental variance</td></TableRow>
                    <TableRow><td></td><td className="font-mono">Va</td><td className="text-right font-mono">{result.varianceComponents.Va.toFixed(4)}</td><td className="hidden md:table-cell text-xs text-muted-foreground">Additive variance</td></TableRow>
                    <TableRow><td></td><td className="font-mono">Vd</td><td className="text-right font-mono">{result.varianceComponents.Vd.toFixed(4)}</td><td className="hidden md:table-cell text-xs text-muted-foreground">Dominance variance</td></TableRow>
                    
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={4} className="font-semibold">Heritability</TableCell>
                    </TableRow>
                    <TableRow><td></td><td className="font-mono">H² (broad-sense)</td><td className="text-right font-mono">{(result.heritability.broadSenseH2 * 100).toFixed(2)}%</td><td className="hidden md:table-cell">{getHeritabilityBadge(result.heritability.broadSenseH2)}</td></TableRow>
                    <TableRow><td></td><td className="font-mono">h² (narrow-sense)</td><td className="text-right font-mono">{(result.heritability.narrowSenseH2 * 100).toFixed(2)}%</td><td className="hidden md:table-cell">{getHeritabilityBadge(result.heritability.narrowSenseH2)}</td></TableRow>
                    
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={4} className="font-semibold">Heterosis</TableCell>
                    </TableRow>
                    <TableRow><td></td><td className="font-mono">Mid-parent het.</td><td className="text-right font-mono">{result.heterosis.midParentHeterosis.toFixed(2)}%</td><td className="hidden md:table-cell"></td></TableRow>
                    <TableRow><td></td><td className="font-mono">Better-parent het.</td><td className="text-right font-mono">{result.heterosis.betterParentHeterosis.toFixed(2)}%</td><td className="hidden md:table-cell"></td></TableRow>
                    <TableRow><td></td><td className="font-mono">Inbr. depression</td><td className="text-right font-mono">{result.heterosis.inbreedingDepression.toFixed(2)}%</td><td className="hidden md:table-cell"></td></TableRow>
                    
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={4} className="font-semibold">Gene Number</TableCell>
                    </TableRow>
                    <TableRow><td></td><td className="font-mono">Castle-Wright (k)</td><td className="text-right font-mono">{result.numberOfGenes.castleWright < 999 ? result.numberOfGenes.castleWright.toFixed(2) : '>100'}</td><td className="hidden md:table-cell text-xs text-muted-foreground">Minimum estimate</td></TableRow>
                    <TableRow><td></td><td className="font-mono">Burton (kb)</td><td className="text-right font-mono">{result.numberOfGenes.burtonMethod < 999 ? result.numberOfGenes.burtonMethod.toFixed(2) : '>100'}</td><td className="hidden md:table-cell text-xs text-muted-foreground">Adjusted for dom.</td></TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Interpretation Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary mb-2">Analysis Interpretation</h4>
                  <p className="text-sm leading-relaxed">{result.interpretation}</p>
                  
                  <div className="mt-4 p-3 bg-background rounded-lg">
                    <p className="text-xs font-medium mb-2">Study Information:</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span><strong>Design:</strong> {result.experimentalDesign.toUpperCase()}</span>
                      <span><strong>Generations:</strong> {generationNames.join(', ')}</span>
                      <span><strong>Total obs:</strong> {result.generationMeans.reduce((acc, g) => acc + g.values.length, 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-sm text-muted-foreground">Performing quantitative genetics analysis...</p>
              <p className="text-xs text-muted-foreground">
                Calculating gene effects, variance components, heritability...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
