"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Icons
import {
  Dna,
  Search,
  Code2,
  ArrowLeftRight,
  Languages,
  Percent,
  Target,
  FileSearch,
  Scissors,
  ChevronDown,
  ChevronUp,
  Upload,
  FileText,
  Download,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Info,
  RotateCcw,
  Play,
  Settings2
} from 'lucide-react';

// Sequence utilities
import {
  cleanSequence,
  detectSequenceType,
  calculateGCContent,
  getComposition,
  getSequenceStats,
  reverseComplement as rc,
  translate,
  findORFs,
  globalAlignment,
  localAlignment,
  mockBLASTSearch,
  findRestrictionSites,
  searchMotif,
  parseFASTA,
  formatFASTA,
  validateSequence,
  EXAMPLE_SEQUENCES,
  GENETIC_CODES,
  SUBSTITUTION_MATRICES,
  RESTRICTION_ENZYMES,
  type SequenceStats,
  type ORF,
  type AlignmentResult,
  type BLASTResult,
  type RestrictionSite,
  type MotifMatch
} from '@/lib/sequence-utils';

// Tool types
type ToolId = 
  | 'pairwise'
  | 'blast'
  | 'orf'
  | 'reverse-complement'
  | 'translation'
  | 'gc-content'
  | 'motif-search'
  | 'pattern-search'
  | 'restriction-map';

interface ToolConfig {
  id: ToolId;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const TOOLS: ToolConfig[] = [
  { id: 'pairwise', name: 'Pairwise Alignment', description: 'Global/Local sequence alignment', icon: <ArrowLeftRight className="w-4 h-4" /> },
  { id: 'blast', name: 'BLAST Search', description: 'Search against databases', icon: <Search className="w-4 h-4" /> },
  { id: 'orf', name: 'ORF Finder', description: 'Find open reading frames', icon: <Code2 className="w-4 h-4" /> },
  { id: 'reverse-complement', name: 'Reverse Complement', description: 'Generate reverse complement', icon: <RotateCcw className="w-4 h-4" /> },
  { id: 'translation', name: 'Translation', description: 'DNA/RNA to Protein', icon: <Languages className="w-4 h-4" /> },
  { id: 'gc-content', name: 'GC Content', description: 'Calculate GC percentage', icon: <Percent className="w-4 h-4" /> },
  { id: 'motif-search', name: 'Motif Search', description: 'Find sequence motifs', icon: <Target className="w-4 h-4" /> },
  { id: 'pattern-search', name: 'Pattern Search', description: 'Search with regex patterns', icon: <FileSearch className="w-4 h-4" /> },
  { id: 'restriction-map', name: 'Restriction Map', description: 'Map restriction sites', icon: <Scissors className="w-4 h-4" /> },
];

// Nucleotide colors for highlighting
const NUCLEOTIDE_COLORS: Record<string, string> = {
  A: 'text-green-600 dark:text-green-400 font-semibold',
  T: 'text-red-600 dark:text-red-400 font-semibold',
  U: 'text-red-600 dark:text-red-400 font-semibold',
  G: 'text-yellow-600 dark:text-yellow-400 font-semibold',
  C: 'text-blue-600 dark:text-blue-400 font-semibold',
};

// Result types
interface AnalysisResult {
  type: ToolId;
  data: unknown;
  timestamp: Date;
}

export default function SequenceAnalysisTool() {
  // State
  const [activeTool, setActiveTool] = useState<ToolId>('pairwise');
  const [sequence1, setSequence1] = useState('');
  const [sequence2, setSequence2] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Tool-specific options state
  const [alignmentOptions, setAlignmentOptions] = useState({
    algorithm: 'global' as 'global' | 'local',
    matchScore: 1,
    mismatchPenalty: -1,
    gapPenalty: -1,
    matrix: 'BLOSUM62',
  });

  const [blastOptions, setBlastOptions] = useState({
    program: 'blastn',
    database: 'nr',
    eValue: '0.001',
    maxTargets: 10,
    wordSize: 11,
    lowComplexityFilter: true,
  });

  const [orfOptions, setOrfOptions] = useState({
    geneticCode: 1,
    minLength: 30,
    showAllFrames: true,
    startCodons: ['ATG'],
  });

  const [translationOptions, setTranslationOptions] = useState({
    frame: 1,
    geneticCode: 1,
  });

  const [motifPattern, setMotifPattern] = useState('');
  const [patternSearchOptions, setPatternSearchOptions] = useState({
    caseSensitive: false,
    allowMismatch: false,
    maxMismatches: 0,
  });

  // Get sequence stats for display
  const seq1Stats = useMemo(() => 
    sequence1 ? getSequenceStats(sequence1) : null, [sequence1]
  );

  const seq2Stats = useMemo(() => 
    sequence2 ? getSequenceStats(sequence2) : null, [sequence2]
  );

  // Load example sequences
  const loadExampleDNA = useCallback(() => {
    setSequence1(EXAMPLE_SEQUENCES.dna);
  }, []);

  const loadExampleProtein = useCallback(() => {
    setSequence1(EXAMPLE_SEQUENCES.protein);
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content.startsWith('>')) {
          const parsed = parseFASTA(content);
          if (parsed.length > 0) {
            setSequence1(parsed[0].sequence);
            if (parsed.length > 1) {
              setSequence2(parsed[1].sequence);
            }
          }
        } else {
          setSequence1(content);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  // Run analysis based on active tool
  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 200);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    let analysisResult: AnalysisResult;

    try {
      switch (activeTool) {
        case 'pairwise': {
          const alignFn = alignmentOptions.algorithm === 'global' ? globalAlignment : localAlignment;
          const alignmentResult = alignFn(sequence1, sequence2, {
            matchScore: alignmentOptions.matchScore,
            mismatchPenalty: alignmentOptions.mismatchPenalty,
            gapPenalty: alignmentOptions.gapPenalty,
          });
          analysisResult = { type: 'pairwise', data: alignmentResult, timestamp: new Date() };
          break;
        }

        case 'blast': {
          const blastResult = mockBLASTSearch(sequence1, {
            database: blastOptions.database,
            maxTargets: blastOptions.maxTargets,
            program: blastOptions.program,
          });
          analysisResult = { type: 'blast', data: blastResult, timestamp: new Date() };
          break;
        }

        case 'orf': {
          const orfs = findORFs(sequence1, {
            minLength: orfOptions.minLength,
            geneticCode: orfOptions.geneticCode,
            allFrames: orfOptions.showAllFrames,
            startCodons: orfOptions.startCodons,
          });
          analysisResult = { type: 'orf', data: orfs, timestamp: new Date() };
          break;
        }

        case 'reverse-complement': {
          const rcResult = rc(sequence1);
          analysisResult = { type: 'reverse-complement', data: rcResult, timestamp: new Date() };
          break;
        }

        case 'translation': {
          const translationResult = translate(
            sequence1,
            translationOptions.frame,
            translationOptions.geneticCode
          );
          analysisResult = { type: 'translation', data: translationResult, timestamp: new Date() };
          break;
        }

        case 'gc-content': {
          const gcResult = getSequenceStats(sequence1);
          analysisResult = { type: 'gc-content', data: gcResult, timestamp: new Date() };
          break;
        }

        case 'motif-search':
        case 'pattern-search': {
          const motifResults = searchMotif(sequence1, motifPattern || 'ATG', patternSearchOptions);
          analysisResult = { type: activeTool, data: motifResults, timestamp: new Date() };
          break;
        }

        case 'restriction-map': {
          const restrictionSites = findRestrictionSites(sequence1);
          analysisResult = { type: 'restriction-map', data: restrictionSites, timestamp: new Date() };
          break;
        }

        default:
          throw new Error('Unknown tool');
      }

      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setResult(analysisResult);
        setIsAnalyzing(false);
        setProgress(0);
      }, 300);

    } catch (error) {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      console.error('Analysis error:', error);
    }
  }, [activeTool, sequence1, sequence2, alignmentOptions, blastOptions, orfOptions, translationOptions, motifPattern, patternSearchOptions]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // Download result
  const downloadResult = useCallback((format: 'json' | 'csv' | 'txt') => {
    if (!result) return;

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(result.data, null, 2);
        filename = `bioalign-${result.type}-result.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = convertToCSV(result.data);
        filename = `bioalign-${result.type}-result.csv`;
        mimeType = 'text/csv';
        break;
      case 'txt':
        content = formatPlainText(result);
        filename = `bioalign-${result.type}-result.txt`;
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  // Highlight nucleotides in sequence
  const highlightSequence = (seq: string): React.ReactNode[] => {
    return seq.split('').map((char, i) => (
      <span key={i} className={NUCLEOTIDE_COLORS[char.toUpperCase()] || ''}>
        {char}
      </span>
    ));
  };

  // Render tool-specific options
  const renderToolOptions = () => {
    switch (activeTool) {
      case 'pairwise':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="algorithm">Algorithm</Label>
                <Select value={alignmentOptions.algorithm} onValueChange={(v) => 
                  setAlignmentOptions(prev => ({ ...prev, algorithm: v as 'global' | 'local' }))
                }>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (Needleman-Wunsch)</SelectItem>
                    <SelectItem value="local">Local (Smith-Waterman)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="matrix">Substitution Matrix</Label>
                <Select value={alignmentOptions.matrix} onValueChange={(v) =>
                  setAlignmentOptions(prev => ({ ...prev, matrix: v }))
                }>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(SUBSTITUTION_MATRICES).map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Advanced Scoring Options
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Match Score</Label>
                    <Input
                      type="number"
                      value={alignmentOptions.matchScore}
                      onChange={(e) => setAlignmentOptions(prev => ({ ...prev, matchScore: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Mismatch Penalty</Label>
                    <Input
                      type="number"
                      value={alignmentOptions.mismatchPenalty}
                      onChange={(e) => setAlignmentOptions(prev => ({ ...prev, mismatchPenalty: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Gap Penalty</Label>
                    <Input
                      type="number"
                      value={alignmentOptions.gapPenalty}
                      onChange={(e) => setAlignmentOptions(prev => ({ ...prev, gapPenalty: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Second sequence input */}
            <div>
              <Label htmlFor="seq2">Second Sequence</Label>
              <Textarea
                id="seq2"
                placeholder="Enter second sequence..."
                value={sequence2}
                onChange={(e) => setSequence2(e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
              {seq2Stats && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{seq2Stats.length} bp</Badge>
                  <Badge variant="secondary">{seq2Stats.type}</Badge>
                  <Badge variant="secondary">GC: {seq2Stats.gcContent.toFixed(1)}%</Badge>
                </div>
              )}
            </div>
          </div>
        );

      case 'blast':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Program</Label>
                <Select value={blastOptions.program} onValueChange={(v) =>
                  setBlastOptions(prev => ({ ...prev, program: v }))
                }>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blastn">BLASTN (Nucleotide)</SelectItem>
                    <SelectItem value="blastp">BLASTP (Protein)</SelectItem>
                    <SelectItem value="blastx">BLASTX (Translated)</SelectItem>
                    <SelectItem value="tblastn">TBLASTN</SelectItem>
                    <SelectItem value="tblastx">TBLASTX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Database</Label>
                <Select value={blastOptions.database} onValueChange={(v) =>
                  setBlastOptions(prev => ({ ...prev, database: v }))
                }>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nr">NR (Non-redundant)</SelectItem>
                    <SelectItem value="nt">NT (Nucleotide)</SelectItem>
                    <SelectItem value="pdb">PDB</SelectItem>
                    <SelectItem value="swissprot">SwissProt</SelectItem>
                    <SelectItem value="refseq">RefSeq</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Advanced Parameters
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>E-value Threshold</Label>
                    <Input
                      value={blastOptions.eValue}
                      onChange={(e) => setBlastOptions(prev => ({ ...prev, eValue: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Max Targets</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={blastOptions.maxTargets}
                      onChange={(e) => setBlastOptions(prev => ({ ...prev, maxTargets: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Word Size</Label>
                    <Input
                      type="number"
                      value={blastOptions.wordSize}
                      onChange={(e) => setBlastOptions(prev => ({ ...prev, wordSize: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={blastOptions.lowComplexityFilter}
                    onCheckedChange={(checked) => setBlastOptions(prev => ({ ...prev, lowComplexityFilter: checked }))}
                  />
                  <Label>Low complexity filter</Label>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        );

      case 'orf':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Genetic Code</Label>
                <Select value={String(orfOptions.geneticCode)} onValueChange={(v) =>
                  setOrfOptions(prev => ({ ...prev, geneticCode: Number(v) }))
                }>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Standard (1)</SelectItem>
                    <SelectItem value="2">Vertebrate Mitochondrial (2)</SelectItem>
                    <SelectItem value="4">Invertebrate Mitochondrial (4)</SelectItem>
                    <SelectItem value="11">Bacterial (11)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Min ORF Length (bp)</Label>
                <Input
                  type="number"
                  min={10}
                  value={orfOptions.minLength}
                  onChange={(e) => setOrfOptions(prev => ({ ...prev, minLength: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={orfOptions.showAllFrames}
                    onCheckedChange={(checked) => setOrfOptions(prev => ({ ...prev, showAllFrames: checked }))}
                  />
                  <Label>Show all 6 frames</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'translation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Reading Frame</Label>
                <Select value={String(translationOptions.frame)} onValueChange={(v) =>
                  setTranslationOptions(prev => ({ ...prev, frame: Number(v) }))
                }>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Frame +1</SelectItem>
                    <SelectItem value="2">Frame +2</SelectItem>
                    <SelectItem value="3">Frame +3</SelectItem>
                    <SelectItem value="-1">Frame -1</SelectItem>
                    <SelectItem value="-2">Frame -2</SelectItem>
                    <SelectItem value="-3">Frame -3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Genetic Code</Label>
                <Select value={String(translationOptions.geneticCode)} onValueChange={(v) =>
                  setTranslationOptions(prev => ({ ...prev, geneticCode: Number(v) }))
                }>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Standard (1)</SelectItem>
                    <SelectItem value="2">Vertebrate Mitochondrial (2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'motif-search':
      case 'pattern-search':
        return (
          <div className="space-y-4">
            <div>
              <Label>Motif / Pattern</Label>
              <Input
                placeholder="Enter search pattern (e.g., ATG, GAATTC)"
                value={motifPattern}
                onChange={(e) => setMotifPattern(e.target.value)}
                className="font-mono uppercase"
              />
            </div>
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Search Options
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={patternSearchOptions.caseSensitive}
                      onCheckedChange={(checked) => setPatternSearchOptions(prev => ({ ...prev, caseSensitive: checked }))}
                    />
                    <Label>Case sensitive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={patternSearchOptions.allowMismatch}
                      onCheckedChange={(checked) => setPatternSearchOptions(prev => ({ ...prev, allowMismatch: checked }))}
                    />
                    <Label>Allow mismatches</Label>
                  </div>
                </div>
                {patternSearchOptions.allowMismatch && (
                  <div>
                    <Label>Max Mismatches</Label>
                    <Slider
                      value={[patternSearchOptions.maxMismatches]}
                      onValueChange={([v]) => setPatternSearchOptions(prev => ({ ...prev, maxMismatches: v }))}
                      min={0}
                      max={5}
                      step={1}
                    />
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        );

      case 'restriction-map':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Will search for common restriction enzyme recognition sites in your sequence.
            </p>
            <div className="flex flex-wrap gap-2">
              {RESTRICTION_ENZYMES.map(enzyme => (
                <Badge key={enzyme.name} variant="outline" className="font-mono text-xs">
                  {enzyme.name}: {enzyme.recognition}
                </Badge>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render results based on tool type
  const renderResults = () => {
    if (!result) return null;

    switch (result.type) {
      case 'pairwise':
        return <AlignmentView data={result.data as AlignmentResult} highlightSequence={highlightSequence} />;
      
      case 'blast':
        return <BLASTView data={result.data as BLASTResult} highlightSequence={highlightSequence} />;
      
      case 'orf':
        return <ORFView data={result.data as ORF[]} />;
      
      case 'reverse-complement':
        return <TextView label="Reverse Complement" data={result.data as string} highlightSequence={highlightSequence} />;
      
      case 'translation':
        return <TextView label="Translated Protein" data={result.data as string} />;
      
      case 'gc-content':
        return <GCContentView data={result.data as SequenceStats} />;
      
      case 'motif-search':
      case 'pattern-search':
        return <MotifView data={result.data as MotifMatch[]} />;
      
      case 'restriction-map':
        return <RestrictionMapView data={result.data as RestrictionSite[]} />;
      
      default:
        return <p>No visualization available for this tool.</p>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2 rounded-lg bg-[#C1121F]/10">
          <Dna className="w-6 h-6 text-[#C1121F]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Sequence Analysis</h1>
          <p className="text-muted-foreground text-sm">Comprehensive bioinformatics tools for sequence analysis</p>
        </div>
      </motion.div>

      {/* Tool Selector */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTool} onValueChange={(v) => { setActiveTool(v as ToolId); setResult(null); }}>
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50">
              {TOOLS.map(tool => (
                <TabsTrigger
                  key={tool.id}
                  value={tool.id}
                  className="data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-xs sm:text-sm px-2 py-1.5"
                >
                  <span className="hidden sm:inline mr-1">{tool.icon}</span>
                  <span className="truncate">{tool.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Section */}
        <motion.div
          key={`input-${activeTool}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-3 space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-[#C1121F]" />
                Input Sequence{activeTool === 'pairwise' ? 's' : ''}
              </CardTitle>
              <CardDescription>
                {TOOLS.find(t => t.id === activeTool)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main sequence input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="seq1">Sequence</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadExampleDNA}>
                      DNA Example
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadExampleProtein}>
                      Protein Example
                    </Button>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".fasta,.fa,.fna,.faa,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button variant="outline" size="sm" asChild>
                        <span className="flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          File
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
                <Textarea
                  id="seq1"
                  placeholder="Paste your sequence here (FASTA format supported)..."
                  value={sequence1}
                  onChange={(e) => setSequence1(e.target.value)}
                  rows={8}
                  className="font-mono text-sm resize-none"
                />
                
                {/* Sequence stats */}
                {seq1Stats && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-wrap gap-2 mt-3"
                  >
                    <Badge variant="default" className="bg-[#C1121F]">
                      {seq1Stats.length.toLocaleString()} bp
                    </Badge>
                    <Badge variant="secondary">{seq1Stats.type}</Badge>
                    {seq1Stats.type !== 'Protein' && (
                      <Badge variant="secondary">GC: {seq1Stats.gcContent.toFixed(1)}%</Badge>
                    )}
                    <Badge variant="outline" className="font-mono text-xs">
                      {Object.entries(seq1Stats.composition).slice(0, 4).map(([k, v]) => `${k}:${v}`).join(' ')}
                    </Badge>
                  </motion.div>
                )}

                {/* Validation errors */}
                {sequence1 && validateSequence(sequence1).errors.length > 0 && (
                  <div className="flex items-start gap-2 mt-2 p-2 bg-destructive/10 rounded-md">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                    <div className="text-xs text-destructive">
                      {validateSequence(sequence1).errors.map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Tool-specific options */}
              {renderToolOptions()}
            </CardContent>
          </Card>

          {/* Run button */}
          <Button
            onClick={runAnalysis}
            disabled={!sequence1.trim() || isAnalyzing || (activeTool === 'pairwise' && !sequence2.trim())}
            className="w-full bg-[#C1121F] hover:bg-[#8B0A14] text-white h-12 text-lg"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Run Analysis
              </>
            )}
          </Button>

          {/* Progress bar */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground mt-1">
                Processing... {Math.round(progress)}%
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        <motion.div
          key={`results-${activeTool}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-[#C1121F]" />
                  Results
                </CardTitle>
                {result && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2))}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <div className="relative group">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-popover border rounded-md shadow-md z-50">
                        <button
                          onClick={() => downloadResult('json')}
                          className="px-3 py-1.5 text-sm hover:bg-accent text-left whitespace-nowrap"
                        >
                          JSON
                        </button>
                        <button
                          onClick={() => downloadResult('csv')}
                          className="px-3 py-1.5 text-sm hover:bg-accent text-left whitespace-nowrap"
                        >
                          CSV
                        </button>
                        <button
                          onClick={() => downloadResult('txt')}
                          className="px-3 py-1.5 text-sm hover:bg-accent text-left whitespace-nowrap"
                        >
                          TXT
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!result && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Dna className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-center">
                    Enter a sequence and click &quot;Run Analysis&quot; to see results
                  </p>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-[#C1121F] mb-4" />
                  <p className="text-muted-foreground">Analyzing sequence...</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {result && !isAnalyzing && (
                  <motion.div
                    key={`result-${result.timestamp.getTime()}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="max-h-[500px] overflow-y-auto"
                  >
                    {renderResults()}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Sub-components for rendering different result types

function AlignmentView({ data, highlightSequence }: { data: AlignmentResult; highlightSequence: (s: string) => React.ReactNode[] }) {
  const [viewTab, setViewTab] = useState<'alignment' | 'stats' | 'raw'>('alignment');

  return (
    <div className="space-y-4">
      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as typeof viewTab)}>
        <TabsList className="w-full">
          <TabsTrigger value="alignment" className="flex-1">Alignment</TabsTrigger>
          <TabsTrigger value="stats" className="flex-1">Statistics</TabsTrigger>
          <TabsTrigger value="raw" className="flex-1">Raw Output</TabsTrigger>
        </TabsList>

        <TabsContent value="alignment" className="mt-4">
          <div className="bg-muted/50 rounded-lg p-3 overflow-x-auto">
            <pre className="font-mono text-xs leading-relaxed">
              <div className="mb-1"><strong>Query:</strong> {highlightSequence(data.alignedSeq1)}</div>
              <div className="mb-1 text-center text-[#C1121F]">{data.midpoint}</div>
              <div><strong>Sbjct:</strong> {highlightSequence(data.alignedSeq2)}</div>
            </pre>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Score" value={data.score.toString()} />
            <StatCard label="Identity" value={`${data.identity}%`} />
            <StatCard label="Similarity" value={`${data.similarity}%`} />
            <StatCard label="Gaps" value={data.gaps.toString()} />
          </div>
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          <pre className="bg-muted/50 rounded-lg p-3 overflow-x-auto font-mono text-xs whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BLASTView({ data, highlightSequence }: { data: BLASTResult; highlightSequence: (s: string) => React.ReactNode[] }) {
  const [selectedHit, setSelectedHit] = useState<number>(0);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Found <strong>{data.hits.length}</strong> hits in <strong>{data.database}</strong>
      </div>

      {/* Hit list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {data.hits.map((hit, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedHit(idx)}
            className={`w-full text-left p-2 rounded-md border transition-colors ${
              selectedHit === idx ? 'border-[#C1121F] bg-[#C1121F]/5' : 'border-border hover:border-[#C1121F]/50'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium truncate mr-2">{hit.description}</span>
              <Badge variant="secondary" className="shrink-0 text-xs">{hit.score}</Badge>
            </div>
            <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
              <span>{hit.identity}% identity</span>
              <span>E-value: {hit.eValue.toExponential(1)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected hit alignment */}
      {data.hits[selectedHit] && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-2">Alignment Details</h4>
          <div className="bg-muted/50 rounded-lg p-3 overflow-x-auto">
            <pre className="font-mono text-xs leading-relaxed">
              <div className="mb-1"><strong>Query:</strong> {highlightSequence(data.hits[selectedHit].queryAlignment)}</div>
              <div className="mb-1 text-center text-[#C1121F]">{data.hits[selectedHit].midpoint}</div>
              <div><strong>Sbjct:</strong> {highlightSequence(data.hits[selectedHit].subjectAlignment)}</div>
            </pre>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div><strong>Score:</strong> {data.hits[selectedHit].score}</div>
            <div><strong>E-value:</strong> {data.hits[selectedHit].eValue.toExponential(2)}</div>
            <div><strong>Identity:</strong> {data.hits[selectedHit].identity}%</div>
            <div><strong>Length:</strong> {data.hits[selectedHit].alignmentLength}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ORFView({ data }: { data: ORF[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No ORFs found matching criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Found <strong>{data.length}</strong> ORF(s)
      </p>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {data.map((orf, idx) => (
          <div key={idx} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-start">
              <Badge variant="default" className="bg-[#C1121F]">ORF {idx + 1}</Badge>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>Frame: {orf.frame}</span>
                <span>{orf.length} bp</span>
              </div>
            </div>
            <div className="text-xs">
              <div><strong>Position:</strong> {orf.start} - {orf.end}</div>
              <div className="mt-1"><strong>Protein:</strong></div>
              <div className="font-mono bg-muted/50 rounded p-2 mt-1 break-all max-h-20 overflow-y-auto">
                {orf.protein.slice(0, 50)}{orf.protein.length > 50 ? '...' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextView({ label, data, highlightSequence }: { label: string; data: string; highlightSequence?: (s: string) => React.ReactNode[] }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <Badge variant="secondary">{data.length} characters</Badge>
      </div>
      <div className="bg-muted/50 rounded-lg p-3 overflow-x-auto">
        <pre className="font-mono text-xs break-all leading-relaxed">
          {highlightSequence ? highlightSequence(data) : data}
        </pre>
      </div>
    </div>
  );
}

function GCContentView({ data }: { data: SequenceStats }) {
  const totalBases = Object.values(data.composition).reduce((a, b) => a + b, 0);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Length" value={data.length.toLocaleString()} />
        <StatCard label="Type" value={data.type} />
        <StatCard label="GC Content" value={`${data.gcContent.toFixed(2)}%`} />
        <StatCard label="AT Content" value={`${(100 - data.gcContent).toFixed(2)}%`} />
      </div>

      <Separator />

      <div>
        <h4 className="font-medium text-sm mb-3">Base Composition</h4>
        <div className="space-y-2">
          {Object.entries(data.composition)
            .sort(([, a], [, b]) => b - a)
            .map(([base, count]) => {
              const percent = ((count / totalBases) * 100).toFixed(1);
              
              return (
                <div key={base} className="flex items-center gap-2">
                  <span className="w-6 font-mono font-bold text-center" style={{ color: base === 'A' ? '#16a34a' : base === 'T' || base === 'U' ? '#dc2626' : base === 'G' ? '#ca8a04' : '#2563eb' }}>
                    {base}
                  </span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: base === 'A' ? '#16a34a' : base === 'T' || base === 'U' ? '#dc2626' : base === 'G' ? '#ca8a04' : '#2563eb'
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">
                    {count} ({percent}%)
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function MotifView({ data }: { data: MotifMatch[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No matches found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Found <strong>{data.length}</strong> match(es)
      </p>
      <div className="space-y-2 max-h-[350px] overflow-y-auto">
        {data.map((match, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <Badge variant={match.strand === '+' ? 'default' : 'secondary'} className="text-xs">
                {match.strand}
              </Badge>
              <span className="font-mono text-sm">{match.match}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Pos: {match.position}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RestrictionMapView({ data }: { data: RestrictionSite[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Scissors className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No restriction sites found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Found <strong>{data.length}</strong> restriction site(s)
      </p>
      <div className="space-y-2 max-h-[350px] overflow-y-auto">
        {data.map((site, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">
                {site.enzyme}
              </Badge>
              <span className="font-mono text-sm">{site.recognitionSite}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={site.strand === '+' ? 'default' : 'secondary'} className="text-xs">
                {site.strand}
              </Badge>
              <span>{site.position}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 text-center">
      <div className="text-lg font-bold text-[#C1121F]">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

// Helper functions for export
function convertToCSV(data: unknown): string {
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(item => 
      headers.map(h => JSON.stringify((item as Record<string, unknown>)[h] ?? '')).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }
  if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data as Record<string, unknown>);
    return entries.map(([k, v]) => `${k},${JSON.stringify(v)}`).join('\n');
  }
  return String(data);
}

function formatPlainText(result: AnalysisResult): string {
  const lines = [`BioAlign ${result.type.toUpperCase()} Results`, `Generated: ${result.timestamp.toISOString()}`, ''];
  
  if (typeof result.data === 'string') {
    lines.push(result.data);
  } else if (Array.isArray(result.data)) {
    lines.push(`Total entries: ${result.data.length}`);
    result.data.forEach((item, idx) => {
      lines.push(`\n--- Entry ${idx + 1} ---`);
      Object.entries(item as Record<string, unknown>).forEach(([k, v]) => {
        lines.push(`${k}: ${JSON.stringify(v)}`);
      });
    });
  } else if (typeof result.data === 'object' && result.data !== null) {
    Object.entries(result.data as Record<string, unknown>).forEach(([k, v]) => {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    });
  }
  
  return lines.join('\n');
}
