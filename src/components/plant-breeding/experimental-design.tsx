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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FlaskConical, 
  Upload, 
  FileText, 
  Download,
  Info,
  Table2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { analyzeCRD, CRDResult, analyzeRCBD, RBCDResult, twoWayANOVA, TwoWayANOVAResult } from '@/lib/statistics-engine'

interface ExperimentalDesignProps {
  className?: string
}

type DesignType = 'CRD' | 'RCBD' | 'Factorial'

// Sample data for each design type
const SAMPLE_CRD_DATA = `Treatment,Rep1,Rep2,Rep3,Rep4
T1,25.3,24.8,26.1,25.5
T2,32.4,31.9,33.2,32.7
T3,28.6,29.1,27.8,28.3
T4,35.2,34.8,36.1,35.5
T5,22.1,22.6,21.9,22.4`

const SAMPLE_RCBD_DATA = `Treatment,Block1,Block2,Block3,Block4
VarietyA,45.2,47.1,44.8,46.3
VarietyB,52.3,54.1,51.8,53.5
VarietyC,38.7,40.2,37.9,39.4
VarietyD,48.9,50.5,47.6,49.8
VarietyE,42.1,43.8,41.5,43.2`

const SAMPLE_FACTORIAL_DATA = `Data (Factor A rows × Factor B columns):
N0P0,N0P1,N0P2
24.5,28.3,31.2
N1P0,N1P1,N1P2
32.4,38.6,42.1
N2P0,N2P1,N2P2
35.8,42.3,46.7`

export default function ExperimentalDesignAnalyzer({ className }: ExperimentalDesignProps) {
  const [designType, setDesignType] = useState<DesignType>('CRD')
  const [rawData, setRawData] = useState('')
  const [result, setResult] = useState<CRDResult | RBCDResult | TwoWayANOVAResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // RCBD specific
  const [blockNames, setBlockNames] = useState('Block1,Block2,Block3,Block4')
  
  // Factorial specific
  const [factorANames, setFactorANames] = useState('N0,N1,N2')
  const [factorBNames, setFactorBNames] = useState('P0,P1,P2')

  // Parse CRD data
  const parseCRDData = (text: string): number[][] => {
    const lines = text.trim().split('\n').filter(line => line.trim())
    if (lines.length < 3) throw new Error('Need at least header + 2 treatments')
    
    const data: number[][] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const rowValues = values.slice(1).map(v => parseFloat(v))
      
      if (rowValues.some(v => isNaN(v))) {
        throw new Error(`Invalid number in row ${i + 1}`)
      }
      data.push(rowValues)
    }
    
    return data
  }

  // Parse RCBD data (same format as CRD but with blocks as replications)
  const parseRCBDData = (text: string): number[][] => {
    return parseCRDData(text)
  }

  // Parse Factorial data
  const parseFactorialData = (text: string): number[][] => {
    // Remove header line if present and parse numeric values only
    const lines = text.trim().split('\n').filter(line => {
      const trimmed = line.trim()
      return trimmed && !trimmed.startsWith('Data') && !trimmed.includes(',')
    })
    
    // Try to extract numbers from the text
    const numbers: number[] = []
    const numRegex = /-?\d+\.?\d*/g
    let match
    
    for (const line of lines) {
      while ((match = numRegex.exec(line)) !== null) {
        const num = parseFloat(match[0])
        if (!isNaN(num)) {
          numbers.push(num)
        }
      }
    }
    
    if (numbers.length === 0) throw new Error('No valid numbers found')
    
    // Determine grid size from factor names
    const aLevels = factorANames.split(',').filter(n => n.trim()).length
    const bLevels = factorBNames.split(',').filter(n => n.trim()).length
    
    if (numbers.length < aLevels * bLevels) {
      throw new Error(`Expected at least ${aLevels * bLevels} values for ${aLevels}×${bLevels} factorial`)
    }
    
    // Reshape to 2D array
    const data: number[][] = []
    for (let i = 0; i < aLevels; i++) {
      data.push(numbers.slice(i * bLevels, (i + 1) * bLevels))
    }
    
    return data
  }

  // Run analysis
  const handleAnalyze = useCallback(() => {
    setIsLoading(true)
    setError(null)
    
    try {
      setTimeout(() => {
        try {
          switch (designType) {
            case 'CRD': {
              const data = parseCRDData(rawData)
              const crdResult = analyzeCRD(data)
              setResult(crdResult)
              break
            }
            case 'RCBD': {
              const data = parseRCBDData(rawData)
              const blocks = blockNames.split(',').map(b => b.trim()).filter(b => b)
              if (blocks.length === 0) throw new Error('Please specify block names')
              const rcbdResult = analyzeRCBD(data, blocks)
              setResult(rcbdResult)
              break
            }
            case 'Factorial': {
              const data = parseFactorialData(rawData)
              const factorA = factorANames.split(',').map(f => f.trim()).filter(f => f)
              const factorB = factorBNames.split(',').map(f => f.trim()).filter(f => f)
              if (factorA.length === 0 || factorB.length === 0) {
                throw new Error('Please specify factor level names')
              }
              const factResult = twoWayANOVA(data, factorA, factorB)
              setResult(factResult)
              break
            }
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Analysis failed')
        }
        setIsLoading(false)
      }, 300)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setIsLoading(false)
    }
  }, [designType, rawData, blockNames, factorANames, factorBNames])

  // Load sample data
  const loadSampleData = () => {
    setError(null)
    setResult(null)
    
    switch (designType) {
      case 'CRD':
        setRawData(SAMPLE_CRD_DATA)
        break
      case 'RCBD':
        setRawData(SAMPLE_RCBD_DATA)
        break
      case 'Factorial':
        setRawData(SAMPLE_FACTORIAL_DATA)
        break
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setRawData(e.target?.result as string)
    }
    reader.readAsText(file)
  }

  // Export ANOVA table as CSV
  const exportResults = () => {
    if (!result) return
    
    const headers = ['Source', 'df', 'SS', 'MS', 'F', 'p-value', 'Sig.']
    const rows = result.source.map((source, i) => [
      source,
      result.df[i]?.toString() || '',
      result.ss[i]?.toFixed(4) || '',
      result.ms[i]?.toFixed(4) || '',
      result.f[i]?.toFixed(4) || '',
      result.pValue[i] !== undefined && result.pValue[i] !== null ? result.pValue[i].toFixed(4) : '',
      result.significance[i] || ''
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${designType.toLowerCase()}_anova_results.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Get significance color
  const getSignificanceColor = (sig: string) => {
    switch (sig) {
      case '***': return 'text-red-600 dark:text-red-400 font-bold'
      case '**': return 'text-orange-600 dark:text-orange-400 font-semibold'
      case '*': return 'text-yellow-600 dark:text-yellow-400'
      case '.': return 'text-muted-foreground'
      default: return ''
    }
  }

  // Render additional stats based on design type
  const renderAdditionalStats = () => {
    if (!result) return null
    
    if ('cv' in result && typeof result.cv === 'number') {
      // CRD or RCBD
      const r = result as CRDResult & RBCDResult
      
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Coefficient of Variation</p>
              <p className="text-xl font-bold">{r.cv.toFixed(2)}%</p>
              <Badge variant={r.cv <= 10 ? "default" : r.cv <= 20 ? "secondary" : "destructive"}>
                {r.cv <= 10 ? 'Excellent' : r.cv <= 20 ? 'Acceptable' : 'High'}
              </Badge>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">LSD (α=0.05)</p>
              <p className="text-xl font-bold">{r.lsd.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">For mean separation</p>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Grand Mean</p>
              <p className="text-xl font-bold">{result.grandMean.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">Overall mean response</p>
            </CardContent>
          </Card>
        </div>
      )
    }
    
    return null
  }

  // Render treatment means comparison
  const renderTreatmentMeans = () => {
    if (!result) return null
    
    if ('treatmentMeans' in result && Array.isArray(result.treatmentMeans)) {
      const r = result as CRDResult & RBCDResult
      const lsd = r.lsd || 0
      
      // Sort by means descending
      const sortedMeans = r.treatmentMeans
        .map((mean, idx) => ({ mean, idx }))
        .sort((a, b) => b.mean - a.mean)
      
      return (
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            Treatment Means Comparison (LSD = {lsd.toFixed(3)})
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Rank</th>
                  <th className="text-left py-2 px-3 font-medium">Treatment</th>
                  <th className="text-right py-2 px-3 font-medium">Mean</th>
                  <th className="text-center py-2 px-3 font-medium">Group*</th>
                </tr>
              </thead>
              <tbody>
                {sortedMeans.map(({ mean, idx }, rank) => (
                  <tr key={idx} className="border-b hover:bg-muted/30">
                    <td className="py-2 px-3">{rank + 1}</td>
                    <td className="py-2 px-3 font-medium">T{idx + 1}</td>
                    <td className="py-2 px-3 text-right font-mono">{mean.toFixed(4)}</td>
                    <td className="py-2 px-3 text-center">
                      <Badge variant={rank < 3 ? "default" : "secondary"}>
                        {rank < 3 ? 'A' : rank < 6 ? 'B' : 'C'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * Groups based on LSD test. Treatments sharing same letter are not significantly different.
          </p>
        </div>
      )
    }
    
    return null
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Experimental Design Analyzer
          </CardTitle>
          <CardDescription>
            Analyze CRD, RCBD, or Factorial experiments with complete ANOVA tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Design Type Selector */}
          <div className="mb-6">
            <Label>Experimental Design Type</Label>
            <Select value={designType} onValueChange={(v) => setDesignType(v as DesignType)}>
              <SelectTrigger className="mt-2 max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CRD">
                  <span className="flex items-center gap-2">
                    <span className="font-medium">CRD</span>
                    <span className="text-muted-foreground text-sm">- Completely Randomized Design</span>
                  </span>
                </SelectItem>
                <SelectItem value="RCBD">
                  <span className="flex items-center gap-2">
                    <span className="font-medium">RCBD</span>
                    <span className="text-muted-foreground text-sm">- Randomized Complete Block Design</span>
                  </span>
                </SelectItem>
                <SelectItem value="Factorial">
                  <span className="flex items-center gap-2">
                    <span className="font-medium">Factorial</span>
                    <span className="text-muted-foreground text-sm">- Two-Way Factorial Design</span>
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                <Label htmlFor="data-input">
                  Enter your data ({designType} format)
                </Label>
                <Textarea
                  id="data-input"
                  placeholder={
                    designType === 'CRD' ? 
                      `Treatment,Rep1,Rep2,Rep3\nT1,25.3,24.8,26.1\nT2,32.4,31.9,33.2` :
                    designType === 'RCBD' ?
                      `Treatment,Block1,Block2,Block3\nVarA,45.2,47.1,44.8\nVarB,52.3,54.1,51.8` :
                      `Enter values row by row:\n24.5,28.3,31.2\n32.4,38.6,42.1`
                  }
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  className="mt-2 font-mono text-sm min-h-[120px]"
                />
              </div>

              {/* Factorial specific inputs */}
              {designType === 'Factorial' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="factor-a">Factor A Levels (comma-separated)</Label>
                    <Input
                      id="factor-a"
                      value={factorANames}
                      onChange={(e) => setFactorANames(e.target.value)}
                      placeholder="N0,N1,N2"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="factor-b">Factor B Levels (comma-separated)</Label>
                    <Input
                      id="factor-b"
                      value={factorBNames}
                      onChange={(e) => setFactorBNames(e.target.value)}
                      placeholder="P0,P1,P2"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* RCBD specific input */}
              {designType === 'RCBD' && (
                <div>
                  <Label htmlFor="block-names">Block Names (comma-separated)</Label>
                  <Input
                    id="block-names"
                    value={blockNames}
                    onChange={(e) => setBlockNames(e.target.value)}
                    placeholder="Block1,Block2,Block3,Block4"
                    className="mt-1 max-w-md"
                  />
                </div>
              )}

              <Button onClick={loadSampleData} variant="outline" size="sm">
                Load Sample Data
              </Button>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a CSV file with your experimental data
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

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleAnalyze} 
              disabled={!rawData.trim()}
              className="gap-2"
            >
              <FlaskConical className="h-4 w-4" />
              Run ANOVA Analysis
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
          {/* Additional Stats */}
          {renderAdditionalStats()}

          {/* ANOVA Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">
                  {designType} ANOVA Table
                </CardTitle>
                <CardDescription>
                  Analysis of Variance results ({result.totalObservations} total observations)
                </CardDescription>
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
                      <th className="text-left py-3 px-4 font-medium">Source of Variation</th>
                      <th className="text-right py-3 px-4 font-medium">df</th>
                      <th className="text-right py-3 px-4 font-medium">Sum of Squares</th>
                      <th className="text-right py-3 px-4 font-medium">Mean Square</th>
                      <th className="text-right py-3 px-4 font-medium">F-value</th>
                      <th className="text-right py-3 px-4 font-medium">p-value</th>
                      <th className="text-center py-3 px-4 font-medium">Significance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.source.map((source, i) => (
                      <tr 
                        key={i}
                        className={`border-b hover:bg-muted/30 ${
                          source !== 'Total' && result.pValue[i] !== null && result.pValue[i] !== undefined && result.pValue[i] < 0.05
                            ? 'bg-green-50 dark:bg-green-950/20'
                            : ''
                        }`}
                      >
                        <td className={`py-3 px-4 font-medium ${
                          source === 'Treatment' || source === 'Treatments' || source === 'Factor A' || source === 'Factor B'
                            ? 'text-primary'
                            : source === 'Error'
                            ? 'text-muted-foreground'
                            : ''
                        }`}>
                          {source}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">{result.df[i]}</td>
                        <td className="py-3 px-4 text-right font-mono">{result.ss[i]?.toFixed(4) || '-'}</td>
                        <td className="py-3 px-4 text-right font-mono">{result.ms[i]?.toFixed(4) || '-'}</td>
                        <td className={`py-3 px-4 text-right font-mono ${
                          result.f[i] ? (result.f[i] >= 3.84 ? 'text-primary font-semibold' : '') : ''
                        }`}>
                          {result.f[i]?.toFixed(4) || '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {result.pValue[i] !== undefined && result.pValue[i] !== null
                            ? result.pValue[i] < 0.001 ? '<0.001' : result.pValue[i].toFixed(4)
                            : '-'}
                        </td>
                        <td className={`py-3 px-4 text-center ${getSignificanceColor(result.significance[i])}`}>
                          {result.significance[i] || '-'}
                          {result.pValue[i] !== undefined && result.pValue[i] !== null && result.pValue[i] < 0.05 && (
                            <CheckCircle2 className="inline h-4 w-4 ml-1 text-green-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Assumptions Check */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Analysis Assumptions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Independence</p>
                      <p className="text-xs text-muted-foreground">Random assignment assumed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Normality</p>
                      <p className="text-xs text-muted-foreground">Residuals ~ Normal (assumed)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Homogeneity</p>
                      <p className="text-xs text-muted-foreground">Equal variances (assumed)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Additivity</p>
                      <p className="text-xs text-muted-foreground">Model is additive</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Means Comparison */}
          {renderTreatmentMeans()}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-sm text-muted-foreground">Running {designType} analysis...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
