// Tools Data for BioAlign Platform
// Comprehensive bioinformatics tools catalog

export type ToolStatus = 'available' | 'beta' | 'deprecated' | 'maintenance';

export interface BioTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  status: ToolStatus;
  popularity: number;
  tags: string[];
  version: string;
  lastUpdated: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  count: number;
}

// Tool Categories
export const toolCategories: ToolCategory[] = [
  {
    id: 'sequence',
    name: 'Sequence Analysis',
    description: 'DNA, RNA, and protein sequence analysis tools',
    icon: 'Dna',
    color: '#10B981',
    count: 15,
  },
  {
    id: 'alignment',
    name: 'Sequence Alignment',
    description: 'Pairwise and multiple sequence alignment',
    icon: 'ArrowLeftRight',
    color: '#3B82F6',
    count: 8,
  },
  {
    id: 'structure',
    name: 'Structure Prediction',
    description: 'Protein and RNA structure analysis',
    icon: 'Atom',
    color: '#8B5CF6',
    count: 10,
  },
  {
    id: 'genomics',
    name: 'Genomics',
    description: 'Genome assembly, annotation, and variant analysis',
    icon: 'CircleDot',
    color: '#F59E0B',
    count: 12,
  },
  {
    id: 'transcriptomics',
    name: 'Transcriptomics',
    description: 'RNA-seq and gene expression analysis',
    icon: 'FlaskConical',
    color: '#EC4899',
    count: 9,
  },
  {
    id: 'phylogenetics',
    name: 'Phylogenetics',
    description: 'Evolutionary tree construction and analysis',
    icon: 'TreePine',
    color: '#059669',
    count: 7,
  },
  {
    id: 'docking',
    name: 'Molecular Docking',
    description: 'Protein-ligand docking simulations',
    icon: 'Atom',
    color: '#6366F1',
    count: 6,
  },
  {
    id: 'crispr',
    name: 'CRISPR Tools',
    description: 'Guide RNA design and off-target prediction',
    icon: 'Scissors',
    color: '#EF4444',
    count: 5,
  },
  {
    id: 'primer',
    name: 'Primer Design',
    description: 'PCR primer design and validation',
    icon: 'TestTube',
    color: '#14B8A6',
    count: 8,
  },
  {
    id: 'utilities',
    name: 'Utilities',
    description: 'File conversion and general utilities',
    icon: 'Settings',
    color: '#6B7280',
    count: 14,
  },
];

// All Tools Database
const allTools: BioTool[] = [
  // Sequence Analysis Tools
  {
    id: 'blast',
    name: 'BLAST Search',
    description: 'Search sequences against NCBI databases using BLAST algorithm',
    category: 'sequence',
    icon: 'Search',
    status: 'available',
    popularity: 98,
    tags: ['search', 'homology', 'ncbi'],
    version: '2.15.0',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'gc-content',
    name: 'GC Content Calculator',
    description: 'Calculate GC content and nucleotide composition of sequences',
    category: 'sequence',
    icon: 'Percent',
    status: 'available',
    popularity: 85,
    tags: ['composition', 'statistics'],
    version: '1.2.0',
    lastUpdated: '2024-02-20',
  },
  {
    id: 'reverse-complement',
    name: 'Reverse Complement',
    description: 'Generate reverse complement of DNA sequences',
    category: 'sequence',
    icon: 'ArrowLeftRight',
    status: 'available',
    popularity: 80,
    tags: ['dna', 'transformation'],
    version: '1.0.0',
    lastUpdated: '2024-01-10',
  },
  {
    id: 'translate',
    name: 'Translate Sequence',
    description: 'Translate DNA/RNA to protein sequences using genetic codes',
    category: 'sequence',
    icon: 'Languages',
    status: 'available',
    popularity: 88,
    tags: ['translation', 'protein', 'codon'],
    version: '1.5.0',
    lastUpdated: '2024-03-01',
  },
  {
    id: 'orf-finder',
    name: 'ORF Finder',
    description: 'Find open reading frames in nucleotide sequences',
    category: 'sequence',
    icon: 'Search',
    status: 'available',
    popularity: 75,
    tags: ['orf', 'coding', 'prediction'],
    version: '2.0.0',
    lastUpdated: '2024-02-15',
  },
  {
    id: 'motif-search',
    name: 'Motif Search',
    description: 'Search for sequence motifs and patterns',
    category: 'sequence',
    icon: 'Target',
    status: 'available',
    popularity: 70,
    tags: ['pattern', 'regex', 'search'],
    version: '1.3.0',
    lastUpdated: '2024-01-25',
  },
  {
    id: 'restriction-map',
    name: 'Restriction Mapper',
    description: 'Find restriction enzyme cut sites in sequences',
    category: 'sequence',
    icon: 'Scissors',
    status: 'available',
    popularity: 72,
    tags: ['enzyme', 'cloning', 'cut-site'],
    version: '1.8.0',
    lastUpdated: '2024-02-28',
  },
  // Alignment Tools
  {
    id: 'pairwise-align',
    name: 'Pairwise Alignment',
    description: 'Align two sequences using Needleman-Wunsch or Smith-Waterman',
    category: 'alignment',
    icon: 'ArrowLeftRight',
    status: 'available',
    popularity: 90,
    tags: ['global', 'local', 'alignment'],
    version: '2.5.0',
    lastUpdated: '2024-03-05',
  },
  {
    id: 'multiple-align',
    name: 'Multiple Sequence Alignment',
    description: 'Align multiple sequences using MUSCLE or MAFFT',
    category: 'alignment',
    icon: 'Layers',
    status: 'available',
    popularity: 87,
    tags: ['msa', 'muscle', 'mafft'],
    version: '3.0.0',
    lastUpdated: '2024-03-10',
  },
  {
    id: 'clustal',
    name: 'Clustal Omega',
    description: 'Fast multiple sequence alignment with guide trees',
    category: 'alignment',
    icon: 'TreePine',
    status: 'available',
    popularity: 82,
    tags: ['clustal', 'msa', 'tree'],
    version: '1.2.4',
    lastUpdated: '2024-02-18',
  },
  // Structure Tools
  {
    id: 'secondary-structure',
    name: 'Secondary Structure Prediction',
    description: 'Predict protein secondary structure from sequence',
    category: 'structure',
    icon: 'Atom',
    status: 'available',
    popularity: 78,
    tags: ['prediction', 'alpha-helix', 'beta-sheet'],
    version: '2.1.0',
    lastUpdated: '2024-02-22',
  },
  {
    id: 'tm-prediction',
    name: 'Transmembrane Prediction',
    description: 'Predict transmembrane helices in proteins',
    category: 'structure',
    icon: 'BarChart3',
    status: 'available',
    popularity: 65,
    tags: ['tmhmm', 'membrane', 'helix'],
    version: '1.5.0',
    lastUpdated: '2024-01-30',
  },
  // Genomics Tools
  {
    id: 'variant-caller',
    name: 'Variant Caller',
    description: 'Call SNPs and indels from alignment files',
    category: 'genomics',
    icon: 'CircleDot',
    status: 'available',
    popularity: 85,
    tags: ['snp', 'indel', 'gatk'],
    version: '4.2.0',
    lastUpdated: '2024-03-08',
  },
  {
    id: 'annotation',
    name: 'Genome Annotation',
    description: 'Annotate genomes with functional information',
    category: 'genomics',
    icon: 'FileText',
    status: 'beta',
    popularity: 70,
    tags: ['genes', 'functional', 'evidence'],
    version: '1.0.0-beta',
    lastUpdated: '2024-03-01',
  },
  // Transcriptomics Tools
  {
    id: 'differential-expression',
    name: 'Differential Expression',
    description: 'Identify differentially expressed genes',
    category: 'transcriptomics',
    icon: 'FlaskConical',
    status: 'available',
    popularity: 88,
    tags: ['deseq2', 'edger', 'rna-seq'],
    version: '3.1.0',
    lastUpdated: '2024-03-12',
  },
  {
    id: 'pathway-analysis',
    name: 'Pathway Analysis',
    description: 'Perform pathway enrichment analysis',
    category: 'transcriptomics',
    icon: 'GitBranch',
    status: 'available',
    popularity: 75,
    tags: ['go', 'kegg', 'enrichment'],
    version: '2.0.0',
    lastUpdated: '2024-02-25',
  },
  // Phylogenetics Tools
  {
    id: 'tree-builder',
    name: 'Phylogenetic Tree Builder',
    description: 'Build evolutionary trees from alignments',
    category: 'phylogenetics',
    icon: 'TreePine',
    status: 'available',
    popularity: 80,
    tags: ['neighbor-joining', 'maximum-likelihood'],
    version: '2.3.0',
    lastUpdated: '2024-03-03',
  },
  // CRISPR Tools
  {
    id: 'grna-design',
    name: 'gRNA Designer',
    description: 'Design guide RNAs for CRISPR/Cas9 experiments',
    category: 'crispr',
    icon: 'Scissors',
    status: 'available',
    popularity: 86,
    tags: ['cas9', 'guide-rna', 'design'],
    version: '2.0.0',
    lastUpdated: '2024-03-06',
  },
  {
    id: 'off-target',
    name: 'Off-Target Predictor',
    description: 'Predict potential off-target effects of gRNAs',
    category: 'crispr',
    icon: 'Crosshair',
    status: 'beta',
    popularity: 72,
    tags: ['specificity', 'prediction', 'safety'],
    version: '1.5.0-beta',
    lastUpdated: '2024-02-20',
  },
  // Primer Design Tools
  {
    id: 'primer3',
    name: 'Primer Design (Primer3)',
    description: 'Design PCR primers using Primer3 engine',
    category: 'primer',
    icon: 'TestTube',
    status: 'available',
    popularity: 92,
    tags: ['pcr', 'primer3', 'design'],
    version: '2.6.0',
    lastUpdated: '2024-03-10',
  },
  {
    id: 'primer-check',
    name: 'Primer Validator',
    description: 'Validate primer properties and check dimers',
    category: 'primer',
    icon: 'CheckCircle2',
    status: 'available',
    popularity: 78,
    tags: ['validation', 'dimer', 'tm'],
    version: '1.8.0',
    lastUpdated: '2024-02-28',
  },
  // Utility Tools
  {
    id: 'format-converter',
    name: 'Format Converter',
    description: 'Convert between FASTA, GenBank, EMBL formats',
    category: 'utilities',
    icon: 'RefreshCw',
    status: 'available',
    popularity: 88,
    tags: ['conversion', 'format', 'fasta'],
    version: '3.0.0',
    lastUpdated: '2024-03-12',
  },
  {
    id: 'seq-extractor',
    name: 'Sequence Extractor',
    description: 'Extract subsequences by coordinates or features',
    category: 'utilities',
    icon: 'Download',
    status: 'available',
    popularity: 70,
    tags: ['extract', 'coordinates', 'region'],
    version: '1.4.0',
    lastUpdated: '2024-02-15',
  },
];

// Get all tools
export function getAllTools(): BioTool[] {
  return [...allTools];
}

// Search tools by query
export function searchTools(query: string): BioTool[] {
  const lowerQuery = query.toLowerCase();
  return allTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      tool.category.toLowerCase().includes(lowerQuery)
  );
}

// Get recently used tools (mock - would come from user data in production)
export function recentlyUsedTools(): BioTool[] {
  return allTools.slice(0, 5).map((tool) => ({ ...tool }));
}

// Get popular tools sorted by popularity
export function popularTools(): BioTool[] {
  return [...allTools].sort((a, b) => b.popularity - a.popularity);
}

// Get tools by category
export function getToolsByCategory(categoryId: string): BioTool[] {
  return allTools.filter((tool) => tool.category === categoryId);
}

// Get a single tool by ID
export function getToolById(toolId: string): BioTool | undefined {
  return allTools.find((tool) => tool.id === toolId);
}
