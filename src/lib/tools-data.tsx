// BioAlign Tools Catalog Data
// Comprehensive bioinformatics tool definitions organized by category

import {
  Dna,
  Microscope,
  TreePine,
  CircleDot,
  FlaskConical,
  Box,
  Atom,
  Scissors,
  TestTube,
  Settings,
  AlignCenter,
  Search,
  GitCompare,
  BarChart3,
  Eye,
  Target,
  Zap,
  Waves,
  Layers,
  Globe,
  Cpu,
  ScanLine,
  Network,
  FileText,
  Calculator,
  Thermometer,
  Shuffle,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

// Tool status types
export type ToolStatus = "available" | "coming-soon" | "beta" | "deprecated"

// Tool interface
export interface BioTool {
  id: string
  name: string
  description: string
  category: ToolCategoryType
  icon: LucideIcon
  status: ToolStatus
  tags: string[]
  version?: string
  lastUpdated?: string
}

// Category types
export type ToolCategoryType =
  | "sequence-analysis"
  | "multiple-alignment"
  | "protein-analysis"
  | "phylogenetics"
  | "genomics"
  | "transcriptomics"
  | "structural-biology"
  | "molecular-docking"
  | "crispr"
  | "primer-tools"
  | "utilities"

// Category interface
export interface ToolCategory {
  id: ToolCategoryType
  name: string
  description: string
  icon: LucideIcon
  color: string
  tools: BioTool[]
}

// ==================== SEQUENCE ANALYSIS TOOLS ====================
const sequenceAnalysisTools: BioTool[] = [
  // BLAST Family
  {
    id: "blast",
    name: "BLAST",
    description: "Basic Local Alignment Search Tool - find regions of similarity between sequences",
    category: "sequence-analysis",
    icon: Search,
    status: "available",
    tags: ["alignment", "search", "similarity"],
    version: "2.15.0",
  },
  {
    id: "blastn",
    name: "BLASTN",
    description: "Nucleotide-nucleotide BLAST for comparing nucleotide query sequences",
    category: "sequence-analysis",
    icon: Dna,
    status: "available",
    tags: ["nucleotide", "alignment", "search"],
    version: "2.15.0",
  },
  {
    id: "blastp",
    name: "BLASTP",
    description: "Protein-protein BLAST for finding similar protein sequences",
    category: "sequence-analysis",
    icon: Microscope,
    status: "available",
    tags: ["protein", "alignment", "search"],
    version: "2.15.0",
  },
  {
    id: "blastx",
    name: "BLASTX",
    description: "Translated nucleotide-protein BLAST for searching protein databases",
    category: "sequence-analysis",
    icon: AlignCenter,
    status: "available",
    tags: ["translation", "protein", "search"],
    version: "2.15.0",
  },
  {
    id: "tblastn",
    name: "TBLASTN",
    description: "Protein-translated nucleotide BLAST for six-frame translations",
    category: "sequence-analysis",
    icon: GitCompare,
    status: "available",
    tags: ["nucleotide", "translation", "search"],
    version: "2.15.0",
  },
  {
    id: "tblastx",
    name: "TBLASTX",
    description: "Translated nucleotide-translated nucleotide BLAST for distant homologs",
    category: "sequence-analysis",
    icon: Layers,
    status: "available",
    tags: ["nucleotide", "translation", "distant-homologs"],
    version: "2.15.0",
  },
  {
    id: "psi-blast",
    name: "PSI-BLAST",
    description: "Position-Specific Iterated BLAST for finding distant relationships",
    category: "sequence-analysis",
    icon: Zap,
    status: "available",
    tags: ["iterative", "position-specific", "profile"],
    version: "2.15.0",
  },
  {
    id: "megablast",
    name: "MegaBLAST",
    description: "Optimized for very similar sequences, faster than standard BLAST",
    category: "sequence-analysis",
    icon: Waves,
    status: "available",
    tags: ["fast", "similar-sequences", "large-datasets"],
    version: "2.15.0",
  },
  // Alignment Tools
  {
    id: "needleman-wunsch",
    name: "Needleman-Wunsch",
    description: "Global pairwise sequence alignment algorithm for optimal alignment",
    category: "sequence-analysis",
    icon: AlignCenter,
    status: "available",
    tags: ["global-alignment", "optimal", "pairwise"],
    version: "1.0.0",
  },
  {
    id: "smith-waterman",
    name: "Smith-Waterman",
    description: "Local pairwise sequence alignment algorithm for best local matches",
    category: "sequence-analysis",
    icon: Target,
    status: "available",
    tags: ["local-alignment", "optimal", "pairwise"],
    version: "1.0.0",
  },
  // Sequence Utilities
  {
    id: "fasta-search",
    name: "FASTA Search",
    description: "Search and query FASTA format sequence databases efficiently",
    category: "sequence-analysis",
    icon: Search,
    status: "available",
    tags: ["fasta", "database", "search"],
    version: "36.3.8",
  },
  {
    id: "dot-plot",
    name: "Dot Plot",
    description: "Visualize sequence similarities using dot matrix representation",
    category: "sequence-analysis",
    icon: BarChart3,
    status: "available",
    tags: ["visualization", "similarity", "matrix"],
    version: "1.0.0",
  },
  // Analysis Tools
  {
    id: "sequence-viewer",
    name: "Sequence Viewer",
    description: "Interactive viewer for exploring DNA, RNA, and protein sequences",
    category: "sequence-analysis",
    icon: Eye,
    status: "available",
    tags: ["viewer", "interactive", "visualization"],
    version: "2.1.0",
  },
  {
    id: "orf-finder",
    name: "ORF Finder",
    description: "Identify open reading frames in nucleotide sequences",
    category: "sequence-analysis",
    icon: Target,
    status: "available",
    tags: ["orf", "coding-region", "prediction"],
    version: "1.2.0",
  },
  {
    id: "reverse-complement",
    name: "Reverse Complement",
    description: "Generate reverse complement of DNA/RNA sequences",
    category: "sequence-analysis",
    icon: GitCompare,
    status: "available",
    tags: ["reverse", "complement", "dna"],
    version: "1.0.0",
  },
  {
    id: "translation",
    name: "Translation",
    description: "Translate nucleotide sequences to protein sequences",
    category: "sequence-analysis",
    icon: Layers,
    status: "available",
    tags: ["translation", "codon", "protein"],
    version: "1.1.0",
  },
  {
    id: "codon-optimization",
    name: "Codon Optimization",
    description: "Optimize codon usage for expression in different organisms",
    category: "sequence-analysis",
    icon: Zap,
    status: "beta",
    tags: ["optimization", "expression", "codon-usage"],
    version: "1.0.0-beta",
  },
  {
    id: "gc-content",
    name: "GC Content",
    description: "Calculate GC content and composition analysis of sequences",
    category: "sequence-analysis",
    icon: BarChart3,
    status: "available",
    tags: ["gc-content", "composition", "statistics"],
    version: "1.0.0",
  },
  {
    id: "sequence-statistics",
    name: "Sequence Statistics",
    description: "Comprehensive statistical analysis of sequence properties",
    category: "sequence-analysis",
    icon: Calculator,
    status: "available",
    tags: ["statistics", "composition", "analysis"],
    version: "1.2.0",
  },
  {
    id: "restriction-enzyme",
    name: "Restriction Enzyme Mapping",
    description: "Find restriction enzyme cut sites in DNA sequences",
    category: "sequence-analysis",
    icon: Scissors,
    status: "available",
    tags: ["restriction-enzyme", "cut-sites", "cloning"],
    version: "2.0.0",
  },
  {
    id: "primer-design",
    name: "Primer Design",
    description: "Design PCR primers with melting temperature optimization",
    category: "sequence-analysis",
    icon: TestTube,
    status: "available",
    tags: ["primer", "pcr", "design"],
    version: "3.0.0",
  },
  {
    id: "motif-search",
    name: "Motif Search",
    description: "Search for sequence motifs and patterns in your data",
    category: "sequence-analysis",
    icon: Search,
    status: "available",
    tags: ["motif", "pattern", "search"],
    version: "1.5.0",
  },
  {
    id: "kmer-analysis",
    name: "K-mer Analysis",
    description: "Analyze k-mer frequency and distribution in sequences",
    category: "sequence-analysis",
    icon: BarChart3,
    status: "beta",
    tags: ["kmer", "frequency", "assembly"],
    version: "1.0.0-beta",
  },
]

// ==================== MULTIPLE SEQUENCE ALIGNMENT TOOLS ====================
const multipleAlignmentTools: BioTool[] = [
  {
    id: "clustal-omega",
    name: "Clustal Omega",
    description: "Fast and scalable multiple sequence alignment for large datasets",
    category: "multiple-alignment",
    icon: AlignCenter,
    status: "available",
    tags: ["msa", "fast", "scalable"],
    version: "1.2.4",
  },
  {
    id: "muscle",
    name: "MUSCLE",
    description: "Multiple Sequence Comparison by Log-Expectation - accurate alignments",
    category: "multiple-alignment",
    icon: Layers,
    status: "available",
    tags: ["msa", "accurate", "refinement"],
    version: "5.1",
  },
  {
    id: "mafft",
    name: "MAFFT",
    description: "Multiple alignment with fast Fourier transform for speed and accuracy",
    category: "multiple-alignment",
    icon: Waves,
    status: "available",
    tags: ["msa", "fft", "accurate"],
    version: "7.550",
  },
  {
    id: "t-coffee",
    name: "T-Coffee",
    description: "Tree-based Consistency Objective Function For alignmEnt evaluation",
    category: "multiple-alignment",
    icon: TreePine,
    status: "available",
    tags: ["msa", "consistency", "accuracy"],
    version: "13.45.0",
  },
  {
    id: "kalign",
    name: "Kalign",
    description: "Fast and accurate multiple sequence alignment algorithm",
    category: "multiple-alignment",
    icon: AlignCenter,
    status: "available",
    tags: ["msa", "fast", "efficient"],
    version: "3.4.0",
  },
  {
    id: "cobalt",
    name: "COBALT",
    description: "Constraint-based multiple protein alignment tool from NCBI",
    category: "multiple-alignment",
    icon: Box,
    status: "available",
    tags: ["msa", "constraint-based", "protein"],
    version: "1.0.0",
  },
]

// ==================== PROTEIN ANALYSIS TOOLS ====================
const proteinAnalysisTools: BioTool[] = [
  {
    id: "protparam",
    name: "ProtParam",
    description: "Compute physical and chemical parameters for protein sequences",
    category: "protein-analysis",
    icon: Microscope,
    status: "available",
    tags: ["parameters", "physicochemical", "properties"],
    version: "1.0.0",
  },
  {
    id: "molecular-weight",
    name: "Molecular Weight",
    description: "Calculate molecular weight of proteins and peptides",
    category: "protein-analysis",
    icon: Calculator,
    status: "available",
    tags: ["weight", "mass", "calculation"],
    version: "1.0.0",
  },
  {
    id: "isoelectric-point",
    name: "Isoelectric Point",
    description: "Predict isoelectric point (pI) of protein sequences",
    category: "protein-analysis",
    icon: Target,
    status: "available",
    tags: ["pi", "charge", "ph"],
    version: "1.0.0",
  },
  {
    id: "hydrophobicity",
    name: "Hydrophobicity",
    description: "Analyze hydrophobicity profiles and scales of proteins",
    category: "protein-analysis",
    icon: Waves,
    status: "available",
    tags: ["hydrophobicity", "kyte-doolittle", "profile"],
    version: "1.0.0",
  },
  {
    id: "signal-peptide",
    name: "Signal Peptide",
    description: "Predict signal peptide cleavage sites in proteins",
    category: "protein-analysis",
    icon: Zap,
    status: "available",
    tags: ["signal-peptide", "secretion", "prediction"],
    version: "6.0",
  },
  {
    id: "transmembrane",
    name: "Transmembrane Prediction",
    description: "Predict transmembrane helices and topology in proteins",
    category: "protein-analysis",
    icon: Layers,
    status: "available",
    tags: ["transmembrane", "tmhmm", "topology"],
    version: "2.0",
  },
  {
    id: "protein-domains",
    name: "Protein Domains",
    description: "Identify conserved domains and functional sites in proteins",
    category: "protein-analysis",
    icon: Box,
    status: "available",
    tags: ["domains", "conserved", "functional"],
    version: "3.19",
  },
  {
    id: "secondary-structure",
    name: "Secondary Structure",
    description: "Predict secondary structure elements (alpha helices, beta sheets)",
    category: "protein-analysis",
    icon: BarChart3,
    status: "available",
    tags: ["secondary-structure", "prediction", "psipred"],
    version: "4.0",
  },
  {
    id: "tertiary-structure",
    name: "Tertiary Structure Prediction",
    description: "Predict 3D structure of proteins using AI/ML methods",
    category: "protein-analysis",
    icon: Globe,
    status: "beta",
    tags: ["tertiary", "3d-structure", "folding"],
    version: "1.0.0-beta",
  },
  {
    id: "ramachandran",
    name: "Ramachandran Plot",
    description: "Analyze backbone dihedral angles psi vs phi in protein structures",
    category: "protein-analysis",
    icon: ScatterPlotIcon,
    status: "available",
    tags: ["ramachandran", "angles", "validation"],
    version: "1.0.0",
  },
  {
    id: "disulfide-bonds",
    name: "Disulfide Bonds",
    description: "Predict disulfide bond patterns in protein structures",
    category: "protein-analysis",
    icon: Atom,
    status: "available",
    tags: ["disulfide", "bonds", "cysteine"],
    version: "1.0.0",
  },
  {
    id: "protein-solubility",
    name: "Protein Solubility",
    description: "Predict protein solubility and aggregation propensity",
    category: "protein-analysis",
    icon: FlaskConical,
    status: "beta",
    tags: ["solubility", "aggregation", "expression"],
    version: "1.0.0-beta",
  },
]

// ==================== PHYLOGENETICS TOOLS ====================
const phylogeneticsTools: BioTool[] = [
  {
    id: "neighbor-joining",
    name: "Neighbor Joining",
    description: "Construct phylogenetic trees using neighbor-joining algorithm",
    category: "phylogenetics",
    icon: TreePine,
    status: "available",
    tags: ["tree-building", "distance-method", "fast"],
    version: "1.0.0",
  },
  {
    id: "maximum-likelihood",
    name: "Maximum Likelihood",
    description: "Build phylogenetic trees using maximum likelihood inference",
    category: "phylogenetics",
    icon: BarChart3,
    status: "available",
    tags: ["ml", "statistical", "accurate"],
    version: "1.0.0",
  },
  {
    id: "upgma",
    name: "UPGMA",
    description: "Unweighted Pair Group Method with Arithmetic Mean clustering",
    category: "phylogenetics",
    icon: Network,
    status: "available",
    tags: ["upgma", "clustering", "hierarchical"],
    version: "1.0.0",
  },
  {
    id: "parsimony",
    name: "Parsimony",
    description: "Maximum parsimony method for phylogenetic tree reconstruction",
    category: "phylogenetics",
    icon: Scissors,
    status: "available",
    tags: ["parsimony", "character-based", "cladistics"],
    version: "1.0.0",
  },
  {
    id: "bootstrap",
    name: "Bootstrap Analysis",
    description: "Assess statistical support for tree nodes via bootstrapping",
    category: "phylogenetics",
    icon: Calculator,
    status: "available",
    tags: ["bootstrap", "statistics", "support"],
    version: "1.0.0",
  },
  {
    id: "tree-viewer",
    name: "Tree Viewer",
    description: "Interactive visualization and exploration of phylogenetic trees",
    category: "phylogenetics",
    icon: Eye,
    status: "available",
    tags: ["visualization", "interactive", "trees"],
    version: "2.0.0",
  },
  {
    id: "tree-export",
    name: "Tree Export",
    description: "Export phylogenetic trees in various formats (Newick, Nexus)",
    category: "phylogenetics",
    icon: FileText,
    status: "available",
    tags: ["export", "formats", "newick"],
    version: "1.0.0",
  },
]

// ==================== GENOMICS TOOLS ====================
const genomicsTools: BioTool[] = [
  {
    id: "genome-browser",
    name: "Genome Browser",
    description: "Visualize and explore genome annotations and features",
    category: "genomics",
    icon: Globe,
    status: "available",
    tags: ["browser", "visualization", "genome"],
    version: "2.5.0",
  },
  {
    id: "genome-annotation",
    name: "Genome Annotation",
    description: "Annotate genomes with genes, regulatory elements, and features",
    category: "genomics",
    icon: Box,
    status: "available",
    tags: ["annotation", "genes", "features"],
    version: "1.5.0",
  },
  {
    id: "variant-calling",
    name: "Variant Calling",
    description: "Identify genetic variants from sequencing data",
    category: "genomics",
    icon: ScanLine,
    status: "available",
    tags: ["variants", "snps", "indels"],
    version: "2.0.0",
  },
  {
    id: "snp-analysis",
    name: "SNP Analysis",
    description: "Analyze single nucleotide polymorphisms and their effects",
    category: "genomics",
    icon: Target,
    status: "available",
    tags: ["snp", "polymorphism", "genotyping"],
    version: "1.8.0",
  },
  {
    id: "cnv-analysis",
    name: "CNV Analysis",
    description: "Detect and analyze copy number variations in genomes",
    category: "genomics",
    icon: BarChart3,
    status: "beta",
    tags: ["cnv", "copy-number", "variation"],
    version: "1.0.0-beta",
  },
  {
    id: "gene-prediction",
    name: "Gene Prediction",
    description: "Predict gene locations and structures in genomic sequences",
    category: "genomics",
    icon: Cpu,
    status: "available",
    tags: ["gene-prediction", "ab-initio", "annotation"],
    version: "2.0.0",
  },
  {
    id: "repeatmasker",
    name: "RepeatMasker",
    description: "Screen DNA sequences for interspersed repeats and low complexity",
    category: "genomics",
    icon: Layers,
    status: "available",
    tags: ["repeats", "masking", "transposons"],
    version: "4.1.6",
  },
]

// ==================== TRANSCRIPTOMICS TOOLS ====================
const transcriptomicsTools: BioTool[] = [
  {
    id: "rnaseq-pipeline",
    name: "RNA-seq Pipeline",
    description: "Complete RNA-seq analysis workflow from raw reads to results",
    category: "transcriptomics",
    icon: FlaskConical,
    status: "available",
    tags: ["rna-seq", "pipeline", "workflow"],
    version: "3.0.0",
  },
  {
    id: "differential-expression",
    name: "Differential Expression",
    description: "Identify differentially expressed genes between conditions",
    category: "transcriptomics",
    icon: BarChart3,
    status: "available",
    tags: ["de", "expression", "statistics"],
    version: "2.5.0",
  },
  {
    id: "heatmaps",
    name: "Heatmaps",
    description: "Create publication-quality heatmaps for expression data",
    category: "transcriptomics",
    icon: HeatmapIcon,
    status: "available",
    tags: ["heatmap", "visualization", "expression"],
    version: "2.0.0",
  },
  {
    id: "volcano-plot",
    name: "Volcano Plot",
    description: "Visualize differential expression results with volcano plots",
    category: "transcriptomics",
    icon: VolcanoIcon,
    status: "available",
    tags: ["volcano", "de", "visualization"],
    version: "1.5.0",
  },
  {
    id: "pca",
    name: "PCA",
    description: "Principal Component Analysis for dimensionality reduction",
    category: "transcriptomics",
    icon: ScatterPlotIcon,
    status: "available",
    tags: ["pca", "dimensionality", "clustering"],
    version: "2.0.0",
  },
  {
    id: "gene-clustering",
    name: "Gene Clustering",
    description: "Cluster genes based on expression patterns",
    category: "transcriptomics",
    icon: Network,
    status: "available",
    tags: ["clustering", "hierarchical", "kmeans"],
    version: "1.8.0",
  },
  {
    id: "normalization",
    name: "Normalization",
    description: "Normalize expression data using various methods",
    category: "transcriptomics",
    icon: Settings,
    status: "available",
    tags: ["normalization", "tpm", "rpkm"],
    version: "2.0.0",
  },
]

// ==================== STRUCTURAL BIOLOGY TOOLS ====================
const structuralBiologyTools: BioTool[] = [
  {
    id: "pdb-viewer",
    name: "PDB Viewer",
    description: "View and analyze PDB format molecular structures",
    category: "structural-biology",
    icon: Box,
    status: "available",
    tags: ["pdb", "viewer", "3d"],
    version: "2.0.0",
  },
  {
    id: "molstar-viewer",
    name: "Mol* Viewer",
    description: "Modern web-based 3D molecular structure viewer",
    category: "structural-biology",
    icon: Globe,
    status: "available",
    tags: ["molstar", "3d", "webgl"],
    version: "4.0.0",
  },
  {
    id: "ngl-viewer",
    name: "NGL Viewer",
    description: "WebGL-based molecular structure viewer with advanced rendering",
    category: "structural-biology",
    icon: Eye,
    status: "available",
    tags: ["ngl", "webgl", "rendering"],
    version: "2.0.0",
  },
  {
    id: "alphafold-viewer",
    name: "AlphaFold Viewer",
    description: "Explore AlphaFold predicted protein structures",
    category: "structural-biology",
    icon: Atom,
    status: "available",
    tags: ["alphafold", "prediction", "deepmind"],
    version: "1.5.0",
  },
  {
    id: "surface-rendering",
    name: "Surface Rendering",
    description: "Render molecular surfaces (SES, SAS, VDW) for visualization",
    category: "structural-biology",
    icon: Globe,
    status: "available",
    tags: ["surface", "rendering", "visualization"],
    version: "1.0.0",
  },
  {
    id: "electrostatic",
    name: "Electrostatic Surface",
    description: "Calculate and visualize electrostatic potential surfaces",
    category: "structural-biology",
    icon: Zap,
    status: "beta",
    tags: ["electrostatics", "potential", "apbs"],
    version: "1.0.0-beta",
  },
]

// ==================== MOLECULAR DOCKING TOOLS ====================
const molecularDockingTools: BioTool[] = [
  {
    id: "autodock-vina",
    name: "AutoDock Vina",
    description: "Molecular docking and virtual screening tool",
    category: "molecular-docking",
    icon: Atom,
    status: "available",
    tags: ["docking", "virtual-screening", "binding"],
    version: "1.2.5",
  },
  {
    id: "pyrx",
    name: "PyRx",
    description: "Virtual screening toolkit for computational drug discovery",
    category: "molecular-docking",
    icon: FlaskConical,
    status: "available",
    tags: ["virtual-screening", "drug-discovery", "python"],
    version: "0.9.8",
  },
  {
    id: "swissdock",
    name: "SwissDock",
    description: "Web service for protein-ligand docking",
    category: "molecular-docking",
    icon: Globe,
    status: "available",
    tags: ["docking", "ewald", "flexible"],
    version: "1.0.0",
  },
  {
    id: "binding-energy",
    name: "Binding Energy Calculator",
    description: "Calculate binding free energies for molecular complexes",
    category: "molecular-docking",
    icon: Calculator,
    status: "available",
    tags: ["binding-energy", "mm-pbsa", "scoring"],
    version: "1.5.0",
  },
]

// ==================== CRISPR TOOLS ====================
const crisprTools: BioTool[] = [
  {
    id: "grna-design",
    name: "Guide RNA Design",
    description: "Design optimal guide RNAs for CRISPR/Cas9 experiments",
    category: "crispr",
    icon: Scissors,
    status: "available",
    tags: ["grna", "design", "crispr"],
    version: "2.0.0",
  },
  {
    id: "offtarget-prediction",
    name: "Off-target Prediction",
    description: "Predict potential off-target effects of CRISPR guides",
    category: "crispr",
    icon: Target,
    status: "available",
    tags: ["off-target", "specificity", "safety"],
    version: "1.5.0",
  },
  {
    id: "cas9-analysis",
    name: "Cas9 Analysis",
    description: "Analyze Cas9 cutting efficiency and outcomes",
    category: "crispr",
    icon: Microscope,
    status: "beta",
    tags: ["cas9", "efficiency", "editing"],
    version: "1.0.0-beta",
  },
]

// ==================== PRIMER TOOLS ====================
const primerTools: BioTool[] = [
  {
    id: "primer3",
    name: "Primer3 Integration",
    description: "Comprehensive primer design using Primer3 engine",
    category: "primer-tools",
    icon: TestTube,
    status: "available",
    tags: ["primer3", "design", "pcr"],
    version: "2.6.1",
  },
  {
    id: "primer-blast",
    name: "Primer-BLAST",
    description: "Design primers with specificity checking against NCBI databases",
    category: "primer-tools",
    icon: Search,
    status: "available",
    tags: ["primer-blast", "specificity", "ncbi"],
    version: "1.0.0",
  },
  {
    id: "pcr-simulation",
    name: "PCR Simulation",
    description: "Simulate PCR amplification and predict products",
    category: "primer-tools",
    icon: FlaskConical,
    status: "available",
    tags: ["pcr", "simulation", "amplification"],
    version: "1.2.0",
  },
  {
    id: "primer-validation",
    name: "Primer Validation",
    description: "Validate primer pairs for secondary structures and dimers",
    category: "primer-tools",
    icon: CheckCircle2,
    status: "available",
    tags: ["validation", "dimers", "quality"],
    version: "1.5.0",
  },
]

// ==================== UTILITY TOOLS ====================
const utilityTools: BioTool[] = [
  {
    id: "file-converter",
    name: "File Converter",
    description: "Convert between biological file formats (FASTA, GenBank, etc.)",
    category: "utilities",
    icon: FileText,
    status: "available",
    tags: ["conversion", "format", "file"],
    version: "2.0.0",
  },
  {
    id: "format-validator",
    name: "Format Validator",
    description: "Validate and check integrity of biological data files",
    category: "utilities",
    icon: CheckCircle2,
    status: "available",
    tags: ["validation", "integrity", "format"],
    version: "1.5.0",
  },
  {
    id: "random-sequence",
    name: "Random Sequence Generator",
    description: "Generate random DNA, RNA, or protein sequences",
    category: "utilities",
    icon: Shuffle,
    status: "available",
    tags: ["random", "generation", "test-data"],
    version: "1.0.0",
  },
  {
    id: "mw-calculator",
    name: "Molecular Weight Calculator",
    description: "Calculate molecular weight of molecules and sequences",
    category: "utilities",
    icon: Calculator,
    status: "available",
    tags: ["molecular-weight", "calculator", "mass"],
    version: "1.2.0",
  },
  {
    id: "tm-calculator",
    name: "Melting Temperature Calculator",
    description: "Calculate Tm for oligonucleotides using multiple algorithms",
    category: "utilities",
    icon: Thermometer,
    status: "available",
    tags: ["tm", "melting-temperature", "oligo"],
    version: "2.0.0",
  },
]

// ==================== ALL CATEGORIES DEFINITION ====================
export const toolCategories: ToolCategory[] = [
  {
    id: "sequence-analysis",
    name: "Sequence Analysis",
    description: "Tools for analyzing DNA, RNA, and protein sequences including BLAST searches, alignments, and sequence utilities",
    icon: Dna,
    color: "#C1121F",
    tools: sequenceAnalysisTools,
  },
  {
    id: "multiple-alignment",
    name: "Multiple Sequence Alignment",
    description: "Align multiple sequences simultaneously to identify conserved regions and evolutionary relationships",
    icon: AlignCenter,
    color: "#2563EB",
    tools: multipleAlignmentTools,
  },
  {
    id: "protein-analysis",
    name: "Protein Analysis",
    description: "Analyze protein properties, structure prediction, domains, and physicochemical characteristics",
    icon: Microscope,
    color: "#059669",
    tools: proteinAnalysisTools,
  },
  {
    id: "phylogenetics",
    name: "Phylogenetics",
    description: "Build and analyze evolutionary trees using various tree-building methods and statistical support",
    icon: TreePine,
    color: "#7C3AED",
    tools: phylogeneticsTools,
  },
  {
    id: "genomics",
    name: "Genomics",
    description: "Genome analysis tools including browsers, annotation, variant calling, and gene prediction",
    icon: CircleDot,
    color: "#DC2626",
    tools: genomicsTools,
  },
  {
    id: "transcriptomics",
    name: "Transcriptomics",
    description: "RNA-seq analysis pipeline, differential expression, and gene expression visualization",
    icon: FlaskConical,
    color: "#EA580C",
    tools: transcriptomicsTools,
  },
  {
    id: "structural-biology",
    name: "Structural Biology",
    description: "3D structure visualization, molecular viewers, and structural analysis tools",
    icon: Box,
    color: "#0891B2",
    tools: structuralBiologyTools,
  },
  {
    id: "molecular-docking",
    name: "Molecular Docking",
    description: "Molecular docking simulations, binding energy calculations, and virtual screening",
    icon: Atom,
    color: "#4F46E5",
    tools: molecularDockingTools,
  },
  {
    id: "crispr",
    name: "CRISPR Tools",
    description: "CRISPR/Cas9 guide design, off-target prediction, and editing analysis tools",
    icon: Scissors,
    color: "#BE185D",
    tools: crisprTools,
  },
  {
    id: "primer-tools",
    name: "Primer Tools",
    description: "PCR primer design, validation, simulation, and specificity checking",
    icon: TestTube,
    color: "#CA8A04",
    tools: primerTools,
  },
  {
    id: "utilities",
    name: "Utilities",
    description: "General-purpose tools for file conversion, validation, and common calculations",
    icon: Settings,
    color: "#64748B",
    tools: utilityTools,
  },
]

// Helper functions
export function getAllTools(): BioTool[] {
  return toolCategories.flatMap((category) => category.tools)
}

export function getToolById(id: string): BioTool | undefined {
  return getAllTools().find((tool) => tool.id === id)
}

export function getToolsByCategory(categoryId: ToolCategoryType): BioTool[] {
  const category = toolCategories.find((cat) => cat.id === categoryId)
  return category?.tools || []
}

export function searchTools(query: string): BioTool[] {
  const lowerQuery = query.toLowerCase()
  return getAllTools().filter(
    (tool) =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

// Custom icons for specific tools
function ScatterPlotIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="7" cy="14" r="1" />
      <circle cx="17" cy="6" r="1" />
      <circle cx="12" cy="10" r="1" />
      <circle cx="18" cy="14" r="1" />
      <circle cx="5" cy="6" r="1" />
      <circle cx="14" cy="16" r="1" />
      <circle cx="9" cy="4" r="1" />
    </svg>
  )
}

function HeatmapIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" fill="currentColor" opacity="0.2" />
      <rect x="11" y="3" width="7" height="7" fill="currentColor" opacity="0.6" />
      <rect x="3" y="11" width="7" height="7" fill="currentColor" opacity="0.8" />
      <rect x="11" y="11" width="7" height="7" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

function VolcanoIcon(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 20h18" />
      <path d="M7 20c0-4 2-8 5-12s5-4 5-4" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="14" r="1.5" fill="currentColor" />
      <circle cx="16" cy="13" r="1.5" fill="currentColor" />
    </svg>
  )
}

// Recently used tools (mock data)
export const recentlyUsedTools: BioTool[] = [
  getToolById("blast")!,
  getToolById("clustal-omega")!,
  getToolById("protparam")!,
  getToolById("autodock-vina")!,
].filter(Boolean)

// Popular/favorite tools (mock data)
export const popularTools: BioTool[] = [
  getToolById("blast")!,
  getToolById("blastp")!,
  getToolById("clustal-omega")!,
  getToolById("muscle")!,
  getToolById("protparam")!,
  getToolById("primer3")!,
  getToolById("autodock-vina")!,
  getToolById("grna-design")!,
].filter(Boolean)
