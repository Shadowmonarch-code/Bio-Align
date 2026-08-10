'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  LineChart, 
  Info, 
  Download,
  Calculator,
  AlertCircle
} from 'lucide-react'

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
}

interface IPCAAxis {
  axis: number
  singularValue: number
  eigenvalue: number
  variancePercent: number
  cumulativePercent: number
}

interface GenotypeScore {
  genotype: string
  ipca1: number
  ipca2: number
  stabilityMeasure: number
  stabilityCategory: string
}

interface EnvironmentScore {
  environment: string
  ipca1: number
  ipca2: number
  meanYield: number
  discriminatingAbility: string
}

interface AMMIResult {
  genotypes: string[]
  environments: string[]
  grandMean: number
  anova: {
    genotype: ANOVARow
    environment: ANOVARow
    geInteraction: ANOVARow
    total: ANOVARow
  }
  ipcaAxes: IPCAAxis[]
  genotypeScores: GenotypeScore[]
  environmentScores: EnvironmentScore[]
  modelFit: {
    ammi1RSquared: number
    ammi2RSquared: number
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
// MATRIX UTILITIES
// ============================================================================

function transpose(matrix: number[][]): number[][] {
  if (matrix.length === 0) return []
  return matrix[0].map((_, colIdx) => matrix.map(row => row[colIdx]))
}

function matMul(A: number[][], B: number[][]): number[][] {
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

function matVecMul(matrix: number[][], vec: number[]): number[] {
  return matrix.map(row => 
    row.reduce((sum, val, i) => sum + val * (vec[i] || 0), 0)
  )
}

/**
 * Simple SVD using power iteration - robust for small matrices
 */
function computeSVD(matrix: number[][]): { U: number[][]; S: number[]; Vt: number[][] } {
  const m = matrix.length
  const n = matrix[0]?.length || 0
  
  if (m === 0 || n === 0) {
    return { U: [], S: [], Vt: [] }
  }
  
  // Compute A^T * A for eigenvalues
  const AtA = matMul(transpose(matrix), matrix)
  const size = Math.min(m, n)
  
  const eigenvalues: number[] = []
  const eigenvectors: number[][] = []
  
  // Copy AtA for deflation
  const workingMatrix = AtA.map(row => [...row])
  
  // Power iteration for each eigenvalue
  for (let iter = 0; iter < size; iter++) {
    // Initialize vector
    let v = new Array(n).fill(0)
    v[Math.min(iter, n-1)] = 1
    
    // Power iteration
    for (let powerIter = 0; powerIter < 150; powerIter++) {
      let Av = matVecMul(workingMatrix, v)
      
      // Orthogonalize against previous eigenvectors (Hotelling deflation)
      for (let k = 0; k < eigenvectors.length; k++) {
        let dot = 0
        for (let i = 0; i < Av.length; i++) {
          dot += Av[i] * eigenvectors[k][i]
        }
        for (let i = 0; i < Av.length; i++) {
          Av[i] -= dot * eigenvectors[k][i]
        }
      }
      
      // Normalize
      let norm = Math.sqrt(Av.reduce((sum, x) => sum + x*x, 0))
      if (norm < 1e-12) break
      v = Av.map(x => x / norm)
    }
    
    // Compute eigenvalue: λ = v^T * W * v
    const Wv = matVecMul(workingMatrix, v)
    let eigenvalue = 0
    for (let i = 0; i < v.length; i++) {
      eigenvalue += v[i] * Wv[i]
    }
    
    if (Math.abs(eigenvalue) > 1e-10 && eigenvalue > 0) {
      eigenvalues.push(eigenvalue)
      eigenvectors.push([...v])
      
      // Deflate: W = W - λ*v*v^T
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          workingMatrix[i][j] -= eigenvalue * v[i] * v[j]
        }
      }
    } else {
      break
    }
  }
  
  // Singular values are sqrt of eigenvalues
  const S = eigenvalues.map(ev => Math.sqrt(Math.max(0, ev)))
  
  // V matrix from eigenvectors
  const V = transpose(eigenvectors)
  const Vt = eigenvectors.length > 0 ? eigenvectors : []
  
  // Compute U = A * V * Σ^-1
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

// F-distribution approximation (simplified)
function fCDF(f: number, df1: number, df2: number): number {
  // Simplified approximation using regularized incomplete beta function
  if (f <= 0) return 0
  const x = (df1 * f) / (df1 * f + df2)
  
  // Regularized incomplete beta approximation
  return betaRegularized(x, df1/2, df2/2)
}

function betaRegularized(x: number, a: number, b: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  
  // Use continued fraction expansion for I_x(a,b)
  const eps = 1e-10
  const maxIter = 200
  
  // For a,b > 0 use continued fraction
  const qab = a + b
  const qap = a + 1
  const qam = a - 1
  
  let c = 1
  let d = 1 + (qab * x / qap)
  if (Math.abs(d) < eps) d = eps
  d = 1 / d
  let h = d
  
  for (let m = 1; m <= maxIter; m++) {
    let m2 = 2 * m
    
    // Even step
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < eps) d = eps
    c = 1 + aa / c
    if (Math.abs(c) < eps) c = eps
    d = 1 / d
    h *= d * c
    
    // Odd step
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < eps) d = eps
    c = 1 + aa / c
    if (Math.abs(c) < eps) c = eps
    d = 1 / d
    const del = d * c
    h *= del
    
    if (Math.abs(del - 1) < eps) break
  }
  
  // Complete the calculation
  const logBetaFn = logGamma(a) + logGamma(b) - logGamma(a + b)
  const front = Math.exp(a * Math.log(x) + b * Math.log(1-x) - logBetaFn) / a
  
  return h * front
}

function logGamma(x: number): number {
  // Lanczos approximation
  const g = 7
  const coef = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
  
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x)
  }
  
  x -= 1
  let a = coef[0]
  for (let i = 1; i < g + 2; i++) {
    a += coef[i] / (x + i)
  }
  const t = x + g + 0.5
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
}

// ============================================================================
// MAIN AMMI ANALYSIS FUNCTION
// ============================================================================

function performAMMIAnalysis(
  gNames: string[],
  eNames: string[],
  data: number[][]
): AMMIResult {
  const g = gNames.length
  const e = eNames.length
  const N = g * e
  
  // Step 1: Calculate means
  let grandTotal = 0
  for (let i = 0; i < g; i++) {
    for (let j = 0; j < e; j++) {
      grandTotal += data[i][j]
    }
  }
  const grandMean = grandTotal / N
  
  // Marginal means
  const gMeans: number[] = []
  const eMeans: number[] = []
  
  for (let i = 0; i < g; i++) {
    let sum = 0
    for (let j = 0; j < e; j++) sum += data[i][j]
    gMeans.push(sum / e)
  }
  
  for (let j = 0; j < e; j++) {
    let sum = 0
    for (let i = 0; i < g; i++) sum += data[i][j]
    eMeans.push(sum / g)
  }
  
  // Main effects
  const gEffects = gMeans.map(m => m - grandMean)
  const eEffects = eMeans.map(m => m - grandMean)
  
  // Step 2: Two-way ANOVA
  let totalSS = 0
  for (let i = 0; i < g; i++) {
    for (let j = 0; j < e; j++) {
      totalSS += (data[i][j] - grandMean) ** 2
    }
  }
  
  let gSS = 0
  for (let i = 0; i < g; i++) gSS += e * gEffects[i] ** 2
  const gDF = g - 1
  const gMS = gSS / gDF
  
  let eSS = 0
  for (let j = 0; j < e; j++) eSS += g * eEffects[j] ** 2
  const eDF = e - 1
  const eMS = eSS / eDF
  
  // G×E interaction
  let geSS = 0
  const geMatrix: number[][] = []
  
  for (let i = 0; i < g; i++) {
    geMatrix[i] = []
    for (let j = 0; j < e; j++) {
      const expected = grandMean + gEffects[i] + eEffects[j]
      const interaction = data[i][j] - expected
      geMatrix[i][j] = interaction
      geSS += interaction ** 2
    }
  }
  
  const geDF = (g - 1) * (e - 1)
  const geMS = geSS / geDF
  
  // F-values (using GE as error term for fixed effects model)
  const gF = gMS / geMS
  const eF = eMS / geMS
  const geF = geMS / (geSS * 0.01 + 1000) // Small value for display
  
  // P-values
  const effDF = Math.max(g * e - g - e + 1, 1)
  const gPVal = 1 - fCDF(gF, gDF, geDF)
  const ePVal = 1 - fCDF(eF, eDF, geDF)
  const gePVal = 1 - fCDF(geF, geDF, effDF)
  
  // Step 3: SVD of G×E matrix
  const { U, S, Vt } = computeSVD(geMatrix)
  
  // Step 4: Extract IPCA axes
  const numAxes = Math.min(S.length, Math.min(g-1, e-1), 5)
  let cumVar = 0
  const ipcaAxes: IPCAAxis[] = []
  
  for (let k = 0; k < numAxes; k++) {
    const eigenval = S[k] ** 2
    const varPct = (eigenval / geSS) * 100
    cumVar += varPct
    
    ipcaAxes.push({
      axis: k + 1,
      singularValue: S[k],
      eigenvalue: eigenval,
      variancePercent: varPct,
      cumulativePercent: cumVar
    })
  }
  
  // Step 5: Genotype scores
  const genotypeScores: GenotypeScore[] = []
  for (let i = 0; i < g; i++) {
    const ipca1 = U[i]?.[0] * S[0] || 0
    const ipca2 = U[i]?.[1] * S[1] || 0
    const stability = Math.sqrt(ipca1**2 + ipca2**2)
    
    let category = 'Stable'
    if (stability < 50000) category = 'Very Stable'
    else if (stability < 150000) category = 'Stable'
    else if (stability < 300000) category = 'Moderate'
    else if (stability < 450000) category = 'Unstable'
    else category = 'Very Unstable'
    
    genotypeScores.push({
      genotype: gNames[i],
      ipca1,
      ipca2,
      stabilityMeasure: stability,
      stabilityCategory: category
    })
  }
  
  // Step 6: Environment scores
  const environmentScores: EnvironmentScore[] = []
  for (let j = 0; j < e; j++) {
    const ipca1 = Vt[0]?.[j] * S[0] || 0
    const ipca2 = Vt[1]?.[j] * S[1] || 0
    const discPower = Math.sqrt(ipca1**2 + ipca2**2)
    
    let discAbility = 'Moderate'
    if (discPower > 80000) discAbility = 'High'
    else if (discPower > 40000) discAbility = 'Moderate'
    else discAbility = 'Low'
    
    environmentScores.push({
      environment: eNames[j],
      ipca1,
      ipca2,
      meanYield: eMeans[j],
      discriminatingAbility: discAbility
    })
  }
  
  // Model fit statistics
  const explainedByIPCA1 = ipcaAxes[0]?.variancePercent || 0
  const explainedByIPCA2 = ipcaAxes[1]?.variancePercent || 0
  
  return {
    genotypes: gNames,
    environments: eNames,
    grandMean,
    anova: {
      genotype: { source: 'Genotype', df: gDF, ss: gSS, ms: gMS, f: gF, pValue: gPVal },
      environment: { source: 'Environment', df: eDF, ss: eSS, ms: eMS, f: eF, pValue: ePVal },
      geInteraction: { source: 'G × E', df: geDF, ss: geSS, ms: geMS, f: geF, pValue: gePVal },
      total: { source: 'Total', df: N-1, ss: totalSS, ms: totalSS/(N-1), f: NaN, pValue: NaN }
    },
    ipcaAxes,
    genotypeScores,
    environmentScores,
    modelFit: {
      ammi1RSquared: explainedByIPCA1 / 100,
      ammi2RSquared: (explainedByIPCA1 + explainedByIPCA2) / 100
    }
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AMMIAnalysisComponent() {
  const [rawData, setRawData] = useState('')
  const [parsedData, setParsedData] = useState<number[][]>([])
  const [gNames, setGNames] = useState<string[]>([])
  const [eNames, setENames] = useState<string[]>([])
  const [result, setResult] = useState<AMMIResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const parseData = useCallback((text: string) => {
    try {
      const lines = text.trim().split('\n').filter(line => line.trim())
      if (lines.length < 3) throw new Error('Need at least header + 2 genotypes')
      
      const headers = lines[0].split(',').map(h => h.trim())
      if (headers.length < 3) throw new Error('Need at least Genotype + 2 environments')
      
      const envNames = headers.slice(1)
      const genNames: string[] = []
      const data: number[][] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        genNames.push(values[0])
        const rowValues = values.slice(1).map(v => parseFloat(v))
        
        if (rowValues.some(v => isNaN(v))) throw new Error(`Invalid number in row ${i+1}`)
        data.push(rowValues)
      }
      
      setGNames(genNames)
      setENames(envNames)
      setParsedData(data)
      setError(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parse failed')
      return false
    }
  }, [])

  const handleCalculate = useCallback(() => {
    setIsLoading(true)
    setError(null)
    
    setTimeout(() => {
      try {
        const ammiResult = performAMMIAnalysis(gNames, eNames, parsedData)
        setResult(ammiResult)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed')
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }, [gNames, eNames, parsedData])

  const loadSampleData = () => {
    setRawData(SAMPLE_DATA)
    parseData(SAMPLE_DATA)
  }

  const exportResults = () => {
    if (!result) return
    
    let csv = '=== AMMI Analysis Results ===\n\n'
    csv += 'ANOVA TABLE\nSource,df,SS,MS,F-value,P-value\n'
    Object.values(result.anova).forEach(row => {
      csv += `${row.source},${row.df},${row.ss.toFixed(2)},${row.ms.toFixed(4)},${row.f.toFixed(4)},${row.pValue.toFixed(6)}\n`
    })
    
    csv += '\nIPCA AXES\nAxis,Singular Value,Eigenvalue,Variance %,Cumulative %\n'
    result.ipcaAxes.forEach(axis => {
      csv += `IPCA${axis.axis},${axis.singularValue.toFixed(4)},${axis.eigenvalue.toFixed(4)},${axis.variancePercent.toFixed(2)},${axis.cumulativePercent.toFixed(2)}\n`
    })
    
    csv += '\nGENOTYPE SCORES\nGenotype,IPCA1,IPCA2,Stability,Category\n'
    result.genotypeScores.forEach(gs => {
      csv += `${gs.genotype},${gs.ipca1.toFixed(4)},${gs.ipca2.toFixed(4)},${gs.stabilityMeasure.toFixed(2)},${gs.stabilityCategory}\n`
    })
    
    csv += '\nENVIRONMENT SCORES\nEnvironment,IPCA1,IPCA2,Mean Yield,Discriminating\n'
    result.environmentScores.forEach(es => {
      csv += `${es.environment},${es.ipca1.toFixed(4)},${es.ipca2.toFixed(4)},${es.meanYield.toFixed(2)},${es.discriminatingAbility}\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ammi_analysis_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <LineChart className="h-5 w-5 text-indigo-500" />
            AMMI Analysis (Additive Main Effects & Multiplicative Interaction)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Input */}
          <Tabs defaultValue="paste">
            <TabsList>
              <TabsTrigger value="paste">Paste Data</TabsTrigger>
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            </TabsList>
            
            <TabsContent value="paste" className="mt-4 space-y-4">
              <Textarea
                placeholder={`Enter your data in CSV format:\n${SAMPLE_DATA}`}
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                className="font-mono text-sm min-h-[160px]"
              />
              <div className="flex gap-2 flex-wrap">
                <Button onClick={loadSampleData} variant="outline" size="sm">
                  Load Sample Data
                </Button>
                <Button onClick={handleCalculate} disabled={parsedData.length === 0 || isLoading} size="sm">
                  {isLoading ? (
                    <>
                      <Calculator className="h-4 w-4 mr-2 animate-spin" />
                      Running AMMI...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Run AMMI Analysis
                    </>
                  )}
                </Button>
                {result && (
                  <Button onClick={exportResults} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="mt-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Select a CSV file with genotype × environment data</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (ev) => {
                        const text = ev.target?.result as string
                        setRawData(text)
                        parseData(text)
                      }
                      reader.readAsText(file)
                    }
                  }}
                  className="mt-4"
                />
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Data Summary */}
          {parsedData.length > 0 && !result && (
            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-sm">
              <span className="font-medium">Data loaded:</span> {gNames.length} genotypes × {eNames.length} environments ({gNames.length * eNames.length} observations)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* ANOVA Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Two-Way ANOVA Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">df</TableHead>
                      <TableHead className="text-right">Sum Sq</TableHead>
                      <TableHead className="text-right">Mean Sq</TableHead>
                      <TableHead className="text-right">F-value</TableHead>
                      <TableHead className="text-right">P-value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[result.anova.genotype, result.anova.environment, result.anova.geInteraction].map((row) => (
                      <TableRow key={row.source}>
                        <TableCell className="font-medium">{row.source}</TableCell>
                        <TableCell className="text-right">{row.df}</TableCell>
                        <TableCell className="text-right font-mono">{row.ss.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{row.ms.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{isFinite(row.f) ? row.f.toFixed(4) : '-'}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={row.pValue < 0.001 ? 'default' : row.pValue < 0.05 ? 'secondary' : 'outline'}>
                            {row.pValue < 0.001 ? '***' : row.pValue < 0.01 ? '**' : row.pValue < 0.05 ? '*' : 'ns'}
                            </Badge>
                          </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* IPCA Axes & Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* IPCA Variance Explained */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">IPCA Variance Explained</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Axis</TableHead>
                        <TableHead className="text-right">Singular Value</TableHead>
                        <TableHead className="text-right">Eigenvalue</TableHead>
                        <TableHead className="text-right">Variance %</TableHead>
                        <TableHead className="text-right">Cumulative %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.ipcaAxes.map((axis) => (
                        <TableRow key={axis.axis}>
                          <TableCell className="font-medium">IPCA{axis.axis}</TableCell>
                          <TableCell className="text-right font-mono">{axis.singularValue.toFixed(4)}</TableCell>
                          <TableCell className="text-right font-mono">{axis.eigenvalue.toFixed(4)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-indigo-500 h-2 rounded-full" 
                                  style={{ width: `${Math.min(axis.variancePercent, 100)}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs w-12 text-right">{axis.variancePercent.toFixed(1)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">{axis.cumulativePercent.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                  <p><strong>Model Fit:</strong></p>
                  <p>AMMI 1 (IPCA1 only): R² = {(result.modelFit.ammi1RSquared * 100).toFixed(1)}%</p>
                  <p>AMMI 2 (IPCA1+2): R² = {(result.modelFit.ammi2RSquared * 100).toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>

            {/* Genotype Scores */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Genotype IPCA Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-auto max-h-[350px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Genotype</TableHead>
                        <TableHead className="text-right">IPCA1</TableHead>
                        <TableHead className="text-right">IPCA2</TableHead>
                        <TableHead className="text-right">Stability (d)</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.genotypeScores.map((gs) => (
                        <TableRow key={gs.genotype}>
                          <TableCell className="font-medium">{gs.genotype}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{gs.ipca1.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{gs.ipca2.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{gs.stabilityMeasure.toFixed(1)}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                gs.stabilityCategory === 'Very Stable' ? 'default' :
                                gs.stabilityCategory === 'Stable' ? 'secondary' : 'outline'
                              }
                              className="text-xs"
                            >
                              {gs.stabilityCategory}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Environment Scores */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Environment IPCA Scores & Discriminating Ability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Environment</TableHead>
                      <TableHead className="text-right">IPCA1</TableHead>
                      <TableHead className="text-right">IPCA2</TableHead>
                      <TableHead className="text-right">Mean Yield</TableHead>
                      <TableHead>Discriminating Ability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.environmentScores.map((es) => (
                      <TableRow key={es.environment}>
                        <TableCell className="font-medium">{es.environment}</TableCell>
                        <TableCell className="text-right font-mono">{es.ipca1.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{es.ipca2.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{es.meanYield.toFixed(1)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={es.discriminatingAbility === 'High' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {es.discriminatingAbility}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Methodology Reference */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Methodology Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xs text-muted-foreground space-y-1">
                <p>This AMMI analysis follows standard methodology from Gauch (2006) and Zobel et al. (1988).</p>
                <p><strong>Model:</strong> Y_ij = μ + g_i + e_j + Σλ_k × α_ik × γ_jk + ε_ij</p>
                <p><strong>Interpretation:</strong> Lower stability measure (d) indicates more stable genotypes across environments.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
