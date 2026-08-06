/**
 * Bioinformatics File Type Definitions and Helper Functions
 * 
 * This module provides comprehensive type definitions for bioinformatics
 * file formats along with utility functions for file detection, validation,
 * and formatting.
 */

// ============================================================================
// Type Definitions
// ============================================================================

/** Supported bioinformatics file categories */
export type BioFileCategory = 
  | 'sequence'
  | 'structure'
  | 'alignment'
  | 'variant'
  | 'data'
  | 'archive';

/** Upload status of a file */
export type FileUploadStatus = 'uploading' | 'ready' | 'error' | 'previewing';

/** Bioinformatics file type information */
export interface BioFileType {
  /** File extension (lowercase, without dot) */
  extension: string;
  /** Display name for the format */
  name: string;
  /** Category this file belongs to */
  category: BioFileCategory;
  /** MIME type for the file */
  mimeType: string;
  /** Description of the format */
  description: string;
  /** Icon name from lucide-react */
  icon: string;
  /** Color for the badge/category indicator */
  color: string;
}

/** Uploaded file data structure */
export interface UploadedFile {
  /** Unique identifier for the file */
  id: string;
  /** Original file name */
  name: string;
  /** File size in bytes */
  size: number;
  /** File type (MIME) */
  type: string;
  /** Detected bioinformatics file type */
  bioType: BioFileType | null;
  /** Last modified timestamp */
  lastModified: number;
  /** Current upload status */
  status: FileUploadStatus;
  /** Upload progress (0-100) */
  progress: number;
  /** Error message if any */
  error?: string;
  /** Preview content (first few lines for text files) */
  preview?: string;
  /** The actual File object reference */
  file: File;
}

/** Category information for display */
export interface CategoryInfo {
  id: BioFileCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  formats: string[];
}

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Bioinformatics File Types Registry
// ============================================================================

/** Complete registry of supported bioinformatics file types */
export const BIO_FILE_TYPES: Record<string, BioFileType> = {
  // Sequence Files
  fasta: {
    extension: 'fasta',
    name: 'FASTA',
    category: 'sequence',
    mimeType: 'text/x-fasta',
    description: 'Sequence alignment format with header lines starting with >',
    icon: 'Dna',
    color: '#10B981'
  },
  fa: {
    extension: 'fa',
    name: 'FASTA',
    category: 'sequence',
    mimeType: 'text/x-fasta',
    description: 'Sequence alignment format (short extension)',
    icon: 'Dna',
    color: '#10B981'
  },
  fna: {
    extension: 'fna',
    name: 'FASTA (Nucleotide)',
    category: 'sequence',
    mimeType: 'text/x-fasta',
    description: 'Nucleotide sequence in FASTA format',
    icon: 'Dna',
    color: '#10B981'
  },
  faa: {
    extension: 'faa',
    name: 'FASTA (Protein)',
    category: 'sequence',
    mimeType: 'text/x-fasta',
    description: 'Protein sequence in FASTA format',
    icon: 'Dna',
    color: '#10B981'
  },
  fastq: {
    extension: 'fastq',
    name: 'FASTQ',
    category: 'sequence',
    mimeType: 'text/x-fastq',
    description: 'Sequence format with quality scores',
    icon: 'FileText',
    color: '#059669'
  },
  fq: {
    extension: 'fq',
    name: 'FASTQ',
    category: 'sequence',
    mimeType: 'text/x-fastq',
    description: 'Sequence format with quality scores (short extension)',
    icon: 'FileText',
    color: '#059669'
  },
  gb: {
    extension: 'gb',
    name: 'GenBank',
    category: 'sequence',
    mimeType: 'text/plain',
    description: 'NCBI GenBank flat file format',
    icon: 'Database',
    color: '#047857'
  },
  genbank: {
    extension: 'genbank',
    name: 'GenBank',
    category: 'sequence',
    mimeType: 'text/plain',
    description: 'NCBI GenBank flat file format',
    icon: 'Database',
    color: '#047857'
  },
  embl: {
    extension: 'embl',
    name: 'EMBL',
    category: 'sequence',
    mimeType: 'text/plain',
    description: 'EMBL/EBIO sequence database format',
    icon: 'Database',
    color: '#065F46'
  },

  // Structure Files
  pdb: {
    extension: 'pdb',
    name: 'PDB',
    category: 'structure',
    mimeType: 'chemical/x-pdb',
    description: 'Protein Data Bank molecular structure format',
    icon: 'Atom',
    color: '#6366F1'
  },
  ent: {
    extension: 'ent',
    name: 'PDB (ENT)',
    category: 'structure',
    mimeType: 'chemical/x-pdb',
    description: 'PDB format with .ent extension',
    icon: 'Atom',
    color: '#6366F1'
  },
  cif: {
    extension: 'cif',
    name: 'CIF/mmCIF',
    category: 'structure',
    mimeType: 'chemical/x-cif',
    description: 'Crystallographic Information File format',
    icon: 'Box',
    color: '#8B5CF6'
  },
  mcif: {
    extension: 'mcif',
    name: 'mmCIF',
    category: 'structure',
    mimeType: 'chemical/x-cif',
    description: 'Macromolecular CIF format',
    icon: 'Box',
    color: '#8B5CF6'
  },
  mol: {
    extension: 'mol',
    name: 'MOL',
    category: 'structure',
    mimeType: 'chemical/x-mdl-molfile',
    description: 'MDL Molfile chemical structure format',
    icon: 'Hexagon',
    color: '#A855F7'
  },
  mol2: {
    extension: 'mol2',
    name: 'MOL2',
    category: 'structure',
    mimeType: 'chemical/x-mol2',
    description: 'Tripos MOL2 molecule format',
    icon: 'Hexagon',
    color: '#A855F7'
  },
  sdf: {
    extension: 'sdf',
    name: 'SDF',
    category: 'structure',
    mimeType: 'chemical/x-mdl-sdfile',
    description: 'Structure Data File format',
    icon: 'Layers',
    color: '#C084FC'
  },

  // Alignment Files
  sam: {
    extension: 'sam',
    name: 'SAM',
    category: 'alignment',
    mimeType: 'text/plain',
    description: 'Sequence Alignment/Map format (text)',
    icon: 'AlignStartVertical',
    color: '#F59E0B'
  },
  bam: {
    extension: 'bam',
    name: 'BAM',
    category: 'alignment',
    mimeType: 'application/octet-stream',
    description: 'Binary Alignment/Map format',
    icon: 'AlignCenterVertical',
    color: '#D97706'
  },
  cram: {
    extension: 'cram',
    name: 'CRAM',
    category: 'alignment',
    mimeType: 'application/octet-stream',
    description: 'Compressed Reference-oriented Alignment Map',
    icon: 'AlignEndVertical',
    color: '#B45309'
  },

  // Variant Files
  vcf: {
    extension: 'vcf',
    name: 'VCF',
    category: 'variant',
    mimeType: 'text/tab-separated-values',
    description: 'Variant Call Format for genomic variants',
    icon: 'GitBranch',
    color: '#EF4444'
  },
  bed: {
    extension: 'bed',
    name: 'BED',
    category: 'variant',
    mimeType: 'text/tab-separated-values',
    description: 'Browser Extensible Data genome annotation format',
    icon: 'LayoutGrid',
    color: '#DC2626'
  },
  gff: {
    extension: 'gff',
    name: 'GFF',
    category: 'variant',
    mimeType: 'text/plain',
    description: 'General Feature Format for genome annotations',
    icon: 'MapPin',
    color: '#B91C1C'
  },
  gff3: {
    extension: 'gff3',
    name: 'GFF3',
    category: 'variant',
    mimeType: 'text/plain',
    description: 'General Feature Format version 3',
    icon: 'MapPin',
    color: '#991B1B'
  },
  gtf: {
    extension: 'gtf',
    name: 'GTF',
    category: 'variant',
    mimeType: 'text/plain',
    description: 'Gene Transfer Format for gene annotations',
    icon: 'Map',
    color: '#991B1B'
  },

  // Data Files
  csv: {
    extension: 'csv',
    name: 'CSV',
    category: 'data',
    mimeType: 'text/csv',
    description: 'Comma-Separated Values data format',
    icon: 'Table',
    color: '#0EA5E9'
  },
  tsv: {
    extension: 'tsv',
    name: 'TSV',
    category: 'data',
    mimeType: 'text/tab-separated-values',
    description: 'Tab-Separated Values data format',
    icon: 'Table2',
    color: '#0284C7'
  },
  txt: {
    extension: 'txt',
    name: 'TXT',
    category: 'data',
    mimeType: 'text/plain',
    description: 'Plain text file',
    icon: 'File',
    color: '#64748B'
  },
  xlsx: {
    extension: 'xlsx',
    name: 'XLSX',
    category: 'data',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    description: 'Microsoft Excel spreadsheet format',
    icon: 'Sheet',
    color: '#22C55E'
  },
  xls: {
    extension: 'xls',
    name: 'XLS',
    category: 'data',
    mimeType: 'application/vnd.ms-excel',
    description: 'Microsoft Excel legacy format',
    icon: 'Sheet',
    color: '#16A34A'
  },
  json: {
    extension: 'json',
    name: 'JSON',
    category: 'data',
    mimeType: 'application/json',
    description: 'JavaScript Object Notation data format',
    icon: 'Braces',
    color: '#F97316'
  },
  xml: {
    extension: 'xml',
    name: 'XML',
    category: 'data',
    mimeType: 'application/xml',
    description: 'Extensible Markup Language format',
    icon: 'Code',
    color: '#EA580C'
  },

  // Archive Files
  zip: {
    extension: 'zip',
    name: 'ZIP',
    category: 'archive',
    mimeType: 'application/zip',
    description: 'ZIP compressed archive',
    icon: 'Archive',
    color: '#78716C'
  },
  gz: {
    extension: 'gz',
    name: 'GZIP',
    category: 'archive',
    mimeType: 'application/gzip',
    description: 'GNU Zip compressed file',
    icon: 'ArchiveRestore',
    color: '#57534E'
  },
  gzip: {
    extension: 'gzip',
    name: 'GZIP',
    category: 'archive',
    mimeType: 'application/gzip',
    description: 'GNU Zip compressed file',
    icon: 'ArchiveRestore',
    color: '#57534E'
  },
  tar: {
    extension: 'tar',
    name: 'TAR',
    category: 'archive',
    mimeType: 'application/x-tar',
    description: 'Tape Archive format',
    icon: 'Package',
    color: '#44403C'
  },
  'tar.gz': {
    extension: 'tar.gz',
    name: 'TAR.GZ',
    category: 'archive',
    mimeType: 'application/gzip',
    description: 'Gzipped TAR archive',
    icon: 'PackageOpen',
    color: '#3F3F46'
  },
  bz2: {
    extension: 'bz2',
    name: 'BZ2',
    category: 'archive',
    mimeType: 'application/x-bzip2',
    description: 'BZip2 compressed file',
    icon: 'FileArchive',
    color: '#292524'
  },
  rar: {
    extension: 'rar',
    name: 'RAR',
    category: 'archive',
    mimeType: 'application/vnd.rar',
    description: 'RAR compressed archive',
    icon: 'Lock',
    color: '#1C1917'
  },
  '7z': {
    extension: '7z',
    name: '7-Zip',
    category: 'archive',
    mimeType: 'application/x-7z-compressed',
    description: '7-Zip compressed archive',
    icon: 'Shield',
    color: '#18181B'
  }
};

// ============================================================================
// Category Definitions
// ============================================================================

/** All available categories with their metadata */
export const FILE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'sequence',
    name: 'Sequence Files',
    description: 'DNA, RNA, and protein sequences',
    icon: 'Dna',
    color: '#10B981',
    formats: ['FASTA', 'FASTQ', 'GenBank', 'EMBL']
  },
  {
    id: 'structure',
    name: 'Structure Files',
    description: '3D molecular structures',
    icon: 'Atom',
    color: '#6366F1',
    formats: ['PDB', 'CIF', 'MOL']
  },
  {
    id: 'alignment',
    name: 'Alignment Files',
    description: 'Sequence alignments and mappings',
    icon: 'AlignCenterVertical',
    color: '#F59E0B',
    formats: ['SAM', 'BAM', 'CRAM']
  },
  {
    id: 'variant',
    name: 'Variant Files',
    description: 'Genomic variants and annotations',
    icon: 'MapPin',
    color: '#EF4444',
    formats: ['VCF', 'BED', 'GFF', 'GTF']
  },
  {
    id: 'data',
    name: 'Data Files',
    description: 'Tabular and structured data',
    icon: 'Table',
    color: '#0EA5E9',
    formats: ['CSV', 'XLSX', 'TSV']
  },
  {
    id: 'archive',
    name: 'Archives',
    description: 'Compressed archives',
    icon: 'Archive',
    color: '#78716C',
    formats: ['ZIP', 'GZ', 'TAR', 'BZ2']
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract file extension from filename
 * Handles compound extensions like .tar.gz
 */
export function getFileExtension(filename: string): string {
  const lowerName = filename.toLowerCase();
  
  // Check for compound extensions first
  if (lowerName.endsWith('.tar.gz') || lowerName.endsWith('.tar.bz2')) {
    return lowerName.slice(lowerName.lastIndexOf('.') - 3);
  }
  
  // Handle .gz specially to check if it's a known format
  if (lowerName.endsWith('.gz')) {
    const baseExt = lowerName.slice(0, -3);
    const lastDot = baseExt.lastIndexOf('.');
    if (lastDot > 0) {
      return baseExt.slice(lastDot + 1) + '.gz';
    }
  }
  
  const lastDot = lowerName.lastIndexOf('.');
  return lastDot > 0 ? lowerName.slice(lastDot + 1) : '';
}

/**
 * Detect bioinformatics file type by extension
 */
export function detectFileType(filename: string): BioFileType | null {
  const ext = getFileExtension(filename);
  return BIO_FILE_TYPES[ext] || null;
}

/**
 * Get all supported extensions as a string for accept attribute
 */
export function getAcceptedExtensions(): string {
  const extensions = Object.keys(BIO_FILE_TYPES).map(ext => `.${ext}`);
  return extensions.join(',');
}

/**
 * Get all supported extensions array
 */
export function getSupportedExtensions(): string[] {
  return Object.keys(BIO_FILE_TYPES);
}

/**
 * Check if a file extension is supported
 */
export function isSupportedExtension(extension: string): boolean {
  return extension.toLowerCase() in BIO_FILE_TYPES;
}

/**
 * Check if a filename has a supported extension
 */
export function isSupportedFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return isSupportedExtension(ext);
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  
  // Use appropriate decimal places based on size
  const decimals = i === 0 ? 0 : size < 10 ? 2 : 1;
  return `${size.toFixed(decimals)} ${units[i]}`;
}

/**
 * Truncate filename if too long, preserving extension
 */
export function truncateFilename(name: string, maxLength: number = 30): string {
  if (name.length <= maxLength) return name;
  
  const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
  const baseName = name.slice(0, name.length - ext.length);
  const truncatedBase = baseName.slice(0, maxLength - ext.length - 3);
  
  return `${truncatedBase}...${ext}`;
}

/**
 * Generate unique ID for files
 */
export function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Validate uploaded file
 */
export function validateFile(file: File): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check file size (max 500MB)
  const maxSize = 500 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`File exceeds maximum size limit (${formatFileSize(maxSize)})`);
  }
  
  // Check for empty files
  if (file.size === 0) {
    errors.push('File is empty');
  }
  
  // Check if file type is supported
  const bioType = detectFileType(file.name);
  if (!bioType) {
    warnings.push('File type not recognized as a standard bioinformatics format');
  }
  
  // Warn about very large text files
  if (file.size > 50 * 1024 * 1024 && file.type.startsWith('text/')) {
    warnings.push('Large text file may take longer to process');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Read preview content from a text file
 * Returns first few lines of the file
 */
export async function readPreviewContent(file: File, maxLines: number = 10): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string || '';
        const lines = content.split('\n').slice(0, maxLines);
        resolve(lines.join('\n'));
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    // Only read as text for small files (< 5MB)
    if (file.size < 5 * 1024 * 1024) {
      reader.readAsText(file);
    } else {
      resolve('[Preview unavailable for large files]');
    }
  });
}

/**
 * Convert File object to UploadedFile structure
 */
export async function createUploadedFile(file: File): Promise<UploadedFile> {
  const validation = validateFile(file);
  const bioType = detectFileType(file.name);
  let preview: string | undefined;
  
  // Try to read preview for text-based files
  if (bioType && (bioType.mimeType.startsWith('text/') || bioType.category !== 'archive')) {
    try {
      preview = await readPreviewContent(file);
    } catch {
      preview = undefined;
    }
  }
  
  return {
    id: generateFileId(),
    name: file.name,
    size: file.size,
    type: file.type || bioType?.mimeType || 'application/octet-stream',
    bioType,
    lastModified: file.lastModified,
    status: validation.valid ? 'ready' : 'error',
    progress: 100,
    error: validation.errors[0],
    preview,
    file
  };
}

/**
 * Get category info by ID
 */
export function getCategoryInfo(categoryId: BioFileCategory): CategoryInfo | undefined {
  return FILE_CATEGORIES.find(c => c.id === categoryId);
}

/**
 * Get all file types in a specific category
 */
export function getFilesByCategory(categoryId: BioFileCategory): BioFileType[] {
  return Object.values(BIO_FILE_TYPES).filter(f => f.category === categoryId);
}
