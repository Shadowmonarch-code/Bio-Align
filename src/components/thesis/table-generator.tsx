'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Table as TableIcon,
  Plus,
  Download,
  Copy,
  Trash2,
  Edit3,
  Eye,
  Settings,
  FileText,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  ChevronDown,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Grid3X3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface TableRecord {
  id: string
  title: string
  type: 'anova' | 'descriptive' | 'correlation' | 'regression' | 'comparison' | 'genetic' | 'custom'
  data: any[][]
  headers: string[]
  caption: string
  journalStyle: string
  significanceIndicators: boolean
}

interface TableGeneratorProps {
  onTableCreate: (table: TableRecord) => void
  existingTables: TableRecord[]
}

// Journal style configurations
const JOURNAL_STYLES = {
  APA: {
    name: 'APA (7th Edition)',
    font: 'Times New Roman',
    fontSize: 12,
    headerFontWeight: 'bold',
    horizontalLines: [true, false, true], // top, middle, bottom
    verticalLines: false,
    cellPadding: '8px',
    alignment: 'center' as const,
    captionPosition: 'above' as const,
    captionFormat: 'italic',
  },
  Nature: {
    name: 'Nature Style',
    font: 'Arial',
    fontSize: 10,
    headerFontWeight: 'bold',
    horizontalLines: [true, true, true],
    verticalLines: true,
    cellPadding: '6px',
    alignment: 'left' as const,
    captionPosition: 'above' as const,
    captionFormat: 'normal',
  },
  Science: {
    name: 'Science Style',
    font: 'Helvetica',
    fontSize: 9,
    headerFontWeight: 'bold',
    horizontalLines: [true, true, true],
    verticalLines: true,
    cellPadding: '5px',
    alignment: 'center' as const,
    captionPosition: 'below' as const,
    captionFormat: 'italic',
  },
  Custom: {
    name: 'Custom Style',
    font: 'Arial',
    fontSize: 11,
    headerFontWeight: 'bold',
    horizontalLines: [true, false, true],
    verticalLines: false,
    cellPadding: '8px',
    alignment: 'center' as const,
    captionPosition: 'above' as const,
    captionFormat: 'italic',
  },
}

// Sample table templates
const TABLE_TEMPLATES = {
  anova: {
    title: 'Analysis of Variance (ANOVA)',
    headers: ['Source', 'df', 'SS', 'MS', 'F', 'p-value'],
    data: [
      ['Treatment', '4', '125.67', '25.13', '15.42', '<0.001***'],
      ['Block', '2', '8.34', '4.17', '2.56', '0.084'],
      ['Error', '88', '143.56', '1.63', '', ''],
      ['Total', '94', '277.57', '', '', ''],
    ],
    caption: 'Table X. Analysis of variance for [trait] showing treatment effects.',
  },
  descriptive: {
    title: 'Descriptive Statistics',
    headers: ['Variable', 'N', 'Mean', 'SD', 'Min', 'Max', 'CV (%)'],
    data: [
      ['Plant Height (cm)', '50', '145.23', '18.45', '98.5', '189.2', '12.7'],
      ['Grain Yield (t/ha)', '50', '4.52', '0.89', '2.1', '6.8', '19.7'],
      ['100-Seed Weight (g)', '50', '24.56', '3.21', '17.8', '32.4', '13.1'],
      ['Days to Flowering', '50', '62.5', '4.32', '54', '72', '6.9'],
    ],
    caption: 'Table X. Descriptive statistics for measured agronomic traits.',
  },
  correlation: {
    title: 'Correlation Matrix',
    headers: ['Trait', 'PH', 'GY', 'SW', 'DF'],
    data: [
      ['Plant Height', '1.000', '', '', ''],
      ['Grain Yield', '0.654**', '1.000', '', ''],
      ['100-SW', '0.432*', '0.789***', '1.000', ''],
      ['Days to Flowering', '-0.321', '-0.567**', '-0.234', '1.000'],
    ],
    caption: 'Table X. Pearson correlation coefficients among agronomic traits. *, **, *** significant at p < 0.05, 0.01, and 0.001, respectively.',
  },
  regression: {
    title: 'Regression Analysis Summary',
    headers: ['Predictor', 'B', 'SE(B)', 'β', 't', 'p-value', 'VIF'],
    data: [
      ['(Intercept)', '12.45', '2.34', '', '5.32', '<0.001***', ''],
      ['Plant Height', '0.034', '0.008', '0.423', '4.25', '<0.001***', '1.24'],
      ['100-SW', '0.156', '0.042', '0.389', '3.71', '<0.001**', '1.35'],
      ['Days to Flower', '-0.078', '0.028', '-0.245', '-2.79', '0.007**', '1.18'],
    ],
    caption: 'Table X. Multiple regression analysis predicting grain yield from agronomic traits. R² = 0.687, Adjusted R² = 0.668.',
  },
  genetic: {
    title: 'Genetic Parameters',
    headers: ['Parameter', 'GCV (%)', 'PCV (%)', 'h² (broad sense)', 'GA (%)'],
    data: [
      ['Plant Height', '10.24', '14.56', '49.43', '15.02'],
      ['Grain Yield', '16.89', '22.34', '57.19', '26.45'],
      ['100-Seed Weight', '11.23', '13.87', '65.62', '18.76'],
      ['Days to Flowering', '5.67', '7.12', '63.48', '9.34'],
    ],
    caption: 'Table X. Estimates of genetic parameters for agronomic traits. GCV: Genotypic coefficient of variation; PCV: Phenotypic coefficient of variation; h²: Heritability; GA: Genetic advance as percent of mean.',
  },
  comparison: {
    title: 'Mean Comparison (LSD Test)',
    headers: ['Treatment', 'Mean', 'Group'],
    data: [
      ['T1 - Control', '3.21', 'c'],
      ['T2 - NPK', '4.56', 'ab'],
      ['T3 - Organic', '4.12', 'b'],
      ['T4 - Bio-fertilizer', '4.89', 'a'],
      ['T5 - Combined', '5.12', 'a'],
    ],
    caption: 'Table X. Mean comparison of treatments using LSD test at α = 0.05. Means followed by different letters are significantly different.',
  },
}

type TableType = keyof typeof TABLE_TEMPLATES

export default function TableGenerator({ onTableCreate, existingTables }: TableGeneratorProps) {
  const [tables, setTables] = useState<TableRecord[]>(existingTables)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // New table state
  const [newTableType, setNewTableType] = useState<TableType>('anova')
  const [tableTitle, setTableTitle] = useState('')
  const [tableCaption, setTableCaption] = useState('')
  const [journalStyle, setJournalStyle] = useState<keyof typeof JOURNAL_STYLES>('APA')
  const [decimalPlaces, setDecimalPlaces] = useState(2)
  const [showSignificanceIndicators, setShowSignificanceIndicators] = useState(true)
  const [borderStyle, setBorderStyle] = useState<'minimal' | 'standard' | 'full'>('standard')

  const selectedTable = useMemo(() =>
    tables.find(t => t.id === selectedTableId),
    [tables, selectedTableId]
  )

  const currentStyle = JOURNAL_STYLES[journalStyle]

  const handleCreateTable = () => {
    const template = TABLE_TEMPLATES[newTableType]
    
    const newTable: TableRecord = {
      id: `table-${Date.now()}`,
      title: tableTitle || template.title,
      type: newTableType,
      data: template.data.map(row => [...row]),
      headers: [...template.headers],
      caption: tableCaption || template.caption,
      journalStyle,
      significanceIndicators: showSignificanceIndicators,
    }

    setTables(prev => [...prev, newTable])
    onTableCreate(newTable)
    setSelectedTableId(newTable.id)
    setIsCreateDialogOpen(false)

    // Reset form
    setTableTitle('')
    setTableCaption('')
  }

  const handleDeleteTable = (tableId: string) => {
    setTables(prev => prev.filter(t => t.id !== tableId))
    if (selectedTableId === tableId) {
      setSelectedTableId(null)
    }
  }

  const handleDuplicateTable = (table: TableRecord) => {
    const duplicated: TableRecord = {
      ...table,
      id: `table-${Date.now()}`,
      title: `${table.title} (Copy)`,
    }
    setTables(prev => [...prev, duplicated])
    onTableCreate(duplicated)
  }

  const exportAsCSV = (table: TableRecord) => {
    const csvContent = [
      table.headers.join(','),
      ...table.data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${table.title.replace(/\s+/g, '_')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async (table: TableRecord) => {
    // Create HTML table format for Word
    let html = `<table border="1" cellpadding="8" cellspacing="0">\n`
    html += `<caption>${table.caption}</caption>\n`
    html += `<thead><tr>`
    table.headers.forEach(h => {
      html += `<th><strong>${h}</strong></th>`
    })
    html += `</tr></thead>\n<tbody>`
    table.data.forEach(row => {
      html += `<tr>`
      row.forEach(cell => {
        html += `<td>${cell}</td>`
      })
      html += `</tr>\n`
    })
    html += `</tbody></table>`

    try {
      await navigator.clipboard.writeText(html)
      alert('Table copied! Paste into Word or Google Docs.')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const generateLaTeX = (table: TableRecord): string => {
    return `\\begin{table}[htbp]
\\centering
\\caption{${table.caption.replace('Table X.', '')}}
\\begin{tabular}{${'l'.repeat(table.headers.length)}}
\\toprule
${table.headers.join(' & ')} \\\\
\\midrule
${table.data.map(row => row.join(' & ') + ' \\\\').join('\n')}
\\bottomrule
\\end{tabular}
\\end{table}`
  }

  const renderPreviewTable = (table: TableRecord) => {
    const style = JOURNAL_STYLES[table.journalStyle as keyof typeof JOURNAL_STYLES] || JOURNAL_STYLES.APA
    
    return (
      <div className="overflow-x-auto">
        {/* Caption */}
        <div 
          className={`text-sm mb-2 ${style.captionFormat === 'italic' ? 'italic' : ''}`}
          style={{ textAlign: style.alignment }}
        >
          {table.caption}
        </div>
        
        {/* Table */}
        <table 
          className="w-full text-sm"
          style={{ 
            fontFamily: style.font,
            fontSize: `${style.fontSize}px`,
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              {table.headers.map((header, idx) => (
                <th
                  key={idx}
                  className="bg-muted/50"
                  style={{
                    padding: style.cellPadding,
                    fontWeight: style.headerFontWeight === 'bold' ? 700 : 400,
                    textAlign: style.alignment,
                    borderBottom: style.horizontalLines[0] ? '2px solid #333' : 'none',
                    borderRight: style.verticalLines ? '1px solid #ddd' : 'none',
                    borderLeft: idx === 0 && style.verticalLines ? '1px solid #ddd' : 'none',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    style={{
                      padding: style.cellPadding,
                      textAlign: style.alignment,
                      borderBottom: style.horizontalLines[2] || (style.horizontalLines[1] && rowIdx < table.data.length - 1) ? '1px solid #ddd' : 'none',
                      borderRight: style.verticalLines ? '1px solid #eee' : 'none',
                      borderLeft: cellIdx === 0 && style.verticalLines ? '1px solid #eee' : 'none',
                    }}
                  >
                    {cell.includes('***') || cell.includes('**') || cell.includes('*') ? (
                      <span dangerouslySetInnerHTML={{
                        __html: cell
                          .replace(/\*\*\*/g, '<sup class="text-red-600">***</sup>')
                          .replace(/\*\*/g, '<sup class="text-orange-600">**</sup>')
                          .replace(/(?<!\*)\*(?!\*)/g, '<sup class="text-yellow-600">*</sup>')
                      }} />
                    ) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Significance legend */}
        {table.significanceIndicators && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            Note: * p &lt; 0.05, ** p &lt; 0.01, *** p &lt; 0.001
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-[#C1121F]" />
                Professional Table Generator
              </CardTitle>
              <CardDescription>Create publication-quality tables for your thesis</CardDescription>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2">
                  <Plus className="w-4 h-4" /> New Table
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Table</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="template" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="template">From Template</TabsTrigger>
                    <TabsTrigger value="custom">Custom Table</TabsTrigger>
                  </TabsList>

                  <TabsContent value="template" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(Object.keys(TABLE_TEMPLATES) as TableType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => setNewTableType(type)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            newTableType === type
                              ? 'border-[#C1121F] bg-[#C1121F]/5'
                              : 'hover:border-muted-foreground/30'
                          }`}
                        >
                          <p className="font-medium text-sm capitalize">{type}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {TABLE_TEMPLATES[type].title}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Template Preview */}
                    <div className="border rounded-lg p-4 bg-muted/20">
                      <p className="text-sm font-medium mb-2">{TABLE_TEMPLATES[newTableType].title}</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-muted">
                              {TABLE_TEMPLATES[newTableType].headers.map((h, i) => (
                                <th key={i} className="p-2 border font-semibold">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {TABLE_TEMPLATES[newTableType].data.slice(0, 3).map((row, i) => (
                              <tr key={i}>
                                {row.map((cell, j) => (
                                  <td key={j} className="p-2 border">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="custom" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Table Data (CSV format)</Label>
                      <Textarea
                        placeholder="Header1,Header2,Header3&#10;Row1Col1,Row1Col2,Row1Col3&#10;..."
                        className="min-h-[150px] font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Common Options */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={tableTitle}
                        onChange={(e) => setTableTitle(e.target.value)}
                        placeholder={TABLE_TEMPLATES[newTableType].title}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Caption</Label>
                      <Input
                        value={tableCaption}
                        onChange={(e) => setTableCaption(e.target.value)}
                        placeholder={TABLE_TEMPLATES[newTableType].caption}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Journal Style</Label>
                      <Select value={journalStyle} onValueChange={(v) => setJournalStyle(v as keyof typeof JOURNAL_STYLES)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(JOURNAL_STYLES).map(([key, style]) => (
                            <SelectItem key={key} value={key}>{style.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Border Style</Label>
                      <Select value={borderStyle} onValueChange={(v) => setBorderStyle(v as typeof borderStyle)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="full">Full Grid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Decimal Places</Label>
                      <Select value={String(decimalPlaces)} onValueChange={(v) => setDecimalPlaces(Number(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4].map(n => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="significance"
                        checked={showSignificanceIndicators}
                        onCheckedChange={setShowSignificanceIndicators}
                      />
                      <Label htmlFor="significance">Show significance indicators (*, **, ***)</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTable} className="bg-[#C1121F] hover:bg-[#9B0F1A]">
                    Create Table
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Tables List and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">
            Your Tables ({tables.length})
          </h3>
          
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 pr-2">
              {tables.length > 0 ? (
                tables.map((table) => (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all group ${
                      selectedTableId === table.id
                        ? 'border-[#C1121F] bg-[#C1121F]/5 shadow-sm'
                        : 'hover:border-muted-foreground/30 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <TableIcon className="w-4 h-4 shrink-0 text-[#C1121F]" />
                          <h4 className="font-medium truncate text-sm">{table.title}</h4>
                        </div>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {table.type.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {table.journalStyle} • {table.headers.length} columns
                        </p>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 shrink-0 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Copy className="w-3.5 h-3.5" onClick={(e) => { e.stopPropagation(); copyToClipboard(table); }} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Copy className="w-3.5 h-3.5" onClick={(e) => { e.stopPropagation(); handleDuplicateTable(table); }} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" onClick={(e) => { e.stopPropagation(); handleDeleteTable(table.id); }} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <TableIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No tables yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first table</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Preview / Editor */}
        <div className="lg:col-span-2">
          {selectedTable ? (
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-base">{selectedTable.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedTable.journalStyle} style • {selectedTable.type}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="w-4 h-4" /> Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyToClipboard(selectedTable)}>
                          <FileText className="w-4 h-4 mr-2" /> Copy to Word
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportAsCSV(selectedTable)}>
                          <FileSpreadsheet className="w-4 h-4 mr-2" /> Download CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(generateLaTeX(selectedTable))
                          alert('LaTeX code copied!')
                        }}>
                          <FileCode className="w-4 h-4 mr-2" /> Copy LaTeX
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTable(selectedTable.id)}
                      className="gap-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <Separator />

              <CardContent className="pt-6">
                {/* Style Selector */}
                <div className="flex items-center gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Preview Style:</span>
                  {(Object.keys(JOURNAL_STYLES) as (keyof typeof JOURNAL_STYLES)[]).map((style) => (
                    <Button
                      key={style}
                      variant={selectedTable.journalStyle === style ? 'default' : 'outline'}
                      size="sm"
                      className={`text-xs ${selectedTable.journalStyle === style ? 'bg-[#C1121F]' : ''}`}
                      onClick={() => {
                        const updated = { ...selectedTable, journalStyle: style }
                        setTables(prev => prev.map(t => t.id === selectedTable.id ? updated : t))
                      }}
                    >
                      {JOURNAL_STYLES[style].name.split(' ')[0]}
                    </Button>
                  ))}
                </div>

                {/* Table Preview */}
                <div className="border rounded-lg p-6 bg-white dark:bg-slate-900 overflow-x-auto">
                  {renderPreviewTable(selectedTable)}
                </div>

                {/* LaTeX Code */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    View LaTeX Code
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto font-mono">
                    {generateLaTeX(selectedTable)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">Select or Create a Table</h3>
                <p className="text-sm text-muted-foreground">
                  Choose an existing table or create a new one using templates
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
