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
  ArrowRightLeft, 
  Upload, 
  FileText, 
  Download,
  Info,
  GitBranch,
  AlertCircle
} from 'lucide-react'
import { pathAnalysis, PathAnalysisResult, pearsonCorrelation, CorrelationResult } from '@/lib/statistics-engine'

interface PathAnalysisProps {
  className?: string
}

// Sample correlation matrix data (can be raw data or pre-computed correlation)
const SAMPLE_RAW_DATA = `Genotype,Yield,PlantHeight,Biomass,Tillers,GrainWeight
G1,4.8,105,45,12,22.5
G2,3.9,92,38,10,20.1
G3,4.3,98,42,11,21.8
G4,3.7,88,35,9,19.5
G5,5.2,112,52,14,24.2
G6,4.5,101,44,11,22.0
G7,3.4,85,33,8,18.8
G8,4.2,96,41,10,21.2
G9,5.5,115,55,15,25.0
G10,4.6,99,43,11,22.3`

export default function PathAnalysisComponent({ className }: PathAnalysisProps) {
  const [rawData, setRawData] = useState('')
  const [parsedData, setParsedData] = useState<number[][]>([])
  const [variableNames, setVariableNames] = useState<string[]>([])
  const [dependentVar, setDependentVar] = useState('Yield')
  const [result, setResult] = useState<PathAnalysisResult | null>(null)
  const [corrMatrix, setCorrMatrix] = useState<number[][] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Parse CSV data
  const parseData = useCallback((text: string): boolean => {
    try {
      const lines = text.trim().split('\n').filter(line => line.trim())
      if (lines.length < 4) throw new Error('Need at least header + 3 observations for reliable estimates')

      const headers = lines[0].split(',').map(h => h.trim())
      const names = headers.slice(1)
      const data: number[][] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const rowValues = values.slice(1).map(v => parseFloat(v))
        
        if (rowValues.some(v => isNaN(v))) {
          throw new Error(`Invalid number in row ${i + 1}`)
        }
        data.push(rowValues)
      }

      setVariableNames(names)
      setParsedData(data)
      
      if (!dependentVar && names.length > 0) {
        setDependentVar(names[0])
      }
      
      setError(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse data')
      return false
    }
  }, [dependentVar])

  // Run path analysis
  const handleAnalyze = useCallback(() => {
    if (parsedData.length === 0) {
      if (!parseData(rawData)) return
    }
    
    runPathAnalysis(parsedData, variableNames)
  }, [parsedData, rawData, variableNames, parseData])

  const runPathAnalysis = (data: number[][], variables: string[]) => {
    setIsLoading(true)
    setError(null)
    
    setTimeout(() => {
      try {
        // First calculate correlation matrix
        const corrResult: CorrelationResult = pearsonCorrelation(data, variables)
        
        // Find dependent variable index
        const depIdx = variables.indexOf(dependentVar)
        if (depIdx === -1) throw new Error('Dependent variable not found')
        
        // Run path analysis using correlation matrix
        const pathResult: PathAnalysisResult = pathAnalysis(
          corrResult.matrix,
          depIdx,
          variables
        )
        
        setResult(pathResult)
        setCorrMatrix(corrResult.matrix)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Path analysis failed')
      }
      setIsLoading(false)
    }, 300)
  }

  // Load sample data
  const loadSampleData = () => {
    setRawData(SAMPLE_RAW_DATA)
    parseData(SAMPLE_RAW_DATA)
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
      ['Path Coefficient Analysis Results'],
      ['Dependent Variable', result.dependentVariable],
      ['R-squared', result.rSquared.toFixed(4)],
      ['Residual Effect', result.residualEffect.toFixed(4)],
      [''],
      ['Direct Effects'],
      ['Variable', 'Direct Effect'],
      ...result.independentVariables.map((v, i) => [v, result.directEffects[i].toFixed(4)]),
      [''],
      ['Indirect Effects Matrix']
    ]
    
    // Add indirect effects header
    rows.push([''] + result.independentVariables)
    
    for (let i = 0; i < result.independentVariables.length; i++) {
      rows.push([
        result.independentVariables[i],
        ...result.indirectEffects[i].map(v => v.toFixed(4))
      ])
    }
    
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'path_analysis_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Render interactive path diagram as SVG
  const renderPathDiagram = () => {
    if (!result) return null

    const { dependentVariable, independentVariables, directEffects, indirectEffects, residualEffect } = result
    
    const width = 700
    const height = 400
    const nodeRadius = 35
    const depX = width / 2
    const depY = height - 80
    
    // Position independent variables in an arc
    const indepPositions = independentVariables.map((_, i) => {
      const angle = Math.PI + ((i + 0.5) / independentVariables.length) * Math.PI
      return {
        x: width / 2 + Math.cos(angle) * 220,
        y: 80 + Math.sin(angle) * 120
      }
    })

    // Get max effect for scaling arrow thickness
    const maxDirectEffect = Math.max(...directEffects.map(Math.abs), 0.01)

    return (
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg border">
          {/* Definitions */}
          <defs>
            {/* Arrow markers */}
            <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#22c55e" />
            </marker>
            <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
            </marker>
            <marker id="arrowGray" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#9ca3af" />
            </marker>
            
            {/* Drop shadow */}
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
            </filter>
          </defs>

          {/* Title */}
          <text x={width/2} y={25} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
            Path Coefficient Diagram - {dependentVariable}
          </text>

          {/* Draw arrows from independent to dependent */}
          {independentVariables.map((varName, i) => {
            const pos = indepPositions[i]
            const effect = directEffects[i]
            const isPositive = effect >= 0
            const color = isPositive ? '#22c55e' : '#ef4444'
            const arrowId = isPositive ? 'arrowGreen' : 'arrowRed'
            const thickness = Math.max(1.5, (Math.abs(effect) / maxDirectEffect) * 4)
            
            return (
              <g key={`direct-${i}`}>
                {/* Arrow line */}
                <line 
                  x1={pos.x} 
                  y1={pos.y + nodeRadius} 
                  x2={depX} 
                  y2={depY - nodeRadius} 
                  stroke={color} 
                  strokeWidth={thickness}
                  markerEnd={`url(#${arrowId})`}
                />
                
                {/* Effect label */}
                <label>
                  <text 
                    x={(pos.x + depX) / 2 + 15} 
                    y={(pos.y + depY) / 2} 
                    fontSize="12" 
                    fontWeight="bold"
                    fill={color}
                  >
                    {effect.toFixed(3)}
                  </text>
                </label>
                
                {/* Variable name label on arrow */}
                <text 
                  x={(pos.x + depX) / 2 - 25} 
                  y={(pos.y + depY) / 2 - 8} 
                  fontSize="10" 
                  fill="#6b7280"
                >
                  P{varName.substring(0, 3)}
                </text>
              </g>
            )
          })}

          {/* Residual effect (dashed arc) */}
          <path
            d={`M ${depX + nodeRadius + 10} ${depY} Q ${depX + nodeRadius + 60} ${depY - 30} ${depX + nodeRadius + 40} ${depY + 20}`}
            stroke="#9ca3af"
            strokeWidth="1.5"
            strokeDasharray="5,3"
            fill="none"
            markerEnd="url(#arrowGray)"
          />
          <text x={depX + nodeRadius + 55} y={depY} fontSize="11" fill="#9ca3af">
            R = {residualEffect.toFixed(3)}
          </text>

          {/* Independent variable nodes */}
          {independentVariables.map((varName, i) => {
            const pos = indepPositions[i]
            const effect = directEffects[i]
            const intensity = Math.min(Math.abs(effect) / maxDirectEffect, 1)
            
            return (
              <g key={`node-${i}`}>
                {/* Node circle with gradient based on effect magnitude */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={effect >= 0 ? `rgba(34, 197, 94, ${0.2 + intensity * 0.5})` : `rgba(239, 68, 68, ${0.2 + intensity * 0.5})`}
                  stroke={effect >= 0 ? '#22c55e' : '#ef4444'}
                  strokeWidth="2"
                  filter="url(#shadow)"
                />
                
                {/* Variable name */}
                <text 
                  x={pos.x} 
                  y={pos.y - 5} 
                  textAnchor="middle" 
                  fontSize="10" 
                  fontWeight="bold"
                  fill="#374151"
                >
                  {varName.length > 10 ? varName.substring(0, 10) + '..' : varName}
                </text>
                
                {/* Direct effect value in node */}
                <text 
                  x={pos.x} 
                  y={pos.y + 12} 
                  textAnchor="middle" 
                  fontSize="11"
                  fontWeight="bold"
                  fill={effect >= 0 ? '#16a34a' : '#dc2626'}
                >
                  {effect.toFixed(3)}
                </text>
              </g>
            )
          })}

          {/* Dependent variable node */}
          <g>
            <circle
              cx={depX}
              cy={depY}
              r={nodeRadius + 5}
              fill="rgba(193, 18, 31, 0.15)"
              stroke="#C1121F"
              strokeWidth="3"
              filter="url(#shadow)"
            />
            <text 
              x={depX} 
              y={depY - 5} 
              textAnchor="middle" 
              fontSize="11" 
              fontWeight="bold"
              fill="#C1121F"
            >
              {dependentVariable}
            </text>
            <text 
              x={depX} 
              y={depY + 12} 
              textAnchor="middle" 
              fontSize="10"
              fill="#6b7280"
            >
              R² = {result.rSquared.toFixed(3)}
            </text>
          </g>

          {/* Legend */}
          <g transform="translate(20, height - 50)">
            <rect x="0" y="0" width="150" height="40" rx="5" fill="#f9fafb" stroke="#e5e7eb" />
            <line x1="10" y1="15" x2="35" y2="15" stroke="#22c55e" strokeWidth="2" />
            <text x="42" y="18" fontSize="10" fill="#374151">Positive effect</text>
            <line x1="10" y1="30" x2="35" y2="30" stroke="#ef4444" strokeWidth="2" />
            <text x="42" y="33" fontSize="10" fill="#374151">Negative effect</text>
          </g>
        </svg>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Path Coefficient Analysis
          </CardTitle>
          <CardDescription>
            Decompose correlations into direct and indirect effects to understand causal relationships
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
                <Label htmlFor="data-input">Enter your multi-trait data (CSV format)</Label>
                <Textarea
                  id="data-input"
                  placeholder={`Genotype,Yield,Height,Biomass,Tillers\nG1,4.8,105,45,12\nG2,3.9,92,38,10\n...`}
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  className="mt-2 font-mono text-sm min-h-[120px]"
                />
              </div>

              <div className="max-w-xs">
                <Label>Dependent Variable (Y)</Label>
                <Select value={dependentVar} onValueChange={setDependentVar}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select dependent variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {variableNames.map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleAnalyze}
              disabled={!rawData.trim() || !dependentVar}
              className="gap-2"
            >
              <GitBranch className="h-4 w-4" />
              Run Path Analysis
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
              <CardContent className="pt-4">
                <p className="text-xs text-red-600 dark:text-red-400">Coefficient of Determination</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{result.rSquared.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground mt-1">{(result.rSquared * 100).toFixed(1)}% variance explained</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="pt-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">Residual Effect</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.residualEffect.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground mt-1">Unexplained variation</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="pt-4">
                <p className="text-xs text-blue-600 dark:text-blue-400">Independent Variables</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{result.independentVariables.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Predictors analyzed</p>
              </CardContent>
            </Card>
          </div>

          {/* Path Diagram */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Interactive Path Diagram
              </CardTitle>
              <CardDescription>
                Visual representation of direct and indirect effects on {result.dependentVariable}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPathDiagram()}
              
              <div className="mt-4 flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p><strong>Diagram interpretation:</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Arrow thickness indicates effect magnitude</li>
                    <li>Green arrows = positive effects, Red arrows = negative effects</li>
                    <li>Numbers show direct path coefficients (Pij)</li>
                    <li>Dashed line shows residual effect (unexplained)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Direct Effects Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">Direct & Indirect Effects</CardTitle>
                <CardDescription>Complete decomposition of correlation coefficients</CardDescription>
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
                      <th className="text-left py-3 px-4 font-medium sticky left-0 bg-background">Variable</th>
                      <th className="text-right py-3 px-4 font-medium bg-primary/5">Direct Effect</th>
                      {result.independentVariables.map((v, j) => (
                        <th key={j} className="text-right py-3 px-4 font-medium text-xs">
                          Ind. via {v.substring(0, 6)}
                        </th>
                      ))}
                      <th className="text-right py-3 px-4 font-medium bg-primary/5">Total Correlation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.independentVariables.map((varName, i) => {
                      const directEff = result.directEffects[i]
                      const totalCorr = corrMatrix ? corrMatrix[result.independentVariables.findIndex(v => v === varName)]?.[variableNames.indexOf(result.dependentVar)] || 0 : 0
                      
                      return (
                        <tr key={i} className="border-b hover:bg-muted/30">
                          <td className="py-3 px-4 font-medium sticky left-0 bg-background">{varName}</td>
                          <td className={`py-3 px-4 text-right font-mono font-semibold ${
                            directEff > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {directEff.toFixed(4)}
                          </td>
                          {result.independentVariables.map((_, j) => (
                            <td key={j} className="py-3 px-4 text-right font-mono text-xs">
                              {i !== j ? result.indirectEffects[i][j]?.toFixed(4) : '-'}
                            </td>
                          ))}
                          <td className="py-3 px-4 text-right font-mono font-medium">{totalCorr.toFixed(4)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
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
              <p className="text-sm text-muted-foreground">Running path analysis...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
