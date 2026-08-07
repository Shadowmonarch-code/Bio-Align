// Sequence Analysis Utility Functions for BioAlign

// Types
export type SequenceType = 'DNA' | 'RNA' | 'Protein' | 'Unknown' | 'Mixed';

export interface SequenceStats {
  length: number;
  type: SequenceType;
  gcContent: number;
  composition: Record<string, number>;
  molecularWeight?: number;
}

export interface ORF {
  start: number;
  end: number;
  frame: number;
  sequence: string;
  protein: string;
  length: number;
}

export interface AlignmentResult {
  alignedSeq1: string;
  alignedSeq2: string;
  score: number;
  identity: number;
  similarity: number;
  gaps: number;
  midpoint: string;
}

export interface BLASTHit {
  id: string;
  description: string;
  score: number;
  eValue: number;
  identity: number;
  alignmentLength: number;
  queryStart: number;
  queryEnd: number;
  subjectStart: number;
  subjectEnd: number;
  queryAlignment: string;
  subjectAlignment: string;
  midpoint: string;
}

export interface BLASTResult {
  queryId: string;
  queryLength: number;
  database: string;
  hits: BLASTHit[];
  statistics: {
    eValueThreshold: number;
    wordSize: number;
    matrix: string;
    gapCosts: string;
  };
}

export interface RestrictionSite {
  enzyme: string;
  recognitionSite: string;
  position: number;
  cutPosition: number;
  strand: '+' | '-';
}

export interface MotifMatch {
  pattern: string;
  position: number;
  match: string;
  strand: '+' | '-';
}

// Example sequences
export const EXAMPLE_SEQUENCES = {
  dna: `ATGCGATCGATCGTACGATCGATCGTAGCTAGCTAGCTAGCATGCATGCATGCATGCGATCGATCGATCGATCGATCGATCGATCG`,
  protein: `MAGIVALLPLMLLTLGLVQAPKKVTVRDPSGPLVIFFCCLLLLSYYSYPKKNYKKDLYQLLDSLSKDNSLERLFLRRLPNLKDKIEELASLTTSTNSLQDVNLAPNRLNPFALPPEEENI`,
  rna: `AUGCGAUCGAUCGUACGAUCGAUCGUAGCUAGCUAGCUAGCAUGCAUGCAUGCAUGCGAUCGAUCGAUCGAUCGAUCGAUCGAUCG`
};

// Genetic code tables
export const GENETIC_CODES: Record<number, Record<string, string>> = {
  // Standard nuclear code
  1: {
    'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
    'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
    'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
    'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
    'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
    'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
    'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
    'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
    'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
    'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
    'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
    'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
    'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
    'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
    'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
    'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
  },
  // Vertebrate mitochondrial code
  2: {
    ...Object.fromEntries(Object.entries({
      'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
      'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
      'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
      'TGT': 'C', 'TGC': 'C', 'TGA': 'W', 'TGG': 'W',
      'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
      'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
      'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
      'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
      'ATT': 'I', 'ATC': 'I', 'ATA': 'M', 'ATG': 'M',
      'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
      'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
      'AGT': 'S', 'AGC': 'S', 'AGA': '*', 'AGG': '*',
      'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
      'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
      'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
      'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
    }))
  }
};

// Substitution matrices (simplified)
export const SUBSTITUTION_MATRICES = {
  BLOSUM62: {
    match: 4,
    mismatch: -3,
    gapOpen: -11,
    gapExtend: -1
  },
  BLOSUM50: {
    match: 3,
    mismatch: -3,
    gapOpen: -10,
    gapExtend: -1
  },
  PAM250: {
    match: 2,
    mismatch: -2,
    gapOpen: -8,
    gapExtend: -2
  },
  PAM70: {
    match: 3,
    mismatch: -2,
    gapOpen: -9,
    gapExtend: -1
  }
};

// Common restriction enzymes
export const RESTRICTION_ENZYMES = [
  { name: 'EcoRI', site: 'GAATTC', cutPos: 1, recognition: "G^AATTC" },
  { name: 'BamHI', site: 'GGATCC', cutPos: 1, recognition: "G^GATCC" },
  { name: 'HindIII', site: 'AAGCTT', cutPos: 1, recognition: "A^AGCTT" },
  { name: 'XbaI', site: 'TCTAGA', cutPos: 1, recognition: "T^CTAGA" },
  { name: 'SalI', site: 'GTCGAC', cutPos: 1, recognition: "G^TCGAC" },
  { name: 'KpnI', site: 'GGTACC', cutPos: 1, recognition: "GGTAC^C" },
  { name: 'PstI', site: 'CTGCAG', cutPos: 5, recognition: "CTGCA^G" },
  { name: 'NotI', site: 'GCGGCCGC', cutPos: 2, recognition: "GC^GGCCGC" },
  { name: 'SacI', site: 'GAGCTC', cutPos: 5, recognition: "GAGCT^C" },
  { name: 'SmaI', site: 'CCCGGG', cutPos: 3, recognition: "CCC^GGG" }
];

/**
 * Clean and validate a sequence string
 */
export function cleanSequence(sequence: string): string {
  return sequence
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .trim();
}

/**
 * Detect the type of biological sequence
 */
export function detectSequenceType(sequence: string): SequenceType {
  const cleaned = cleanSequence(sequence);
  if (!cleaned || cleaned.length === 0) return 'Unknown';

  const dnaBases = new Set(['A', 'T', 'G', 'C']);
  const rnaBases = new Set(['A', 'U', 'G', 'C']);
  const proteinAminoAcids = new Set([
    'A', 'R', 'N', 'D', 'C', 'Q', 'E', 'G', 'H', 'I',
    'L', 'K', 'M', 'F', 'P', 'S', 'T', 'W', 'Y', 'V'
  ]);

  let dnaCount = 0;
  let rnaCount = 0;
  let proteinCount = 0;

  for (const char of cleaned) {
    if (dnaBases.has(char)) dnaCount++;
    if (rnaBases.has(char)) rnaCount++;
    if (proteinAminoAcids.has(char)) proteinCount++;
  }

  const total = cleaned.length;
  const dnaRatio = dnaCount / total;
  const rnaRatio = rnaCount / total;
  const proteinRatio = proteinCount / total;

  // Check for RNA (has U but no T)
  const hasU = cleaned.includes('U');
  const hasT = cleaned.includes('T');

  if (hasU && !hasT && rnaRatio > 0.95) return 'RNA';
  if (!hasU && hasT && dnaRatio > 0.95) return 'DNA';
  if (proteinRatio > 0.95 && !hasU) return 'Protein';
  
  if (dnaRatio > 0.8 || rnaRatio > 0.8) return 'DNA'; // Default to DNA-like
  if (proteinRatio > 0.8) return 'Protein';

  return 'Mixed';
}

/**
 * Calculate GC content of a DNA/RNA sequence
 */
export function calculateGCContent(sequence: string): number {
  const cleaned = cleanSequence(sequence);
  if (!cleaned) return 0;

  let gcCount = 0;
  for (const char of cleaned) {
    if (char === 'G' || char === 'C') {
      gcCount++;
    }
  }

  return (gcCount / cleaned.length) * 100;
}

/**
 * Get nucleotide composition
 */
export function getComposition(sequence: string): Record<string, number> {
  const cleaned = cleanSequence(sequence);
  const composition: Record<string, number> = {};

  for (const char of cleaned) {
    composition[char] = (composition[char] || 0) + 1;
  }

  return composition;
}

/**
 * Get full sequence statistics
 */
export function getSequenceStats(sequence: string): SequenceStats {
  const cleaned = cleanSequence(sequence);
  const type = detectSequenceType(cleaned);
  const gcContent = calculateGCContent(cleaned);
  const composition = getComposition(cleaned);

  return {
    length: cleaned.length,
    type,
    gcContent: Math.round(gcContent * 100) / 100,
    composition
  };
}

/**
 * Calculate reverse complement of DNA sequence
 */
export function reverseComplement(sequence: string): string {
  const complement: Record<string, string> = {
    'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G',
    'a': 't', 't': 'a', 'g': 'c', 'c': 'g',
    'U': 'A', 'u': 'a'
  };

  const cleaned = cleanSequence(sequence);
  let result = '';

  for (let i = cleaned.length - 1; i >= 0; i--) {
    const char = cleaned[i];
    result += complement[char] || char;
  }

  return result;
}

/**
 * Translate DNA/RNA to protein sequence
 */
export function translate(
  sequence: string,
  frame: number = 1,
  geneticCode: number = 1
): string {
  const cleaned = cleanSequence(sequence).replace(/U/g, 'T');
  const codeTable = GENETIC_CODES[geneticCode] || GENETIC_CODES[1];
  
  // Determine start position based on frame
  let startPos = 0;
  let reverseStrand = false;

  if (frame < 0) {
    reverseStrand = true;
    startPos = Math.abs(frame) - 1;
  } else {
    startPos = frame - 1;
  }

  let workingSeq = reverseStrand ? reverseComplement(cleaned) : cleaned;
  workingSeq = workingSeq.slice(startPos);

  let protein = '';
  for (let i = 0; i < workingSeq.length - 2; i += 3) {
    const codon = workingSeq.slice(i, i + 3);
    if (codon.length === 3) {
      const aminoAcid = codeTable[codon] || 'X';
      protein += aminoAcid;
      if (aminoAcid === '*') break; // Stop codon
    }
  }

  return protein;
}

/**
 * Find all ORFs in a sequence
 */
export function findORFs(
  sequence: string,
  options: {
    minLength?: number;
    geneticCode?: number;
    allFrames?: boolean;
    startCodons?: string[];
  } = {}
): ORF[] {
  const {
    minLength = 30,
    geneticCode = 1,
    allFrames = true,
    startCodons = ['ATG']
  } = options;

  const cleaned = cleanSequence(sequence).replace(/U/g, 'T');
  const orfs: ORF[] = [];
  const frames = allFrames ? [1, 2, 3, -1, -2, -3] : [1];

  for (const frame of frames) {
    let workingSeq = frame < 0 ? reverseComplement(cleaned) : cleaned;
    const absFrame = Math.abs(frame);
    workingSeq = workingSeq.slice(absFrame - 1);

    let inORF = false;
    let orfStart = 0;

    for (let i = 0; i < workingSeq.length - 2; i += 3) {
      const codon = workingSeq.slice(i, i + 3);

      if (startCodons.includes(codon) && !inORF) {
        inORF = true;
        orfStart = i;
      }

      if (inORF && (codon === 'TAA' || codon === 'TAG' || codon === 'TGA')) {
        const orfEnd = i + 3;
        const orfSeq = workingSeq.slice(orfStart, orfEnd);
        
        if (orfSeq.length >= minLength) {
          const protein = translate(orfSeq, 1, geneticCode);
          orfs.push({
            start: orfStart + (absFrame - 1),
            end: orfEnd + (absFrame - 1),
            frame,
            sequence: orfSeq,
            protein: protein.replace(/\*$/, ''),
            length: orfSeq.length
          });
        }
        inORF = false;
      }
    }

    // Handle ORFs that reach end without stop codon
    if (inORF) {
      const orfSeq = workingSeq.slice(orfStart);
      if (orfSeq.length >= minLength) {
        const protein = translate(orfSeq, 1, geneticCode);
        orfs.push({
          start: orfStart + (absFrame - 1),
          end: workingSeq.length + (absFrame - 1),
          frame,
          sequence: orfSeq,
          protein: protein.replace(/\*$/, ''),
          length: orfSeq.length
        });
      }
    }
  }

  // Sort by length descending
  return orfs.sort((a, b) => b.length - a.length);
}

/**
 * Simple Needleman-Wunsch global alignment (mock implementation)
 */
export function globalAlignment(
  seq1: string,
  seq2: string,
  options: {
    matchScore?: number;
    mismatchPenalty?: number;
    gapPenalty?: number;
  } = {}
): AlignmentResult {
  const {
    matchScore = 1,
    mismatchPenalty = -1,
    gapPenalty = -1
  } = options;

  const s1 = cleanSequence(seq1);
  const s2 = cleanSequence(seq2);
  const m = s1.length;
  const n = s2.length;

  // Initialize scoring matrix
  const scoreMatrix: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) scoreMatrix[i][0] = i * gapPenalty;
  for (let j = 0; j <= n; j++) scoreMatrix[0][j] = j * gapPenalty;

  // Fill matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = scoreMatrix[i-1][j-1] + (s1[i-1] === s2[j-1] ? matchScore : mismatchPenalty);
      const deleteGap = scoreMatrix[i-1][j] + gapPenalty;
      const insertGap = scoreMatrix[i][j-1] + gapPenalty;
      scoreMatrix[i][j] = Math.max(match, deleteGap, insertGap);
    }
  }

  // Traceback
  let aligned1 = '';
  let aligned2 = '';
  let midpoint = '';
  let i = m, j = n;
  let matches = 0, similarities = 0, gaps = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && scoreMatrix[i][j] === scoreMatrix[i-1][j-1] + (s1[i-1] === s2[j-1] ? matchScore : mismatchPenalty)) {
      aligned1 = s1[i-1] + aligned1;
      aligned2 = s2[j-1] + aligned2;
      midpoint = (s1[i-1] === s2[j-1] ? '|' : '.') + midpoint;
      if (s1[i-1] === s2[j-1]) matches++;
      else similarities++;
      i--; j--;
    } else if (i > 0 && scoreMatrix[i][j] === scoreMatrix[i-1][j] + gapPenalty) {
      aligned1 = s1[i-1] + aligned1;
      aligned2 = '-' + aligned2;
      midpoint = ' ' + midpoint;
      gaps++;
      i--;
    } else {
      aligned1 = '-' + aligned1;
      aligned2 = s2[j-1] + aligned2;
      midpoint = ' ' + midpoint;
      gaps++;
      j--;
    }
  }

  const alignmentLength = aligned1.length;
  similarities += matches; // Count matches as similarities too

  return {
    alignedSeq1: aligned1,
    alignedSeq2: aligned2,
    score: scoreMatrix[m][n],
    identity: alignmentLength > 0 ? Math.round((matches / alignmentLength) * 10000) / 100 : 0,
    similarity: alignmentLength > 0 ? Math.round((similarities / alignmentLength) * 10000) / 100 : 0,
    gaps,
    midpoint
  };
}

/**
 * Simple Smith-Waterman local alignment (mock implementation)
 */
export function localAlignment(
  seq1: string,
  seq2: string,
  options: {
    matchScore?: number;
    mismatchPenalty?: number;
    gapPenalty?: number;
  } = {}
): AlignmentResult {
  // For mock purposes, use global alignment with slight modifications
  return globalAlignment(seq1, seq2, options);
}

/**
 * Mock BLAST search results
 */
export function mockBLASTSearch(
  sequence: string,
  options: {
    database?: string;
    maxTargets?: number;
    program?: string;
  } = {}
): BLASTResult {
  const {
    database = 'nr',
    maxTargets = 10,
    program = 'blastn'
  } = options;

  const cleaned = cleanSequence(sequence);
  const queryLength = cleaned.length;

  // Generate mock hits based on sequence characteristics
  const mockDescriptions = [
    'Homo sapiens chromosome 1 genomic contig',
    'Mus musculus clone RP23 genomic sequence',
    'Synthetic construct DNA',
    'Escherichia coli strain K-12 genome',
    'Bacillus subtilis subsp. subtilis str. 168',
    'Saccharomyces cerevisiae S288c chromosome IV',
    'Drosophila melanogaster chromosome 3L',
    'Caenorhabditis elegans chromosome I',
    'Arabidopsis thaliana chromosome 1',
    'Zea mays cultivar B73 genome'
  ];

  const numHits = Math.min(maxTargets, Math.floor(queryLength / 20) + 1);
  const hits: BLASTHit[] = [];

  for (let i = 0; i < numHits; i++) {
    const identity = 85 + Math.random() * 14;
    const alignLen = Math.floor(queryLength * (0.7 + Math.random() * 0.3));
    
    // Generate mock alignment
    const startIdx = Math.floor(Math.random() * (queryLength - alignLen));
    const queryAlign = cleaned.slice(startIdx, startIdx + alignLen);
    let subjectAlign = '';
    let mid = '';
    
    for (let j = 0; j < queryAlign.length; j++) {
      if (Math.random() < identity / 100) {
        subjectAlign += queryAlign[j];
        mid += '|';
      } else {
        subjectAlign += 'ACGT'[Math.floor(Math.random() * 4)];
        mid += '.';
      }
    }

    hits.push({
      id: `gi|${Math.floor(Math.random() * 99999999)}|ref|NM_${Math.floor(Math.random() * 999999)}.${Math.floor(Math.random() * 5)}`,
      description: mockDescriptions[i % mockDescriptions.length],
      score: Math.floor(100 + Math.random() * 400),
      eValue: Math.pow(10, -(Math.floor(Math.random() * 150) + 1)),
      identity: Math.round(identity * 100) / 100,
      alignmentLength: alignLen,
      queryStart: startIdx + 1,
      queryEnd: startIdx + alignLen,
      subjectStart: Math.floor(Math.random() * 10000) + 1,
      subjectEnd: Math.floor(Math.random() * 10000) + alignLen,
      queryAlignment: queryAlign,
      subjectAlignment: subjectAlign,
      midpoint: mid
    });

    // Sort by score descending
    hits.sort((a, b) => b.score - a.score);
  }

  return {
    queryId: 'Query',
    queryLength,
    database,
    hits,
    statistics: {
      eValueThreshold: 10,
      wordSize: program === 'blastp' ? 3 : 11,
      matrix: program === 'blastp' ? 'BLOSUM62' : '',
      gapCosts: 'Existence: 5 Extension: 2'
    }
  };
}

/**
 * Find restriction enzyme sites in sequence
 */
export function findRestrictionSites(
  sequence: string,
  enzymes: typeof RESTRICTION_ENZYMES = RESTRICTION_ENZYMES
): RestrictionSite[] {
  const cleaned = cleanSequence(sequence);
  const sites: RestrictionSite[] = [];
  const rcSeq = reverseComplement(cleaned);

  for (const enzyme of enzymes) {
    // Forward strand
    let pos = cleaned.indexOf(enzyme.site);
    while (pos !== -1) {
      sites.push({
        enzyme: enzyme.name,
        recognitionSite: enzyme.site,
        position: pos,
        cutPosition: pos + enzyme.cutPos,
        strand: '+'
      });
      pos = cleaned.indexOf(enzyme.site, pos + 1);
    }

    // Reverse strand
    const rcSite = reverseComplement(enzyme.site);
    pos = rcSeq.indexOf(rcSite);
    while (pos !== -1) {
      sites.push({
        enzyme: enzyme.name,
        recognitionSite: rcSite,
        position: cleaned.length - pos - rcSite.length,
        cutPosition: cleaned.length - pos - (rcSite.length - enzyme.cutPos),
        strand: '-'
      });
      pos = rcSeq.indexOf(rcSite, pos + 1);
    }
  }

  return sites.sort((a, b) => a.position - b.position);
}

/**
 * Search for motifs/patterns in sequence
 */
export function searchMotif(
  sequence: string,
  pattern: string,
  options: {
    caseSensitive?: boolean;
    allowMismatch?: boolean;
    maxMismatches?: number;
  } = {}
): MotifMatch[] {
  const {
    caseSensitive = false,
    allowMismatch = false,
    maxMismatches = 0
  } = options;

  const cleaned = caseSensitive ? sequence.trim() : cleanSequence(sequence);
  const searchPattern = caseSensitive ? pattern : pattern.toUpperCase();
  const matches: MotifMatch[] = [];

  for (let i = 0; i <= cleaned.length - searchPattern.length; i++) {
    const substring = cleaned.slice(i, i + searchPattern.length);
    
    if (substring === searchPattern) {
      matches.push({
        pattern: searchPattern,
        position: i,
        match: substring,
        strand: '+'
      });
    } else if (allowMismatch) {
      let mismatches = 0;
      for (let j = 0; j < searchPattern.length; j++) {
        if (substring[j] !== searchPattern[j]) mismatches++;
      }
      if (mismatches <= maxMismatches) {
        matches.push({
          pattern: searchPattern,
          position: i,
          match: substring,
          strand: '+'
        });
      }
    }
  }

  // Also check reverse complement for DNA sequences
  const type = detectSequenceType(cleaned);
  if (type === 'DNA' || type === 'RNA') {
    const rcSeq = reverseComplement(cleaned);
    const rcPattern = reverseComplement(searchPattern);
    
    for (let i = 0; i <= rcSeq.length - rcPattern.length; i++) {
      const substring = rcSeq.slice(i, i + rcPattern.length);
      
      if (substring === rcPattern) {
        matches.push({
          pattern: searchPattern,
          position: cleaned.length - i - rcPattern.length,
          match: searchPattern,
          strand: '-'
        });
      }
    }
  }

  return matches.sort((a, b) => a.position - b.position);
}

/**
 * Parse FASTA format
 */
export function parseFASTA(fastaString: string): { name: string; sequence: string }[] {
  const entries: { name: string; sequence: string }[] = [];
  const lines = fastaString.split('\n');
  let currentName = '';
  let currentSequence = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('>')) {
      if (currentName) {
        entries.push({ name: currentName, sequence: currentSequence });
      }
      currentName = trimmed.slice(1).split(/\s/)[0];
      currentSequence = '';
    } else {
      currentSequence += trimmed;
    }
  }

  if (currentName) {
    entries.push({ name: currentName, sequence: currentSequence });
  }

  return entries;
}

/**
 * Format as FASTA
 */
export function formatFASTA(name: string, sequence: string, lineLength: number = 60): string {
  const lines = [];
  lines.push(`>${name}`);
  
  for (let i = 0; i < sequence.length; i += lineLength) {
    lines.push(sequence.slice(i, i + lineLength));
  }

  return lines.join('\n');
}

/**
 * Validate sequence input
 */
export function validateSequence(sequence: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const cleaned = cleanSequence(sequence);

  if (!cleaned) {
    errors.push('Sequence is empty');
    return { valid: false, errors };
  }

  if (cleaned.length < 2) {
    errors.push('Sequence is too short (minimum 2 characters)');
  }

  // Check for invalid characters
  const validChars = new Set('ACGTURYNWSMKHBVDacgturynwsmkhbvd');
  const invalidChars: string[] = [];
  
  for (const char of cleaned) {
    if (!validChars.has(char)) {
      invalidChars.push(char);
    }
  }

  if (invalidChars.length > 0) {
    const uniqueInvalid = [...new Set(invalidChars)].join(', ');
    errors.push(`Invalid character(s) found: ${uniqueInvalid}`);
  }

  return { valid: errors.length === 0, errors };
}
