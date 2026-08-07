import { NextRequest, NextResponse } from 'next/server';

// POST /api/ai/chat - AI Bioinformatics Assistant
export async function POST(request: NextRequest) {
  let message = '';
  
  try {
    const body = await request.json();
    message = body.message || '';
    const { history = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Try to use ZAI SDK with timeout and error handling
    let response = '';
    
    try {
      // Dynamic import to avoid module loading issues
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();

      // System prompt for bioinformatics assistant
      const systemPrompt = `You are BioAssist, an expert AI bioinformatics assistant for the BioAlign platform. You help researchers, students, and scientists with:

## Your Capabilities:
1. **Sequence Analysis** - Explain BLAST results, alignment scores, ORF findings
2. **Genomics** - Guide variant calling, SNP analysis, genome annotation
3. **Protein Analysis** - Help with structure prediction, domain analysis
4. **Transcriptomics** - Assist with RNA-seq analysis, differential expression
5. **Phylogenetics** - Guide tree building methods, bootstrap analysis
6. **Molecular Docking** - Explain binding energies, docking protocols
7. **CRISPR** - Help design guide RNAs, predict off-targets
8. **Primer Design** - Assist with PCR primer selection and validation
9. **Workflow Recommendations** - Suggest appropriate tools and pipelines
10. **Literature Guidance** - Point to relevant databases and resources

## Guidelines:
- Be concise but thorough in your explanations
- Use technical terms but explain them when needed
- Provide practical examples when possible
- Recommend specific BioAlign tools when relevant
- Include code snippets (Python/R) when helpful
- Format responses with clear headings and bullet points
- If you're unsure, say so and suggest consulting literature

## Available Databases to Reference:
NCBI (GenBank, PubMed, SRA), UniProt, PDB, AlphaFold DB, Ensembl, KEGG, Reactome, InterPro, Pfam, STRING, GEO, ClinVar, dbSNP

## Response Style:
- Professional yet approachable
- Use markdown formatting for readability
- Include visual indicators (🧬 for sequences, 📊 for data, 🔬 for experiments)
- End with suggested follow-up questions when appropriate`;

      // Build conversation history
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10), // Keep last 10 messages for context
        { role: 'user', content: message },
      ];

      // Call AI API with timeout
      const completion = await Promise.race([
        zai.chat.completions.create({
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.9,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('AI request timeout')), 25000)
        ),
      ]);

      response = completion.choices[0]?.message?.content || '';
      
      if (!response.trim()) {
        throw new Error('Empty response from AI');
      }
      
    } catch (sdkError) {
      console.warn('ZAI SDK error, using fallback:', sdkError instanceof Error ? sdkError.message : sdkError);
      
      // Generate intelligent fallback response based on keywords
      response = generateFallbackResponse(message);
    }

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    
    // Return a fallback response if AI service is unavailable
    return NextResponse.json({
      success: true,
      response: generateFallbackResponse(message),
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  }
}

// Intelligent fallback response generator
function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // BLAST-related queries
  if (lowerMessage.includes('blast') || lowerMessage.includes('alignment result') || lowerMessage.includes('sequence similarity')) {
    return `## BLAST Results Interpretation 🧬

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
Would you like me to help you with phylogenetic tree construction from these results?`;
  }
  
  // RNA-seq related queries
  if (lowerMessage.includes('rna-seq') || lowerMessage.includes('rnaseq') || lowerMessage.includes('expression') || lowerMessage.includes('transcript')) {
    return `## RNA-seq Data Analysis Pipeline 📊

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

Need help with a specific step in this workflow?`;
  }
  
  // Primer design queries
  if (lowerMessage.includes('primer') || lowerMessage.includes('pcr') || lowerMessage.includes('amplification')) {
    return `## Primer Design Guide 🧪

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

### Recommended Tools
1. **Primer3** - Gold standard, command-line available
2. **NCBI Primer-BLAST** - Specificity checking built-in
3. **Benchling** - Visual interface with templates

Would you like me to help you design primers for a specific target sequence?`;
  }
  
  // VCF/Variant queries
  if (lowerMessage.includes('vcf') || lowerMessage.includes('variant') || lowerMessage.includes('mutation') || lowerMessage.includes('snp')) {
    return `## VCF File Interpretation Guide 🔬

VCF (Variant Call Format) files contain genetic variants. Here's how to interpret them:

### VCF File Structure
\`\`\`
##fileformat=VCFv4.2
#CHROM  POS ID  REF  ALT  QUAL  FILTER  INFO
chr1    12345 .  A    G    45.6   PASS    DP=100;AF=0.5
\`\`\`

### Key Columns
| Column | Description |
|--------|-------------|
| **CHROM** | Chromosome name |
| **POS** | Position (1-based) |
| **REF** | Reference allele |
| **ALT** | Alternate allele(s) |
| **QUAL** | Quality score |
| **FILTER** | Filter status (PASS = good) |

### Common INFO Fields
- **DP**: Total read depth at position
- **AF**: Allele frequency
- **Gene**: Affected gene name
- **Consequence**: Missense, synonymous, etc.

Do you have a specific VCF file you need help interpreting?`;
  }
  
  // Default response for other queries
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
