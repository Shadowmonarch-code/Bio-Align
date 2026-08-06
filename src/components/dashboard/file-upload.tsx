'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Upload,
  X,
  File,
  FileText,
  Dna,
  Database,
  Atom,
  Box,
  Hexagon,
  Layers,
  AlignCenterVertical,
  GitBranch,
  LayoutGrid,
  MapPin,
  Map,
  Table,
  Table2,
  Sheet,
  Braces,
  Code,
  Archive,
  ArchiveRestore,
  Package,
  PackageOpen,
  FileArchive,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Trash2,
  List,
  Grid3X3,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  UploadedFile,
  BioFileType,
  CategoryInfo,
  FILE_CATEGORIES,
  BIO_FILE_TYPES,
  detectFileType,
  formatFileSize,
  truncateFilename,
  generateFileId,
  validateFile,
  readPreviewContent,
  getCategoryInfo,
} from '@/lib/file-types';
import { cn } from '@/lib/utils';

// ============================================================================
// Icon Mapping Component
// ============================================================================

interface IconProps {
  className?: string;
}

const IconMap: Record<string, React.FC<IconProps>> = {
  Dna,
  FileText,
  Database,
  Atom,
  Box,
  Hexagon,
  Layers,
  AlignStartVertical: AlignCenterVertical,
  AlignCenterVertical,
  AlignEndVertical: AlignCenterVertical,
  GitBranch,
  LayoutGrid,
  MapPin,
  Map,
  Table,
  Table2,
  Sheet,
  Braces,
  Code,
  Archive,
  ArchiveRestore,
  Package,
  PackageOpen,
  FileArchive,
  Lock,
  Shield,
};

function getFileIcon(bioType: BioFileType | null, className = 'size-5'): React.ReactElement {
  if (!bioType) return <File className={className} />;
  
  const IconComponent = IconMap[bioType.icon] || File;
  return <IconComponent className={className} />;
}

// ============================================================================
// Custom Hook for Drag and Drop
// ============================================================================

function useDragDrop(onFiles: (files: File[]) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFiles(files);
      }
    },
    [onFiles]
  );

  return {
    isDragging,
    handlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}

// ============================================================================
// Sub-Components
// ============================================================================

/** Empty state illustration */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-8 text-center"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="mb-4"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
          <div className="relative bg-gradient-to-br from-[#C1121F]/10 to-[#C1121F]/5 p-6 rounded-full border-2 border-dashed border-[#C1121F]/30">
            <Upload className="size-12 text-[#C1121F]" />
          </div>
        </div>
      </motion.div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No files uploaded yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Drag and drop your bioinformatics files here or click to browse
      </p>
      
      {/* Supported formats preview */}
      <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
        {FILE_CATEGORIES.slice(0, 3).map((cat) => (
          <div key={cat.id} className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-muted/50">
            {getFileIcon({ icon: cat.icon, extension: '', name: '', category: cat.id, mimeType: '', description: '', color: cat.color }, 'size-3')}
            <span className="text-muted-foreground">{cat.formats.length} {cat.name.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/** Supported file types display */
function SupportedFormats() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Supported Bioinformatics Formats</span>
          </div>
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                {FILE_CATEGORIES.map((category) => (
                  <CategoryBadge key={category.id} category={category} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!expanded && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {FILE_CATEGORIES.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="text-xs py-0 h-6"
                style={{ borderColor: `${category.color}40`, color: category.color }}
              >
                {category.formats.slice(0, 2).join(', ')}
                {category.formats.length > 2 && ` +${category.formats.length - 2}`}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Category badge component */
function CategoryBadge({ category }: { category: CategoryInfo }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-3 rounded-lg border bg-background/50 transition-colors hover:bg-background"
      style={{ borderColor: `${category.color}30` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="p-1.5 rounded-md"
          style={{ backgroundColor: `${category.color}15` }}
        >
          {getFileIcon(
            { icon: category.icon, extension: '', name: '', category: category.id, mimeType: '', description: '', color: category.color },
            'size-4'
          )}
        </div>
        <span className="font-medium text-sm">{category.name}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{category.description}</p>
      <div className="flex flex-wrap gap-1">
        {category.formats.map((format) => (
          <Badge
            key={format}
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-5 font-mono"
            style={{ backgroundColor: `${category.color}15`, color: category.color }}
          >
            {format}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}

/** Single file item in the list */
function FileItem({
  file,
  onRemove,
  onPreview,
  viewMode,
}: {
  file: UploadedFile;
  onRemove: (id: string) => void;
  onPreview: (file: UploadedFile) => void;
  viewMode: 'grid' | 'list';
}) {
  const controls = useAnimation();

  useEffect(() => {
    if (file.status === 'uploading') {
      controls.start({
        scale: [1, 1.02, 1],
        transition: { repeat: Infinity, duration: 1.5 },
      });
    }
  }, [file.status, controls]);

  const statusConfig = {
    uploading: {
      icon: Loader2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      label: 'Uploading...',
    },
    ready: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: 'Ready',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      label: 'Error',
    },
    previewing: {
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      label: 'Preview',
    },
  };

  const status = statusConfig[file.status];
  const StatusIcon = status.icon;

  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="group relative"
      >
        <Card className="h-full overflow-hidden border-border/50 hover:border-[#C1121F]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#C1121F]/5">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <motion.div
                animate={controls}
                className={cn(
                  'p-2.5 rounded-lg transition-colors',
                  file.bioType?.color
                    ? `bg-[${file.bioType.color}10]`
                    : 'bg-muted'
                )}
                style={
                  file.bioType?.color
                    ? { backgroundColor: `${file.bioType.color}10` }
                    : undefined
                }
              >
                {getFileIcon(file.bioType, 'size-5')}
              </motion.div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {file.preview && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    onClick={() => onPreview(file)}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 text-destructive hover:text-destructive"
                  onClick={() => onRemove(file.id)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* File info */}
            <div className="space-y-2">
              <p className="text-sm font-medium truncate" title={file.name}>
                {truncateFilename(file.name, 20)}
              </p>
              
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 font-mono"
                  style={
                    file.bioType?.color
                      ? {
                          backgroundColor: `${file.bioType.color}15`,
                          color: file.bioType.color,
                        }
                      : undefined
                  }
                >
                  {file.bioType?.name || 'Unknown'}
                </Badge>
                
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
              </div>

              {/* Progress bar for uploading */}
              {file.status === 'uploading' && (
                <Progress value={file.progress} className="h-1.5" />
              )}

              {/* Status indicator */}
              <div className="flex items-center gap-1.5">
                <StatusIcon className={cn('size-3.5', status.color)} />
                <span className={cn('text-xs', status.color)}>
                  {file.error || status.label}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // List view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group"
    >
      <div className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-[#C1121F]/30 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-sm">
        {/* Icon */}
        <motion.div
          animate={controls}
          className={cn(
            'p-2 rounded-lg shrink-0',
            file.bioType?.color ? '' : 'bg-muted'
          )}
          style={
            file.bioType?.color
              ? { backgroundColor: `${file.bioType.color}10` }
              : undefined
          }
        >
          {getFileIcon(file.bioType, 'size-4')}
        </motion.div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate" title={file.name}>
              {truncateFilename(file.name, 35)}
            </p>
            <Badge
              variant="secondary"
              className="text-[10px] h-5 shrink-0 font-mono"
              style={
                file.bioType?.color
                  ? {
                      backgroundColor: `${file.bioType.color}15`,
                      color: file.bioType.color,
                    }
                  : undefined
              }
            >
              {file.bioType?.name || 'Unknown'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
            
            {file.status === 'uploading' && (
              <div className="flex items-center gap-2 flex-1 max-w-[150px]">
                <Progress value={file.progress} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground">
                  {file.progress}%
                </span>
              </div>
            )}

            <div className={cn('flex items-center gap-1', status.bgColor, 'px-1.5 rounded')}>
              <StatusIcon className={cn('size-3', status.color)} />
              <span className={cn('text-[10px]', status.color)}>
                {file.error || status.label}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {file.preview && (
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => onPreview(file)}
            >
              <Eye className="size-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(file.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/** Preview dialog content */
function PreviewDialog({
  file,
  onClose,
}: {
  file: UploadedFile;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-xl shadow-2xl"
      >
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={
                    file.bioType?.color
                      ? { backgroundColor: `${file.bioType.color}10` }
                      : undefined
                  }
                >
                  {getFileIcon(file.bioType, 'size-5')}
                </div>
                <div>
                  <CardTitle className="text-base">{file.name}</CardTitle>
                  <CardDescription>
                    {file.bioType?.name || 'Unknown'} • {formatFileSize(file.size)}
                  </CardDescription>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-lg bg-muted/50 border overflow-auto max-h-[400px]">
              <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">
                {file.preview || 'Preview not available'}
              </pre>
            </div>
            {file.preview && (
              <p className="mt-2 text-xs text-muted-foreground text-right">
                Showing first {file.preview.split('\n').length} lines
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function FileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle new files being added
  const handleFiles = useCallback(async (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = [];

    for (const file of newFiles) {
      const validation = validateFile(file);
      const bioType = detectFileType(file.name);
      let preview: string | undefined;

      // Try to read preview for text-based files
      if (bioType && !bioType.mimeType.startsWith('application/')) {
        try {
          preview = await readPreviewContent(file);
        } catch {
          preview = undefined;
        }
      }

      uploadedFiles.push({
        id: generateFileId(),
        name: file.name,
        size: file.size,
        type: file.type || bioType?.mimeType || 'application/octet-stream',
        bioType,
        lastModified: file.lastModified,
        status: validation.valid ? 'uploading' : 'error',
        progress: 0,
        error: validation.errors[0],
        preview,
        file,
      });
    }

    setFiles((prev) => [...prev, ...uploadedFiles]);

    // Simulate upload progress for each file
    uploadedFiles.forEach((uploadedFile) => {
      if (uploadedFile.status !== 'error') {
        // Start upload simulation
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30 + 10;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id ? { ...f, status: 'ready' as const, progress: 100 } : f
              )
            );
          } else {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id ? { ...f, progress: Math.min(progress, 99) } : f
              )
            );
          }
        }, 200);
      }
    });
  }, []);

  // Remove a single file
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Clear all files
  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  // Open file browser
  const openFileBrowser = () => {
    fileInputRef.current?.click();
  };

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  // Drag and drop hook
  const { isDragging, handlers } = useDragDrop(handleFiles);

  // Calculate stats
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const readyCount = files.filter((f) => f.status === 'ready').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <div className="w-full space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".fasta,.fa,.fna,.faa,.fastq,.fq,.gb,.genbank,.embl,.pdb,.ent,.cif,.mcif,.mol,.mol2,.sdf,.sam,.bam,.cram,.vcf,.bed,.gff,.gff3,.gtf,.csv,.tsv,.txt,.xlsx,.xls,.json,.xml,.zip,.gz,.gzip,.tar,.tar.gz,.bz2,.rar,.7z"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload Zone */}
      <motion.div
        {...handlers}
        onClick={openFileBrowser}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        animate={isDragging ? { scale: 1.02 } : {}}
        className={cn(
          'relative cursor-pointer rounded-xl border-2 border-dashed p-8 md:p-12 transition-all duration-300',
          'hover:border-[#C1121F]/50 hover:bg-[#C1121F]/[0.02]',
          isDragging
            ? 'border-[#C1121F] bg-[#C1121F]/[0.05]'
            : 'border-border hover:border-[#C1121F]/30'
        )}
      >
        {/* Glassmorphism effect overlay */}
        <div
          className={cn(
            'absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none',
            'bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-[2px]',
            isDragging && 'opacity-100'
          )}
          style={{
            boxShadow: isDragging
              ? 'inset 0 0 30px rgba(193, 18, 31, 0.1)'
              : undefined,
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {/* Animated upload icon */}
          <motion.div
            animate={
              isDragging
                ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }
                : {
                    y: [0, -8, 0],
                  }
            }
            transition={
              isDragging
                ? { duration: 0.5, repeat: Infinity }
                : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }
            className="mb-4"
          >
            <div
              className={cn(
                'relative p-4 md:p-6 rounded-full transition-colors duration-300',
                isDragging
                  ? 'bg-[#C1121F]/10'
                  : 'bg-muted hover:bg-[#C1121F]/5'
              )}
            >
              <Upload
                className={cn(
                  'size-8 md:size-10 transition-colors duration-300',
                  isDragging ? 'text-[#C1121F]' : 'text-muted-foreground'
                )}
              />
              
              {/* Pulse effect when dragging */}
              {isDragging && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#C1121F]"
                  animate={{
                    scale: [1, 1.5],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                />
              )}
            </div>
          </motion.div>

          {/* Text content */}
          <AnimatePresence mode="wait">
            {isDragging ? (
              <motion.div
                key="dragging"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-lg font-semibold text-[#C1121F] mb-1">
                  Drop files here
                </h3>
                <p className="text-sm text-muted-foreground">
                  Release to upload your files
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-lg font-semibold mb-1">
                  Drag & drop bioinformatics files
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  or click to browse your computer
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileBrowser();
                  }}
                >
                  <Upload className="size-4" />
                  Browse Files
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick format badges */}
          {!isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 flex flex-wrap justify-center gap-1.5"
            >
              {['FASTA', 'FASTQ', 'PDB', 'VCF', 'BAM', 'CSV'].map((format) => (
                <Badge
                  key={format}
                  variant="outline"
                  className="text-[10px] font-mono px-1.5 py-0 h-5"
                >
                  .{format.toLowerCase()}
                </Badge>
              ))}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                +{Object.keys(BIO_FILE_TYPES).length - 6} more
              </Badge>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Supported Formats Section */}
      <SupportedFormats />

      {/* Files Section */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                Uploaded Files{' '}
                <span className="text-muted-foreground font-normal">
                  ({files.length})
                </span>
              </h3>
              
              {/* Stats */}
              <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-green-500" />
                  {readyCount} ready
                </span>
                {errorCount > 0 && (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="size-3.5 text-red-500" />
                    {errorCount} errors
                  </span>
                )}
                <span>{formatFileSize(totalSize)} total</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="hidden sm:flex items-center border rounded-md p-0.5">
                <Button
                  size="icon"
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  className="size-7"
                  onClick={() => setViewMode('list')}
                >
                  <List className="size-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  className="size-7"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="size-3.5" />
                </Button>
              </div>

              {/* Clear all button */}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={clearAll}
              >
                <Trash2 className="size-3.5" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Mobile stats */}
          <div className="sm:hidden flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-3 text-green-500" />
              {readyCount} ready
            </span>
            {errorCount > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle className="size-3 text-red-500" />
                {errorCount} errors
              </span>
            )}
            <span>{formatFileSize(totalSize)}</span>
          </div>

          {/* File list/grid */}
          <AnimatePresence mode="popLayout">
            {viewMode === 'grid' ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                <AnimatePresence>
                  {files.map((file) => (
                    <FileItem
                      key={file.id}
                      file={file}
                      onRemove={removeFile}
                      onPreview={setPreviewFile}
                      viewMode={viewMode}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="space-y-2"
              >
                <AnimatePresence>
                  {files.map((file) => (
                    <FileItem
                      key={file.id}
                      file={file}
                      onRemove={removeFile}
                      onPreview={setPreviewFile}
                      viewMode={viewMode}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {files.length === 0 && <EmptyState />}

      {/* Preview Dialog */}
      <AnimatePresence>
        {previewFile && (
          <PreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
