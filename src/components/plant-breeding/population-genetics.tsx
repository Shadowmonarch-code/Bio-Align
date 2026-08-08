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
  Microscope, 
  Upload, 
  FileText, 
  Download,
  Info,
  Dna,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { analyzePopulationGenetics, PopulationGeneticsResult } from '@/lib/statistics-engine'

interface PopulationGeneticsProps {
  className?: string
}

// Sample genotype data (diploid genotypes)
const SAMPLE_DATA = `AA,Aa,aa,AA,Aa,Aa,aa,aa,AA,Aa,AA,aa,Aa,AA,Aa,aa,aa,AA,Aa,Aa,aa,AA,Aa,aa`

export default function PopulationGeneticsAnalyzer({ className }: PopulationGeneticsProps) {
  const [rawData, setRawData] = useState('')
  const [parsedGenotypes, setParsedGenotypes] = useState<string[]>([])
  const [result, setResult] = useState<PopulationGeneticsResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Parse genotype data
  const parseData = useCallback((text: string): boolean => {
    try {
      // Support multiple formats: comma-separated, space-separated, or newline-separated
      let genotypes: string[] = []
      
      if (text.includes('\n')) {
        // Newline separated - each line is a genotype or multiple
        text.trim().split('\n').forEach(line => {
          const items = line.split(/[,\s]+/).filter(g => g.trim())
          genotypes.push(...items.map(g => g.trim().toUpperCase()))
        })
      } else if (text.includes(',')) {
        genotypes = text.split(',').map(g => g.trim().toUpperCase()).filter(g => g)
      } else {
        genotypes = text.split(/\s+/).map(g => g.trim().toUpperCase()).filter(g => g)
      }
      
      if (genotypes.length < 4) throw new Error('Need at least 4 genotypes for meaningful analysis')
      
      // Validate format - should be like AA, Aa, aa, AB, etc.
      for (const gt of genotypes) {
        const clean = gt.replace(/[^A-Za-z]/g, '')
        if (clean.length < 2 || clean.length > 2) {
          console.warn(`Unusual genotype format: ${gt}, attempting to continue`)
        }
      }
      
      setParsedGenotypes(genotypes)
      setError(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse data')
      return false
    }
  }, [])

  // Run analysis
  const handleAnalyze = useCallback(() => {
    if (parsedGenotypes.length === 0) {
      if (!parseData(rawData)) return
    }
    
    runAnalysis(parsedGenotypes)
  }, [parsedGenotypes, rawData, parseData])

  const runAnalysis = (genotypes: string[]) => {
    setIsLoading(true)
    setError(null)
    
    setTimeout(() => {
      try {
        const popResult: PopulationGeneticsResult = analyzePopulationGenetics(genotypes)
        setResult(popResult)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Population genetics analysis failed')
      }
      setIsLoading(false)
    }, 300)
  }

  // Load sample data
  const loadSampleData = () => {
    setRawData(SAMPLE_DATA)
    parseData(SAMPLE_DATA)
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

  // Export results
  const exportResults = () => {
    if (!result) return
    
    const rows = [
      ['Population Genetics Analysis Results'],
      [''],
      ['Allele Frequencies'],
      ...Object.entries(result.alleleFrequencies).map(([allele, freq]) => [allele, freq.toFixed(4)]),
      [''],
      ['Genotype Frequencies'],
      ...Object.entries(result.genotypeFrequencies).map(([gt, freq]) => [gt, freq.toFixed(4)]),
      [''],
      ['Diversity Measures', 'Value', 'Interpretation'],
      ['Expected Heterozygosity (He)', result.expectedHeterozygosity.toFixed(4), 'Gene diversity'],
      ['Observed Heterozygosity (Ho)', result.observedHeterozygosity.toFixed(4), 'Actual heterozygotes proportion'],
      ['Fixation Index (F)', result.fixationIndex.toFixed(4), result.fixationIndex > 0 ? 'Deficit' : 'Excess' || '-'],
      ['Genetic Diversity', result.geneticDiversity.toFixed(4), '-'],
      [''],
      ['Hardy-Weinberg Equilibrium Test'],
      ['Chi-square statistic', result.hardyWeinberg.chiSquare.toFixed(4)],
      ['Degrees of freedom', result.hardyWeinberg.df.toString()],
      ['In HWE?', result.hardyWeinberg.equilibrium ? 'Yes' : 'No']
    ]
    
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'population_genetics.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Render pie chart for allele frequencies
  const renderAllelePieChart = (): React.ReactNode => {
    if (!result) return null
    
    const alleles = Object.entries(result.alleleFrequencies)
    const total = alleles.reduce((sum, [, f]) => sum + f, 0)
    
    let currentAngle = -90 // Start from top
    const radius = 80
    const centerX = 100
    const centerY = 100
    
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    
    const paths = alleles.map(([allele, freq], i) => {
      const angleSpan = (freq / total) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angleSpan
      
      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)
      
      const largeArc = angleSpan > 180 ? 1 : 0
      
      const pathD = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
      
      // Label position
      const midAngle = startAngle + angleSpan / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + labelRadius * Math.cos((midAngle * Math.PI) / 180)
      const labelY = centerY + labelRadius * Math.sin((midAngle * Math.PI) / 180)
      
      currentAngle = endAngle
      
      return (
        <g key={allele}>
          <path d={pathD} fill={colors[i % colors.length]} stroke="white" strokeWidth="2" />
          {(freq / total) > 0.05 && (
            <>
              <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill="white">
                {allele}
              </text>
              <text x={labelX} y={labelY + 14} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="white">
                {(freq * 100).toFixed(1)}%
              </text>
            </>
          )}
        </g>
      )
    })
    
    return (
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
        {paths}
      </svg>
    )
  }

  // Render heterozygosity bar chart
  const renderHeterozygosityChart = (): React.ReactNode => {
    if (!result) return null
    
    const { expectedHeterozygosity, observedHeterozygosity } = result
    const maxVal = Math.max(expectedHeterozygosity, observedHeterozygosity, 0.5)
    const width = 250
    const height = 120
    const barHeight = 30
    const padding = 20
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-sm mx-auto">
        {/* Expected Heterozygosity */}
        <text x={padding} y={25} fontSize="11" fill="#374151" fontWeight="medium">Expected (He)</text>
        <rect 
          x={padding + 90} 
          y={10} 
          width={(expectedHeterozygosity / maxVal) * (width - padding - 100)} 
          height={barHeight - 5} 
          rx="4"
          fill="#22c55e"
        />
        <text x={padding + 95 + (expectedHeterozygosity / maxVal) * (width - padding - 100)} y={30} fontSize="11" fill="#22c55e" fontWeight="bold">
          {expectedHeterozygosity?.toFixed(3)}
        </text>
        
        {/* Observed Heterozygosity */}
        <text x={padding} y={70} fontSize="11" fill="#374151" fontWeight="medium">Observed (Ho)</text>
        <rect 
          x={padding + 90} 
          y={55} 
          width={(observedHeterozygosity / maxVal) * (width - padding - 100)} 
          height={barHeight - 5} 
          rx="4"
          fill="#3b82f6"
        />
        <text x={padding + 95 + (observedHeterozygosity / maxVal) * (width - padding - 100)} y={75} fontSize="11" fill="#3b82f6" fontWeight="bold">
          {observedHeterozygosity.toFixed(3)}
        </text>
        
        {/* Fixation Index */}
        <text x={padding} y={110} fontSize="11" fill="#374151" fontWeight="medium">Fixation (F)</text>
        <rect 
          x={padding + 90} 
          y={95} 
          width={(Math.abs(result.fixationIndex) / 1) * (width - padding - 100)} 
          height={barHeight - 5} 
          rx="4"
          fill={result.fixationIndex > 0 ? '#ef4444' : '#f59e0b'}
        />
        <text x={padding + 95 + (Math.abs(result.fixationIndex) / 1) * (width - padding - 100)} y={110} fontSize="11" fill={result.fixationIndex > 0 ? '#ef4444' : '#f59e0b'} fontWeight="bold">
          {result.fixationIndex.toFixed(3)}
        </text>
      </svg>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-primary" />
            Population Genetics Analyzer
          </CardTitle>
          <CardDescription>
            Analyze allele frequencies, test Hardy-Weinberg equilibrium, and compute diversity indices
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
                Upload File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="data-input">Enter diploid genotypes</Label>
                <Textarea
                  id="data-input"
                  placeholder={`Enter genotypes in any of these formats:
• Comma-separated: AA, Aa, aa, AA, Aa...
• Space-separated: AA Aa aa AA Aa...
• One per line:
  AA
  Aa
  aa
  
Supported formats: AA, Aa, aa, AB, etc.`}
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  className="mt-2 font-mono text-sm min-h-[140px]"
                />
              </div>

              <Button onClick={loadSampleData} variant="outline" size="sm">
                Load Sample Data (n=24)
              </Button>

              {parsedGenotypes.length > 0 && !result && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium mb-2">Parsed Genotypes ({parsedGenotypes.length}):</p>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {parsedGenotypes.slice(0, 30).map((gt, i) => (
                      <Badge key={i} variant="secondary" className="font-mono text-xs">{gt}</Badge>
                    ))}
                    {parsedGenotypes.length > 30 && (
                      <Badge variant="outline" className="text-xs">+{parsedGenotypes.length - 30} more</Badge>
                    )}
                  </div>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a file with genotype data (one per line or comma/space separated)
                </p>
                <Input type="file" accept=".csv,.txt,.gen" onChange={handleFileUpload} className="max-w-xs mx-auto" />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleAnalyze} disabled={!rawData.trim()} className="gap-2">
              <Dna className="h-4 w-4" />
              Analyze Population
            </Button>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <span className="text-sm text-destructive">{error}</span>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardContent className="pt-4">
                <p className="text-xs text-green-600 dark:text-green-400">Expected Het. (He)</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{result.expectedHeterozygosity.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground mt-1">Gene diversity</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="pt-4">
                <p className="text-xs text-blue-600 dark:text-blue-400">Observed Het. (Ho)</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{result.observedHeterozygosity.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground mt-1">Actual heterozygotes</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardContent className="pt-4">
                <p className="text-xs text-purple-600 dark:text-purple-400">Fixation Index (F)</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{result.fixationIndex.toFixed(4)}</p>
                <Badge variant={Math.abs(result.fixationIndex) < 0.05 ? "default" : "secondary"} className="mt-1">
                  {Math.abs(result.fixationIndex) < 0.05 ? 'Near equilibrium' : 'Deviation'}
                </Badge>
              </CardContent>
            </Card>
            
            <Card className={`bg-gradient-to-br ${
              result.hardyWeinberg.equilibrium 
                ? 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900'
                : 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900'
            }`}>
              <CardContent className="pt-4">
                <p className={`text-xs ${
                  result.hardyWeinberg.equilibrium 
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  Hardy-Weinberg
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">
                    {result.hardyWeinberg.equilibrium ? 'In Equilibrium' : 'Deviates'}
                  </p>
                  {result.hardyWeinberg.equilibrium 
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    : <XCircle className="h-5 w-5 text-red-500" />
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Allele Frequencies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Allele Frequencies</CardTitle>
                <CardDescription>Frequency of each allele in the population</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {renderAllelePieChart()}
                  
                  <div className="flex-1 space-y-2">
                    {Object.entries(result.alleleFrequencies).sort((a, b) => b[1] - a[1]).map(([allele, freq], i) => (
                      <div key={allele} className="flex items-center gap-3">
                        <span className="font-mono font-bold w-8">{allele}</span>
                        <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded transition-all"
                            style={{ width: `${freq * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-sm w-14 text-right">{(freq * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Genotype Frequencies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Genotype Frequencies</CardTitle>
                <CardDescription>Observed frequency of each genotype</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(result.genotypeFrequencies)
                    .sort((a, b) => b[1] - a[1])
                    .map(([gt, freq]) => {
                      const count = Math.round(freq * parsedGenotypes.length)
                      return (
                        <div key={gt} className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono w-12 justify-center">{gt}</Badge>
                          <div className="flex-1 h-7 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                            <div 
                              className={`h-full rounded transition-all ${
                                gt === gt[0] + gt[0].toLowerCase() || gt === gt.toUpperCase() 
                                  ? 'bg-blue-500' 
                                  : gt[0] !== gt[1]
                                    ? 'bg-green-500'
                                    : 'bg-orange-500'
                              }`}
                              style={{ width: `${freq * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-sm">{(freq * 100).toFixed(1)}%</span>
                            <span className="text-xs text-muted-foreground ml-1">(n={count})</span>
                          </div>
                        </div>
                      )
                    })}
                  
                  <div className="mt-4 pt-3 border-t text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                      Homozygous dominant
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-green-500 inline-block"></span>
                      Heterozygous
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-orange-500 inline-block"></span>
                      Homozygous recessive
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Diversity Measures */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">Diversity Measures & HWE Test</CardTitle>
                <CardDescription>Population genetic statistics and equilibrium testing</CardDescription>
              </div>
              <Button onClick={exportResults} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-4 text-center">Diversity Indices Comparison</h4>
                  {renderHeterozygosityChart()}
                </div>
                
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-medium">Parameter</th>
                        <th className="text-right py-3 px-4 font-medium">Value</th>
                        <th className="text-left py-3 px-4 font-medium">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono text-xs">Expected Het. (He)</td>
                        <td className="py-3 px-4 text-right font-mono">{result.expectedHeterozygosity.toFixed(6)}</td>
                        <td className="py-3 px-4 text-xs">Gene diversity under HWE</td>
                      </tr>
                      <tr className="border-b hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono text-xs">Observed Het. (Ho)</td>
                        <td className="py-3 px-4 text-right font-mono">{result.observedHeterozygosity.toFixed(6)}</td>
                        <td className="py-3 px-4 text-xs">Actual heterozygote proportion</td>
                      </tr>
                      <tr className="border-b hover:bg-muted/30 bg-primary/5">
                        <td className="py-3 px-4 font-mono text-xs font-semibold">Fixation Index (F)</td>
                        <td className={`py-3 px-4 text-right font-mono font-semibold ${
                          result.fixationIndex > 0 ? 'text-red-600' : result.fixationIndex < 0 ? 'text-blue-600' : ''
                        }`}>
                          {result.fixationIndex.toFixed(6)}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {result.fixationIndex > 0.05 ? 'Heterozygote deficit (possible inbreeding)' :
                           result.fixationIndex < -0.05 ? 'Heterozygote excess (possible selection)' :
                           'Near random mating'}
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono text-xs">Genetic Diversity</td>
                        <td className="py-3 px-4 text-right font-mono">{result.geneticDiversity.toFixed(6)}</td>
                        <td className="py-3 px-4 text-xs">Nei's gene diversity</td>
                      </tr>
                      <tr className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono text-xs font-semibold">Sample Size</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold">{parsedGenotypes.length}</td>
                        <td className="py-3 px-4 text-xs">Number of individuals</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* HWE Test Details */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Hardy-Weinberg Equilibrium Test Details
                </h4>
                
                <div className={`p-4 rounded-lg ${
                  result.hardyWeinberg.equilibrium 
                    ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-start gap-3">
                    {result.hardyWeinberg.equilibrium 
                      ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                      : <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    }
                    
                    <div>
                      <p className="font-medium">
                        {result.hardyWeinberg.equilibrium 
                          ? 'Population is in Hardy-Weinberg Equilibrium'
                          : 'Population deviates from Hardy-Weinberg Equilibrium'
                        }
                      </p>
                      
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Chi-square:</span>
                          <span className="ml-2 font-mono font-medium">{result.hardyWeinberg.chiSquare.toFixed(4)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">df:</span>
                          <span className="ml-2 font-mono font-medium">{result.hardyWeinberg.df}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">p-value:</span>
                          <span className="ml-2 font-mono font-medium">
                            {result.hardyWeinberg.pValue ? '> 0.05' : '< 0.05'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Conclusion:</span>
                          <span className="ml-2 font-medium">
                            {result.hardyWeinberg.equilibrium ? 'Accept H₀' : 'Reject H₀'}
                          </span>
                        </div>
                      </div>
                      
                      {!result.hardyWeinberg.equilibrium && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Deviation from HWE may indicate non-random mating, selection, genetic drift, 
                          or other evolutionary forces acting on this locus.
                        </p>
                      )}
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
              <p className="text-sm text-muted-foreground">Analyzing population genetics...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
