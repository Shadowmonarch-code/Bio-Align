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
  Users, 
  Upload, 
  FileText, 
  Download,
  Info,
  Network,
  AlertCircle,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { 
  euclideanDistance, 
  manhattanDistance, 
  hierarchicalClustering, 
  cutDendrogram,
  principalComponentAnalysis,
  DiversityResult,
  DendrogramNode
} from '@/lib/statistics-engine'

interface DiversityAnalysisProps {
  className?: string
}

type DistanceMethod = 'euclidean' | 'manhattan'
type LinkageMethod = 'average' | 'complete' | 'single'

// Sample diversity data (genotypes × traits)
const SAMPLE_DATA = `Genotype,Trait1,Trait2,Trait3,Trait4,Trait5
G1,45,120,8.5,24,145
G2,52,135,7.8,21,128
G3,48,128,8.2,23,138
G4,42,115,9.1,20,122
G5,55,142,7.2,26,155
G6,50,130,8.0,23,140
G7,40,110,9.5,19,115
G8,47,125,8.4,22,135
G9,58,148,6.9,27,160
G10,51,132,7.9,24,142`

export default function DiversityAnalysisComponent({ className }: DiversityAnalysisProps) {
  const [rawData, setRawData] = useState('')
  const [parsedData, setParsedData] = useState<number[][]>([])
  const [genotypeNames, setGenotypeNames] = useState<string[]>([])
  
  // Analysis options
  const [distanceMethod, setDistanceMethod] = useState<DistanceMethod>('euclidean')
  const [linkageMethod, setLinkageMethod] = useState<LinkageMethod>('average')
  const [nClusters, setNClusters] = useState(3)
  
  // Results
  const [result, setResult] = useState<DiversityResult | null>(null)
  const [distanceMatrix, setDistanceMatrix] = useState<number[][] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dendrogramZoom, setDendrogramZoom] = useState(1)

  // Parse CSV data
  const parseData = useCallback((text: string): boolean => {
    try {
      const lines = text.trim().split('\n').filter(line => line.trim())
      if (lines.length < 4) throw new Error('Need at least header + 3 genotypes for meaningful clustering')

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
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse data')
      return false
    }
  }, [])

  // Run analysis
  const handleAnalyze = useCallback(() => {
    if (parsedData.length === 0) {
      if (!parseData(rawData)) return
    }
    
    runAnalysis(parsedData)
  }, [parsedData, rawData, parseData])

  const runAnalysis = (data: number[][]) => {
    setIsLoading(true)
    setError(null)
    
    setTimeout(() => {
      try {
        // Calculate distance matrix
        const distMatrix = distanceMethod === 'euclidean' 
          ? euclideanDistance(data)
          : manhattanDistance(data)
        
        setDistanceMatrix(distMatrix)
        
        // Perform hierarchical clustering
        const dendrogram = hierarchicalClustering(distMatrix, linkageMethod)
        
        // Perform PCA
        const pcaResult = principalComponentAnalysis(data)
        
        // Cut dendrogram to get clusters
        const clusterGroups = cutDendrogram(dendrogram, nClusters)
        
        const diversityResult: DiversityResult = {
          distanceMatrix: distMatrix,
          clusterGroups,
          dendrogramData: dendrogram,
          pcaScores: pcaResult.scores,
          pcaLoadings: pcaResult.loadings,
          varianceExplained: pcaResult.varianceExplained,
          method: distanceMethod
        }
        
        setResult(diversityResult)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Diversity analysis failed')
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
    if (!result || !distanceMatrix) return
    
    const rows = [
      ['Diversity Analysis Results'],
      ['Method', distanceMethod],
      ['Linkage', linkageMethod],
      ['Number of Clusters', nClusters.toString()],
      [''],
      ['Distance Matrix']
    ]
    
    // Distance matrix header
    rows.push([''] + genotypeNames)
    
    for (let i = 0; i < genotypeNames.length; i++) {
      rows.push([genotypeNames[i], ...distanceMatrix[i].map(d => d.toFixed(4))])
    }
    
    rows.push([''])
    rows.push(['Cluster Assignments'])
    result.clusterGroups.forEach((group, idx) => {
      rows.push([`Cluster ${idx + 1}`, ...group.map(i => genotypeNames[i])])
    })
    
    rows.push([''])
    rows.push(['PCA Variance Explained (%)'])
    rows.push(['PC', '% Variance', 'Cumulative %'])
    let cumVar = 0
    result.varianceExplained.forEach((v, i) => {
      cumVar += v
      rows.push([`PC${i + 1}`, v.toFixed(2), cumVar.toFixed(2)])
    })
    
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diversity_analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Render dendrogram SVG
  const renderDendrogram = (): React.ReactNode => {
    if (!result) return null
    
    const { dendrogramData } = result
    const width = 600 * dendrogramZoom
    const height = 350 * dendrogramZoom
    
    // Calculate layout positions
    interface NodePos {
      x: number
      y: number
      label?: string
    }
    
    const positions: Map<string, NodePos> = new Map()
    let leafIndex = 0
    const leafSpacing = Math.min(60, (width - 100) / (genotypeNames.length || 1))
    const startX = 50
    
    function calculatePositions(node: DendrogramNode, depth: number): void {
      if (!node.left || !node.right) {
        // Leaf node
        const x = startX + leafIndex * leafSpacing
        const y = height - 50
        positions.set(node.id, { x, y, label: node.labels?.[0] || '' })
        leafIndex++
        return
      }
      
      // Recursively position children
      calculatePositions(node.left!, depth + 1)
      calculatePositions(node.right!, depth + 1)
      
      const leftPos = positions.get(node.left!.id)!
      const rightPos = positions.get(node.right!.id)!
      
      // Scale distance for visualization
      const maxDist = getMaxDistance(dendrogramData)
      const scaledDepth = (node.distance / maxDist) * (height - 120)
      
      positions.set(node.id, {
        x: (leftPos.x + rightPos.x) / 2,
        y: 30 + scaledDepth
      })
    }
    
    function getMaxDistance(node: DendrogramNode): number {
      if (!node.left || !node.right) return 0
      return Math.max(node.distance, getMaxDistance(node.left!), getMaxDistance(node.right!))
    }
    
    calculatePositions(dendrogramData, 0)
    
    // Cluster colors
    const clusterColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
    
    function getClusterColor(labelIdx: number): string {
      for (let i = 0; i < result.clusterGroups.length; i++) {
        if (result.clusterGroups[i].includes(labelIdx)) {
          return clusterColors[i % clusterColors.length]
        }
      }
      return '#94a3b8'
    }
    
    // Render nodes recursively
    function renderNode(node: DendrogramNode): React.ReactNode {
      const pos = positions.get(node.id)
      if (!pos) return null
      
      if (!node.left || !node.right) {
        // Leaf node
        const labelIdx = parseInt(pos.label?.replace('G', '') || '0') - 1
        const color = getClusterColor(isNaN(labelIdx) ? 0 : labelIdx)
        
        return (
          <g key={node.id}>
            <circle cx={pos.x} cy={pos.y} r="6" fill={color} stroke="white" strokeWidth="2" />
            <text 
              x={pos.x} 
              y={pos.y + 25} 
              textAnchor="middle" 
              fontSize="11" 
              fill="#374151"
              transform={`rotate(-35, ${pos.x}, ${pos.y + 25})`}
            >
              {pos.label}
            </text>
          </g>
        )
      }
      
      const leftPos = positions.get(node.left!.id)!
      const rightPos = positions.get(node.right!.id)!
      
      return (
        <g key={node.id}>
          {/* Lines to children */}
          <line x1={pos.x} y1={pos.y} x2={leftPos.x} y2={leftPos.y} stroke="#6b7280" strokeWidth="1.5" />
          <line x1={pos.x} y1={pos.y} x2={rightPos.x} y2={rightPos.y} stroke="#6b7280" strokeWidth="1.5" />
          
          {/* Horizontal connector */}
          <line x1={leftPos.x} y1={pos.y} x2={rightPos.x} y2={pos.y} stroke="#6b7280" strokeWidth="1.5" />
          
          {/* Junction point */}
          <circle cx={pos.x} cy={pos.y} r="3" fill="#374151" />
          
          {/* Render children */}
          {renderNode(node.left!)}
          {renderNode(node.right!)}
          
          {/* Cut line indicator */}
          {nClusters > 1 && (
            <line 
              x1={startX - 10} 
              y1={pos.y} 
              x2={startX + (genotypeNames.length - 1) * leafSpacing + 10} 
              y2={pos.y} 
              stroke="#ef4444" 
              strokeWidth="1" 
              strokeDasharray="4,2"
              opacity="0.5"
            />
          )}
        </g>
      )
    }
    
    return (
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg border">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15"/>
            </filter>
          </defs>
          
          {/* Title */}
          <text x={width/2} y={20} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#374151">
            Hierarchical Clustering Dendrogram ({linkageMethod.charAt(0).toUpperCase() + linkageMethod.slice(1)} Linkage)
          </text>
          
          {/* Render tree */}
          {renderNode(dendrogramData)}
          
          {/* Legend */}
          <g transform="translate(width - 150, 30)">
            <rect x="0" y="0" width="140" height={result.clusterGroups.length * 22 + 25} rx="5" fill="#f9fafb" stroke="#e5e7eb" />
            <text x="70" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#374151">Clusters</text>
            {result.clusterGroups.slice(0, Math.min(result.clusterGroups.length, 6)).map((group, i) => (
              <g key={i}>
                <circle cx="15" cy={28 + i * 20} r="5" fill={clusterColors[i]} />
                <text x="28" y={32} fontSize="10" fill="#374151">Cluster {i + 1} (n={group.length})</text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    )
  }

  // Render PCA biplot
  const renderPCABiplot = (): React.ReactNode => {
    if (!result) return null
    
    const { pcaScores, pcaLoadings, varianceExplained } = result
    
    if (!pcaScores.length) return null
    
    const width = 500
    const height = 400
    const padding = 60
    
    // Find bounds
    const pc1Scores = pcaScores.map(s => s[0])
    const pc2Scores = pcaScores.map(s => s[1])
    const minX = Math.min(...pc1Scores) * 1.1
    const maxX = Math.max(...pc1Scores) * 1.1
    const minY = Math.min(...pc2Scores) * 1.1
    const maxY = Math.max(...pc2Scores) * 1.1
    
    const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX)) * (width - 2 * padding)
    const scaleY = (y: number) => height - padding - ((y - minY) / (maxY - minY)) * (height - 2 * padding)
    
    // Cluster colors
    const clusterColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    
    function getClusterColor(idx: number): string {
      for (let i = 0; i < result.clusterGroups.length; i++) {
        if (result.clusterGroups[i].includes(idx)) {
          return clusterColors[i % clusterColors.length]
        }
      }
      return '#94a3b8'
    }
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg border">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
          <g key={i}>
            <line x1={padding} y1={padding + frac * (height - 2 * padding)} x2={width - padding} y2={padding + frac * (height - 2 * padding)} stroke="#e5e7eb" strokeWidth="0.5" />
            <line x1={padding + frac * (width - 2 * padding)} y1={padding} x2={padding + frac * (width - 2 * padding)} y2={height - padding} stroke="#e5e7eb" strokeWidth="0.5" />
          </g>
        ))}
        
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="1.5" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="1.5" />
        
        {/* Axis labels */}
        <text x={width / 2} y={height - 12} textAnchor="middle" fontSize="12" fill="#374151" fontWeight="medium">
          PC1 ({varianceExplained[0]?.toFixed(1)}%)
        </text>
        <text x={16} y={height / 2} textAnchor="middle" fontSize="12" fill="#374151" fontWeight="medium" transform={`rotate(-90, 16, ${height / 2})`}>
          PC2 ({varianceExplained[1]?.toFixed(1)}%)
        </text>
        
        {/* Origin lines */}
        <line x1={scaleX(0)} y1={padding} x2={scaleX(0)} y2={height - padding} stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,4" />
        <line x1={padding} y1={scaleY(0)} x2={width - padding} y2={scaleY(0)} stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,4" />
        
        {/* Data points */}
        {pcaScores.map((score, i) => (
          <g key={i}>
            <circle
              cx={scaleX(score[0])}
              cy={scaleY(score[1])}
              r="7"
              fill={getClusterColor(i)}
              stroke="white"
              strokeWidth="2"
              opacity="0.85"
            />
            <text
              x={scaleX(score[0]) + 10}
              y={scaleY(score[1]) - 5}
              fontSize="10"
              fill="#374151"
            >
              {genotypeNames[i]}
            </text>
          </g>
        ))}
        
        {/* Loading vectors (if available) */}
        {pcaLoadings && pcaLoadings[0] && (
          <>
            {pcaLoadings[0].map((load, i) => {
              const scale = Math.max(maxX - minX, maxY - minY) * 0.4
              const endX = load * scale
              const endY = pcaLoadings[1][i] * scale
              
              return (
                <g key={`vec-${i}`}>
                  <line
                    x1={scaleX(0)}
                    y1={scaleY(0)}
                    x2={scaleX(endX)}
                    y2={scaleY(endY)}
                    stroke="#C1121F"
                    strokeWidth="2"
                    markerEnd="url(#arrowRed)"
                  />
                  <text
                    x={scaleX(endX) + 5}
                    y={scaleY(endY) - 5}
                    fontSize="10"
                    fill="#C1121F"
                    fontWeight="bold"
                  >
                    {traitNames[i] || `T${i + 1}`}
                  </text>
                </g>
              )
            })}
            
            <defs>
              <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#C1121F" />
              </marker>
            </defs>
          </>
        )}
      </svg>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Diversity Analysis
          </CardTitle>
          <CardDescription>
            Analyze genetic diversity using distance metrics, clustering, and PCA
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

          {/* Analysis Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div>
              <Label>Distance Method</Label>
              <Select value={distanceMethod} onValueChange={(v) => setDistanceMethod(v as DistanceMethod)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="euclidean">Euclidean Distance</SelectItem>
                  <SelectItem value="manhattan">Manhattan Distance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Linkage Method</Label>
              <Select value={linkageMethod} onValueChange={(v) => setLinkageMethod(v as LinkageMethod)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="average">UPGMA (Average)</SelectItem>
                  <SelectItem value="complete">Complete Linkage</SelectItem>
                  <SelectItem value="single">Single Linkage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="n-clusters">Number of Clusters</Label>
              <Input
                id="n-clusters"
                type="number"
                min="2"
                max="10"
                value={nClusters}
                onChange={(e) => setNClusters(parseInt(e.target.value) || 3)}
                className="mt-2"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleAnalyze} disabled={!rawData.trim()} className="gap-2">
              <Network className="h-4 w-4" />
              Run Diversity Analysis
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
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900">
              <CardContent className="pt-4">
                <p className="text-xs text-teal-600 dark:text-teal-400">Genotypes Analyzed</p>
                <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">{genotypeNames.length}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="pt-4">
                <p className="text-xs text-blue-600 dark:text-blue-400">Clusters Formed</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{result.clusterGroups.length}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardContent className="pt-4">
                <p className="text-xs text-green-600 dark:text-green-400">PC1 Variance</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{result.varianceExplained[0]?.toFixed(1)}%</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardContent className="pt-4">
                <p className="text-xs text-purple-600 dark:text-purple-400">PC2 Variance</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{result.varianceExplained[1]?.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Dendrogram */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Hierarchical Clustering Dendrogram
                </CardTitle>
                <CardDescription>
                  Visual representation of genetic relationships among genotypes
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setDendrogramZoom(Math.max(0.5, dendrogramZoom - 0.2))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDendrogramZoom(Math.min(2, dendrogramZoom + 0.2))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button onClick={exportResults} variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderDendrogram()}
              
              {/* Cluster assignments */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Cluster Memberships</h4>
                <div className="space-y-2">
                  {result.clusterGroups.map((group, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                      <Badge variant="outline" className="font-mono">
                        Cluster {i + 1}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {group.map(idx => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {genotypeNames[idx]}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-auto">
                        n = {group.length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PCA Biplot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PCA Biplot</CardTitle>
              <CardDescription>
                Principal Component Analysis showing genetic relationships in reduced dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPCABiplot()}
              
              {/* Variance explained table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-2 px-3 font-medium">Principal Component</th>
                      <th className="text-right py-2 px-3 font-medium">Variance Explained (%)</th>
                      <th className="text-right py-2 px-3 font-medium">Cumulative (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.varianceExplained.slice(0, 5).map((v, i) => {
                      const cumVar = result.varianceExplained.slice(0, i + 1).reduce((a, b) => a + b, 0)
                      return (
                        <tr key={i} className="border-b hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium">PC{i + 1}</td>
                          <td className="py-2 px-3 text-right font-mono">{v.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-mono">{cumVar.toFixed(2)}</td>
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
              <p className="text-sm text-muted-foreground">Running diversity analysis...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
