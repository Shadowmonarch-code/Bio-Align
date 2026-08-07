import { NextRequest, NextResponse } from 'next/server';

// POST /api/analyze/sequence - Perform sequence analysis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, sequence, options = {} } = body;

    if (!sequence || !tool) {
      return NextResponse.json(
        { error: 'Missing required fields: sequence and tool are required' },
        { status: 400 }
      );
    }

    // Clean sequence - remove whitespace and newlines
    const cleanSequence = sequence.replace(/\s/g, '').toUpperCase();

    // Validate sequence contains valid characters
    const validChars = /^[ACGTURYSWKMBDHVN-]+$/i;
    if (!validChars.test(cleanSequence)) {
      return NextResponse.json(
        { error: 'Invalid sequence characters detected' },
        { status: 400 }
      );
    }

    let result;

    switch (tool) {
      case 'gc-content':
        result = calculateGCContent(cleanSequence);
        break;
      case 'reverse-complement':
        result = calculateReverseComplement(cleanSequence);
        break;
      case 'translate':
        result = translateSequence(cleanSequence, options.readingFrame || 1);
        break;
      case 'orf-finder':
        result = findORFs(cleanSequence, options);
        break;
      case 'motif-search':
        result = searchMotif(cleanSequence, options.motif || '');
        break;
      case 'stats':
        result = getSequenceStats(cleanSequence);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown tool: ${tool}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      tool,
      inputLength: cleanSequence.length,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('Sequence analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error during analysis' },
      { status: 500 }
    );
  }
}

// GC Content Calculation
function calculateGCContent(sequence: string) {
  const gcCount = (sequence.match(/[GC]/g) || []).length;
  const atCount = (sequence.match(/[AT]/g) || []).length;
  const gcPercent = (gcCount / sequence.length) * 100;
  
  return {
    type: 'gc-content',
    data: {
      gcContent: Math.round(gcPercent * 100) / 100,
      atContent: Math.round((100 - gcPercent) * 100) / 100,
      gcCount,
      atCount,
      totalBases: sequence.length,
      composition: {
        A: (sequence.match(/A/g) || []).length,
        T: (sequence.match(/T/g) || []).length,
        G: (sequence.match(/G/g) || []).length,
        C: (sequence.match(/C/g) || []).length,
        N: (sequence.match(/N/g) || []).length,
      },
    },
  };
}

// Reverse Complement
function calculateReverseComplement(sequence: string) {
  const complement: Record<string, string> = {
    A: 'T', T: 'A', G: 'C', C: 'G',
    U: 'A', R: 'Y', Y: 'R',
    S: 'S', W: 'W', K: 'M',
    M: 'K', B: 'V', D: 'H',
    V: 'B', H: 'D', N: '-',
  };

  const reversed = sequence.split('').reverse();
  const reverseComplement = reversed.map(base => complement[base] || 'N').join('');

  return {
    type: 'reverse-complement',
    data: {
      original: sequence,
      reverseComplement,
      reverse: reversed.join(''),
    },
  };
}

// Translation
const CODON_TABLE: Record<string, string> = {
  TTT: 'F', TTC: 'F', TTA: 'L', TTG: 'L',
  CTT: 'L', CTC: 'L', CTA: 'L', CTG: 'L',
  ATT: 'I', ATC: 'I', ATA: 'I', ATG: 'M',
  GTT: 'V', GTC: 'V', GTA: 'V', GTG: 'V',
  TCT: 'S', TCC: 'S', TCA: 'S', TCG: 'S',
  CCT: 'P', CCC: 'P', CCA: 'P', CCG: 'P',
  ACT: 'T', ACC: 'T', ACA: 'T', ACG: 'T',
  GCT: 'A', GCC: 'A', GCA: 'A', GCG: 'A',
  TAT: 'Y', TAC: 'Y', TAA: '*', TAG: '*',
  CAT: 'H', CAC: 'H', CAA: 'Q', CAG: 'Q',
  AAT: 'N', AAC: 'N', AAA: 'K', AAG: 'K',
  GAT: 'D', GAC: 'D', GAA: 'E', GAG: 'E',
  TGT: 'C', TGC: 'C', TGA: '*', TGG: 'W',
  CGT: 'R', CGC: 'R', CGA: 'R', CGG: 'R',
  AGT: 'S', AGC: 'S', AGA: 'R', AGG: 'R',
  GGT: 'G', GGC: 'G', GGA: 'G', GGG: 'G',
};

function translateSequence(sequence: string, readingFrame: number = 1) {
  let dnaToRna = sequence.replace(/T/g, 'U');
  let startOffset = Math.abs(readingFrame) - 1;
  
  if (readingFrame < 0) {
    // Reverse complement for negative frames
    const comp: Record<string, string> = { A: 'U', U: 'A', G: 'C', C: 'G' };
    const rc = dnaToRna.split('').reverse().map(b => comp[b] || 'N').join('');
    dnaToRna = rc;
  }

  const codons: string[] = [];
  const aminoAcids: string[] = [];
  const proteinSeq: string[] = [];

  for (let i = startOffset; i + 2 < dnaToRna.length; i += 3) {
    const codon = dnaToRna.substring(i, i + 3);
    const aa = CODON_TABLE[codon] || 'X';
    codons.push(codon);
    aminoAcids.push(aa);
    proteinSeq.push(aa);
  }

  return {
    type: 'translation',
    data: {
      readingFrame,
      protein: proteinSeq.join(''),
      length: proteinSeq.length,
      codons,
      aminoAcids,
      hasStopCodon: proteinSeq.includes('*'),
    },
  };
}

// ORF Finder
function findORFs(sequence: string, options: any = {}) {
  const minLength = options.minLength || 100;
  const orfs: Array<{
    start: number;
    end: number;
    length: number;
    frame: number;
    sequence: string;
    protein: string;
  }> = [];

  const startCodons = ['ATG'];
  const stopCodons = ['TAA', 'TAG', 'TGA'];

  for (let frame = 1; frame <= 3; frame++) {
    for (let i = frame - 1; i + 2 < sequence.length; i += 3) {
      const codon = sequence.substring(i, i + 3);
      
      if (startCodons.includes(codon)) {
        // Found start codon, look for stop codon
        for (let j = i + 3; j + 2 < sequence.length; j += 3) {
          const stopCodon = sequence.substring(j, j + 3);
          if (stopCodons.includes(stopCodon)) {
            const orfSequence = sequence.substring(i, j + 3);
            if (orfSequence.length >= minLength) {
              // Translate ORF
              let protein = '';
              for (let k = 0; k + 2 < orfSequence.length; k += 3) {
                protein += CODON_TABLE[orfSequence.substring(k, k + 3)] || 'X';
              }
              
              orfs.push({
                start: i + 1,
                end: j + 3,
                length: orfSequence.length,
                frame,
                sequence: orfSequence,
                protein,
              });
            }
            break;
          }
        }
      }
    }
  }

  return {
    type: 'orf-finder',
    data: {
      orfs: orfs.sort((a, b) => b.length - a.length),
      totalFound: orfs.length,
      searchParameters: { minLength },
    },
  };
}

// Motif Search
function searchMotif(sequence: string, motif: string) {
  if (!motif) {
    return { type: 'motif-search', data: { matches: [], totalMatches: 0 } };
  }

  const positions: number[] = [];
  const searchSeq = sequence.toUpperCase();
  const searchMotif = motif.toUpperCase();
  
  let pos = searchSeq.indexOf(searchMotif);
  while (pos !== -1) {
    positions.push(pos + 1); // 1-based position
    pos = searchSeq.indexOf(searchMotif, pos + 1);
  }

  return {
    type: 'motif-search',
    data: {
      motif,
      matches: positions.map(p => ({
        position: p,
        context: sequence.substring(Math.max(0, p - 10), Math.min(sequence.length, p + motif.length + 10)),
      })),
      totalMatches: positions.length,
    },
  };
}

// Sequence Statistics
function getSequenceStats(sequence: string) {
  const composition: Record<string, number> = {};
  for (const base of sequence) {
    composition[base] = (composition[base] || 0) + 1;
  }

  const gcCount = (composition.G || 0) + (composition.C || 0);
  const atCount = (composition.A || 0) + (composition.T || 0);

  // Calculate molecular weight (approximate)
  const mw: Record<string, number> = {
    A: 331.22, T: 322.21, G: 347.22, C: 307.21,
    U: 308.20,
  };
  
  let molecularWeight = 0;
  for (const [base, count] of Object.entries(composition)) {
    molecularWeight += (mw[base] || 320) * count;
  }

  return {
    type: 'stats',
    data: {
      length: sequence.length,
      gcContent: sequence.length > 0 ? ((gcCount / sequence.length) * 100).toFixed(2) : '0',
      atContent: sequence.length > 0 ? ((atCount / sequence.length) * 100).toFixed(2) : '0',
      molecularWeight: molecularWeight.toFixed(2),
      composition,
      type: detectType(composition),
    },
  };
}

function detectType(composition: Record<string, number>): string {
  const total = Object.values(composition).reduce((a, b) => a + b, 0);
  if (total === 0) return 'unknown';
  
  const hasT = (composition.T || 0) > 0;
  const hasU = (composition.U || 0) > 0;
  
  if (hasU && !hasT) return 'RNA';
  if (hasT && !hasU) return 'DNA';
  if (hasT && hasU) return 'mixed';
  
  // Check if it might be protein
  const aaLetters = 'ARNDCEQGHILKMFPSTWYV';
  const aaCount = aaLetters.split('').filter(l => composition[l]).length;
  if (aaCount > 10) return 'protein';
  
  return 'unknown';
}
