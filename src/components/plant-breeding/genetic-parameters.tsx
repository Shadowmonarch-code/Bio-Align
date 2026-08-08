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
  Calculator, 
  Upload, 
  FileText, 
  Download,
  Info,
  TrendingUp,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import { calculateGeneticParameters, GeneticParameters } from '@/lib/statistics-engine'

interface GeneticParametersProps {
  className?: string
}

// Sample data for testing
const SAMPLE_DATA = `Genotype,Rep1,Rep2,Rep3
G1,4520,4380,4610
G2,3890,4020,3750
G3,4210,4350,4180
G4,3980,4120,4050
G5,4780,4650,4890
G6,4420,4510,4380
G7,3650,3780,3590
G8,4150,4280,4120
G9,4890,4750,4980
G10,4320,4450,4280`

export default function GeneticParametersCalculator({ className }: GeneticParametersProps) {
  const [rawData, setRawData] = useState('')
  const [parsedData, setParsedData] = useState<number[][]>([])
  const [genotypeNames, setGenotypeNames] = useState<string[]>([])
  const [result, setResult] = useState<GeneticParameters | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectionIntensity, setSelectionIntensity] = useState(2.06)
  const [isLoading, setIsLoading] = useState(false)

  // Parse CSV data
  const parseData = useCallback((text: string) => {
    try {
      const lines = text.trim().split('\n').filter(line => line.trim())
      if (lines.length < 3) {
        throw new Error('Need at least header + 2 genotypes')
      }

      const headers = lines[0].split(',').map(h => h.trim())
      const names: string[] = []
      const data: number[][] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        names.push(values[0])
        const rowValues = values.slice(1).map(v => parseFloat(v))
        
        if (rowValues.some(v => isNaN(v))) {
          throw new Error(`Invalid number in row ${i + 1}`)
        }
        data.push(rowValues)
      }

      setGenotypeNames(names)
      setParsedData(data)
      setError(null)
      return { names, data }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse data')
      return null
    }
  }, [])

  // Calculate genetic parameters
  const handleCalculate = useCallback(() => {
    if (parsedData.length === 0) {
      const parsed = parseData(rawData)
      if (!parsed) return
      calculateFromData(parsed.data)
    } else {
      calculateFromData(parsedData)
    }
  }, [parsedData, rawData, parseData])

  const calculateFromData = (data: number[][]) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Small delay to show loading state
      setTimeout(() => {
        const params = calculateGeneticParameters(data, selectionIntensity)
        setResult(params)
        setIsLoading(false)
      }, 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed')
      setIsLoading(false)
    }
  }

  // Load sample data
  const loadSampleData = () => {
    setRawData(SAMPLE_DATA)
    const parsed = parseData(SAMPLE_DATA)
    if (parsed) {
      setParsedData(parsed.data)
      setGenotypeNames(parsed.names)
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
    
    const rows = [
      ['Parameter', 'Value', 'Interpretation'],
      ['Phenotypic Variance (σ²P)', result.phenotypicVariance.toFixed(4), 'Total observed variation'],
      ['Genotypic Variance (σ²g)', result.genotypicVariance.toFixed(4), 'Genetic contribution to variation'],
      ['Environmental Variance (σ²e)', result.environmentalVariance.toFixed(4), 'Environmental contribution'],
      ['GCV (%)', result.gcv.toFixed(2), result.gcv > 20 ? 'High' : result.gcv > 10 ? 'Medium' : 'Low'],
      ['PCV (%)', result.pcv.toFixed(2), '-'],
      ['Broad-sense Heritability (H²)', (result.broadSenseHeritability * 100).toFixed(2) + '%', 
       result.broadSenseHeritability >= 0.8 ? 'Very High' : 
       result.broadSenseHeritability >= 0.6 ? 'High' : 
       result.broadSenseHeritability >= 0.4 ? 'Moderate' : 'Low'],
      ['Heritability SE', result.heritabilitySE.toFixed(4), '-'],
      ['Genetic Advance', result.geneticAdvance.toFixed(4), '-'],
      ['Genetic Advance %', result.geneticAdvancePercent.toFixed(2) + '%',
       result.geneticAdvancePercent >= 20 ? 'Very High' : 
       result.geneticAdvancePercent >= 10 ? 'High' :
       result.geneticAdvancePercent >= 5 ? 'Moderate' : 'Low'],
      ['Trait Mean', result.traitMean.toFixed(4), '-'],
      ['Trait SD', result.traitSD.toFixed(4), '-'],
      ['', '', ''],
      ['Interpretation', result.interpretation, '']
    ]

    const csv = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'genetic_parameters.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Render gauge chart for heritability
  const renderHeritabilityGauge = (value: number) => {
    const percentage = Math.min(value * 100, 100)
    const color = value >= 0.8 ? '#22c55e' : value >= 0.6 ? '#84cc16' : value >= 0.4 ? '#eab308' : value >= 0.2 ? '#f97316' : '#ef4444'
    
    return (
      <div className="relative w-32 h-16 mx-auto">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M 10 55 A 50 50 0 ${percentage > 50 ? 1 : 0} 1 ${10 + (percentage / 100) * 100} ${55 - Math.sin((percentage / 100) * Math.PI) * 50}`}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Needle */}
          <line
            x1="60"
            y1="55"
            x2={60 + 40 * Math.cos(Math.PI - (percentage / 100) * Math.PI)}
            y2={55 - 40 * Math.sin((percentage / 100) * Math.PI)}
            stroke="#374151"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Center circle */}
          <circle cx="60" cy="55" r="5" fill="#374151" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="text-lg font-bold" style={{ color }}>{(value * 100).toFixed(1)}%</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Genetic Parameters Calculator
          </CardTitle>
          <CardDescription>
            Calculate variance components, heritability, and genetic advance from genotype × replication data
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
                <Label htmlFor="data-input">Enter your data (CSV format)</Label>
                <Textarea
                  id="data-input"
                  placeholder={`Genotype,Rep1,Rep2,Rep3\nG1,4520,4380,4610\nG2,3890,4020,3750\n...`}
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  className="mt-2 font-mono text-sm min-h-[150px]"
                />
              </div>
              <div className="flex gap-2">
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
                  Upload a CSV file with genotype × replication data
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

          {/* Selection Intensity */}
          <div className="mt-4 flex items-end gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="selection-intensity">Selection Intensity (K)</Label>
              <Input
                id="selection-intensity"
                type="number"
                step="0.01"
                value={selectionIntensity}
                onChange={(e) => setSelectionIntensity(parseFloat(e.target.value) || 2.06)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Default 2.06 for 5% selection intensity
              </p>
            </div>
            
            <Button 
              onClick={handleCalculate} 
              disabled={parsedData.length === 0 && !rawData.trim()}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Calculate Parameters
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2"
            >
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <span className="text-sm text-destructive">{error}</span>
            </motion.div>
          )}

          {/* Parsed Data Preview */}
          {parsedData.length > 0 && !result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-muted/30 rounded-lg"
            >
              <p className="text-sm font-medium mb-2">Data Preview:</p>
              <p className="text-xs text-muted-foreground">
                {genotypeNames.length} genotypes × {parsedData[0]?.length || 0} replications loaded
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
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Phenotypic Var.</p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{result.phenotypicVariance.toFixed(2)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Genotypic Var.</p>
                    <p className="text-xl font-bold text-green-900 dark:text-green-100">{result.genotypicVariance.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Heritability (H²)</p>
                    <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                      {(result.broadSenseHeritability * 100).toFixed(1)}%
                    </p>
                  </div>
                  {renderHeritabilityGauge(result.broadSenseHeritability)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Genetic Advance</p>
                    <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                      {result.geneticAdvancePercent.toFixed(1)}%
                    </p>
                  </div>
                  <Badge variant={result.geneticAdvancePercent >= 20 ? "default" : "secondary"}>
                    {result.geneticAdvancePercent >= 20 ? 'Very High' : 
                     result.geneticAdvancePercent >= 10 ? 'High' :
                     result.geneticAdvancePercent >= 5 ? 'Moderate' : 'Low'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Detailed Results</CardTitle>
                <CardDescription>Complete genetic parameter estimates</CardDescription>
              </div>
              <Button onClick={exportResults} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Parameter</th>
                      <th className="text-right py-3 px-4 font-medium">Value</th>
                      <th className="text-left py-3 px-4 font-medium">Formula / Description</th>
                      <th className="text-left py-3 px-4 font-medium">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs">σ²P</td>
                      <td className="py-3 px-4 text-right font-mono">{result.phenotypicVariance.toFixed(4)}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">σ²g + σ²e</td>
                      <td className="py-3 px-4">Total phenotypic variation</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs">σ²g</td>
                      <td className="py-3 px-4 text-right font-mono">{result.genotypicVariance.toFixed(4)}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">(MSg - MSe) / r</td>
                      <td className="py-3 px-4">Genetic component of variation</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs">σ²e</td>
                      <td className="py-3 px-4 text-right font-mono">{result.environmentalVariance.toFixed(4)}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">MSE</td>
                      <td className="py-3 px-4">Environmental/error variation</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30 bg-primary/5">
                      <td className="py-3 px-4 font-mono text-xs font-semibold">GCV (%)</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">{result.gcv.toFixed(2)}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">(σg / μ) × 100</td>
                      <td className="py-3 px-4">
                        <Badge variant={result.gcv > 20 ? "default" : "secondary"}>
                          {result.gcv > 20 ? 'High' : result.gcv > 10 ? 'Moderate' : 'Low'} variability
                        </Badge>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30 bg-primary/5">
                      <td className="py-3 px-4 font-mono text-xs font-semibold">PCV (%)</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">{result.pcv.toFixed(2)}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">(σp / μ) × 100</td>
                      <td className="py-3 px-4">Phenotypic coefficient of variation</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30 bg-primary/5">
                      <td className="py-3 px-4 font-mono text-xs font-semibold">H² (Broad-sense)</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">{(result.broadSenseHeritability * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">σ²g / σ²P</td>
                      <td className="py-3 px-4">
                        <Badge variant={
                          result.broadSenseHeritability >= 0.8 ? "default" : 
                          result.broadSenseHeritability >= 0.6 ? "secondary" : "outline"
                        }>
                          {result.broadSenseHeritability >= 0.8 ? 'Very High' : 
                           result.broadSenseHeritability >= 0.6 ? 'High' :
                           result.broadSenseHeritability >= 0.4 ? 'Moderate' : 'Low'}
                        </Badge>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs">SE(H²)</td>
                      <td className="py-3 px-4 text-right font-mono">{result.heritabilitySE.toFixed(4)}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">Approximate formula</td>
                      <td className="py-3 px-4">Standard error of heritability</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30 bg-primary/5">
                      <td className="py-3 px-4 font-mono text-xs font-semibold">GA</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">{result.geneticAdvance.toFixed(4)}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">K × H × σp</td>
                      <td className="py-3 px-4">Expected gain from selection</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30 bg-primary/5">
                      <td className="py-3 px-4 font-mono text-xs font-semibold">GA%</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">{result.geneticAdvancePercent.toFixed(2)}%</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">(GA / μ) × 100</td>
                      <td className="py-3 px-4">
                        <Badge variant={
                          result.geneticAdvancePercent >= 20 ? "default" : 
                          result.geneticAdvancePercent >= 10 ? "secondary" : "outline"
                        }>
                          {result.geneticAdvancePercent >= 20 ? 'Very High' : 
                           result.geneticAdvancePercent >= 10 ? 'High' :
                           result.geneticAdvancePercent >= 5 ? 'Moderate' : 'Low'}
                        </Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs">Mean (μ)</td>
                      <td className="py-3 px-4 text-right font-mono">{result.traitMean.toFixed(4)}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">Σx / N</td>
                      <td className="py-3 px-4">Grand mean of all observations</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono text-xs">SD (σ)</td>
                      <td className="py-3 px-4 text-right font-mono">{result.traitSD.toFixed(4)}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">√σ²P</td>
                      <td className="py-3 px-4">Phenotypic standard deviation</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* GCV vs PCV Bar Chart */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  GCV vs PCV Comparison
                </h4>
                <div className="flex items-end gap-8 h-48 justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      className="w-24 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg flex items-end justify-center pb-2 text-white font-bold text-sm"
                      style={{ height: `${Math.min(result.gcv / 50 * 100, 100)}%`, minHeight: '20px' }}
                    >
                      {result.gcv.toFixed(1)}%
                    </div>
                    <span className="text-xs font-medium">GCV</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      className="w-24 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg flex items-end justify-center pb-2 text-white font-bold text-sm"
                      style={{ height: `${Math.min(result.pcv / 50 * 100, 100)}%`, minHeight: '20px' }}
                    >
                      {result.pcv.toFixed(1)}%
                    </div>
                    <span className="text-xs font-medium">PCV</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  The difference between PCV and GCV indicates environmental influence on the trait.
                  {result.pcv - result.gcv > 5 && ' Large difference suggests significant environmental effect.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Interpretation Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-primary mb-2">Interpretation</h4>
                  <p className="text-sm leading-relaxed">{result.interpretation}</p>
                  
                  <div className="mt-4 p-3 bg-background rounded-lg">
                    <p className="text-xs font-medium mb-2">Study Information:</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span><strong>Genotypes:</strong> {result.genotypeCount}</span>
                      <span><strong>Replications:</strong> {result.replicationCount}</span>
                      <span><strong>Total obs:</strong> {result.genotypeCount * result.replicationCount}</span>
                      <span><strong>K value:</strong> {selectionIntensity}</span>
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
              <p className="text-sm text-muted-foreground">Calculating genetic parameters...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
