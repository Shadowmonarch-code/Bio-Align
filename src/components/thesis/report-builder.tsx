'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  FileOutput,
  Plus,
  Download,
  Trash2,
  Edit3,
  GripVertical,
  Eye,
  FileText,
  Image,
  Table as TableIcon,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  BookOpen,
  FlaskConical,
  BarChart3,
  MessageSquare,
  Award,
  List,
  MoveUp,
  MoveDown,
  Copy,
  Save,
  Sparkles,
  Layers,
  ArrowUpDown
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

// Import types from thesis-studio
import type { ThesisProject, FigureRecord, TableRecord, AnalysisRecord, NoteRecord } from './thesis-studio'

interface ReportBuilderProps {
  project: ThesisProject
  onUpdateProject: (updates: Partial<ThesisProject>) => void
}

interface ReportSection {
  id: string
  type: 'title' | 'abstract' | 'chapter' | 'subsection' | 'figure' | 'table' | 'reference' | 'appendix'
  title: string
  content: string
  order: number
  isExpanded: boolean
  subsections?: ReportSection[]
  figureId?: string
  tableId?: string
  wordCount?: number
}

const DEFAULT_SECTIONS: Omit<ReportSection, 'id'>[] = [
  {
    type: 'title',
    title: 'Title Page',
    content: '',
    order: 0,
    isExpanded: false,
  },
  {
    type: 'abstract',
    title: 'Abstract',
    content: '',
    order: 1,
    isExpanded: true,
  },
  {
    type: 'chapter',
    title: '1. Introduction',
    content: '',
    order: 2,
    isExpanded: true,
    subsections: [
      { id: 'sub-1-1', type: 'subsection', title: '1.1 Background of the Study', content: '', order: 0, isExpanded: false },
      { id: 'sub-1-2', type: 'subsection', title: '1.2 Problem Statement', content: '', order: 1, isExpanded: false },
      { id: 'sub-1-3', type: 'subsection', title: '1.3 Research Objectives', content: '', order: 2, isExpanded: false },
      { id: 'sub-1-4', type: 'subsection', title: '1.4 Significance of the Study', content: '', order: 3, isExpanded: false },
    ],
  },
  {
    type: 'chapter',
    title: '2. Review of Related Literature',
    content: '',
    order: 3,
    isExpanded: true,
    subsections: [
      { id: 'sub-2-1', type: 'subsection', title: '2.1 Theoretical Framework', content: '', order: 0, isExpanded: false },
      { id: 'sub-2-2', type: 'subsection', title: '2.2 Related Studies', content: '', order: 1, isExpanded: false },
      { id: 'sub-2-3', type: 'subsection', title: '2.3 Synthesis', content: '', order: 2, isExpanded: false },
    ],
  },
  {
    type: 'chapter',
    title: '3. Materials and Methods',
    content: '',
    order: 4,
    isExpanded: true,
    subsections: [
      { id: 'sub-3-1', type: 'subsection', title: '3.1 Experimental Design', content: '', order: 0, isExpanded: false },
      { id: 'sub-3-2', type: 'subsection', title: '3.2 Materials Used', content: '', order: 1, isExpanded: false },
      { id: 'sub-3-3', type: 'subsection', title: '3.3 Data Collection', content: '', order: 2, isExpanded: false },
      { id: 'sub-3-4', type: 'subsection', title: '3.4 Statistical Analysis', content: '', order: 3, isExpanded: false },
    ],
  },
  {
    type: 'chapter',
    title: '4. Results and Discussion',
    content: '',
    order: 5,
    isExpanded: true,
    subsections: [],
  },
  {
    type: 'chapter',
    title: '5. Conclusions and Recommendations',
    content: '',
    order: 6,
    isExpanded: true,
    subsections: [
      { id: 'sub-5-1', type: 'subsection', title: '5.1 Conclusions', content: '', order: 0, isExpanded: false },
      { id: 'sub-5-2', type: 'subsection', title: '5.2 Recommendations', content: '', order: 1, isExpanded: false },
    ],
  },
  {
    type: 'reference',
    title: 'References',
    content: '',
    order: 7,
    isExpanded: true,
  },
  {
    type: 'appendix',
    title: 'Appendices',
    content: '',
    order: 8,
    isExpanded: true,
  },
]

export default function ReportBuilder({ project, onUpdateProject }: ReportBuilderProps) {
  const [sections, setSections] = useState<ReportSection[]>(
    DEFAULT_SECTIONS.map((s, i) => ({ ...s, id: `section-${i}` }))
  )
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  
  // Document metadata
  const [metadata, setMetadata] = useState({
    author: '',
    institution: '',
    department: '',
    year: new Date().getFullYear().toString(),
    degree: 'Master of Science',
  })

  // Generate auto-content based on project data
  const generateAutoContent = useCallback((sectionType: string): string => {
    switch (sectionType) {
      case 'abstract':
        return `This study investigated ${project.researchQuestion.toLowerCase()}. The research was conducted to ${project.objectives[0]?.toLowerCase() || 'achieve the stated objectives'}.

${project.hypothesis ? `The hypothesis that "${project.hypothesis}" was tested using appropriate statistical methods.` : ''}

Key findings revealed significant differences among treatments (p < 0.05). The results support the conclusion that further investigation in this area is warranted.

Keywords: ${project.title.split(' ').slice(0, 3).join(', ')}, research, analysis`

      case 'title':
        return `${project.title}\n\nby\n\n[Your Name]\n\n${metadata.degree} Thesis\n\n${metadata.institution || '[Institution Name]'}\n${metadata.year}`

      case 'chapter-3-1': // Experimental Design
        return project.experimentalDesign 
          ? `The experiment was conducted using a ${project.experimentalDesign.toLowerCase()}. This design was chosen to minimize experimental error and ensure valid statistical inference.\n\nThe treatments were arranged according to the specified design parameters, with appropriate randomization procedures followed.`
          : ''

      case 'chapter-3-4': // Statistical Analysis
        if (project.analyses.length === 0) return ''
        
        return `Data were analyzed using appropriate statistical methods. The following analyses were performed:\n\n${project.analyses.map(a => `- **${a.name}**: ${a.type.toUpperCase()} analysis was conducted to evaluate treatment effects.`).join('\n')}\n\nAll statistical analyses were performed at α = 0.05 significance level using BioAlign Statistical Software.`

      default:
        return ''
    }
  }, [project])

  const selectedSection = useMemo(() =>
    sections.find(s => s.id === activeSectionId),
    [sections, activeSectionId]
  )

  // Calculate total word count
  const totalWordCount = useMemo(() => {
    const countWords = (text: string) => text ? text.split(/\s+/).filter(Boolean).length : 0
    
    let total = 0
    sections.forEach(section => {
      total += countWords(section.content)
      section.subsections?.forEach(sub => {
        total += countWords(sub.content)
      })
    })
    return total
  }, [sections])

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    let completedSections = 0
    sections.forEach(section => {
      if (section.content && section.content.length > 50) completedSections++
      if (section.subsections) {
        section.subsections.forEach(sub => {
          if (sub.content && sub.content.length > 30) completedSections++
        })
      }
    })
    
    const totalSubsections = sections.reduce((acc, s) => acc + (s.subsections?.length || 0), 0)
    const totalItems = sections.length + totalSubsections
    return Math.round((completedSections / totalItems) * 100)
  }, [sections])

  const handleUpdateSection = (sectionId: string, updates: Partial<ReportSection>) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return { ...section, ...updates }
      }
      if (section.subsections) {
        return {
          ...section,
          subsections: section.subsections.map(sub =>
            sub.id === sectionId ? { ...sub, ...updates } : sub
          ),
        }
      }
      return section
    }))
  }

  const handleToggleExpand = (sectionId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return { ...section, isExpanded: !section.isExpanded }
      }
      if (section.subsections?.some(s => s.id === sectionId)) {
        return {
          ...section,
          subsections: section.subsections.map(sub =>
            sub.id === sectionId ? { ...sub, isExpanded: !sub.isExpanded } : sub
          ),
        }
      }
      return section
    }))
  }

  const handleAddFigureToSection = (sectionId: string, figureId: string) => {
    const newFigureSection: ReportSection = {
      id: `figure-${Date.now()}`,
      type: 'figure',
      title: project.figures.find(f => f.id === figureId)?.title || 'Figure',
      content: '',
      order: 0,
      isExpanded: false,
      figureId,
    }
    
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          subsections: [...(section.subsections || []), newFigureSection],
        }
      }
      return section
    }))
  }

  const handleAddTableToSection = (sectionId: string, tableId: string) => {
    const newTableSection: ReportSection = {
      id: `table-${Date.now()}`,
      type: 'table',
      title: project.tables.find(t => t.id === tableId)?.title || 'Table',
      content: '',
      order: 0,
      isExpanded: false,
      tableId,
    }
    
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          subsections: [...(section.subsections || []), newTableSection],
        }
      }
      return section
    }))
  }

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return
    
    const newSections = [...sections]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]]
    
    newSections.forEach((s, i) => ({ ...s, order: i }))
    setSections(newSections)
  }

  const handleDeleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId))
    if (activeSectionId === sectionId) {
      setActiveSectionId(null)
    }
  }

  const handleDuplicateSection = (section: ReportSection) => {
    const duplicated: ReportSection = {
      ...section,
      id: `section-${Date.now}`,
      title: `${section.title} (Copy)`,
    }
    setSections(prev => [...prev, duplicated])
  }

  const handleExportDocument = (format: 'docx' | 'pdf') => {
    // In a real implementation, this would use a library like docx or jsPDF
    alert(`Exporting document as ${format.toUpperCase()}...\n\nThis feature would generate a complete thesis document with all sections, figures, and tables properly formatted.`)
  }

  const getSectionIcon = (type: ReportSection['type']) => {
    switch (type) {
      case 'title': return <FileText className="w-4 h-4" />
      case 'abstract': return <Eye className="w-4 h-4" />
      case 'chapter': return <BookOpen className="w-4 h-4" />
      case 'subsection': return <List className="w-4 h-4" />
      case 'figure': return <Image className="w-4 h-4" />
      case 'table': return <TableIcon className="w-4 h-4" />
      case 'reference': return <Layers className="w-4 h-4" />
      case 'appendix': return <Layers className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getSectionColor = (type: ReportSection['type']) => {
    switch (type) {
      case 'title': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'abstract': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'chapter': return 'bg-[#C1121F]/10 text-[#C1121F]'
      case 'subsection': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'figure': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'table': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'reference': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'appendix': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileOutput className="w-5 h-5 text-[#C1121F]" />
                Report Builder
              </CardTitle>
              <CardDescription>Assemble your thesis document</CardDescription>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats */}
              <div className="hidden md:flex items-center gap-4 mr-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Progress:</span>{' '}
                  <span className="font-semibold text-[#C1121F]">{completionPercentage}%</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Words:</span>{' '}
                  <span className="font-semibold">{totalWordCount.toLocaleString()}</span>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={!isPreviewMode ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-none h-9"
                  onClick={() => setIsPreviewMode(false)}
                >
                  <Edit3 className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button
                  variant={isPreviewMode ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-none h-9"
                  onClick={() => setIsPreviewMode(true)}
                >
                  <Eye className="w-4 h-4 mr-1" /> Preview
                </Button>
              </div>

              {/* Export */}
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2">
                    <Download className="w-4 h-4" /> Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Document</DialogTitle>
                    <DialogDescription>Choose your preferred format</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 mt-4">
                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Author Name</Label>
                        <Input
                          value={metadata.author}
                          onChange={(e) => setMetadata(prev => ({ ...prev, author: e.target.value }))}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input
                          value={metadata.institution}
                          onChange={(e) => setMetadata(prev => ({ ...prev, institution: e.target.value }))}
                          placeholder="University name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Degree Program</Label>
                        <Select value={metadata.degree} onValueChange={(v) => setMetadata(prev => ({ ...prev, degree: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bachelor of Science">BS</SelectItem>
                            <SelectItem value="Master of Science">MS</SelectItem>
                            <SelectItem value="Doctor of Philosophy">PhD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Input
                          value={metadata.year}
                          onChange={(e) => setMetadata(prev => ({ ...prev, year: e.target.value }))}
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Export Options */}
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 hover:border-[#C1121F]"
                        onClick={() => handleExportDocument('docx')}
                      >
                        <FileText className="w-8 h-8 text-blue-600" />
                        <span className="font-medium">Word (.docx)</span>
                        <span className="text-xs text-muted-foreground">Editable format</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 hover:border-[#C1121F]"
                        onClick={() => handleExportDocument('pdf')}
                      >
                        <FileText className="w-8 h-8 text-red-600" />
                        <span className="font-medium">PDF</span>
                        <span className="text-xs text-muted-foreground">Print-ready</span>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Document Completion</span>
          <span className="font-medium">{completionPercentage}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#C1121F] to-[#E63946]"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Main Content */}
      {!isPreviewMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section Navigator */}
          <aside className="lg:col-span-4 space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Document Structure
                </CardTitle>
                <CardDescription>Click to edit • Drag to reorder</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="px-3 pb-3 space-y-1">
                    {sections.map((section, index) => (
                      <div key={section.id}>
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`group rounded-lg border transition-all ${
                            activeSectionId === section.id
                              ? 'border-[#C1121F] bg-[#C1121F]/5 shadow-sm'
                              : 'hover:border-muted-foreground/30 hover:bg-muted/30'
                          }`}
                        >
                          <div
                            className="flex items-center gap-2 p-3 cursor-pointer"
                            onClick={() => setActiveSectionId(section.id)}
                          >
                            <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0 cursor-grab" />
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleExpand(section.id)
                              }}
                              className="shrink-0"
                            >
                              {section.isExpanded && section.subsections ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>

                            <div className={`p-1.5 rounded ${getSectionColor(section.type)}`}>
                              {getSectionIcon(section.type)}
                            </div>

                            <span className="flex-1 font-medium text-sm truncate">
                              {section.title}
                            </span>

                            {/* Word count badge */}
                            {section.content && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {section.content.split(/\s+/).filter(Boolean).length} words
                              </Badge>
                            )}

                            {/* Actions dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0">
                                  <MoreHorizontalIcon className="w-3.5 h-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleMoveSection(index, 'up')} disabled={index === 0}>
                                  <MoveUp className="w-4 h-4 mr-2" /> Move Up
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMoveSection(index, 'down')} disabled={index === sections.length - 1}>
                                  <MoveDown className="w-4 h-4 mr-2" /> Move Down
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateSection(section)}>
                                  <Copy className="w-4 h-4 mr-2" /> Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteSection(section.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Subsections */}
                          <AnimatePresence>
                            {section.isExpanded && section.subsections && section.subsections.length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-10 pr-3 pb-2 space-y-1">
                                  {section.subsections.map((sub) => (
                                    <button
                                      key={sub.id}
                                      onClick={() => setActiveSectionId(sub.id)}
                                      className={`w-full text-left p-2 rounded-md transition-all flex items-center gap-2 ${
                                        activeSectionId === sub.id
                                          ? 'bg-[#C1121F]/10 text-[#C1121F]'
                                          : 'hover:bg-muted'
                                      }`}
                                    >
                                      <div className={`p-1 rounded ${getSectionColor(sub.type)}`}>
                                        {getSectionIcon(sub.type)}
                                      </div>
                                      <span className="text-sm truncate flex-1">{sub.title}</span>
                                      {sub.content && (
                                        <Badge variant="outline" className="text-xs shrink-0">
                                          {sub.content.split(/\s+/).filter(Boolean).length}
                                        </Badge>
                                      )}
                                    </button>
                                  ))}
                                  
                                  {/* Add figure/table buttons for Results chapter */}
                                  {section.title.includes('Results') && (
                                    <div className="flex gap-2 pt-2 mt-2 border-t">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs gap-1"
                                        disabled={project.figures.length === 0}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (project.figures.length > 0) {
                                            handleAddFigureToSection(section.id, project.figures[0].id)
                                          }
                                        }}
                                      >
                                        <Image className="w-3 h-3" /> Add Figure
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs gap-1"
                                        disabled={project.tables.length === 0}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (project.tables.length > 0) {
                                            handleAddTableToSection(section.id, project.tables[0].id)
                                          }
                                        }}
                                      >
                                        <TableIcon className="w-3 h-3" /> Add Table
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          {/* Editor Panel */}
          <section className="lg:col-span-8">
            {selectedSection ? (
              <Card className="min-h-[600px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getSectionColor(selectedSection.type)}`}>
                        {getSectionIcon(selectedSection.type)}
                      </div>
                      <div>
                        <Input
                          value={selectedSection.title}
                          onChange={(e) => handleUpdateSection(selectedSection.id, { title: e.target.value })}
                          className="font-semibold text-lg border-none px-0 focus-visible:ring-0 h-auto"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedSection.type.charAt(0).toUpperCase() + selectedSection.type.slice(1)} Section
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          const autoContent = generateAutoContent(
                            selectedSection.type === 'chapter' 
                              ? `chapter-${selectedSection.title.replace(/[^0-9.]/g, '')}`
                              : selectedSection.type
                          )
                          if (autoContent) {
                            handleUpdateSection(selectedSection.id, { 
                              content: selectedSection.content 
                                ? selectedSection.content + '\n\n' + autoContent 
                                : autoContent 
                            })
                          }
                        }}
                        disabled={
                          !generateAutoContent(
                            selectedSection.type === 'chapter' 
                              ? `chapter-${selectedSection.title.replace(/[^0-9.]/g, '')}`
                              : selectedSection.type
                          )
                        }
                      >
                        <Sparkles className="w-4 h-4" /> Auto-generate
                      </Button>
                      
                      <Badge variant="secondary">
                        {selectedSection.content?.split(/\s+/).filter(Boolean).length || 0} words
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-6">
                  <Textarea
                    value={selectedSection.content || ''}
                    onChange={(e) => handleUpdateSection(selectedSection.id, { content: e.target.value })}
                    placeholder={`Start writing your ${selectedSection.title.toLowerCase()}...`}
                    className="min-h-[450px] resize-y font-serif leading-relaxed"
                  />

                  {/* Quick insert options for figures/tables */}
                  {(selectedSection.title.includes('Results') || selectedSection.type === 'figure' || selectedSection.type === 'table') && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium mb-2">Quick Insert</p>
                      <div className="flex flex-wrap gap-2">
                        {project.figures.slice(0, 3).map(fig => (
                          <Button
                            key={fig.id}
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => {
                              const insertText = `\n\n[Figure: ${fig.title}]\n${fig.caption}\n`
                              handleUpdateSection(selectedSection.id, {
                                content: (selectedSection.content || '') + insertText
                              })
                            }}
                          >
                            <Image className="w-3 h-3" /> {fig.title}
                          </Button>
                        ))}
                        {project.tables.slice(0, 3).map(tab => (
                          <Button
                            key={tab.id}
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => {
                              const insertText = `\n\n[Table: ${tab.title}]\n${tab.caption}\n`
                              handleUpdateSection(selectedSection.id, {
                                content: (selectedSection.content || '') + insertText
                              })
                            }}
                          >
                            <TableIcon className="w-3 h-3" /> {tab.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Edit3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">Select a Section to Edit</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Choose a section from the document structure on the left to start writing or editing its content.
                  </p>
                  
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg inline-block">
                    <p className="text-sm font-medium mb-2">Quick Tips</p>
                    <ul className="text-xs text-left text-muted-foreground space-y-1">
                      <li>• Click any section to edit its content</li>
                      <li>• Use "Auto-generate" to fill from project data</li>
                      <li>• Drag sections to reorder them</li>
                      <li>• Insert figures & tables into Results</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </section>
        </div>
      ) : (
        /* Preview Mode */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#C1121F]" />
              Document Preview
            </CardTitle>
            <CardDescription>This is how your thesis will look when exported</CardDescription>
          </CardHeader>
          
          <Separator />

          <CardContent className="pt-6">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 shadow-lg rounded-lg min-h-[800px]">
              {/* Title Page Preview */}
              <div className="text-center mb-12 pb-12 border-b">
                <h1 className="text-2xl md:text-3xl font-bold mb-6">{project.title}</h1>
                
                {metadata.author && (
                  <>
                    <p className="text-xl mb-2">by</p>
                    <p className="text-xl font-semibold mb-4">{metadata.author}</p>
                  </>
                )}
                
                <div className="space-y-1 text-muted-foreground">
                  <p>{metadata.degree} Thesis</p>
                  {metadata.institution && <p>{metadata.institution}</p>}
                  <p>{metadata.year}</p>
                </div>
              </div>

              {/* Sections Preview */}
              {sections.filter(s => s.type !== 'title').map((section) => (
                <div key={section.id} className="mb-8">
                  <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                  
                  {section.content ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                      {section.content}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">[Content not yet written]</p>
                  )}

                  {/* Subsections */}
                  {section.subsections?.map((sub) => (
                    <div key={sub.id} className="mt-6 ml-4">
                      <h3 className="text-lg font-semibold mb-2">{sub.title}</h3>
                      {sub.content ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                          {sub.content}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic text-sm">[Content not yet written]</p>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Footer */}
              <div className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
                <p>Generated by BioAlign Thesis Studio</p>
                <p>Total word count: {totalWordCount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Additional icon component
function MoreHorizontalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="1"/>
      <circle cx="19" cy="12" r="1"/>
      <circle cx="5" cy="12" r="1"/>
    </svg>
  )
}
