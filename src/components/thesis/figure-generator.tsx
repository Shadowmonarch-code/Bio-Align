'use client'

import React, { useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon,
  Plus,
  Download,
  Trash2,
  Copy,
  Settings,
  Eye,
  Type,
  Palette,
  Maximize2,
  BarChart3,
  LineChart,
  Activity,
  Ruler,
  Layers,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
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

export interface FigureRecord {
  id: string
  title: string
  type: 'bar' | 'line' | 'scatter' | 'box' | 'heatmap' | 'pie' | 'histogram' | 'violin'
  dataUrl: string
  caption: string
  dimensions: { width: number; height: number }
  journalStyle?: string
}

interface FigureGeneratorProps {
  onFigureCreate: (figure: FigureRecord) => void
  existingFigures: FigureRecord[]
}

// Color palettes for figures
const COLOR_PALETTES = {
  academic: ['#C1121F', '#1E3A5F', '#2D6A4F', '#9B2226', '#0A4B5C', '#588157', '#6D597A', '#E29578'],
  nature: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'],
  colorblind: ['#0077BB', '#33BBEE', '#009988', '#EE7733', '#CC3311', '#EE3377', '#BBBBBB', '#000000'],
  grayscale: ['#333333', '#666666', '#999999', '#BBBBBB', '#DDDDDD', '#444444', '#777777', '#AAAAAA'],
  warm: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#FFFFD2'],
  cool: ['#74B9FF', '#0984E3', '#00CEC9', '#55EFC4', '#81ECEC', '#A29BFE', '#DFE6E9', '#B2BEC3'],
}

// Dimension presets
const DIMENSION_PRESETS = [
  { name: 'Single Column', width: 89, height: 67 },
  { name: 'Double Column', width: 183, height: 137 },
  { name: 'Square', width: 89, height: 89 },
  { name: 'Presentation', width: 160, height: 90 },
  { name: 'Custom', width: 120, height: 90 },
]

// Font options
const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
]

type FigureType = FigureRecord['type']

// Custom SVG icons for chart types
function ScatterChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="7" cy="15" r="2"/>
      <circle cx="12" cy="9" r="2"/>
      <circle cx="17" cy="13" r="2"/>
      <circle cx="9" cy="6" r="2"/>
      <circle cx="15" cy="17" r="2"/>
      <path d="M3 21h18M3 3v18"/>
    </svg>
  )
}

function PieChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  )
}

function BoxPlotIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <path d="M4 12h16M8 4v16M16 4v16"/>
    </svg>
  )
}

function HistogramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="12" width="4" height="9" rx="1"/>
      <rect x="9" y="8" width="4" height="13" rx="1"/>
      <rect x="15" y="4" width="4" height="17" rx="1"/>
    </svg>
  )
}

export default function FigureGenerator({ onFigureCreate, existingFigures }: FigureGeneratorProps) {
  const [figures, setFigures] = useState<FigureRecord[]>(existingFigures)
  const [selectedFigureId, setSelectedFigureId] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // New figure state
  const [figureType, setFigureType] = useState<FigureType>('bar')
  const [figureTitle, setFigureTitle] = useState('')
  const [figureCaption, setFigureCaption] = useState('')
  
  // Configuration state
  const [config, setConfig] = useState({
    width: 400,
    height: 300,
    fontFamily: 'Arial',
    fontSize: 12,
    colorPalette: 'academic' as keyof typeof COLOR_PALETTES,
    showLegend: true,
    legendPosition: 'right' as 'top' | 'bottom' | 'left' | 'right',
    showGrid: true,
    showErrorBars: true,
    errorBarStyle: 'sd' as 'sd' | 'se' | 'ci',
    axisLineWidth: 1,
    tickLength: 5,
    dpi: 300,
    format: 'png' as 'png' | 'svg' | 'pdf' | 'tiff',
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const selectedFigure = useMemo(() =>
    figures.find(f => f.id === selectedFigureId),
    [figures, selectedFigureId]
  )

  const currentColors = COLOR_PALETTES[config.colorPalette]

  // Sample data for preview
  const sampleData = useMemo(() => ({
    labels: ['Variety A', 'Variety B', 'Variety C', 'Variety D', 'Variety E'],
    values: [4.5, 5.2, 3.8, 6.1, 4.9],
    errorValues: [0.3, 0.4, 0.35, 0.45, 0.32],
    secondaryValues: [3.8, 4.5, 4.2, 5.5, 4.3],
  }), [])

  // Drawing helper functions - defined first to avoid reference errors
  const drawLegend = useCallback((
    ctx: CanvasRenderingContext2D,
    margin: { top: number; right: number; bottom: number; left: number },
    chartWidth: number,
    items: string[],
    colors?: string[],
    legendConfig: { position: string; fontSize: number; fontFamily: string }
  ) => {
    let legendX: number, legendY: number
    
    switch (legendConfig.position) {
      case 'top':
        legendX = margin.left + chartWidth / 2 - (items.length * 60) / 2
        legendY = 10
        break
      case 'bottom':
        legendX = margin.left + chartWidth / 2 - (items.length * 60) / 2
        legendY = margin.top + 350 + 20
        break
      case 'left':
        legendX = 10
        legendY = margin.top + 20
        break
      default:
        legendX = margin.left + chartWidth + 15
        legendY = margin.top + 20
    }

    items.forEach((item, index) => {
      if (colors) {
        ctx.fillStyle = colors[index % colors.length]
      } else {
        ctx.fillStyle = currentColors[0]
      }
      ctx.fillRect(legendX, legendY + index * 20, 14, 14)

      ctx.fillStyle = '#333333'
      ctx.font = `${legendConfig.fontSize - 1}px ${legendConfig.fontFamily}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(item, legendX + 18, legendY + index * 20 + 7)
    })
  }, [currentColors])

  const drawBarChart = useCallback((
    ctx: CanvasRenderingContext2D, 
    margin: { top: number; right: number; bottom: number; left: number }, 
    chartWidth: number, 
    chartHeight: number,
    cfg: typeof config
  ) => {
    const maxValue = Math.max(...sampleData.values) * 1.2
    const barWidth = chartWidth / sampleData.labels.length * 0.7
    const gap = chartWidth / sampleData.labels.length * 0.3

    // Grid lines
    if (cfg.showGrid) {
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 0.5
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()

        ctx.fillStyle = '#666666'
        ctx.font = `${cfg.fontSize}px ${cfg.fontFamily}`
        ctx.textAlign = 'right'
        const value = (maxValue - (maxValue / 5) * i).toFixed(1)
        ctx.fillText(value, margin.left - 10, y + 4)
      }
    }

    // Bars
    sampleData.values.forEach((value, index) => {
      const x = margin.left + (chartWidth / sampleData.labels.length) * index + gap / 2
      const barHeight = (value / maxValue) * chartHeight
      const y = margin.top + chartHeight - barHeight

      ctx.fillStyle = currentColors[index % currentColors.length]
      ctx.fillRect(x, y, barWidth, barHeight)

      if (cfg.showErrorBars) {
        const errorY = (sampleData.errorValues[index] / maxValue) * chartHeight
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(x + barWidth / 2, y - errorY)
        ctx.lineTo(x + barWidth / 2, y + errorY)
        ctx.moveTo(x + barWidth / 2 - 5, y - errorY)
        ctx.lineTo(x + barWidth / 2 + 5, y - errorY)
        ctx.moveTo(x + barWidth / 2 - 5, y + errorY)
        ctx.lineTo(x + barWidth / 2 + 5, y + errorY)
        ctx.stroke()
      }

      ctx.fillStyle = '#666666'
      ctx.font = `${cfg.fontSize}px ${cfg.fontFamily}`
      ctx.textAlign = 'center'
      ctx.save()
      ctx.translate(x + barWidth / 2, margin.top + chartHeight + 15)
      ctx.rotate(-Math.PI / 6)
      ctx.fillText(sampleData.labels[index], 0, 0)
      ctx.restore()
    })

    // Axis lines
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = cfg.axisLineWidth
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, margin.top + chartHeight)
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight)
    ctx.stroke()

    if (cfg.showLegend) {
      drawLegend(ctx, margin, chartWidth, ['Treatment A'], undefined, {
        position: cfg.legendPosition,
        fontSize: cfg.fontSize,
        fontFamily: cfg.fontFamily
      })
    }
  }, [sampleData, currentColors, drawLegend])

  const drawLineChart = useCallback((
    ctx: CanvasRenderingContext2D,
    margin: { top: number; right: number; bottom: number; left: number },
    chartWidth: number,
    chartHeight: number,
    cfg: typeof config
  ) => {
    const allValues = [...sampleData.values, ...sampleData.secondaryValues]
    const maxValue = Math.max(...allValues) * 1.2
    const minValue = Math.min(...allValues) * 0.8
    const range = maxValue - minValue

    if (cfg.showGrid) {
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 0.5
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()
      }
    }

    // Draw line 1
    ctx.strokeStyle = currentColors[0]
    ctx.lineWidth = 2
    ctx.beginPath()
    sampleData.values.forEach((value, index) => {
      const x = margin.left + (chartWidth / (sampleData.values.length - 1)) * index
      const y = margin.top + chartHeight - ((value - minValue) / range) * chartHeight
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    sampleData.values.forEach((value, index) => {
      const x = margin.left + (chartWidth / (sampleData.values.length - 1)) * index
      const y = margin.top + chartHeight - ((value - minValue) / range) * chartHeight
      
      ctx.fillStyle = currentColors[0]
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
    })

    // X-axis labels
    sampleData.labels.forEach((label, index) => {
      const x = margin.left + (chartWidth / (sampleData.labels.length - 1)) * index
      ctx.fillStyle = '#666666'
      ctx.font = `${cfg.fontSize}px ${cfg.fontFamily}`
      ctx.textAlign = 'center'
      ctx.save()
      ctx.translate(x, margin.top + chartHeight + 15)
      ctx.rotate(-Math.PI / 6)
      ctx.fillText(label, 0, 0)
      ctx.restore()
    })

    ctx.strokeStyle = '#333333'
    ctx.lineWidth = cfg.axisLineWidth
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, margin.top + chartHeight)
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight)
    ctx.stroke()
  }, [sampleData, currentColors])

  const drawScatterChart = useCallback((
    ctx: CanvasRenderingContext2D,
    margin: { top: number; right: number; bottom: number; left: number },
    chartWidth: number,
    chartHeight: number,
    cfg: typeof config
  ) => {
    const points = Array.from({ length: 30 }, () => ({
      x: Math.random() * 10,
      y: Math.random() * 10 + Math.random() * 3,
    }))

    const maxX = Math.max(...points.map(p => p.x)) * 1.1
    const maxY = Math.max(...points.map(p => p.y)) * 1.1

    if (cfg.showGrid) {
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 0.5
      for (let i = 0; i <= 5; i++) {
        const x = margin.left + (chartWidth / 5) * i
        const y = margin.top + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(x, margin.top)
        ctx.lineTo(x, margin.top + chartHeight)
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()
      }
    }

    points.forEach(point => {
      const x = margin.left + (point.x / maxX) * chartWidth
      const y = margin.top + chartHeight - (point.y / maxY) * chartHeight
      
      ctx.fillStyle = currentColors[0] + 'CC'
      ctx.strokeStyle = currentColors[0]
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })

    ctx.strokeStyle = '#333333'
    ctx.lineWidth = cfg.axisLineWidth
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, margin.top + chartHeight)
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight)
    ctx.stroke()
  }, [currentColors])

  const drawBoxPlot = useCallback((
    ctx: CanvasRenderingContext2D,
    margin: { top: number; right: number; bottom: number; left: number },
    chartWidth: number,
    chartHeight: number,
    cfg: typeof config
  ) => {
    const boxData = [
      { min: 2.1, q1: 3.5, median: 4.5, q3: 5.2, max: 6.8, outliers: [7.5] },
      { min: 2.8, q1: 4.0, median: 5.2, q3: 6.0, max: 7.2, outliers: [] },
      { min: 1.5, q1: 3.0, median: 3.8, q3: 4.5, max: 5.5, outliers: [6.2, 6.8] },
      { min: 3.2, q1: 4.8, median: 6.1, q3: 7.0, max: 8.2, outliers: [] },
      { min: 2.5, q1: 3.8, median: 4.9, q3: 5.6, max: 6.5, outliers: [7.1] },
    ]

    const globalMax = 9
    const boxWidth = chartWidth / boxData.length * 0.5

    if (cfg.showGrid) {
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 0.5
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()
      }
    }

    boxData.forEach((box, index) => {
      const centerX = margin.left + (chartWidth / boxData.length) * (index + 0.5)
      
      const scaleY = (value: number) => margin.top + chartHeight - (value / globalMax) * chartHeight

      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(centerX, scaleY(box.min))
      ctx.lineTo(centerX, scaleY(box.q1))
      ctx.moveTo(centerX, scaleY(box.q3))
      ctx.lineTo(centerX, scaleY(box.max))
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(centerX - boxWidth / 3, scaleY(box.min))
      ctx.lineTo(centerX + boxWidth / 3, scaleY(box.min))
      ctx.moveTo(centerX - boxWidth / 3, scaleY(box.max))
      ctx.lineTo(centerX + boxWidth / 3, scaleY(box.max))
      ctx.stroke()

      ctx.fillStyle = currentColors[index % currentColors.length] + '40'
      ctx.strokeStyle = currentColors[index % currentColors.length]
      ctx.lineWidth = 2
      ctx.fillRect(centerX - boxWidth / 2, scaleY(box.q3), boxWidth, scaleY(box.q1) - scaleY(box.q3))
      ctx.strokeRect(centerX - boxWidth / 2, scaleY(box.q3), boxWidth, scaleY(box.q1) - scaleY(box.q3))

      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX - boxWidth / 2, scaleY(box.median))
      ctx.lineTo(centerX + boxWidth / 2, scaleY(box.median))
      ctx.stroke()

      box.outliers.forEach(outlier => {
        ctx.fillStyle = '#FFFFFF'
        ctx.strokeStyle = currentColors[index % currentColors.length]
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(centerX, scaleY(outlier), 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      })

      ctx.fillStyle = '#666666'
      ctx.font = `${cfg.fontSize}px ${cfg.fontFamily}`
      ctx.textAlign = 'center'
      ctx.save()
      ctx.translate(centerX, margin.top + chartHeight + 15)
      ctx.rotate(-Math.PI / 6)
      ctx.fillText(sampleData.labels[index], 0, 0)
      ctx.restore()
    })
  }, [currentColors, sampleData])

  const drawHistogram = useCallback((
    ctx: CanvasRenderingContext2D,
    margin: { top: number; right: number; bottom: number; left: number },
    chartWidth: number,
    chartHeight: number,
    cfg: typeof config
  ) => {
    const bins = [8, 15, 25, 18, 12, 6, 3]
    const maxCount = Math.max(...bins) * 1.2
    const binWidth = chartWidth / bins.length

    if (cfg.showGrid) {
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 0.5
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + (chartHeight / 5) * i
        ctx.beginPath()
        ctx.moveTo(margin.left, y)
        ctx.lineTo(margin.left + chartWidth, y)
        ctx.stroke()
      }
    }

    bins.forEach((count, index) => {
      const x = margin.left + binWidth * index
      const barHeight = (count / maxCount) * chartHeight
      const y = margin.top + chartHeight - barHeight

      ctx.fillStyle = currentColors[0] + 'CC'
      ctx.strokeStyle = currentColors[0]
      ctx.lineWidth = 1
      ctx.fillRect(x + 2, y, binWidth - 4, barHeight)
      ctx.strokeRect(x + 2, y, binWidth - 4, barHeight)
    })

    ctx.strokeStyle = '#333333'
    ctx.lineWidth = cfg.axisLineWidth
    ctx.beginPath()
    ctx.moveTo(margin.left, margin.top)
    ctx.lineTo(margin.left, margin.top + chartHeight)
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight)
    ctx.stroke()
  }, [currentColors])

  const drawPieChart = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cfg: typeof config
  ) => {
    const data = [30, 25, 20, 15, 10]
    const total = data.reduce((a, b) => a + b, 0)
    const centerX = width / 2 - 50
    const centerY = height / 2
    const radius = Math.min(width, height) / 3

    let startAngle = -Math.PI / 2

    data.forEach((value, index) => {
      const sliceAngle = (value / total) * Math.PI * 2
      const endAngle = startAngle + sliceAngle

      ctx.fillStyle = currentColors[index % currentColors.length]
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.stroke()

      const midAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(midAngle) * labelRadius
      const labelY = centerY + Math.sin(midAngle) * labelRadius

      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold ${cfg.fontSize}px ${cfg.fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${value}%`, labelX, labelY)

      startAngle = endAngle
    })

    const legendItems = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E']
    legendItems.forEach((item, index) => {
      const legendX = width - 90
      const legendY = 50 + index * 22

      ctx.fillStyle = currentColors[index % currentColors.length]
      ctx.fillRect(legendX, legendY, 12, 12)

      ctx.fillStyle = '#333333'
      ctx.font = `${cfg.fontSize - 1}px ${cfg.fontFamily}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(item, legendX + 16, legendY + 6)
    })
  }, [currentColors])

  // Main draw function - defined after helpers
  const drawFigure = useCallback((canvas: HTMLCanvasElement, type: FigureType) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = config
    canvas.width = width * 2
    canvas.height = height * 2
    ctx.scale(2, 2)

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    const margin = { top: 40, right: config.showLegend && config.legendPosition === 'right' ? 100 : 20, bottom: 60, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    switch (type) {
      case 'bar':
        drawBarChart(ctx, margin, chartWidth, chartHeight, config)
        break
      case 'line':
        drawLineChart(ctx, margin, chartWidth, chartHeight, config)
        break
      case 'scatter':
        drawScatterChart(ctx, margin, chartWidth, chartHeight, config)
        break
      case 'box':
        drawBoxPlot(ctx, margin, chartWidth, chartHeight, config)
        break
      case 'histogram':
        drawHistogram(ctx, margin, chartWidth, chartHeight, config)
        break
      case 'pie':
        drawPieChart(ctx, width, height, config)
        break
      default:
        drawBarChart(ctx, margin, chartWidth, chartHeight, config)
    }

    ctx.fillStyle = '#000000'
    ctx.font = `bold ${config.fontSize + 2}px ${config.fontFamily}`
    ctx.textAlign = 'center'
    ctx.fillText(figureTitle || 'Sample Figure Title', width / 2, 25)

  }, [config, figureTitle, drawBarChart, drawLineChart, drawScatterChart, drawBoxPlot, drawHistogram, drawPieChart])

  // Redraw when config changes
  React.useEffect(() => {
    if (canvasRef.current) {
      drawFigure(canvasRef.current, figureType)
    }
  }, [config, figureType, drawFigure])

  const handleCreateFigure = () => {
    if (!canvasRef.current) return

    const newFigure: FigureRecord = {
      id: `figure-${Date.now()}`,
      title: figureTitle || `${figureType.charAt(0).toUpperCase() + figureType.slice(1)} Chart`,
      type: figureType,
      dataUrl: canvasRef.current.toDataURL(`image/${config.format}`, 1.0),
      caption: figureCaption || 'Figure caption describing the visualization.',
      dimensions: { width: config.width, height: config.height },
      journalStyle: 'APA',
    }

    setFigures(prev => [...prev, newFigure])
    onFigureCreate(newFigure)
    setSelectedFigureId(newFigure.id)
    setIsCreateDialogOpen(false)

    setFigureTitle('')
    setFigureCaption('')
  }

  const handleDeleteFigure = (figureId: string) => {
    setFigures(prev => prev.filter(f => f.id !== figureId))
    if (selectedFigureId === figureId) {
      setSelectedFigureId(null)
    }
  }

  const handleExportFigure = (format: 'png' | 'svg' | 'pdf') => {
    if (!canvasRef.current || !selectedFigure) return

    let mimeType = 'image/png'
    let extension = 'png'
    
    switch (format) {
      case 'svg':
        alert('SVG export requires additional processing. PNG exported instead.')
        break
      case 'pdf':
        alert('PDF export would require a PDF library. PNG exported instead.')
        break
      default:
        mimeType = 'image/png'
        extension = 'png'
    }

    const link = document.createElement('a')
    link.download = `${selectedFigure.title.replace(/\s+/g, '_')}.${extension}`
    link.href = canvasRef.current.toDataURL(mimeType, 1.0)
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#C1121F]" />
                Publication-Quality Figure Generator
              </CardTitle>
              <CardDescription>Create professional figures for your thesis</CardDescription>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2">
                  <Plus className="w-4 h-4" /> New Figure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Figure</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  {/* Left Panel */}
                  <div className="lg:col-span-1 space-y-4">
                    {/* Chart Type Selection */}
                    <div className="space-y-2">
                      <Label>Chart Type</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { type: 'bar' as FigureType, icon: BarChart3, label: 'Bar' },
                          { type: 'line' as FigureType, icon: LineChart, label: 'Line' },
                          { type: 'scatter' as FigureType, icon: ScatterChartIcon, label: 'Scatter' },
                          { type: 'box' as FigureType, icon: BoxPlotIcon, label: 'Box Plot' },
                          { type: 'histogram' as FigureType, icon: HistogramIcon, label: 'Histogram' },
                          { type: 'pie' as FigureType, icon: PieChartIcon, label: 'Pie' },
                        ].map(({ type, icon: Icon, label }) => (
                          <button
                            key={type}
                            onClick={() => setFigureType(type)}
                            className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                              figureType === type
                                ? 'border-[#C1121F] bg-[#C1121F]/5'
                                : 'hover:border-muted-foreground/30'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${figureType === type ? 'text-[#C1121F]' : ''}`} />
                            <span className="text-xs">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Ruler className="w-4 h-4" /> Dimensions
                      </Label>
                      <Select 
                        value={`${config.width}x${config.height}`} 
                        onValueChange={(v) => {
                          const [w, h] = v.split('x').map(Number)
                          setConfig(prev => ({ ...prev, width: w, height: h }))
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DIMENSION_PRESETS.map(preset => (
                            <SelectItem key={preset.name} value={`${preset.width}x${preset.height}`}>
                              {preset.name} ({preset.width}×{preset.height}mm)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Font */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Type className="w-4 h-4" /> Typography
                      </Label>
                      <Select 
                        value={config.fontFamily} 
                        onValueChange={(v) => setConfig(prev => ({ ...prev, fontFamily: v }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map(font => (
                            <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Font Size</span>
                          <span>{config.fontSize}pt</span>
                        </div>
                        <Slider
                          value={[config.fontSize]}
                          onValueChange={([v]) => setConfig(prev => ({ ...prev, fontSize: v }))}
                          min={8}
                          max={18}
                          step={1}
                        />
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Color Palette
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(COLOR_PALETTES) as (keyof typeof COLOR_PALETTES)[]).map(palette => (
                          <button
                            key={palette}
                            onClick={() => setConfig(prev => ({ ...prev, colorPalette: palette }))}
                            className={`p-2 rounded border ${
                              config.colorPalette === palette ? 'border-[#C1121F]' : ''
                            }`}
                          >
                            <div className="flex gap-0.5">
                              {COLOR_PALETTES[palette].slice(0, 4).map((color, i) => (
                                <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
                              ))}
                            </div>
                            <span className="text-xs mt-1 capitalize">{palette}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Display Options
                      </Label>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Show Legend</span>
                          <Switch checked={config.showLegend} onCheckedChange={(v) => setConfig(prev => ({ ...prev, showLegend: v }))} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Show Grid</span>
                          <Switch checked={config.showGrid} onCheckedChange={(v) => setConfig(prev => ({ ...prev, showGrid: v }))} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Error Bars</span>
                          <Switch checked={config.showErrorBars} onCheckedChange={(v) => setConfig(prev => ({ ...prev, showErrorBars: v }))} />
                        </div>
                      </div>

                      {config.showLegend && (
                        <div className="space-y-2">
                          <Label className="text-sm">Legend Position</Label>
                          <Select value={config.legendPosition} onValueChange={(v) => setConfig(prev => ({ ...prev, legendPosition: v as typeof config.legendPosition }))}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top">Top</SelectItem>
                              <SelectItem value="bottom">Bottom</SelectItem>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Title & Caption */}
                    <div className="space-y-2 pt-2 border-t">
                      <Label>Title</Label>
                      <Input value={figureTitle} onChange={(e) => setFigureTitle(e.target.value)} placeholder="Figure title..." />
                      <Label>Caption</Label>
                      <Textarea value={figureCaption} onChange={(e) => setFigureCaption(e.target.value)} placeholder="Figure caption..." className="min-h-[60px]" />
                    </div>
                  </div>

                  {/* Right Panel - Preview */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="border rounded-lg p-4 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Preview</span>
                        <Badge variant="secondary">{config.width}×{config.height}mm @ {config.dpi} DPI</Badge>
                      </div>
                      
                      <div className="flex justify-center p-4 bg-muted/20 rounded">
                        <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', border: '1px solid #e5e7eb' }} />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleCreateFigure} className="bg-[#C1121F] hover:bg-[#9B0F1A]">Create Figure</Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Figures List and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Figures Gallery */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground">Your Figures ({figures.length})</h3>
          
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-2 gap-3 pr-2">
              {figures.length > 0 ? (
                figures.map((figure) => (
                  <motion.div
                    key={figure.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedFigureId(figure.id)}
                    className={`cursor-pointer rounded-lg border overflow-hidden transition-all group ${
                      selectedFigureId === figure.id
                        ? 'border-[#C1121F] ring-2 ring-[#C1121F]/20'
                        : 'hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="aspect-square bg-muted relative">
                      {figure.dataUrl ? (
                        <img src={figure.dataUrl} alt={figure.title} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="secondary" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleExportFigure('png') }}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDeleteFigure(figure.id) }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{figure.title}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{figure.type.toUpperCase()}</Badge>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No figures yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first figure</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Selected Figure Preview */}
        <div className="lg:col-span-2">
          {selectedFigure ? (
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-base">{selectedFigure.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedFigure.dimensions.width}×{selectedFigure.dimensions.height}mm • {selectedFigure.type}
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
                        <DropdownMenuItem onClick={() => handleExportFigure('png')}>Export as PNG (300 DPI)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportFigure('svg')}>Export as SVG</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportFigure('pdf')}>Export as PDF</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button variant="outline" size="sm" onClick={() => handleDeleteFigure(selectedFigure.id)} className="gap-1 text-red-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <Separator />

              <CardContent className="pt-6">
                <div className="border rounded-lg p-6 bg-white dark:bg-slate-900 inline-block w-full">
                  <div className="flex justify-center">
                    {selectedFigure.dataUrl ? (
                      <img src={selectedFigure.dataUrl} alt={selectedFigure.title} className="max-w-full h-auto" style={{ maxHeight: '400px' }} />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center bg-muted rounded">
                        <ImageIcon className="w-16 h-16 text-muted-foreground/30" alt="" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm italic text-center mt-4 text-muted-foreground">{selectedFigure.caption}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Dimensions</p>
                    <p className="font-medium text-sm">{selectedFigure.dimensions.width}×{selectedFigure.dimensions.height} mm</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium text-sm capitalize">{selectedFigure.type}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Resolution</p>
                    <p className="font-medium text-sm">300 DPI</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Format</p>
                    <p className="font-medium text-sm">PNG</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Maximize2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">Select or Create a Figure</h3>
                <p className="text-sm text-muted-foreground">Choose an existing figure or create a new publication-quality one</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
