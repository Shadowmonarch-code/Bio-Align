"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface UseAIChatOptions {
  storageKey?: string;
}

// Mock AI responses for bioinformatics questions
const mockResponses: Record<string, string> = {
  blast: `## BLAST Results Interpretation

Your **BLAST (Basic Local Alignment Search Tool)** results can be interpreted by examining these key metrics:

### Key Metrics to Analyze

| Metric | Description | Good Threshold |
|--------|-------------|----------------|
| **E-value** | Expected number of hits by chance | < 0.001 (lower is better) |
| **Identity** | % of identical residues | > 30% for homologs |
| **Query Coverage** | % of query sequence covered | > 70% preferred |
| **Bit Score** | Alignment quality score | Higher is better |

### Understanding Your Results

1. **High-scoring Segment Pairs (HSPs)**: These represent local alignments between your query and subject sequences.

2. **Color Scheme in Alignments**:
   - 🔴 Red: Perfect match or highly conserved
   - 🟢 Green: Similar amino acids (conservative substitution)
   - ⚪ Blue/Neutral: Weak similarity

3. **Common Patterns**:
   - Multiple HSPs may indicate domain architecture
   - Gaps represent insertions/deletions
   - Check for frame shifts in translated searches

### Next Steps

\`\`\`bash
# Download top hits for further analysis
blastdbcmd -db nr -entry_batch hit_ids.txt -outfmt %f
\`\`\`

Would you like me to help you with phylogenetic tree construction from these results?`,

  rnaseq: `## RNA-seq Data Analysis Workflow

Here's a comprehensive pipeline for analyzing RNA sequencing data:

### Standard Analysis Pipeline

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Quality        │───▶│  Alignment      │───▶│  Quantification │
│  Control        │    │  (STAR/HISAT2)  │    │  (featureCounts)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐              ▼
│  Visualization  │◀───│  Differential   │◀─────┌─────────────────┐
│  (Heatmaps,     │    │  Expression     │      │  Normalization  │
│   PCA, Volcano) │    │  (DESeq2/edgeR) │      │  (TMM/TPM/FPKM) │
└─────────────────┘    └─────────────────┘      └─────────────────┘
\`\`\`

### Recommended Tools

| Step | Tool | Why |
|------|------|-----|
| QC | FastQC + MultiQC | Industry standard |
| Trimming | Trim Galore! | Handles adapters well |
| Alignment | STAR | Fast, splice-aware |
| Quantification | featureCounts | Accurate, fast |
| DE Analysis | DESeq2 | Robust statistical model |

### R Code Template

\`\`\`r
# DESeq2 analysis example
library(DESeq2)

# Read count matrix
countData <- read.csv("counts.csv", row.names=1)
colData <- read.csv("metadata.csv", row.names=1)

# Create DESeqDataSet
dds <- DESeqDataSetFromMatrix(
  countData = countData,
  colData = colData,
  design = ~ condition
)

# Run analysis
dds <- DESeq(dds)
res <- results(dds, alpha=0.05)

# View results
head(res[order(res$padj), ])
\`\`\`

### Key Considerations

- **Biological replicates**: Minimum 3 per condition recommended
- **Batch effects**: Include in design formula if present
- **Multiple testing**: FDR correction essential
- **Gene length bias**: Consider TPM for cross-gene comparison

Need help with a specific step in this workflow?`,

  primers: `## Primer Design Guide

Let me walk you through designing optimal primers for your sequence:

### Primer Design Parameters

| Parameter | Optimal Range | Critical For |
|-----------|---------------|--------------|
| **Length** | 18-25 bp | Specificity |
| **Tm** | 55-65°C (pair within 2°C) | Efficient PCR |
| **GC%** | 40-60% | Stability |
| **3' end** | End with G/C (GC clamp) | Polymerase binding |
| **ΔG** | < -9 kcal/mol | Stable binding |

### Design Checklist

- [ ] Avoid runs of identical nucleotides (>4)
- [ ] No self-complementarity (hairpins)
- [ ] No primer-dimer formation
- [ ] Amplicon size appropriate for application
- [ ] Span exon-exon junctions (for qPCR)

### Python Script for Primer Design

\`\`\`python
from Bio.Seq import Seq
from Bio.SeqUtils.MeltingTemp import Tm_NN

def analyze_primer(primer_seq: str) -> dict:
    """Analyze primer properties."""
    seq = Seq(primer_seq.upper())
    
    # Calculate properties
    gc_content = (seq.count("G") + seq.count("C")) / len(seq) * 100
    tm = Tm_NN(seq, dnac=250, Na=50, Mg=2)
    
    return {
        "sequence": str(seq),
        "length": len(seq),
        "gc_percent": round(gc_content, 1),
        "tm": round(tm, 1),
        "gc_clamp": str(seq[-1]) in ["G", "C"]
    }

# Example usage
forward_primer = "ATGGTAAACGCCATTTTGCG"
print(analyze_primer(forward_primer))
\`\`\`

### Recommended Tools

1. **Primer3** - Gold standard, command-line available
2. **NCBI Primer-BLAST** - Specificity checking built-in
3. **Benchling** - Visual interface with templates
4. **IDT OligoAnalyzer** - Secondary structure prediction

Would you like me to help you design primers for a specific target sequence? Please share your sequence and I'll provide specific recommendations.`,

  alignment: `## Sequence Alignment Tools Comparison

Choosing the right alignment tool depends on your data type and goals:

### Global Alignment Tools Comparison

| Tool | Speed | Accuracy | Best For | Memory Usage |
|------|-------|----------|----------|--------------|
| **BWA-MEM2** | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | DNA-seq, Illumina | Medium |
| **Bowtie2** | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | DNA-seq, gapped | Low |
| **STAR** | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | RNA-seq, spliced | High |
| **HISAT2** | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | RNA-seq, small mem | Low |
| **Minimap2** | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Long reads, genome | Very Low |

### Decision Flowchart

\`\`\`
Start
  │
  ├─▶ Read Type?
  │     ├─ Short reads (<150bp) ──▶ BWA-MEM2 / Bowtie2
  │     └─ Long reads (Nanopore/PacBio) ──▶ Minimap2
  │
  ├─▶ Application?
  │     ├─ DNA variant calling ──▶ BWA-MEM2
  │     ├─ RNA expression ──▶ STAR / HISAT2
  │     ├─ De novo assembly ──▶ Minimap2 (overlap)
  │     └─ Isoform discovery ──▶ STAR (2-pass)
  │
  └─▶ Resources Available?
        ├─ High memory ──▶ STAR
        └─ Limited memory ──▶ HISAT2 / Bowtie2
\`\`\`

### Quick Start Commands

\`\`\`bash
# BWA-MEM2 alignment
bwa-mem2 index reference.fasta
bwa-mem2 mem -t 16 reference.fasta reads_R1.fastq.gz reads_R2.fastq.gz | \\
  samtools view -bS - | samtools sort -o aligned.bam -

# STAR alignment (RNA-seq)
STAR --runThreadN 16 \\
    --genomeDir star_index/ \\
    --readFilesIn reads_R1.fastq.gz reads_R2.fastq.gz \\
    --readFilesCommand zcat \\
    --outFileNamePrefix sample_ \\
    --outSAMtype BAM SortedByCoordinate
\`\`\`

What type of data are you working with? I can give more specific recommendations.`,

  vcf: `## VCF File Interpretation Guide

VCF (Variant Call Format) files contain genetic variants. Here's how to interpret them:

### VCF File Structure

\`\`\`
##fileformat=VCFv4.2
##INFO=<ID=DP,Number=1,Type=Integer,Description="Total Depth">
#CHROM  POS ID  REF  ALT  QUAL  FILTER  INFO          FORMAT  Sample1
chr1    12345 .  A    G    45.6   PASS    DP=100;AF=0.5 GT:DP   0/1:50
\`\`\`

### Column Descriptions

| Column | Description | Example |
|--------|-------------|---------|
| **CHROM** | Chromosome name | chr1, chrX |
| **POS** | Position (1-based) | 12345 |
| **ID** | Identifier (rsID or .) | rs12345 |
| **REF** | Reference allele | A |
| **ALT** | Alternate allele(s) | G |
| **QUAL** | Quality score | 45.6 |
| **FILTER** | Filter status | PASS |
| **INFO** | Additional info | DP=100;AF=0.5 |

### Common INFO Fields

- **DP**: Total read depth at position
- **AF**: Allele frequency
- **Impact**: HIGH/MODERATE/LOW (using SnpEff)
- **Gene**: Affected gene name
- **Consequence**: Missense, synonymous, etc.

### Filtering Best Practices

\`\`\`bash
# Using bcftools for filtering
bcftools view -i 'QUAL>30 && DP>10 && AF>0.01' input.vcf.gz -Oz -o filtered.vcf.gz

# Extract only PASS variants
bcftools view -f PASS input.vcf.gz

# Get variant statistics
bcftools stats input.vcf.gz > vcf_stats.txt
\`\`\`

### Annotation Tools

1. **SnpEff/SnpSift** - Functional annotation
2. **VEP (Ensembl)** - Comprehensive annotation
3. **ANNOVAR** - Gene-based annotation
4. **vcfanno** - Custom annotation

### Python Parsing Example

\`\`\`python
import gzip

def parse_vcf(vcf_path: str):
    """Parse VCF file and yield variants."""
    opener = gzip.open if vcf_path.endswith('.gz') else open
    
    with opener(vcf_path, 'rt') as f:
        for line in f:
            if line.startswith('#'):
                continue
            
            fields = line.strip().split('\t')
            chrom, pos, ref, alt = fields[0], fields[1], fields[3], fields[4]
            info = dict(item.split('=') if '=' in item else (item, True) 
                       for item in fields[7].split(';'))
            
            yield {
                'chrom': chrom,
                'pos': int(pos),
                'ref': ref,
                'alt': alt,
                'info': info
            }
\`\`\`

Do you have a specific VCF file you need help interpreting? Share more details about what you're looking for.`,
};

function generateMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("blast") || lowerMessage.includes("alignment result")) {
    return mockResponses.blast;
  }
  if (lowerMessage.includes("rna-seq") || lowerMessage.includes("rnaseq") || lowerMessage.includes("expression")) {
    return mockResponses.rnaseq;
  }
  if (lowerMessage.includes("primer") || lowerMessage.includes("pcr")) {
    return mockResponses.primers;
  }
  if (lowerMessage.includes("alignment tool") || lowerMessage.includes("aligner") || lowerMessage.includes("bwa") || lowerMessage.includes("star")) {
    return mockResponses.alignment;
  }
  if (lowerMessage.includes("vcf") || lowerMessage.includes("variant") || lowerMessage.includes("mutation") || lowerMessage.includes("snp")) {
    return mockResponses.vcf;
  }
  
  // Default response
  return `## Hello! I'm BioAssist 🧬

I'm your AI-powered bioinformatics assistant. I can help you with:

- **Analysis Explanation**: Interpret complex results like BLAST, VCF files, and more
- **Workflow Guidance**: Suggest optimal analysis pipelines for your data type
- **Error Diagnosis**: Help debug issues with your bioinformatics workflows
- **Literature Search**: Find relevant papers and methodologies
- **Protocol Recommendations**: Suggest experimental methods and best practices
- **Code Generation**: Write Python/R scripts for common analyses

You asked about: "${message}"

Could you provide more details about what you're working on? For example:
- What type of data do you have? (DNA-seq, RNA-seq, proteomics, etc.)
- What analysis are you trying to perform?
- Are you encountering any errors?

This will help me give you more specific guidance!`;
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const STORAGE_KEY = "bioassist_chat_history";

// Function to load messages from localStorage (used as lazy initializer)
function loadMessagesFromStorage(storageKey: string): Message[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (error) {
    console.error("Failed to load chat history:", error);
  }
  return [];
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const { storageKey = STORAGE_KEY } = options;
  
  const [messages, setMessages] = useState<Message[]>(() => loadMessagesFromStorage(storageKey));
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }, [messages, storageKey]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));

    // Generate mock response
    const aiResponse: Message = {
      id: generateId(),
      role: "assistant",
      content: generateMockResponse(content),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
    setIsLoading(false);
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const copyMessage = useCallback(async (content: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      return false;
    }
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    messages,
    isLoading,
    isOpen,
    messagesEndRef,
    sendMessage,
    clearMessages,
    copyMessage,
    toggleOpen,
    setIsOpen,
  };
}
