'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Plus, 
  FolderOpen, 
  CheckCircle2, 
  Circle, 
  ChevronRight,
  FileText,
  BarChart3,
  Image,
  Table,
  StickyNote,
  FileOutput,
  Database,
  FlaskConical,
  Calculator,
  PenTool,
  Search,
  MoreVertical,
  Trash2,
  Copy,
  Download,
  Upload,
  Settings,
  Sparkles,
  GraduationCap,
  Target,
  Lightbulb,
  Clock,
  Save,
  X,
  Edit3,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import ResearchNotes from './research-notes'
import TableGenerator from './table-generator'
import FigureGenerator from './figure-generator'
import ReportBuilder from './report-builder'

// Types
export interface AnalysisRecord {
  id: string
  type: 'anova' | 'correlation' | 'regression' | 'ttest' | 'chi-square' | 'descriptive' | 'genetic-params' | 'path-analysis' | 'diversity'
  name: string
  parameters: Record<string, any>
  results: any
  timestamp: Date
  status: 'running' | 'completed' | 'error'
}

export interface FigureRecord {
  id: string
  title: string
  type: 'bar' | 'line' | 'scatter' | 'box' | 'heatmap' | 'pie' | 'histogram' | 'violin'
  dataUrl: string
  caption: string
  dimensions: { width: number; height: number }
  journalStyle?: string
}

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

export interface NoteRecord {
  id: string
  title: string
  content: string
  tags: string[]
  isPinned?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ThesisProject {
  id: string
  title: string
  researchQuestion: string
  objectives: string[]
  hypothesis: string
  datasetId?: string
  experimentalDesign?: string
  analyses: AnalysisRecord[]
  figures: FigureRecord[]
  tables: TableRecord[]
  notes: NoteRecord[]
  status: WorkflowStep
  createdAt: Date
  updatedAt: Date
}

export type WorkflowStep = 
  | 'question' 
  | 'dataset' 
  | 'design' 
  | 'analysis' 
  | 'figures' 
  | 'tables' 
  | 'notes' 
  | 'report'

interface WorkflowStepConfig {
  id: WorkflowStep
  label: string
  icon: React.ReactNode
  description: string
}

const WORKFLOW_STEPS: WorkflowStepConfig[] = [
  { id: 'question', label: 'Research Question', icon: <Target className="w-4 h-4" />, description: 'Define your research question and objectives' },
  { id: 'dataset', label: 'Dataset', icon: <Database className="w-4 h-4" />, description: 'Import or create your dataset' },
  { id: 'design', label: 'Experimental Design', icon: <FlaskConical className="w-4 h-4" />, description: 'Define experimental methodology' },
  { id: 'analysis', label: 'Analysis', icon: <Calculator className="w-4 h-4" />, description: 'Perform statistical analyses' },
  { id: 'figures', label: 'Figures', icon: <Image className="w-4 h-4" />, description: 'Create publication-quality figures' },
  { id: 'tables', label: 'Tables', icon: <Table className="w-4 h-4" />, description: 'Generate professional tables' },
  { id: 'notes', label: 'Notes', icon: <StickyNote className="w-4 h-4" />, description: 'Organize research notes' },
  { id: 'report', label: 'Report', icon: <FileOutput className="w-4 h-4" />, description: 'Assemble final thesis document' },
]

// Sample Data
const SAMPLE_PROJECTS: ThesisProject[] = [
  {
    id: 'sample-1',
    title: 'Genetic Diversity Analysis of Rice Varieties',
    researchQuestion: 'What is the genetic diversity among 50 rice varieties using SSR markers?',
    objectives: [
      'Assess genetic diversity using molecular markers',
      'Identify genetically distant varieties for hybridization',
      'Determine population structure of rice germplasm'
    ],
    hypothesis: 'There is significant genetic diversity among rice varieties that can be exploited for breeding programs.',
    datasetId: 'rice-diversity-dataset',
    experimentalDesign: 'Randomized Complete Block Design (RCBD) with 3 replications',
    analyses: [
      {
        id: 'anal-1',
        type: 'diversity',
        name: 'Genetic Diversity Analysis',
        parameters: { markers: 20, method: 'Nei\'s genetic distance' },
        results: { heterozygosity: 0.65, PIC: 0.58, geneDiversity: 0.62 },
        timestamp: new Date('2024-01-15'),
        status: 'completed'
      },
      {
        id: 'anal-2',
        type: 'anova',
        name: 'ANOVA - Yield Traits',
        parameters: { trait: 'grain_yield', alpha: 0.05 },
        results: { fValue: 15.23, pValue: 0.001, df: [49, 98] },
        timestamp: new Date('2024-01-16'),
        status: 'completed'
      }
    ],
    figures: [
      {
        id: 'fig-1',
        title: 'Principal Coordinate Analysis (PCoA)',
        type: 'scatter',
        dataUrl: '',
        caption: 'Figure 1. Principal coordinate analysis showing genetic relationships among 50 rice varieties based on SSR marker data.',
        dimensions: { width: 400, height: 300 },
        journalStyle: 'APA'
      },
      {
        id: 'fig-2',
        title: 'Yield Distribution by Variety',
        type: 'box',
        dataUrl: '',
        caption: 'Figure 2. Box plot showing grain yield distribution across different rice variety groups.',
        dimensions: { width: 400, height: 300 },
        journalStyle: 'Nature'
      }
    ],
    tables: [
      {
        id: 'tab-1',
        title: 'Analysis of Variance for Grain Yield',
        type: 'anova',
        data: [
          ['Source', 'df', 'SS', 'MS', 'F', 'p-value'],
          ['Variety', '49', '125.6', '2.56', '15.23', '<0.001***'],
          ['Error', '98', '16.5', '0.17', '', ''],
          ['Total', '147', '142.1', '', '', '']
        ],
        headers: ['Source', 'df', 'SS', 'MS', 'F', 'p-value'],
        caption: 'Table 1. Analysis of variance for grain yield (t/ha) of 50 rice varieties evaluated in three replications.',
        journalStyle: 'APA',
        significanceIndicators: true
      }
    ],
    notes: [
      {
        id: 'note-1',
        title: 'Literature Review Notes',
        content: '# Key References\n\n1. Smith et al. (2020) - Genetic diversity in rice\n2. Johnson & Lee (2019) - SSR marker analysis\n\n## Important Findings\n- High polymorphism in chromosome 11\n- PIC values range from 0.3 to 0.8',
        tags: ['literature', 'genetics'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12')
      }
    ],
    status: 'analysis',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 'sample-2',
    title: 'Correlation Analysis of Agronomic Traits in Maize',
    researchQuestion: 'What are the correlations between yield components in maize hybrids?',
    objectives: [
      'Estimate correlation coefficients between agronomic traits',
      'Identify key traits for indirect selection',
      'Develop selection indices for maize improvement'
    ],
    hypothesis: 'Grain yield shows strong positive correlation with ear length and kernel weight.',
    experimentalDesign: 'Alpha lattice design with 2 replications',
    analyses: [],
    figures: [],
    tables: [],
    notes: [],
    status: 'design',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05')
  }
]

export default function ThesisStudio() {
  const [projects, setProjects] = useState<ThesisProject[]>(SAMPLE_PROJECTS)
  const [activeProjectId, setActiveProjectId] = useState<string>(SAMPLE_PROJECTS[0].id)
  const [activeTab, setActiveTab] = useState<WorkflowStep>('question')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // New project form state
  const [newProject, setNewProject] = useState({
    title: '',
    researchQuestion: '',
    objectives: [''],
    hypothesis: ''
  })

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId), 
    [projects, activeProjectId]
  )

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects
    return projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.researchQuestion.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [projects, searchQuery])

  const getStepCompletion = useCallback((step: WorkflowStep): boolean => {
    if (!activeProject) return false
    const stepIndex = WORKFLOW_STEPS.findIndex(s => s.id === step)
    const currentStatusIndex = WORKFLOW_STEPS.findIndex(s => s.id === activeProject.status)
    return stepIndex < currentStatusIndex
  }, [activeProject])

  const handleCreateProject = () => {
    if (!newProject.title.trim()) return
    
    const project: ThesisProject = {
      id: `project-${Date.now()}`,
      title: newProject.title,
      researchQuestion: newProject.researchQuestion,
      objectives: newProject.objectives.filter(o => o.trim()),
      hypothesis: newProject.hypothesis,
      analyses: [],
      figures: [],
    tables: [],
      notes: [],
      status: 'question',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setProjects(prev => [...prev, project])
    setActiveProjectId(project.id)
    setIsCreateDialogOpen(false)
    setNewProject({ title: '', researchQuestion: '', objectives: [''], hypothesis: '' })
  }

  const updateProject = useCallback((updates: Partial<ThesisProject>) => {
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId 
        ? { ...p, ...updates, updatedAt: new Date() }
        : p
    ))
  }, [activeProjectId])

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    if (activeProjectId === projectId && projects.length > 1) {
      setActiveProjectId(projects.find(p => p.id !== projectId)?.id || '')
    }
  }

  const duplicateProject = (projectId: string) => {
    const source = projects.find(p => p.id === projectId)
    if (!source) return
    
    const duplicated: ThesisProject = {
      ...source,
      id: `project-${Date.now()}`,
      title: `${source.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setProjects(prev => [...prev, duplicated])
  }

  const addAnalysis = (analysis: AnalysisRecord) => {
    if (!activeProject) return
    updateProject({ 
      analyses: [...activeProject.analyses, analysis],
      status: 'analysis'
    })
  }

  const addFigure = (figure: FigureRecord) => {
    if (!activeProject) return
    updateProject({ figures: [...activeProject.figures, figure] })
  }

  const addTable = (table: TableRecord) => {
    if (!activeProject) return
    updateProject({ tables: [...activeProject.tables, table] })
  }

  const addNote = (note: NoteRecord) => {
    if (!activeProject) return
    updateProject({ notes: [...activeProject.notes, note] })
  }

  // Render content based on active tab
  const renderTabContent = () => {
    if (!activeProject) return null

    switch (activeTab) {
      case 'question':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#C1121F]" />
                  Research Question
                </CardTitle>
                <CardDescription>Define the core question your thesis will answer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What is the main research question you want to address?"
                  value={activeProject.researchQuestion}
                  onChange={(e) => updateProject({ researchQuestion: e.target.value })}
                  className="min-h-[100px] resize-none"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#C1121F]" />
                  Research Objectives
                </CardTitle>
                <CardDescription>Specific goals you aim to achieve</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeProject.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <Badge variant="outline" className="mt-2 shrink-0">
                      {index + 1}
                    </Badge>
                    <Input
                      value={objective}
                      onChange={(e) => {
                        const newObjectives = [...activeProject.objectives]
                        newObjectives[index] = e.target.value
                        updateProject({ objectives: newObjectives })
                      }}
                      placeholder={`Objective ${index + 1}`}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateProject({ objectives: [...activeProject.objectives, ''] })}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Objective
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C1121F]" />
                  Hypothesis
                </CardTitle>
                <CardDescription>Your testable prediction</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="State your research hypothesis..."
                  value={activeProject.hypothesis}
                  onChange={(e) => updateProject({ hypothesis: e.target.value })}
                  className="min-h-[80px] resize-none"
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  updateProject({ status: 'dataset' })
                  setActiveTab('dataset')
                }}
                className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2"
              >
                Continue to Dataset <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )

      case 'dataset':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#C1121F]" />
                  Dataset Management
                </CardTitle>
                <CardDescription>Import or connect your research data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Upload Your Dataset</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports CSV, Excel, TSV files up to 50MB
                  </p>
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" /> Choose File
                  </Button>
                </div>

                {activeProject.datasetId && (
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Dataset Connected</p>
                        <p className="text-sm text-muted-foreground">ID: {activeProject.datasetId}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Change</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('question')}
                className="gap-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back
              </Button>
              <Button 
                onClick={() => {
                  updateProject({ status: 'design' })
                  setActiveTab('design')
                }}
                className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2"
              >
                Continue to Design <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )

      case 'design':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-[#C1121F]" />
                  Experimental Design
                </CardTitle>
                <CardDescription>Define your experimental methodology</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Design Type</label>
                    <select 
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={activeProject.experimentalDesign?.split(' ')[0] || ''}
                      onChange={(e) => updateProject({ experimentalDesign: e.target.value + ' Design' })}
                    >
                      <option value="">Select design...</option>
                      <option value="RCBD">Randomized Complete Block</option>
                      <option value="CRD">Completely Randomized</option>
                      <option value="Alpha Lattice">Alpha Lattice</option>
                      <option value="Split Plot">Split Plot</option>
                      <option value="Factorial">Factorial</option>
                      <option value="Observational">Observational Study</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Replications</label>
                    <Input type="number" min="1" max="10" placeholder="3" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Design Description</label>
                  <Textarea
                    placeholder="Describe your experimental design in detail..."
                    value={activeProject.experimentalDesign || ''}
                    onChange={(e) => updateProject({ experimentalDesign: e.target.value })}
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('dataset')}
                className="gap-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back
              </Button>
              <Button 
                onClick={() => {
                  updateProject({ status: 'analysis' })
                  setActiveTab('analysis')
                }}
                className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2"
              >
                Continue to Analysis <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )

      case 'analysis':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-[#C1121F]" />
                      Statistical Analyses
                    </CardTitle>
                    <CardDescription>Run and manage your statistical tests</CardDescription>
                  </div>
                  <Button size="sm" className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2">
                    <Plus className="w-4 h-4" /> New Analysis
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeProject.analyses.length > 0 ? (
                  <div className="space-y-3">
                    {activeProject.analyses.map((analysis) => (
                      <motion.div
                        key={analysis.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            analysis.status === 'completed' ? 'bg-green-100 text-green-700' :
                            analysis.status === 'running' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {analysis.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                             analysis.status === 'running' ? <Clock className="w-5 h-5 animate-spin" /> :
                             <X className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{analysis.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{analysis.type}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {analysis.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Results</DropdownMenuItem>
                            <DropdownMenuItem><Edit3 className="w-4 h-4 mr-2" /> Re-run</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calculator className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">No Analyses Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by running your first statistical analysis
                    </p>
                    <Button className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2">
                      <Plus className="w-4 h-4" /> Run Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Analysis Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Start Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { type: 'anova', label: 'ANOVA', desc: 'Compare means' },
                    { type: 'correlation', label: 'Correlation', desc: 'Variable relationships' },
                    { type: 'regression', label: 'Regression', desc: 'Predict outcomes' },
                    { type: 'descriptive', label: 'Descriptive', desc: 'Summary stats' },
                  ].map((item) => (
                    <Button
                      key={item.type}
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-1 hover:border-[#C1121F] hover:text-[#C1121F]"
                      onClick={() => {
                        const newAnalysis: AnalysisRecord = {
                          id: `anal-${Date.now()}`,
                          type: item.type as AnalysisRecord['type'],
                          name: `${item.label} Analysis`,
                          parameters: {},
                          results: {},
                          timestamp: new Date(),
                          status: 'completed'
                        }
                        addAnalysis(newAnalysis)
                      }}
                    >
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.desc}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('design')}
                className="gap-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back
              </Button>
              <Button 
                onClick={() => setActiveTab('figures')}
                className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2"
              >
                Continue to Figures <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )

      case 'figures':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <FigureGenerator 
              onFigureCreate={addFigure}
              existingFigures={activeProject.figures}
            />

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('analysis')}
                className="gap-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back
              </Button>
              <Button 
                onClick={() => setActiveTab('tables')}
                className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2"
              >
                Continue to Tables <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )

      case 'tables':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <TableGenerator 
              onTableCreate={addTable}
              existingTables={activeProject.tables}
            />

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('figures')}
                className="gap-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back
              </Button>
              <Button 
                onClick={() => setActiveTab('notes')}
                className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2"
              >
                Continue to Notes <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )

      case 'notes':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <ResearchNotes 
              notes={activeProject.notes}
              onNoteAdd={addNote}
            />

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('tables')}
                className="gap-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" /> Back
              </Button>
              <Button 
                onClick={() => setActiveTab('report')}
                className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2"
              >
                Continue to Report <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )

      case 'report':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <ReportBuilder 
              project={activeProject}
              onUpdateProject={updateProject}
            />
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30 dark:from-slate-950 dark:to-red-950/10">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#C1121F] rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Thesis Studio</h1>
                <p className="text-sm text-muted-foreground">Complete thesis workflow management</p>
              </div>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2">
                  <Plus className="w-4 h-4" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Thesis Project</DialogTitle>
                  <DialogDescription>
                    Set up a new thesis or dissertation project
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Title *</label>
                    <Input
                      placeholder="e.g., Genetic Analysis of Crop Varieties"
                      value={newProject.title}
                      onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Research Question *</label>
                    <Textarea
                      placeholder="What is the main question your research will answer?"
                      value={newProject.researchQuestion}
                      onChange={(e) => setNewProject(prev => ({ ...prev, researchQuestion: e.target.value }))}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Research Objectives</label>
                    {newProject.objectives.map((obj, index) => (
                      <Input
                        key={index}
                        placeholder={`Objective ${index + 1}`}
                        value={obj}
                        onChange={(e) => {
                          const updated = [...newProject.objectives]
                          updated[index] = e.target.value
                          setNewProject(prev => ({ ...prev, objectives: updated }))
                        }}
                      />
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewProject(prev => ({ ...prev, objectives: [...prev.objectives, '' ]}))}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Objective
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hypothesis</label>
                    <Textarea
                      placeholder="Your research hypothesis..."
                      value={newProject.hypothesis}
                      onChange={(e) => setNewProject(prev => ({ ...prev, hypothesis: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateProject}
                      className="bg-[#C1121F] hover:bg-[#9B0F1A]"
                      disabled={!newProject.title.trim()}
                    >
                      Create Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-4">
            {/* Projects List */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" /> Projects
                  </CardTitle>
                  <Badge variant="secondary">{filteredProjects.length}</Badge>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  <div className="px-2 pb-2 space-y-1">
                    {filteredProjects.map((project) => (
                      <motion.button
                        key={project.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveProjectId(project.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors group ${
                          activeProjectId === project.id 
                            ? 'bg-[#C1121F] text-white' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-sm">{project.title}</p>
                            <p className={`text-xs mt-1 truncate ${
                              activeProjectId === project.id ? 'text-white/70' : 'text-muted-foreground'
                            }`}>
                              Updated {project.updatedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={`shrink-0 h-7 w-7 ${
                                  activeProjectId === project.id ? 'hover:bg-white/20' : ''
                                }`}
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => duplicateProject(project.id)}>
                                <Copy className="w-4 h-4 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteProject(project.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.button>
                    ))}
                    
                    {filteredProjects.length === 0 && (
                      <div className="text-center py-8 px-4">
                        <FolderOpen className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">No projects found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Workflow Steps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PenTool className="w-4 h-4" /> Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[350px]">
                  <div className="px-2 pb-2 space-y-1">
                    {WORKFLOW_STEPS.map((step, index) => {
                      const isActive = activeTab === step.id
                      const isCompleted = getStepCompletion(step.id)
                      
                      return (
                        <motion.button
                          key={step.id}
                          whileHover={{ x: 4 }}
                          onClick={() => setActiveTab(step.id)}
                          className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                            isActive 
                              ? 'bg-[#C1121F]/10 text-[#C1121F] border border-[#C1121F]/20' 
                              : isCompleted 
                                ? 'hover:bg-muted' 
                                : 'hover:bg-muted opacity-60'
                          }`}
                        >
                          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isActive 
                              ? 'bg-[#C1121F] text-white' 
                              : isCompleted 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-muted'
                          }`}>
                            {isCompleted && !isActive ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : step.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{step.label}</p>
                            <p className="text-xs text-muted-foreground truncate hidden sm:block">
                              {step.description}
                            </p>
                          </div>
                          {isActive && <ChevronRight className="w-4 h-4 shrink-0" />}
                        </motion.button>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <section className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <Card key={activeTab} className="min-h-[600px]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {WORKFLOW_STEPS.find(s => s.id === activeTab)?.icon}
                        {activeProject?.title || 'Thesis Studio'}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {WORKFLOW_STEPS.find(s => s.id === activeTab)?.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={activeProject?.status === 'report' ? 'default' : 'secondary'}
                        className={activeProject?.status === 'report' ? 'bg-green-600' : ''}
                      >
                        {activeProject?.status === 'report' ? 'Ready for Export' : 'In Progress'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  {renderTabContent()}
                </CardContent>
              </Card>
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  )
}
