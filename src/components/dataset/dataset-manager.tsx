'use client'

import React, { useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  Table2,
  BarChart3,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowUpDown,
  Eye,
  Settings,
  Copy,
  X,
  Zap,
  Database,
  Layers,
  TrendingUp,
  PieChart,
  SlidersHorizontal,
  FileSpreadsheet,
  FileJson,
  Type,
  Hash,
  Calendar,
  AlertTriangle,
  CheckCircle,
  MinusCircle,
  Maximize2,
  Shuffle,
  ArrowDownAZ,
  ArrowUpAZ,
  Pencil,
  Eraser,
  Droplets,
  Scale,
  ClipboardCopy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

export interface ColumnInfo {
  name: string
  type: 'numeric' | 'categorical' | 'date' | 'text' | 'unknown'
  missingCount: number
  uniqueCount: number
  // Numeric stats
  mean?: number
  median?: number
  mode?: string | number
  std?: number
  variance?: number
  min?: number
  max?: number
  range?: number
  skewness?: number
  kurtosis?: number
  q1?: number
  q3?: number
  iqr?: number
  // Categorical stats
  categories?: Record<string, number>
  mostFrequent?: string
}

export interface DatasetInfo {
  id: string
  name: string
  format: string
  rowCount: number
  columnCount: number
  size: number
  rawData: any[][]
  columns: ColumnInfo[]
  missingValues: number
  duplicateRows: number
  loadedAt: Date
}

export interface DatasetManagerProps {
  onDatasetLoaded?: (dataset: DatasetInfo) => void
  onAnalyzeClick?: (dataset: DatasetInfo) => void
  className?: string
}

interface SortConfig {
  column: number
  direction: 'asc' | 'desc' | null
}

interface FilterCondition {
  column: string
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'not_contains' | 'is_null' | 'is_not_null'
  value: string
}

// ============================================================================
// Constants
// ============================================================================

const SUPPORTED_FORMATS = [
  '.csv', '.xlsx', '.xls', '.tsv', '.txt', 
  '.fasta', '.fa', '.fastq', '.fq', '.gb', '.gbk',
  '.vcf', '.json'
]

const ACCEPTED_TYPES = [
  'text/csv',
  'text/tab-separated-values',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/json',
]

const BIOALIGN_PRIMARY = '#C1121F'
const BIOALIGN_PRIMARY_LIGHT = '#FF4D5A'

// ============================================================================
// Utility Functions - Data Parsing
// ============================================================================

function parseCSV(text: string): any[][] {
  const lines = text.split(/\r?\n/).filter(line => line.trim())
  if (lines.length === 0) return []
  
  const result: any[][] = []
  for (const line of lines) {
    const values: any[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    result.push(values)
  }
  
  return result
}

function parseTSV(text: string): any[][] {
  const lines = text.split(/\r?\n/).filter(line => line.trim())
  return lines.map(line => line.split('\t').map(v => v.trim()))
}

function parseJSON(text: string): any[][] {
  try {
    const data = JSON.parse(text)
    
    // Handle array of objects
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
      const keys = Object.keys(data[0])
      const result: any[][] = [keys]
      for (const row of data) {
        result.push(keys.map(k => row[k] ?? ''))
      }
      return result
    }
    
    // Handle array of arrays
    if (Array.isArray(data)) {
      return data.map(row => 
        Array.isArray(row) ? row : [row]
      )
    }
    
    return []
  } catch {
    return []
  }
}

function detectColumnType(values: string[]): ColumnInfo['type'] {
  const nonEmptyValues = values.filter(v => v !== '' && v !== null && v !== undefined && v.toLowerCase() !== 'nan' && v.toLowerCase() !== 'na' && v.toLowerCase() !== 'null')
  
  if (nonEmptyValues.length === 0) return 'unknown'
  
  // Check for date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/,           // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}/,          // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}/,            // DD-MM-YYYY
    /^\d{4}\/\d{2}\/\d{2}/,          // YYYY/MM/DD
    /^[A-Z][a-z]{2}\s+\d{1,2},?\s+\d{4}/, // Mon DD, YYYY
  ]
  
  const dateMatchRatio = nonEmptyValues.filter(v => 
    datePatterns.some(p => p.test(v))
  ).length / nonEmptyValues.length
  
  if (dateMatchRatio > 0.8) return 'date'
  
  // Check for numeric
  const numericRatio = nonEmptyValues.filter(v => 
    !isNaN(Number(v)) && v.trim() !== ''
  ).length / nonEmptyValues.length
  
  if (numericRatio > 0.8) return 'numeric'
  
  // Check for categorical (low unique count relative to total)
  const uniqueCount = new Set(nonEmptyValues).size
  const categoricalThreshold = Math.min(20, nonEmptyValues.length * 0.3)
  
  if (uniqueCount <= categoricalThreshold) return 'categorical'
  
  return 'text'
}

function calculateNumericStats(values: number[]): Omit<ColumnInfo, 'name' | 'type' | 'categories'> {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  
  // Mean
  const mean = values.reduce((a, b) => a + b, 0) / n
  
  // Median
  const median = n % 2 === 0 
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
    : sorted[Math.floor(n / 2)]
  
  // Standard deviation and variance
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / n
  const std = Math.sqrt(variance)
  
  // Min, Max, Range
  const min = sorted[0]
  const max = sorted[n - 1]
  const range = max - min
  
  // Quartiles
  const q1Index = Math.floor(n * 0.25)
  const q3Index = Math.floor(n * 0.75)
  const q1 = sorted[q1Index]
  const q3 = sorted[q3Index]
  const iqr = q3 - q1
  
  // Mode
  const frequency: Record<string, number> = {}
  values.forEach(v => {
    const key = String(v)
    frequency[key] = (frequency[key] || 0) + 1
  })
  const mode = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0]
  
  // Skewness and Kurtosis
  const skewness = n > 2 
    ? (values.reduce((sum, v) => sum + Math.pow((v - mean) / std, 3), 0) / n)
    : 0
  const kurtosis = n > 3 
    ? (values.reduce((sum, v) => sum + Math.pow((v - mean) / std, 4), 0) / n) - 3
    : 0
  
  return {
    missingCount: 0,
    uniqueCount: new Set(values.map(String)).size,
    mean,
    median,
    mode: parseFloat(mode),
    std,
    variance,
    min,
    max,
    range,
    skewness,
    kurtosis,
    q1,
    q3,
    iqr,
  }
}

function calculateCategoricalStats(values: string[]): Pick<ColumnInfo, 'uniqueCount' | 'categories' | 'mostFrequent'> {
  const categories: Record<string, number> = {}
  values.forEach(v => {
    const key = String(v)
    categories[key] = (categories[key] || 0) + 1
  })
  
  const sortedCategories = Object.entries(categories).sort((a, b) => b[1] - a[1])
  const mostFrequent = sortedCategories[0]?.[0] || ''
  
  return {
    uniqueCount: Object.keys(categories).length,
    categories,
    mostFrequent,
  }
}

function calculateColumnStats(name: string, values: string[], type: ColumnInfo['type']): ColumnInfo {
  const nonEmptyValues = values.filter(v => 
    v !== '' && v !== null && v !== undefined && 
    v.toLowerCase() !== 'nan' && v.toLowerCase() !== 'na' && 
    v.toLowerCase() !== 'null' && v.toLowerCase() !== 'undefined'
  )
  const missingCount = values.length - nonEmptyValues.length
  
  if (type === 'numeric') {
    const numericValues = nonEmptyValues.filter(v => !isNaN(Number(v))).map(Number)
    return {
      name,
      type,
      missingCount,
      ...calculateNumericStats(numericValues),
    }
  } else if (type === 'categorical') {
    return {
      name,
      type,
      missingCount,
      ...calculateCategoricalStats(nonEmptyValues),
    }
  }
  
  return {
    name,
    type,
    missingCount,
    uniqueCount: new Set(nonEmptyValues).size,
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function generateId(): string {
  return `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// Sub-Components
// ============================================================================

// Upload Zone Component
function UploadZone({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateAndProcessFile = useCallback((file: File) => {
    setError(null)
    
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!SUPPORTED_FORMATS.includes(extension)) {
      setError(`Unsupported format: ${extension}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`)
      return
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File too large. Maximum size is 100MB.')
      return
    }
    
    onFileSelect(file)
  }, [onFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      validateAndProcessFile(files[0])
    }
  }, [validateAndProcessFile])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      validateAndProcessFile(files[0])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="border-2 border-dashed transition-all duration-300 hover:border-[#C1121F]/50"
        style={{
          borderColor: isDragging ? BIOALIGN_PRIMARY : undefined,
          background: isDragging ? 'rgba(193, 18, 31, 0.05)' : undefined,
        }}
      >
        <CardContent 
          className="flex flex-col items-center justify-center p-12 cursor-pointer min-h-[300px]"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_FORMATS.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <motion.div
            animate={{ 
              scale: isDragging ? 1.1 : 1,
              rotate: isDragging ? 5 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="mb-6 p-6 rounded-full bg-gradient-to-br from-[#C1121F]/10 to-[#C1121F]/5"
          >
            <Upload className="w-16 h-16 text-[#C1121F]" />
          </motion.div>
          
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Drop your dataset here
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-center">
            or click to browse files
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center max-w-md">
            {['CSV', 'TSV', 'XLSX', 'JSON', 'FASTA', 'FASTQ', 'VCF'].map(format => (
              <Badge key={format} variant="secondary" className="font-mono text-xs">
                {format}
              </Badge>
            ))}
          </div>
          
          <p className="text-xs text-gray-400 mt-4">
            Maximum file size: 100 MB
          </p>
        </CardContent>
      </Card>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Dataset Overview Component
function DatasetOverview({ dataset }: { dataset: DatasetInfo }) {
  const missingPercent = ((dataset.missingValues / (dataset.rowCount * dataset.columnCount)) * 100).toFixed(1)
  const duplicatePercent = ((dataset.duplicateRows / dataset.rowCount) * 100).toFixed(1)
  
  const numericCols = dataset.columns.filter(c => c.type === 'numeric').length
  const categoricalCols = dataset.columns.filter(c => c.type === 'categorical').length
  const dateCols = dataset.columns.filter(c => c.type === 'date').length
  const otherCols = dataset.columnCount - numericCols - categoricalCols - dateCols

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border shadow-lg overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-[#C1121F]/10 to-transparent">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5 text-[#C1121F]" />
            Dataset Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <InfoItem icon={<FileText className="w-4 h-4" />} label="Name" value={dataset.name} highlight />
            <InfoItem icon={<Hash className="w-4 h-4" />} label="Rows" value={dataset.rowCount.toLocaleString()} />
            <InfoItem icon={<Layers className="w-4 h-4" />} label="Columns" value={dataset.columnCount.toString()} />
            <InfoItem icon={<FileSpreadsheet className="w-4 h-4" />} label="Size" value={formatFileSize(dataset.size)} />
            <InfoItem icon={<Type className="w-4 h-4" />} label="Format" value={dataset.format.toUpperCase()} />
            <InfoItem icon={<Calendar className="w-4 h-4" />} label="Loaded" value={new Date(dataset.loadedAt).toLocaleTimeString()} />
          </div>

          {/* Quality Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <QualityIndicator
              label="Missing Values"
              count={dataset.missingValues}
              percent={`${missingPercent}%`}
              status={parseFloat(missingPercent) < 5 ? 'good' : parseFloat(missingPercent) < 15 ? 'warning' : 'bad'}
              icon={<MinusCircle className="w-4 h-4" />}
            />
            <QualityIndicator
              label="Duplicate Rows"
              count={dataset.duplicateRows}
              percent={`${duplicatePercent}%`}
              status={parseFloat(duplicatePercent) < 5 ? 'good' : parseFloat(duplicatePercent) < 15 ? 'warning' : 'bad'}
              icon={<Copy className="w-4 h-4" />}
            />
          </div>

          {/* Variable Types */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Variable Types</h4>
            <div className="flex flex-wrap gap-2">
              <TypeBadge type="numeric" count={numericCols} />
              <TypeBadge type="categorical" count={categoricalCols} />
              <TypeBadge type="date" count={dateCols} />
              {otherCols > 0 && <TypeBadge type="other" count={otherCols} />}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function InfoItem({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      highlight ? "bg-[#C1121F]/5 border-[#C1121F]/20" : "bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
    )}>
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={cn(
        "font-semibold truncate",
        highlight ? "text-[#C1121F]" : "text-gray-900 dark:text-gray-100"
      )}>{value}</p>
    </div>
  )
}

function QualityIndicator({ label, count, percent, status, icon }: { 
  label: string; 
  count: number; 
  percent: string; 
  status: 'good' | 'warning' | 'bad';
  icon: React.ReactNode;
}) {
  const statusColors = {
    good: 'text-green-600 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
    bad: 'text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  }

  const statusIcons = {
    good: <CheckCircle className="w-4 h-4 text-green-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    bad: <AlertCircle className="w-4 h-4 text-red-500" />,
  }

  return (
    <div className={cn("p-3 rounded-lg border", statusColors[status])}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        {statusIcons[status]}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{count.toLocaleString()}</span>
        <span className="text-sm opacity-70">({percent})</span>
      </div>
    </div>
  )
}

function TypeBadge({ type, count }: { type: string; count: number }) {
  const config: Record<string, { icon: React.ReactNode; color: string }> = {
    numeric: { icon: <Hash className="w-3 h-3" />, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    categorical: { icon: <Type className="w-3 h-3" />, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    date: { icon: <Calendar className="w-3 h-3" />, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    other: { icon: <FileText className="w-3 h-3" />, color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' },
  }

  const c = config[type] || config.other

  return (
    <Badge variant="secondary" className={cn("gap-1.5", c.color)}>
      {c.icon}
      {type.charAt(0).toUpperCase() + type.slice(1)}: {count}
    </Badge>
  )
}

// Data Preview Table Component
function DataTable({ 
  dataset, 
  sortConfig, 
  onSort,
  searchQuery,
}: { 
  dataset: DatasetInfo; 
  sortConfig: SortConfig;
  onSort: (column: number) => void;
  searchQuery: string;
}) {
  const MAX_ROWS = 100

  // Process and filter data
  const processedData = useMemo(() => {
    let data = [...dataset.rawData]
    
    // Skip header for processing
    const header = data.shift()
    if (!header) return { header: [], rows: [] }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      data = data.filter(row => 
        row.some(cell => String(cell).toLowerCase().includes(query))
      )
    }

    // Apply sorting
    if (sortConfig.column >= 0 && sortConfig.direction) {
      const colIndex = sortConfig.column
      data.sort((a, b) => {
        const aVal = a[colIndex]
        const bVal = b[colIndex]
        
        // Try numeric comparison first
        const aNum = Number(aVal)
        const bNum = Number(bVal)
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum
        }
        
        // Fall back to string comparison
        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr)
        }
        return bStr.localeCompare(aStr)
      })
    }

    // Limit rows
    data = data.slice(0, MAX_ROWS)

    return { header, rows: data }
  }, [dataset.rawData, sortConfig, searchQuery])

  const getTypeIcon = (type: ColumnInfo['type']) => {
    switch (type) {
      case 'numeric': return <Hash className="w-3 h-3 text-blue-500" />
      case 'categorical': return <Type className="w-3 h-3 text-purple-500" />
      case 'date': return <Calendar className="w-3 h-3 text-orange-500" />
      default: return <FileText className="w-3 h-3 text-gray-500" />
    }
  }

  const isMissingValue = (value: any) => {
    if (value === '' || value === null || value === undefined) return true
    const strVal = String(value).trim().toLowerCase()
    return ['nan', 'na', 'null', 'undefined', 'none', '-', 'n/a'].includes(strVal)
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <ScrollArea className="max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-16 bg-gray-100 dark:bg-gray-800">
                #
              </th>
              {processedData.header.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 group cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => onSort(idx)}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[150px]">{col}</span>
                    {getTypeIcon(dataset.columns[idx]?.type)}
                    <ArrowUpDown className={cn(
                      "w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity",
                      sortConfig.column === idx && "opacity-100 text-[#C1121F]"
                    )} />
                    {sortConfig.column === idx && sortConfig.direction && (
                      <span className="text-[10px] text-[#C1121F]">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {processedData.rows.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-4 py-2 text-xs text-gray-400 font-mono bg-gray-50/50 dark:bg-gray-900/50">
                  {rowIdx + 1}
                </td>
                {row.map((cell, cellIdx) => (
                  <td 
                    key={cellIdx}
                    className={cn(
                      "px-4 py-2 max-w-[200px] truncate",
                      isMissingValue(cell) && "bg-red-50 dark:bg-red-950/20 text-red-500 italic"
                    )}
                    title={String(cell)}
                  >
                    {isMissingValue(cell) ? (
                      <span className="flex items-center gap-1">
                        <MinusCircle className="w-3 h-3" />
                        <span className="text-xs">NULL</span>
                      </span>
                    ) : (
                      <span>{String(cell)}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      
      {processedData.rows.length === 0 && (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Search className="w-5 h-5 mr-2" />
          No matching rows found
        </div>
      )}
      
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
        Showing {processedData.rows.length} of {dataset.rowCount - 1} rows
        {searchQuery && ` (filtered by "${searchQuery}")`}
      </div>
    </div>
  )
}

// Data Quality Panel Component
function DataQualityPanel({ dataset }: { dataset: DatasetInfo }) {
  const maxMissing = Math.max(...dataset.columns.map(c => c.missingCount), 1)

  return (
    <div className="space-y-6">
      {/* Missing Values Overview */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Missing Values Analysis
          </CardTitle>
          <CardDescription>Per-column missing value distribution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dataset.columns.map((col, idx) => {
            const percentage = (col.missingCount / (dataset.rowCount - 1)) * 100
            const barColor = percentage === 0 ? 'bg-green-500' : percentage < 5 ? 'bg-yellow-500' : percentage < 15 ? 'bg-orange-500' : 'bg-red-500'
            
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-gray-500">#{idx}</span>
                    <span className="truncate font-medium">{col.name}</span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {col.type}
                    </Badge>
                  </div>
                  <span className={cn(
                    "font-mono text-xs ml-2",
                    col.missingCount === 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {col.missingCount.toLocaleString()} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(col.missingCount / maxMissing) * 100}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className={cn("h-full rounded-full", barColor)}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Outlier Detection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-5 h-5 text-purple-500" />
            Outlier Detection (IQR Method)
          </CardTitle>
          <CardDescription>Numeric columns with potential outliers</CardDescription>
        </CardHeader>
        <CardContent>
          {dataset.columns.filter(c => c.type === 'numeric').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No numeric columns found for outlier detection</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dataset.columns.filter(c => c.type === 'numeric').map((col, idx) => {
                // Simulate outlier detection based on distribution
                const hasOutliers = col.std && col.mean && (Math.abs(col.max! - col.mean!) > 3 * col.std || Math.abs(col.min! - col.mean!) > 3 * col.std)
                
                return (
                  <div key={idx} className={cn(
                    "p-4 rounded-lg border",
                    hasOutliers ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20" : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{col.name}</span>
                      {hasOutliers ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Potential outliers detected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Clean
                        </Badge>
                      )}
                    </div>
                    {hasOutliers && col.q1 !== undefined && col.iqr !== undefined && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p>IQR Range: [{col.q1?.toFixed(2)}, {(col.q1! + col.iqr!).toFixed(2)}]</p>
                        <p className="text-yellow-600 dark:text-yellow-400">
                          Values outside [{(col.q1! - 1.5 * col.iqr!).toFixed(2)}, {(col.q3! + 1.5 * col.iqr!).toFixed(2)}] may be outliers
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duplicate Analysis */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Copy className="w-5 h-5 text-blue-500" />
            Duplicate Row Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "p-4 rounded-lg border text-center",
            dataset.duplicateRows === 0 
              ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
              : "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20"
          )}>
            {dataset.duplicateRows === 0 ? (
              <>
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p className="font-medium text-green-700 dark:text-green-300">No duplicate rows found</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">Your dataset is clean!</p>
              </>
            ) : (
              <>
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-orange-500" />
                <p className="font-medium text-orange-700 dark:text-orange-300">
                  {dataset.duplicateRows} duplicate rows detected
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  ({((dataset.duplicateRows / dataset.rowCount) * 100).toFixed(1)}% of total data)
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove Duplicates
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Statistics Panel Component
function StatisticsPanel({ dataset }: { dataset: DatasetInfo }) {
  const [expandedColumn, setExpandedColumn] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {dataset.columns.map((col, idx) => {
        const isExpanded = expandedColumn === idx
        
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <Card className="overflow-hidden">
              <button
                className="w-full text-left"
                onClick={() => setExpandedColumn(isExpanded ? null : idx)}
              >
                <CardHeader className="py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <div>
                        <CardTitle className="text-base font-medium">{col.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <TypeBadge type={col.type} count={0} />
                          <span>•</span>
                          <span>{col.uniqueCount} unique values</span>
                          {col.missingCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-red-500">{col.missingCount} missing</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    
                    {/* Quick Stats Preview */}
                    {col.type === 'numeric' && (
                      <div className="hidden md:flex items-center gap-4 text-sm text-gray-500">
                        <span><strong className="text-gray-700 dark:text-gray-300">μ:</strong> {col.mean?.toFixed(2)}</span>
                        <span><strong className="text-gray-700 dark:text-gray-300">σ:</strong> {col.std?.toFixed(2)}</span>
                        <span>[{col.min?.toFixed(1)}, {col.max?.toFixed(1)}]</span>
                      </div>
                    )}
                    
                    {col.type === 'categorical' && col.categories && (
                      <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                        <span>Top: <strong className="text-gray-700 dark:text-gray-300">{col.mostFrequent}</strong></span>
                        <span>({col.categories[col.mostFrequent!]})</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-0 pb-4 border-t border-gray-100 dark:border-gray-800">
                      {col.type === 'numeric' ? (
                        <NumericStatsTable column={col} />
                      ) : col.type === 'categorical' ? (
                        <CategoricalStatsTable column={col} />
                      ) : (
                        <TextStatsTable column={col} />
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

function NumericStatsTable({ column }: { column: ColumnInfo }) {
  const stats = [
    { label: 'Mean', value: column.mean?.toFixed(4), icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Median', value: column.median?.toFixed(4), icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Mode', value: String(column.mode ?? 'N/A'), icon: <PieChart className="w-4 h-4" /> },
    { label: 'Std Dev', value: column.std?.toFixed(4), icon: <SlidersHorizontal className="w-4 h-4" /> },
    { label: 'Variance', value: column.variance?.toFixed(4), icon: <Scale className="w-4 h-4" /> },
    { label: 'Min', value: column.min?.toFixed(4), icon: <ArrowDownAZ className="w-4 h-4" /> },
    { label: 'Max', value: column.max?.toFixed(4), icon: <ArrowUpAZ className="w-4 h-4" /> },
    { label: 'Range', value: column.range?.toFixed(4), icon: <Maximize2 className="w-4 h-4" /> },
    { label: 'Q1 (25%)', value: column.q1?.toFixed(4), icon: null },
    { label: 'Q3 (75%)', value: column.q3?.toFixed(4), icon: null },
    { label: 'IQR', value: column.iqr?.toFixed(4), icon: null },
    { label: 'Skewness', value: column.skewness?.toFixed(4), icon: null },
    { label: 'Kurtosis', value: column.kurtosis?.toFixed(4), icon: null },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {stats.map((stat, idx) => (
        <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            {stat.icon}
            <span className="text-xs font-medium">{stat.label}</span>
          </div>
          <p className="font-mono font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

function CategoricalStatsTable({ column }: { column: ColumnInfo }) {
  if (!column.categories) return null
  
  const sortedCategories = Object.entries(column.categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  
  const maxCount = sortedCategories[0]?.[1] || 1

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
          <span className="text-xs text-purple-600 dark:text-purple-400">Unique Categories</span>
          <p className="font-bold text-purple-700 dark:text-purple-300 text-lg">{column.uniqueCount}</p>
        </div>
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
          <span className="text-xs text-indigo-600 dark:text-indigo-400">Most Frequent</span>
          <p className="font-bold text-indigo-700 dark:text-indigo-300 text-lg truncate">{column.mostFrequent}</p>
        </div>
        <div className="p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
          <span className="text-xs text-pink-600 dark:text-pink-400">Mode Count</span>
          <p className="font-bold text-pink-700 dark:text-pink-300 text-lg">
            {column.mostFrequent ? column.categories[column.mostFrequent] : 0}
          </p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-xs text-gray-500">Missing</span>
          <p className="font-bold text-gray-700 dark:text-gray-300 text-lg">{column.missingCount}</p>
        </div>
      </div>
      
      <div>
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Category Distribution</h5>
        <div className="space-y-2">
          {sortedCategories.map(([category, count], idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-32 truncate" title={category}>
                {category}
              </span>
              <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCount) * 100}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded"
                />
              </div>
              <span className="text-sm font-mono text-gray-600 dark:text-gray-400 w-12 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
        {Object.keys(column.categories).length > 10 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            ...and {Object.keys(column.categories).length - 10} more categories
          </p>
        )}
      </div>
    </div>
  )
}

function TextStatsTable({ column }: { column: ColumnInfo }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <span className="text-xs text-gray-500">Unique Values</span>
        <p className="font-bold text-gray-700 dark:text-gray-300 text-lg">{column.uniqueCount}</p>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <span className="text-xs text-gray-500">Missing</span>
        <p className="font-bold text-gray-700 dark:text-gray-300 text-lg">{column.missingCount}</p>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <span className="text-xs text-gray-500">Uniqueness</span>
        <p className="font-bold text-gray-700 dark:text-gray-300 text-lg">
          {((column.uniqueCount / (column.uniqueCount + column.missingCount)) * 100).toFixed(1)}%
        </p>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <span className="text-xs text-gray-500">Type</span>
        <p className="font-bold text-gray-700 dark:text-gray-300 text-lg capitalize">{column.type}</p>
      </div>
    </div>
  )
}

// Transform Tools Component
function TransformTools({ 
  dataset, 
  onDatasetUpdate 
}: { 
  dataset: DatasetInfo; 
  onDatasetUpdate: (dataset: DatasetInfo) => void;
}) {
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([])
  const [newColumnName, setNewColumnName] = useState('')
  const [renameColumnIdx, setRenameColumnIdx] = useState<number | null>(null)
  const [fillMethod, setFillMethod] = useState<'mean' | 'median' | 'mode' | 'drop'>('mean')

  const toggleColumnSelection = (colName: string) => {
    setSelectedColumns(prev =>
      prev.includes(colName)
        ? prev.filter(n => n !== colName)
        : [...prev, colName]
    )
  }

  const selectAllColumns = () => {
    setSelectedColumns(dataset.columns.map(c => c.name))
  }

  const deselectAllColumns = () => {
    setSelectedColumns([])
  }

  const removeSelectedColumns = () => {
    const indicesToRemove = selectedColumns.map(name => 
      dataset.columns.findIndex(c => c.name === name)
    ).filter(idx => idx >= 0)

    if (indicesToRemove.length === 0) return

    const newData = dataset.rawData.map(row =>
      row.filter((_, idx) => !indicesToRemove.includes(idx))
    )
    const newColumns = dataset.columns.filter((_, idx) => !indicesToRemove.includes(idx))

    onDatasetUpdate({
      ...dataset,
      rawData: newData,
      columns: newColumns,
      columnCount: newColumns.length,
    })
    setSelectedColumns([])
  }

  const renameColumn = () => {
    if (renameColumnIdx === null || !newColumnName.trim()) return
    
    const newRawData = [...dataset.rawData]
    newRawData[0][renameColumnIdx] = newColumnName.trim()
    
    const newColumns = [...dataset.columns]
    newColumns[renameColumnIdx] = {
      ...newColumns[renameColumnIdx],
      name: newColumnName.trim(),
    }

    onDatasetUpdate({
      ...dataset,
      rawData: newRawData,
      columns: newColumns,
    })

    setNewColumnName('')
    setRenameColumnIdx(null)
  }

  const handleMissingValues = () => {
    if (selectedColumns.length === 0) return

    const indicesToFill = selectedColumns.map(name => 
      dataset.columns.findIndex(c => c.name === name)
    ).filter(idx => idx >= 0)

    const newData = dataset.rawData.map((row, rowIdx) => {
      if (rowIdx === 0) return row // Keep header
      
      return row.map((cell, colIdx) => {
        if (!indicesToFill.includes(colIdx)) return cell
        
        // Check if it's a missing value
        const strVal = String(cell).trim().toLowerCase()
        const isMissing = ['', 'nan', 'na', 'null', 'undefined', 'none', '-', 'n/a'].includes(strVal) || cell === null || cell === undefined
        
        if (!isMissing) return cell
        
        const col = dataset.columns[colIdx]
        
        if (fillMethod === 'drop') return '__DROP__'
        if (fillMethod === 'mean' && col.mean !== undefined) return col.mean.toFixed(4)
        if (fillMethod === 'median' && col.median !== undefined) return col.median.toFixed(4)
        if (fillMethod === 'mode' && col.mode !== undefined) return col.mode
        
        return cell
      })
    })

    // Handle drop method
    let finalData = newData
    if (fillMethod === 'drop') {
      finalData = newData.filter(row => !row.includes('__DROP__'))
    }

    // Recalculate stats would happen here in a real implementation
    onDatasetUpdate({
      ...dataset,
      rawData: finalData,
      rowCount: finalData.length,
    })
  }

  const removeDuplicates = () => {
    const seen = new Set<string>()
    const uniqueData = [dataset.rawData[0]] // Keep header
    
    for (let i = 1; i < dataset.rawData.length; i++) {
      const key = JSON.stringify(dataset.rawData[i])
      if (!seen.has(key)) {
        seen.add(key)
        uniqueData.push(dataset.rawData[i])
      }
    }

    onDatasetUpdate({
      ...dataset,
      rawData: uniqueData,
      rowCount: uniqueData.length,
      duplicateRows: 0,
    })
  }

  const normalizeColumns = () => {
    const indicesToNormalize = selectedColumns.length > 0
      ? selectedColumns.map(name => dataset.columns.findIndex(c => c.name === name)).filter(idx => idx >= 0)
      : dataset.columns.map((_, idx) => idx).filter(idx => dataset.columns[idx].type === 'numeric')

    const newData = dataset.rawData.map((row, rowIdx) => {
      if (rowIdx === 0) return row // Keep header
      
      return row.map((cell, colIdx) => {
        if (!indicesToNormalize.includes(colIdx)) return cell
        
        const num = Number(cell)
        if (isNaN(num)) return cell
        
        const col = dataset.columns[colIdx]
        if (col.min === undefined || col.max === undefined || col.min === col.max) return cell
        
        // Min-max normalization
        return ((num - col.min) / (col.max - col.min)).toFixed(6)
      })
    })

    onDatasetUpdate({
      ...dataset,
      rawData: newData,
    })
  }

  const standardizeColumns = () => {
    const indicesToStandardize = selectedColumns.length > 0
      ? selectedColumns.map(name => dataset.columns.findIndex(c => c.name === name)).filter(idx => idx >= 0)
      : dataset.columns.map((_, idx) => idx).filter(idx => dataset.columns[idx].type === 'numeric')

    const newData = dataset.rawData.map((row, rowIdx) => {
      if (rowIdx === 0) return row // Keep header
      
      return row.map((cell, colIdx) => {
        if (!indicesToStandardize.includes(colIdx)) return cell
        
        const num = Number(cell)
        if (isNaN(num)) return cell
        
        const col = dataset.columns[colIdx]
        if (col.mean === undefined || col.std === undefined || col.std === 0) return cell
        
        // Z-score standardization
        return ((num - col.mean) / col.std).toFixed(6)
      })
    })

    onDatasetUpdate({
      ...dataset,
      rawData: newData,
    })
  }

  return (
    <div className="space-y-6">
      {/* Tool Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ToolButton
          icon={<Filter className="w-5 h-5" />}
          label="Filter Rows"
          active={activeTool === 'filter'}
          onClick={() => setActiveTool(activeTool === 'filter' ? null : 'filter')}
        />
        <ToolButton
          icon={<Shuffle className="w-5 h-5" />}
          label="Sort Data"
          active={activeTool === 'sort'}
          onClick={() => setActiveTool(activeTool === 'sort' ? null : 'sort')}
        />
        <ToolButton
          icon={<Pencil className="w-5 h-5" />}
          label="Rename Columns"
          active={activeTool === 'rename'}
          onClick={() => setActiveTool(activeTool === 'rename' ? null : 'rename')}
        />
        <ToolButton
          icon={<Layers className="w-5 h-5" />}
          label="Select Columns"
          active={activeTool === 'select'}
          onClick={() => setActiveTool(activeTool === 'select' ? null : 'select')}
        />
        <ToolButton
          icon={<Droplets className="w-5 h-5" />}
          label="Handle Missing"
          active={activeTool === 'missing'}
          onClick={() => setActiveTool(activeTool === 'missing' ? null : 'missing')}
        />
        <ToolButton
          icon={<Copy className="w-5 h-5" />}
          label="Remove Duplicates"
          active={false}
          onClick={removeDuplicates}
          variant="action"
        />
        <ToolButton
          icon={<Scale className="w-5 h-5" />}
          label="Normalize"
          active={activeTool === 'normalize'}
          onClick={() => setActiveTool(activeTool === 'normalize' ? null : 'normalize')}
        />
        <ToolButton
          icon={<TrendingUp className="w-5 h-5" />}
          label="Standardize"
          active={activeTool === 'standardize'}
          onClick={() => setActiveTool(activeTool === 'standardize' ? null : 'standardize')}
        />
      </div>

      {/* Tool Panels */}
      <AnimatePresence mode="wait">
        {activeTool === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Column Selection</CardTitle>
                <CardDescription>Select columns to keep or remove</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllColumns}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllColumns}>
                    Deselect All
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={removeSelectedColumns}
                    disabled={selectedColumns.length === 0}
                  >
                    <Eraser className="w-4 h-4 mr-1" />
                    Remove Selected ({selectedColumns.length})
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {dataset.columns.map((col, idx) => (
                    <Badge
                      key={idx}
                      variant={selectedColumns.includes(col.name) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedColumns.includes(col.name) 
                          ? "bg-[#C1121F] hover:bg-[#C1121F]/80" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                      onClick={() => toggleColumnSelection(col.name)}
                    >
                      {col.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTool === 'rename' && (
          <motion.div
            key="rename"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rename Column</CardTitle>
                <CardDescription>Select a column and enter its new name</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Column</label>
                    <Select value={renameColumnIdx?.toString() || ''} onValueChange={(v) => setRenameColumnIdx(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a column..." />
                      </SelectTrigger>
                      <SelectContent>
                        {dataset.columns.map((col, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">New Name</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter new column name..."
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && renameColumn()}
                      />
                      <Button 
                        onClick={renameColumn}
                        disabled={!newColumnName.trim() || renameColumnIdx === null}
                      >
                        Rename
                      </Button>
                    </div>
                  </div>
                </div>
                
                {renameColumnIdx !== null && (
                  <p className="text-sm text-gray-500">
                    Renaming: <strong>{dataset.columns[renameColumnIdx]?.name}</strong> → <strong>{newColumnName || '...'}</strong>
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTool === 'missing' && (
          <motion.div
            key="missing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Handle Missing Values</CardTitle>
                <CardDescription>Choose how to fill or remove missing values</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Fill Method</label>
                  <Select value={fillMethod} onValueChange={(v: any) => setFillMethod(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mean">Fill with Mean (numeric)</SelectItem>
                      <SelectItem value="median">Fill with Median (numeric)</SelectItem>
                      <SelectItem value="mode">Fill with Mode (categorical)</SelectItem>
                      <SelectItem value="drop">Drop Rows with Missing Values</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Apply To</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {dataset.columns.filter(c => c.missingCount > 0).map((col, idx) => {
                      const actualIdx = dataset.columns.findIndex(c => c.name === col.name)
                      return (
                        <Badge
                          key={idx}
                          variant={selectedColumns.includes(col.name) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer",
                            selectedColumns.includes(col.name) && "bg-[#C1121F]"
                          )}
                          onClick={() => toggleColumnSelection(col.name)}
                        >
                          {col.name} ({col.missingCount})
                        </Badge>
                      )
                    })}
                  </div>
                  {selectedColumns.length === 0 && (
                    <p className="text-xs text-gray-500">Click columns above or leave empty to apply to all columns with missing values</p>
                  )}
                </div>
                
                <Button onClick={handleMissingValues}>
                  <Droplets className="w-4 h-4 mr-2" />
                  Apply Transformation
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTool === 'normalize' && (
          <motion.div
            key="normalize"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Normalize (Min-Max Scaling)</CardTitle>
                <CardDescription>Scale values to [0, 1] range</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Formula: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">(x - min) / (max - min)</code>
                </p>
                <div className="flex flex-wrap gap-2">
                  {dataset.columns.filter(c => c.type === 'numeric').map((col, idx) => (
                    <Badge
                      key={idx}
                      variant={selectedColumns.includes(col.name) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer",
                        selectedColumns.includes(col.name) && "bg-[#C1121F]"
                      )}
                      onClick={() => toggleColumnSelection(col.name)}
                    >
                      {col.name}
                    </Badge>
                  ))}
                </div>
                <Button onClick={normalizeColumns}>
                  <Scale className="w-4 h-4 mr-2" />
                  Normalize Selected
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTool === 'standardize' && (
          <motion.div
            key="standardize"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Standardize (Z-Score)</CardTitle>
                <CardDescription>Transform to have mean=0, std=1</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Formula: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">(x - μ) / σ</code>
                </p>
                <div className="flex flex-wrap gap-2">
                  {dataset.columns.filter(c => c.type === 'numeric').map((col, idx) => (
                    <Badge
                      key={idx}
                      variant={selectedColumns.includes(col.name) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer",
                        selectedColumns.includes(col.name) && "bg-[#C1121F]"
                      )}
                      onClick={() => toggleColumnSelection(col.name)}
                    >
                      {col.name}
                    </Badge>
                  ))}
                </div>
                <Button onClick={standardizeColumns}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Standardize Selected
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ToolButton({ 
  icon, 
  label, 
  active, 
  onClick, 
  variant = 'default' 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  variant?: 'default' | 'action';
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className={cn(
        "flex-col h-auto py-3 gap-1",
        active && "bg-[#C1121F] hover:bg-[#C1121F]/90",
        variant === 'action' && "bg-green-600 hover:bg-green-700 text-white border-green-600"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  )
}

// Export Options Component
function ExportOptions({ dataset }: { dataset: DatasetInfo }) {
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  const exportAsCSV = async () => {
    setExporting(true)
    try {
      const csvContent = dataset.rawData.map(row => 
        row.map(cell => {
          const str = String(cell)
          // Escape cells that contain commas or quotes
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }).join(',')
      ).join('\n')
      
      downloadFile(csvContent, `${dataset.name.replace(/\.[^/.]+$/, '')}_cleaned.csv`, 'text/csv')
    } finally {
      setTimeout(() => setExporting(false), 500)
    }
  }

  const exportAsJSON = async () => {
    setExporting(true)
    try {
      const headers = dataset.rawData[0]
      const jsonData = dataset.rawData.slice(1).map(row => {
        const obj: Record<string, any> = {}
        headers.forEach((header, idx) => {
          obj[header] = row[idx]
        })
        return obj
      })
      
      downloadFile(JSON.stringify(jsonData, null, 2), `${dataset.name.replace(/\.[^/.]+$/, '')}_cleaned.json`, 'application/json')
    } finally {
      setTimeout(() => setExporting(false), 500)
    }
  }

  const copyToClipboard = async () => {
    try {
      const headers = dataset.rawData[0]
      const jsonData = dataset.rawData.slice(1).map(row => {
        const obj: Record<string, any> = {}
        headers.forEach((header, idx) => {
          obj[header] = row[idx]
        })
        return obj
      })
      
      await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="w-5 h-5 text-[#C1121F]" />
          Export Dataset
        </CardTitle>
        <CardDescription>Download your processed data in various formats</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={exportAsCSV}
            disabled={exporting}
          >
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <span>Download CSV</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={exportAsJSON}
            disabled={exporting}
          >
            <FileJson className="w-6 h-6 text-blue-600" />
            <span>Download JSON</span>
          </Button>
          
          <Button 
            variant="outline" 
            className={cn(
              "h-auto py-4 flex-col gap-2",
              copied && "bg-green-50 border-green-200 text-green-700"
            )}
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <ClipboardCopy className="w-6 h-6 text-purple-600" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Dataset Manager Component
// ============================================================================

export default function DatasetManager({ 
  onDatasetLoaded, 
  onAnalyzeClick,
  className 
}: DatasetManagerProps) {
  const [dataset, setDataset] = useState<DatasetInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: -1, direction: null })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('preview')

  const processFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    setLoadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setLoadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const text = await file.text()
      setLoadProgress(95)

      const extension = file.name.split('.').pop()?.toLowerCase()
      let parsedData: any[][] = []

      // Parse based on extension
      if (extension === 'csv') {
        parsedData = parseCSV(text)
      } else if (extension === 'tsv') {
        parsedData = parseTSV(text)
      } else if (extension === 'json') {
        parsedData = parseJSON(text)
      } else if (extension === 'txt') {
        // Try CSV first, then TSV
        parsedData = text.includes('\t') ? parseTSV(text) : parseCSV(text)
      } else {
        // For bio formats, attempt CSV parsing as fallback
        parsedData = parseCSV(text)
      }

      clearInterval(progressInterval)
      setLoadProgress(100)

      if (parsedData.length < 2) {
        throw new Error('File appears to be empty or invalid. Please check the file format.')
      }

      // Extract header and data
      const header = parsedData[0]
      const dataRows = parsedData.slice(1)

      // Detect column types and calculate statistics
      const columns: ColumnInfo[] = header.map((colName, idx) => {
        const columnValues = dataRows.map(row => String(row[idx] ?? ''))
        const type = detectColumnType(columnValues)
        return calculateColumnStats(String(colName), columnValues, type)
      })

      // Calculate duplicates
      const seen = new Set<string>()
      let duplicateCount = 0
      for (const row of dataRows) {
        const key = JSON.stringify(row)
        if (seen.has(key)) {
          duplicateCount++
        }
        seen.add(key)
      }

      // Calculate total missing values
      const totalMissing = columns.reduce((sum, col) => sum + col.missingCount, 0)

      const newDataset: DatasetInfo = {
        id: generateId(),
        name: file.name,
        format: extension || 'unknown',
        rowCount: parsedData.length,
        columnCount: header.length,
        size: file.size,
        rawData: parsedData,
        columns,
        missingValues: totalMissing,
        duplicateRows: duplicateCount,
        loadedAt: new Date(),
      }

      setDataset(newDataset)
      setLoading(false)
      onDatasetLoaded?.(newDataset)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
      setLoading(false)
    }
  }, [onDatasetLoaded])

  const handleSort = useCallback((column: number) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' :
               prev.column === column && prev.direction === 'desc' ? null : 'asc'
    }))
  }, [])

  const clearDataset = useCallback(() => {
    setDataset(null)
    setSearchQuery('')
    setSortConfig({ column: -1, direction: null })
    setActiveTab('preview')
  }, [])

  const handleDatasetUpdate = useCallback((updatedDataset: DatasetInfo) => {
    setDataset(updatedDataset)
  }, [])

  return (
    <div className={cn("w-full space-y-6", className)}>
      {!dataset ? (
        /* Upload State */
        <UploadZone onFileSelect={processFile} />
      ) : (
        /* Dataset Loaded State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#C1121F]/10">
                <Database className="w-6 h-6 text-[#C1121F]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {dataset.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {dataset.rowCount.toLocaleString()} rows • {dataset.columnCount} columns • {formatFileSize(dataset.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onAnalyzeClick && (
                <Button 
                  onClick={() => onAnalyzeClick(dataset)}
                  className="bg-[#C1121F] hover:bg-[#C1121F]/90"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Data
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={clearDataset} title="Load new dataset">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Dataset Overview */}
          <DatasetOverview dataset={dataset} />

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview</span>
              </TabsTrigger>
              <TabsTrigger value="quality" className="gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Quality</span>
              </TabsTrigger>
              <TabsTrigger value="statistics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Statistics</span>
              </TabsTrigger>
              <TabsTrigger value="transform" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Transform</span>
              </TabsTrigger>
            </TabsList>

            {/* Preview Tab */}
            <TabsContent value="preview" className="mt-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search in table..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Table */}
              <DataTable
                dataset={dataset}
                sortConfig={sortConfig}
                onSort={handleSort}
                searchQuery={searchQuery}
              />

              {/* Export */}
              <ExportOptions dataset={dataset} />
            </TabsContent>

            {/* Quality Tab */}
            <TabsContent value="quality" className="mt-6">
              <DataQualityPanel dataset={dataset} />
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="mt-6">
              <StatisticsPanel dataset={dataset} />
            </TabsContent>

            {/* Transform Tab */}
            <TabsContent value="transform" className="mt-6">
              <TransformTools 
                dataset={dataset} 
                onDatasetUpdate={handleDatasetUpdate}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border-4 border-[#C1121F]/20 border-t-[#C1121F] mb-6"
                />
                <h3 className="text-lg font-semibold mb-2">Processing Dataset</h3>
                <p className="text-sm text-gray-500 mb-4">Analyzing data structure and computing statistics...</p>
                <Progress value={loadProgress} className="w-full h-2" />
                <p className="text-xs text-gray-400 mt-2">{loadProgress}% complete</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 max-w-md"
          >
            <div className="bg-red-50 dark:bg-red-950/90 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800 dark:text-red-200">Error Loading Dataset</p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// DatasetManager component is exported above
// Types are exported at their definition location
