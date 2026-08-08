'use client'

import React, { useState, useCallback, useMemo } from 'react'
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
  GitBranch, 
  Upload, 
  FileText, 
  Download,
  Info,
  TrendingUp,
  ScatterChart,
  AlertCircle
} from 'lucide-react'
import { 
  pearsonCorrelation, 
  spearmanCorrelation, 
  CorrelationResult,
  simpleLinearRegression,
  multipleRegression,
  RegressionResult
} from '@/lib/statistics-engine'

interface CorrelationRegressionProps {
  className?: string
}

type AnalysisType = 'correlation' | 'simple-regression' | 'multiple-regression'

// Sample multi-trait data
const SAMPLE_DATA = `Genotype,PlantHeight,PanicleLength,GrainsPerPanicle,1000GrainWt,Yield
G1,105,24,145,22.5,4.8
G2,92,21,128,20.1,3.9
G3,98,23,138,21.8,4.3
G4,88,20,122,19.5,3.7
G5,112,26,155,24.2,5.2
G6,101,23,140,22.0,4.5
G7,85,19,115,18.8,3.4
G8,96,22,135,21.2,4.2
G9,115,27,160,25.0,5.5
G10,99,24,142,22.3,4.6`

export default function CorrelationRegressionAnalysis({ className }: CorrelationRegressionProps) {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('correlation')
  const [rawData, setRawData] = useState('')
  const [parsedData, setParsedData] = useState<number[][]>([])
  const [variableNames, setVariableNames] = useState<string[]>([])
  const [correlationMethod, setCorrelationMethod] = useState<'pearson' | 'spearman'>('pearson')
  
  // For regression
  const [dependentVar, setDependentVar] = useState('')
  const [independentVars, setIndependentVars] = useState<string[]>([])
  
  // Results
  const [corrResult, setCorrResult] = useState<CorrelationResult | null>(null)
  const [regResult, setRegResult] = useState<RegressionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Parse CSV data
  const parseData = useCallback((text: string): { data: number[][], names: string[] } | null => {
    try {
      const lines = text.trim().split('\n').filter(line => line.trim())
      if (lines.length < 3) throw new Error('Need at least header + 2 observations')

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

      setVariableNames(headers.slice(1))
      setParsedData(data)
      
      if (headers.length > 1 && !dependentVar) {
        setDependentVar(headers[headers.length - 1]) // Default last variable as dependent
        setIndependentVars(headers.slice(1, -1))
      }
      
      setError(null)
      return { data, names: headers.slice(1) }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse data')
      return null
    }
  }, [dependentVar])

  // Run correlation analysis
  const runCorrelation = useCallback(() => {
    if (parsedData.length === 0) {
      const parsed = parseData(rawData)
      if (!parsed) return
      calculateCorrelation(parsed.data)
    } else {
      calculateCorrelation(parsedData)
    }
  }, [parsedData, rawData, parseData])

  const calculateCorrelation = (data: number[][]) => {
    setIsLoading(true)
    setError(null)
    
    setTimeout(() => {
      try {
        const result = correlationMethod === 'pearson' 
          ? pearsonCorrelation(data, variableNames)
          : spearmanCorrelation(data, variableNames)
        setCorrResult(result)
        setRegResult(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Correlation analysis failed')
      }
      setIsLoading(false)
    }, 300)
  }

  // Run regression analysis
  const runRegression = useCallback(() => {
    if (parsedData.length === 0) {
      const parsed = parseData(rawData)
      if (!parsed) return
      calculateRegression(parsed.data)
    } else {
      calculateRegression(parsedData)
    }
  }, [parsedData, rawData, parseData])

  const calculateRegression = (data: number[][]) => {
    setIsLoading(true)
    setError(null)
    
    setTimeout(() => {
      try {
        const depIdx = variableNames.indexOf(dependentVar)
        if (depIdx === -1) throw new Error('Please select a dependent variable')
        
        let result: RegressionResult
        
        if (analysisType === 'simple-regression') {
          // Simple linear regression with first independent variable
          const indepIdx = independentVars.length > 0 
            ? variableNames.indexOf(independentVars[0])
            : 0
          
          if (indepIdx === -1 || indepIdx === depIdx) throw new Error('Invalid independent variable')
          
          const x = data.map(row => row[indepIdx])
          const y = data.map(row => row[depIdx])
          result = simpleLinearRegression(x, y)
        } else {
          // Multiple regression
          const indepIndices = independentVars
            .map(v => variableNames.indexOf(v))
            .filter(i => i !== -1 && i !== depIdx)
          
          if (indepIndices.length === 0) throw new Error('Select at least one independent variable')
          
          const X = data.map(row => indepIndices.map(i => row[i]))
          const y = data.map(row => row[depIdx])
          result = multipleRegression(X, y)
        }
        
        setRegResult(result)
        setCorrResult(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Regression analysis failed')
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

  // Get significance stars
  const getSignificanceStars = (p: number): string => {
    if (p < 0.001) return '***'
    if (p < 0.01) return '**'
    if (p < 0.05) return '*'
    if (p < 0.1) return '.'
    return ''
  }

  // Get cell color for heatmap
  const getHeatmapColor = (value: number): string => {
    const absValue = Math.abs(value)
    const intensity = Math.min(absValue, 1)
    
    if (value >= 0) {
      // Positive: white to green
      const r = Math.round(255 * (1 - intensity))
      const g = Math.round(200 + 55 * intensity)
      const b = Math.round(255 * (1 - intensity))
      return `rgb(${r}, ${g}, ${b})`
    } else {
      // Negative: white to red
      const r = Math.round(200 + 55 * intensity)
      const g = Math.round(255 * (1 - intensity))
      const b = Math.round(255 * (1 - intensity))
      return `rgb(${r}, ${g}, ${b})`
    }
  }

  // Render correlation matrix as heatmap
  const renderCorrelationHeatmap = () => {
    if (!corrResult) return null
    
    const { matrix, pValues, variables } = corrResult
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs font-medium"></th>
              {variables.map((v, i) => (
                <th key={i} className="p-2 text-xs font-medium text-center min-w-[80px]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                  {v}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variables.map((varI, i) => (
              <tr key={i}>
                <td className="p-2 font-medium text-xs">{varI}</td>
                {variables.map((_, j) => (
                  <td 
                    key={j}
                    className="p-1 text-center"
                    style={{ backgroundColor: i !== j ? getHeatmapColor(matrix[i][j]) : '#f3f4f6' }}
                  >
                    <div className="font-mono text-xs">
                      {matrix[i][j].toFixed(3)}
                    </div>
                    {i !== j && (
                      <div className={`text-[10px] ${getSignificanceStars(pValues[i][j]) ? 'font-bold' : ''}`}>
                        {getSignificanceStars(pValues[i][j])}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(255, 75, 75)' }}></span> Strong negative (-1)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-white border"></span> No correlation (0)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(75, 255, 75)' }}></span> Strong positive (+1)
          </span>
          <span className="text-muted-foreground ml-4">*** p&lt;0.001 ** p&lt;0.01 * p&lt;0.05</span>
        </div>
      </div>
    )
  }

  // Render scatter plot with regression line (simplified SVG)
  const renderScatterPlot = () => {
    if (!regResult || !parsedData.length) return null
    
    const depIdx = variableNames.indexOf(dependentVar)
    const indepIdx = analysisType === 'simple-regression' && independentVars.length > 0
      ? variableNames.indexOf(independentVars[0])
      : 0
    
    if (depIdx === -1 || indepIdx === -1) return null
    
    const xData = parsedData.map(row => row[indepIdx])
    const yData = parsedData.map(row => row[depIdx])
    
    // Calculate bounds with padding
    const xMin = Math.min(...xData) * 0.95
    const xMax = Math.max(...xData) * 1.05
    const yMin = Math.min(...yData) * 0.95
    const yMax = Math.max(...yData) * 1.05
    
    const width = 400
    const height = 300
    const padding = 40
    
    const scaleX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding)
    const scaleY = (y: number) => height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding)
    
    // Generate regression line points
    const regLineStartX = xMin
    const regLineEndX = xMax
    const regLineStartY = regResult.coefficients[0] + regResult.coefficients[1] * regLineStartX
    const regLineEndY = regResult.coefficients[0] + regResult.coefficients[1] * regLineEndX
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg border">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
          <g key={i}>
            <line 
              x1={padding} 
              y1={padding + frac * (height - 2 * padding)} 
              x2={width - padding} 
              y2={padding + frac * (height - 2 * padding)} 
              stroke="#e5e7eb" 
              strokeWidth="0.5"
            />
            <line 
              x1={padding + frac * (width - 2 * padding)} 
              y1={padding} 
              x2={padding + frac * (width - 2 * padding)} 
              y2={height - padding} 
              stroke="#e5e7eb" 
              strokeWidth="0.5"
            />
          </g>
        ))}
        
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="1.5" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="1.5" />
        
        {/* Axis labels */}
        <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="12" fill="#6b7280">
          {variableNames[indepIdx]}
        </text>
        <text x={12} y={height / 2} textAnchor="middle" fontSize="12" fill="#6b7280" transform={`rotate(-90, 12, ${height / 2})`}>
          {dependentVar}
        </text>
        
        {/* Regression line */}
        <line 
          x1={scaleX(regLineStartX)} 
          y1={scaleY(regLineStartY)} 
          x2={scaleX(regLineEndX)} 
          y2={scaleY(regLineEndY)} 
          stroke="#C1121F" 
          strokeWidth="2"
        />
        
        {/* Data points */}
        {xData.map((x, i) => (
          <circle
            key={i}
            cx={scaleX(x)}
            cy={scaleY(yData[i])}
            r="5"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.8"
          />
        ))}
        
        {/* Equation label */}
        <text x={width - padding - 10} y={padding + 20} textAnchor="end" fontSize="11" fill="#C1121F" fontWeight="bold">
          {regResult.equation}
        </text>
        <text x={width - padding - 10} y={padding + 35} textAnchor="end" fontSize="10" fill="#6b7280">
          R² = {regResult.rSquared.toFixed(4)}
        </text>
      </svg>
    )
  }

  // Export results
  const exportResults = () => {
    if (corrResult) {
      const rows = [
        ['Correlation Matrix'],
        ['', ...corrResult.variables],
        ...corrResult.matrix.map((row, i) => [corrResult.variables[i], ...row.map(v => v.toFixed(4))]),
        [''],
        ['P-values'],
        ['', ...corrResult.variables],
        ...corrResult.pValues.map((row, i) => [corrResult.variables[i], ...row.map(v => v.toFixed(4))])
      ]
      const csv = rows.map(r => r.join(',')).join('\n')
      downloadCSV(csv, 'correlation_matrix.csv')
    } else if (regResult) {
      const rows = [
        ['Regression Results'],
        ['Equation', regResult.equation],
        ['R-squared', regResult.rSquared.toFixed(4)],
        ['Adjusted R-squared', regResult.adjustedRSquared.toFixed(4)],
        ['F-statistic', regResult.fStatistic.toFixed(4)],
        ['P-value', regResult.pValue.toFixed(4)],
        [''],
        ['Coefficient', 'Value', 'Std. Error', 't-value'],
        ...regResult.coefficients.map((coef, i) => [
          i === 0 ? 'Intercept' : `X${i}`,
          coef.toFixed(4),
          regResult.stdErrors[i]?.toFixed(4) || '',
          (coef / (regResult.stdErrors[i] || 1)).toFixed(4)
        ])
      ]
      const csv = rows.map(r => r.join(',')).join('\n')
      downloadCSV(csv, 'regression_results.csv')
    }
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Correlation & Regression Analysis
          </CardTitle>
          <CardDescription>
            Multi-trait correlation analysis and regression modeling
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Analysis Type Selector */}
          <div className="mb-6">
            <Label>Analysis Type</Label>
            <Select value={analysisType} onValueChange={(v) => setAnalysisType(v as AnalysisType)}>
              <SelectTrigger className="mt-2 max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="correlation">Correlation Matrix</SelectItem>
                <SelectItem value="simple-regression">Simple Linear Regression</SelectItem>
                <SelectItem value="multiple-regression">Multiple Linear Regression</SelectItem>
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
                <Label htmlFor="data-input">Enter your data (CSV format)</Label>
                <Textarea
                  id="data-input"
                  placeholder={`Genotype,Trait1,Trait2,Trait3\nG1,105,24,145\nG2,92,21,128\n...`}
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  className="mt-2 font-mono text-sm min-h-[120px]"
                />
              </div>

              {/* Variable selection for regression */}
              {(analysisType === 'simple-regression' || analysisType === 'multiple-regression') && variableNames.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
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
                  
                  <div>
                    <Label>Independent Variables (X)</Label>
                    <Select 
                      value={independentVars.join(',')} 
                      onValueChange={(val) => setIndependentVars(val.split(','))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select independent variables" />
                      </SelectTrigger>
                      <SelectContent>
                        {variableNames.filter(v => v !== dependentVar).map(v => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Correlation method selector */}
              {analysisType === 'correlation' && (
                <div className="max-w-xs">
                  <Label>Correlation Method</Label>
                  <Select value={correlationMethod} onValueChange={(v) => setCorrelationMethod(v as 'pearson' | 'spearman')}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pearson">Pearson (Linear)</SelectItem>
                      <SelectItem value="spearman">Spearman (Rank)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

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
              onClick={analysisType === 'correlation' ? runCorrelation : runRegression}
              disabled={!rawData.trim() || (analysisType !== 'correlation' && !dependentVar)}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Run {analysisType === 'correlation' ? 'Correlation' : 'Regression'} Analysis
            </Button>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <span className="text-sm text-destructive">{error}</span>
            </motion.div>
          )}

          {parsedData.length > 0 && !corrResult && !regResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-2">Data Preview:</p>
              <p className="text-xs text-muted-foreground">
                {parsedData.length} observations × {variableNames.length} variables loaded
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {variableNames.map(v => (
                  <Badge key={v} variant="secondary" className="text-xs">{v}</Badge>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Correlation Results */}
      {corrResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg capitalize">
                  {correlationMethod} Correlation Matrix
                </CardTitle>
                <CardDescription>
                  {corrResult.variables.length} variables × {parsedData.length} observations
                </CardDescription>
              </div>
              <Button onClick={exportResults} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {renderCorrelationHeatmap()}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Regression Results */}
      {regResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="pt-4">
                <p className="text-xs text-blue-600 dark:text-blue-400">R-squared</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{regResult.rSquared.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground mt-1">{(regResult.rSquared * 100).toFixed(1)}% variance explained</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardContent className="pt-4">
                <p className="text-xs text-green-600 dark:text-green-400">Adjusted R²</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{regResult.adjustedRSquared.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground mt-1">Adjusted for predictors</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardContent className="pt-4">
                <p className="text-xs text-purple-600 dark:text-purple-400">F-statistic</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{regResult.fStatistic.toFixed(2)}</p>
                <Badge variant={regResult.pValue < 0.05 ? "default" : "secondary"} className="mt-1">
                  p = {regResult.pValue < 0.001 ? '<0.001' : regResult.pValue.toFixed(4)}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Equation & Coefficients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">Regression Model</CardTitle>
                <CardDescription>Coefficient estimates and model equation</CardDescription>
              </div>
              <Button onClick={exportResults} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {/* Equation Display */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Model Equation:</p>
                <p className="font-mono text-lg font-bold text-primary">{regResult.equation}</p>
              </div>

              {/* Coefficients Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-2 px-3 font-medium">Term</th>
                      <th className="text-right py-2 px-3 font-medium">Coefficient</th>
                      <th className="text-right py-2 px-3 font-medium">Std. Error</th>
                      <th className="text-right py-2 px-3 font-medium">t-value</th>
                      <th className="text-left py-2 px-3 font-medium">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regResult.coefficients.map((coef, i) => {
                      const se = regResult.stdErrors[i] || 0
                      const tVal = se !== 0 ? coef / se : 0
                      return (
                        <tr key={i} className="border-b hover:bg-muted/30">
                          <td className="py-2 px-3 font-mono font-medium">
                            {i === 0 ? 'Intercept (β₀)' : `β${i}`}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">{coef.toFixed(4)}</td>
                          <td className="py-2 px-3 text-right font-mono">{se.toFixed(4)}</td>
                          <td className={`py-2 px-3 text-right font-mono ${Math.abs(tVal) > 2 ? 'font-semibold text-primary' : ''}`}>
                            {tVal.toFixed(4)}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {i === 0 
                              ? 'Baseline when all X = 0' 
                              : `Unit change in Y per unit change in X${i}`
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Scatter Plot (for simple regression) */}
          {analysisType === 'simple-regression' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ScatterChart className="h-5 w-5" />
                  Scatter Plot with Regression Line
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderScatterPlot()}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-sm text-muted-foreground">Running analysis...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
