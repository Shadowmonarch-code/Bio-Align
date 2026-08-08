'use client'

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Tag,
  FileText,
  Clock,
  Trash2,
  Edit3,
  Save,
  Download,
  Copy,
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Undo2,
  Redo2,
  FolderOpen,
  Pin,
  Archive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export interface NoteRecord {
  id: string
  title: string
  content: string
  tags: string[]
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

interface ResearchNotesProps {
  notes: NoteRecord[]
  onNoteAdd: (note: NoteRecord) => void
}

const SAMPLE_TAGS = [
  'literature', 'methods', 'results', 'discussion', 
  'ideas', 'references', 'data', 'analysis',
  'hypothesis', 'limitations', 'future-work'
]

// Simple markdown parser for preview
function parseMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code class="bg-muted px-1 rounded text-sm">$1</code>')
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-[#C1121F] pl-4 italic text-muted-foreground my-2">$1</blockquote>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n/gim, '<br />')
}

export default function ResearchNotes({ notes: initialNotes, onNoteAdd }: ResearchNotesProps) {
  const [notes, setNotes] = useState<NoteRecord[]>(initialNotes)
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  
  // New note form state
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteTags, setNewNoteTags] = useState<string[]>([])

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const activeNote = useMemo(() => 
    notes.find(n => n.id === activeNoteId),
    [notes, activeNoteId]
  )

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }, [notes])

  const filteredNotes = useMemo(() => {
    let filtered = [...notes]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag))
    }

    // Sort: pinned first, then by updated date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    })

    return filtered
  }, [notes, searchQuery, selectedTag])

  // Save note handler (defined before useEffect to avoid reference errors)
  const handleSaveNote = () => {
    // Trigger save notification or sync
    console.log('Note saved:', activeNoteId)
  }

  // Auto-save effect
  useEffect(() => {
    if (!activeNote || !autoSaveTimerRef.current) return
    
    autoSaveTimerRef.current = setTimeout(() => {
      handleSaveNote()
    }, 2000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [activeNote?.content])

  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) return

    const newNote: NoteRecord = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      content: newNoteContent,
      tags: newNoteTags,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setNotes(prev => [newNote, ...prev])
    onNoteAdd(newNote)
    setActiveNoteId(newNote.id)
    
    // Reset form
    setNewNoteTitle('')
    setNewNoteContent('')
    setNewNoteTags([])
    setIsCreateDialogOpen(false)
  }

  const handleUpdateNote = useCallback((updates: Partial<NoteRecord>) => {
    if (!activeNoteId) return
    setNotes(prev => prev.map(note =>
      note.id === activeNoteId
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ))
  }, [activeNoteId])

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
    if (activeNoteId === noteId) {
      setActiveNoteId(null)
    }
  }

  const handleTogglePin = (noteId: string) => {
    setNotes(prev => prev.map(note =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ))
  }

  const handleDuplicateNote = (note: NoteRecord) => {
    const duplicated: NoteRecord = {
      ...note,
      id: `note-${Date.now()}`,
      title: `${note.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setNotes(prev => [duplicated, ...prev])
    onNoteAdd(duplicated)
  }

  const handleExportNote = (note: NoteRecord, format: 'markdown' | 'txt') => {
    let content = ''
    let filename = ''
    let mimeType = ''

    if (format === 'markdown') {
      content = `# ${note.title}\n\n${note.content}\n\n---\n*Tags: ${note.tags.join(', ')}*\n*Created: ${note.createdAt.toLocaleDateString()}*`
      filename = `${note.title.replace(/\s+/g, '_')}.md`
      mimeType = 'text/markdown'
    } else {
      content = `${note.title}\n${'='.repeat(note.title.length)}\n\n${note.content}\n\nTags: ${note.tags.join(', ')}\nCreated: ${note.createdAt.toLocaleDateString()}`
      filename = `${note.title.replace(/\s+/g, '_')}.txt`
      mimeType = 'text/plain'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const insertMarkdown = (syntax: string) => {
    if (!activeNote) return
    
    const textarea = document.getElementById('note-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = activeNote.content
    const selectedText = text.substring(start, end)

    let newText = ''
    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`
        break
      case 'heading1':
        newText = `\n# ${selectedText || 'Heading 1'}\n`
        break
      case 'heading2':
        newText = `\n## ${selectedText || 'Heading 2'}\n`
        break
      case 'list':
        newText = `\n- ${selectedText || 'List item'}\n`
        break
      case 'ordered-list':
        newText = `\n1. ${selectedText || 'List item'}\n`
        break
      case 'quote':
        newText = `\n> ${selectedText || 'Quote'}\n`
        break
      case 'code':
        newText = `\`${selectedText || 'code'}\``
        break
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`
        break
      default:
        newText = syntax
    }

    const updatedContent = text.substring(0, start) + newText + text.substring(end)
    handleUpdateNote({ content: updatedContent })

    // Restore focus and position cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + newText.length, start + newText.length)
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#C1121F] hover:bg-[#9B0F1A] gap-2 shrink-0">
                <Plus className="w-4 h-4" /> New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="Note title..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNote()}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Content</label>
                  <Textarea
                    placeholder="Start writing your note..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {SAMPLE_TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={newNoteTags.includes(tag) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-colors ${
                          newNoteTags.includes(tag) ? 'bg-[#C1121F]' : ''
                        }`}
                        onClick={() => {
                          if (newNoteTags.includes(tag)) {
                            setNewNoteTags(prev => prev.filter(t => t !== tag))
                          } else {
                            setNewNoteTags(prev => [...prev, tag])
                          }
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateNote}
                    className="bg-[#C1121F] hover:bg-[#9B0F1A]"
                    disabled={!newNoteTitle.trim()}
                  >
                    Create Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tags Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {allTags.slice(0, 5).map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              className={`cursor-pointer transition-colors ${
                selectedTag === tag ? 'bg-[#C1121F]' : 'hover:bg-[#C1121F]/10'
              }`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
          {allTags.length > 5 && (
            <Badge variant="outline" className="cursor-pointer">
              +{allTags.length - 5} more
            </Badge>
          )}
          {selectedTag && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTag(null)}
              className="h-6 px-2 text-xs"
            >
              <X className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Notes Grid / Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Notes List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-muted-foreground">
              Notes ({filteredNotes.length})
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8">
                  <FolderOpen className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setNotes([...notes].sort((a, b) => a.title.localeCompare(b.title)))}>
                  Sort by Title
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setNotes([...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()))}>
                  Sort by Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setNotes([...notes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))}>
                  Sort by Created
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ScrollArea className="h-[450px]">
            <div className="space-y-2 pr-2">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all group ${
                      activeNoteId === note.id 
                        ? 'border-[#C1121F] bg-[#C1121F]/5 shadow-sm' 
                        : 'hover:border-muted-foreground/30 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {note.isPinned && <Pin className="w-3 h-3 text-[#C1121F] shrink-0" />}
                          <h4 className="font-medium truncate text-sm">{note.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {note.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {note.updatedAt.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{note.tags.length - 3}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action buttons on hover */}
                      <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 shrink-0 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTogglePin(note.id)
                          }}
                        >
                          <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'text-[#C1121F]' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicateNote(note)
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNote(note.id)
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No notes found</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first note to get started</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Note Editor / Preview */}
        <div className="lg:col-span-2">
          {activeNote ? (
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <Input
                      value={activeNote.title}
                      onChange={(e) => handleUpdateNote({ title: e.target.value })}
                      className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0 h-auto"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex border rounded-md overflow-hidden">
                      <Button
                        variant={viewMode === 'edit' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="rounded-none h-8"
                        onClick={() => setViewMode('edit')}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="rounded-none h-8"
                        onClick={() => setViewMode('preview')}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Export */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Export</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExportNote(activeNote, 'markdown')}>
                          <Code className="w-4 h-4 mr-2" /> Markdown (.md)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportNote(activeNote, 'txt')}>
                          <FileText className="w-4 h-4 mr-2" /> Plain Text (.txt)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {activeNote.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add tag
                  </Button>
                </div>
              </CardHeader>
              
              <Separator />

              <CardContent className="pt-4">
                {viewMode === 'edit' ? (
                  <>
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 p-2 border rounded-t-lg bg-muted/30 mb-0 overflow-x-auto">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('bold')} title="Bold">
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('italic')} title="Italic">
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Separator orientation="vertical" className="mx-1 h-6" />
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('heading1')} title="Heading 1">
                        <Heading1 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('heading2')} title="Heading 2">
                        <Heading2 className="w-4 h-4" />
                      </Button>
                      <Separator orientation="vertical" className="mx-1 h-6" />
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('list')} title="Bullet List">
                        <List className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('ordered-list')} title="Numbered List">
                        <ListOrdered className="w-4 h-4" />
                      </Button>
                      <Separator orientation="vertical" className="mx-1 h-6" />
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('quote')} title="Quote">
                        <Quote className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('code')} title="Inline Code">
                        <Code className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertMarkdown('link')} title="Link">
                        <Link className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Editor */}
                    <Textarea
                      id="note-editor"
                      value={activeNote.content}
                      onChange={(e) => handleUpdateNote({ content: e.target.value })}
                      placeholder="Start writing in Markdown..."
                      className="min-h-[350px] resize-none font-mono text-sm border-t-0 rounded-t-none focus-visible:ring-0"
                    />

                    {/* Status Bar */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 px-1">
                      <span>{activeNote.content.split(/\s+/).filter(Boolean).length} words</span>
                      <span className="flex items-center gap-1">
                        <Save className="w-3 h-3" /> Auto-saved
                      </span>
                    </div>
                  </>
                ) : (
                  /* Preview Mode */
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none min-h-[400px] p-4 rounded-lg border bg-background"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(activeNote.content) }}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <StickyNote className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">Select a Note</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a note from the list or create a new one
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// StickyNote icon import
function StickyNote(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/>
      <path d="M15 3v6h6"/>
    </svg>
  )
}
