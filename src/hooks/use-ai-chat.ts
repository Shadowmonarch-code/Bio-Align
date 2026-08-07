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

// Mock AI responses for bioinformatics questions (used as fallback)
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

### Design Checklist
- [ ] Avoid runs of identical nucleotides (>4)
- [ ] No self-complementarity (hairpins)
- [ ] No primer-dimer formation
- [ ] Amplicon size appropriate for application

### Recommended Tools
1. **Primer3** - Gold standard, command-line available
2. **NCBI Primer-BLAST** - Specificity checking built-in
3. **Benchling** - Visual interface with templates

Would you like me to help you design primers for a specific target sequence?`,

  alignment: `## Sequence Alignment Tools Comparison

Choosing the right alignment tool depends on your data type and goals:

| Tool | Speed | Accuracy | Best For |
|------|-------|----------|----------|
| **BWA-MEM2** | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | DNA-seq, Illumina |
| **Bowtie2** | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | DNA-seq, gapped |
| **STAR** | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | RNA-seq, spliced |
| **Minimap2** | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Long reads, genome |

What type of data are you working with?`,

  vcf: `## VCF File Interpretation Guide

VCF (Variant Call Format) files contain genetic variants:

### Key Columns
| Column | Description |
|--------|-------------|
| **CHROM** | Chromosome name |
| **POS** | Position (1-based) |
| **REF** | Reference allele |
| **ALT** | Alternate allele(s) |
| **QUAL** | Quality score |

### Common INFO Fields
- **DP**: Total read depth at position
- **AF**: Allele frequency
- **Gene**: Affected gene name

Do you have a specific VCF file you need help interpreting?`,
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

- **Analysis Explanation**: Interpret BLAST, VCF files, and more
- **Workflow Guidance**: Suggest analysis pipelines for your data
- **Error Diagnosis**: Help debug bioinformatics workflows
- **Code Generation**: Write Python/R scripts for analyses

You asked about: "${message}"

Could you provide more details? For example:
- What type of data do you have?
- What analysis are you trying to perform?
- Are you encountering any errors?`;
}

// API configuration
const AI_API_ENDPOINT = "/api/ai/chat";
const API_TIMEOUT_MS = 30000; // 30 second timeout
const MAX_HISTORY_MESSAGES = 10;

/**
 * Calls the real AI API endpoint with the user's message and conversation history.
 * Returns the AI response content on success, or throws an error on failure.
 */
async function callAI_API(message: string, history: Message[]): Promise<string> {
  // Get recent messages for context (last MAX_HISTORY_MESSAGES)
  const recentHistory = history.slice(-MAX_HISTORY_MESSAGES).map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Create abort controller for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(AI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history: recentHistory,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(`API error (${response.status}): ${errorData.error || response.statusText}`);
    }

    const data = await response.json();

    // Support different response formats from the API
    const content = data.content || data.response || data.message || "";
    
    if (!content || !content.trim()) {
      throw new Error("Empty response from API");
    }

    return content;
  } catch (error) {
    clearTimeout(timeoutId);

    // Re-throw abort errors with a clearer message
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("API request timed out. Please try again.");
    }

    // Re-throw other errors
    throw error;
  }
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

    let aiResponseContent: string;

    try {
      // First, try calling the real AI API
      console.log("Calling AI API...");
      aiResponseContent = await callAI_API(content, messages);
      console.log("AI API response received successfully");
      
    } catch (error) {
      // Log the error for debugging
      console.warn("AI API call failed, using fallback response:", error);
      
      // Fall back to mock response when API fails
      aiResponseContent = generateMockResponse(content);
    }

    // Create and add the AI response message
    const aiResponse: Message = {
      id: generateId(),
      role: "assistant",
      content: aiResponseContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
    setIsLoading(false);
  }, [isLoading, messages]);

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
