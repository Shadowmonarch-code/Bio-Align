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
  ListChecks, 
  Upload, 
  FileText, 
  Download,
  Info,
  Trophy,
  AlertCircle
} from 'lucide-react'
import { calculateSelectionIndex, SelectionIndexResult } from '@/lib/statistics-engine'

interface SelectionIndexProps {
  className?: string
}

// Sample data for selection index
const SAMPLE_DATA = `Genotype,Yield,PlantHeight,PanicleLength,1000GrainWt
G1,4.8,105,24,22.5
G2,3.9,92,21,20.1
G3,4.3,98,23,21.8
G4,3.7,88,20,19.5
G5,5.2,112,26,24.2
G6,4.5,101,23,22.0
G7,3.4,85,19,18.8
G8,4.2,96,22,21.2
G9,5.5,115,27,25.0
G10,4.6,99,24,22.3`

export default function SelectionIndexCalculator({ className }: SelectionIndexProps) {
  const [rawData, setRawData] = useState('')
  const [parsedData, setParsedData] = useState<number[][]>([])
  const [genotypeNames, setGenotypeNames] = useState<string[]>([])
  const [traitNames, setTraitNames] = useState<string[]>([])
  
  // Method and weights
  const [method, setMethod] = useState<'smith' | 'base' | 'desired'>('base')
  const [weights, setWeights] = useState<Record<string, number>>({})
  const [economicWeights, setEconomicWeights] = useState<Record<string, number>>({})
  const [desiredGains, setDesiredGains] = useState<Record<string, number>>({})
  const [selectionIntensity, setSelectionIntensity] = useState(20) // % selected
  
  // Results
  const [result, setResult] = useState<SelectionIndexResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Parse CSV data
  const parseData = useCallback((text: string): boolean => {
    try {
      const lines = text.trim().split('\n').filter(line => line.trim())
      if (lines.length < 3) throw new Error('Need at least header + 2 genotypes')

      const headers = lines[0].split(',').map(h => h.trim())
      const traits = headers.slice(1)
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
      setTraitNames(traits)
      setParsedData(data)
      
      // Set default equal weights
      const defaultWeights: Record<string, number> = {}
      traits.forEach(t => defaultWeights[t] = 1)
      setWeights(defaultWeights)
      
      setError(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse data')
      return false
    }
  }, [])

  // Run selection index calculation
  const handleCalculate = useCallback(() => {
    if (parsedData.length === 0) {
      if (!parseData(rawData)) return
    }
    
    runCalculation(parsedData, traitNames, genotypeNames)
  }, [parsedData, rawData, traitNames, genotypeNames, parseData])

  const runCalculation = (data: number[][], traits: string[], genotypes: string[]) => {
    setIsLoading(true)
    setError(null)
    
    setTimeout(() => {
      try {
        // Build weights array in correct order
        const weightArray = traits.map(t => weights[t] || 1)
        const econWeightArray = traits.map(t => economicWeights[t] || weights[t] || 1)
        const desiredGainArray = traits.map(t => desiredGains[t] || 0)
        
        const indexResult: SelectionIndexResult = calculateSelectionIndex(data, weightArray, {
          genotypeNames: genotypes,
          traitNames: traits,
          economicWeights: econWeightArray,
          desiredGains: method === 'desired' ? desiredGainArray : undefined,
          method
        })
        
        setResult(indexResult)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Selection index calculation failed')
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

  // Update weight for a trait
  const updateWeight = (trait: string, value: number) => {
    setWeights(prev => ({ ...prev, [trait]: value }))
  }

  // Update economic weight
  const updateEconomicWeight = (trait: string, value: number) => {
    setEconomicWeights(prev => ({ ...prev, [trait]: value }))
  }

  // Update desired gain
  const updateDesiredGain = (trait: string, value: number) => {
    setDesiredGains(prev => ({ ...prev, [trait]: value }))
  }

  // Export results
  const exportResults = () => {
    if (!result) return
    
    const rows = [
      ['Selection Index Results'],
      [`Method`, method.toUpperCase()],
      [`Selection Intensity`, `${selectionIntensity}%`],
      [`Number Selected`, result.selectedGenotypes.length.toString()],
      [''],
      ['Rank', 'Genotype', 'Index Value', ...result.criteria.map(c => c.trait), 'Decision']
    ]
    
    // Sort by rank
    const sortedIndices = result.ranks
      .map((rank, idx) => ({ rank, idx }))
      .sort((a, b) => a.rank - b.rank)
    
    sortedIndices.forEach(({ rank, idx }) => {
      const isSelected = result.selectedGenotypes.includes(result.genotypes[idx])
      rows.push([
        rank.toString(),
        result.genotypes[idx],
        result.indexValues[idx].toFixed(4),
        ...result.traitValues[idx].map(v => v.toFixed(2)),
        isSelected ? 'SELECTED' : ''
      ])
    })
    
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `selection_index_${method}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Selection Index Calculator
          </CardTitle>
          <CardDescription>
            Calculate multi-trait selection index to identify superior genotypes
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
                  placeholder={`Genotype,Trait1,Trait2,Trait3\nG1,45,120,8.5\nG2,52,135,7.8\n...`}
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  className="mt-2 font-mono text-sm min-h-[120px]"
                />
              </div>

              <Button onClick={loadSampleData} variant="outline" size="sm">
                Load Sample Data
              </Button>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <Input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="max-w-xs mx-auto" />
              </div>
            </TabsContent>
          </Tabs>

          {/* Method & Weights Section */}
          {parsedData.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-6 border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Method Selection */}
                <div>
                  <Label>Selection Index Method</Label>
                  <Select value={method} onValueChange={(v) => setMethod(v as typeof method)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base">Base Index (Simple Weighted Sum)</SelectItem>
                      <SelectItem value="smith">Smith's Index (Optimal)</SelectItem>
                      <SelectItem value="desired">Desired Gains Index</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {method === 'base' && 'Simple weighted sum of standardized trait values'}
                    {method === 'smith' && 'Uses phenotypic variance-covariance matrix for optimal weights'}
                    {method === 'desired' && 'Weights adjusted to achieve target genetic gains per trait'}
                  </p>
                </div>

                {/* Selection Intensity */}
                <div>
                  <Label htmlFor="selection-intensity">Selection Intensity (%)</Label>
                  <Input
                    id="selection-intensity"
                    type="number"
                    min="5"
                    max="50"
                    step="5"
                    value={selectionIntensity}
                    onChange={(e) => setSelectionIntensity(parseInt(e.target.value) || 20)}
                    className="mt-2 max-w-[150px]"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Top {selectionIntensity}% of genotypes will be selected
                  </p>
                </div>
              </div>

              {/* Trait Weights */}
              <div>
                <Label>Trait Weights (Relative Importance)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  {traitNames.map(trait => (
                    <div key={trait} className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium truncate">{trait}</p>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={weights[trait] || 1}
                        onChange={(e) => updateWeight(trait, parseFloat(e.target.value) || 0)}
                        className="mt-1 h-9"
                      />
                      
                      {(method === 'smith') && (
                        <div className="mt-2">
                          <p className="text-[10px] text-muted-foreground">Economic Weight</p>
                          <Input
                            type="number"
                            step="0.01"
                            value={economicWeights[trait] || weights[trait] || 1}
                            onChange={(e) => updateEconomicWeight(trait, parseFloat(e.target.value) || 0)}
                            className="mt-1 h-7 text-xs"
                          />
                        </div>
                      )}
                      
                      {method === 'desired' && (
                        <div className="mt-2">
                          <p className="text-[10px] text-muted-foreground">Desired Gain (%)</p>
                          <Input
                            type="number"
                            step="1"
                            value={desiredGains[trait] || 0}
                            onChange={(e) => updateDesiredGain(trait, parseFloat(e.target.value) || 0)}
                            className="mt-1 h-7 text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Weight visualization */}
                <div className="flex items-end gap-2 mt-4 h-16 px-4 bg-background rounded-lg border">
                  {traitNames.map(trait => {
                    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
                    const pct = ((weights[trait] || 1) / totalWeight) * 100
                    return (
                      <div key={trait} className="flex flex-col items-center gap-1 flex-1">
                        <div 
                          className="w-full max-w-[40px] bg-gradient-to-t from-primary to-primary/60 rounded-t"
                          style={{ height: `${Math.max(pct * 0.5, 5)}px` }}
                        ></div>
                        <span className="text-[9px] text-muted-foreground truncate w-full text-center">{pct.toFixed(0)}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleCalculate}
              disabled={!rawData.trim() || parsedData.length === 0}
              className="gap-2"
            >
              <Trophy className="h-4 w-4" />
              Calculate Selection Index
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
              <CardContent className="pt-4">
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Total Genotypes</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{result.genotypes.length}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardContent className="pt-4">
                <p className="text-xs text-green-600 dark:text-green-400">Selected Genotypes</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{result.selectedGenotypes.length}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="pt-4">
                <p className="text-xs text-blue-600 dark:text-blue-400">Best Index Value</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {Math.max(...result.indexValues).toFixed(4)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardContent className="pt-4">
                <p className="text-xs text-purple-600 dark:text-purple-400">Method Used</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100 capitalize">{method}</p>
              </CardContent>
            </Card>
          </div>

          {/* Ranked Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">Ranked Genotypes by Selection Index</CardTitle>
                <CardDescription>
                  Top {result.selectedGenotypes.length} genotypes selected ({selectionIntensity}% intensity)
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
                      <th className="text-left py-3 px-4 font-medium sticky left-0 bg-background">Rank</th>
                      <th className="text-left py-3 px-4 font-medium sticky left-0 bg-background">Genotype</th>
                      <th className="text-right py-3 px-4 font-medium bg-primary/5">Index Value</th>
                      {result.criteria.map((c, i) => (
                        <th key={i} className="text-right py-3 px-4 font-medium text-xs">{c.trait}</th>
                      ))}
                      <th className="text-center py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.ranks
                      .map((rank, idx) => ({ rank, idx }))
                      .sort((a, b) => a.rank - b.rank)
                      .map(({ rank, idx }) => {
                        const isSelected = result.selectedGenotypes.includes(result.genotypes[idx])
                        const isTop3 = rank <= 3
                        
                        return (
                          <tr 
                            key={idx} 
                            className={`border-b hover:bg-muted/30 ${
                              isTop3 ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''
                            } ${isSelected ? 'border-l-4 border-l-green-500' : ''}`}
                          >
                            <td className={`py-3 px-4 font-mono ${isTop3 ? 'font-bold text-primary' : ''}`}>
                              {rank}
                              {isTop3 && <Trophy className="inline h-4 w-4 ml-1 text-yellow-500" />}
                            </td>
                            <td className="py-3 px-4 font-medium">{result.genotypes[idx]}</td>
                            <td className={`py-3 px-4 text-right font-mono font-semibold ${
                              rank <= Math.ceil(result.genotypes.length * selectionIntensity / 100)
                                ? 'text-green-600 dark:text-green-400'
                                : ''
                            }`}>
                              {result.indexValues[idx].toFixed(4)}
                            </td>
                            {result.traitValues[idx].map((val, j) => (
                              <td key={j} className="py-3 px-4 text-right font-mono text-xs">
                                {val.toFixed(2)}
                              </td>
                            ))}
                            <td className="py-3 px-4 text-center">
                              {isSelected ? (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                  SELECTED
                                </Badge>
                              ) : (
                                <Badge variant="secondary">-</Badge>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>

              {/* Selected Genotypes Summary */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Selected Genotypes for Advancement
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.selectedGenotypes.map(g => (
                    <Badge key={g} variant="default" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-1 px-3">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Index Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selection Index Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-around gap-1 px-4">
                {result.indexValues
                  .map((val, idx) => ({ val, idx, rank: result.ranks[idx] }))
                  .sort((a, b) => a.rank - b.rank)
                  .map(({ val, idx }) => {
                    const isSelected = result.selectedGenotypes.includes(result.genotypes[idx])
                    const maxVal = Math.max(...result.indexValues)
                    const minVal = Math.min(...result.indexValues)
                    const range = maxVal - minVal || 1
                    const heightPct = ((val - minVal) / range) * 80 + 20
                    
                    return (
                      <div 
                        key={idx}
                        className="flex flex-col items-center gap-1 group relative"
                      >
                        <div 
                          className={`w-6 rounded-t transition-all ${
                            isSelected 
                              ? 'bg-gradient-to-t from-green-600 to-green-400' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          style={{ height: `${heightPct}px` }}
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded whitespace-nowrap z-10">
                            {result.genotypes[idx]}: {val.toFixed(4)} (Rank #{result.ranks[idx]})
                          </div>
                        </div>
                        <span className="text-[8px] text-muted-foreground transform -rotate-45 origin-top-left translate-x-1">
                          {result.genotypes[idx]}
                        </span>
                      </div>
                    )
                  })}
              </div>
              
              <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gradient-to-t from-green-600 to-green-400"></span>
                  Selected
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-gray-300"></span>
                  Not Selected
                </span>
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
              <p className="text-sm text-muted-foreground">Calculating selection index...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
