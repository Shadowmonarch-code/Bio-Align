'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Code2, 
  Database, 
  Terminal, 
  FileText, 
  GitBranch,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Documentation sections data
const docSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    content: [
      {
        title: 'Installation',
        code: `# Clone the repository
git clone https://github.com/bioalign/bioalign.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run db:push

# Start development server
npm run dev`,
      },
      {
        title: 'Quick Setup',
        description: 'BioAlign requires Node.js 18+ and npm or bun package manager.',
        steps: [
          'Create an account or sign in',
          'Set up your profile and institution',
          'Upload your first sequence file',
          'Choose a tool from the catalog',
          'Run analysis and view results',
        ],
      },
    ],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Code2,
    color: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user account',
        params: `{ name, email, password, institution? }`,
      },
      {
        method: 'POST',
        path: '/api/ai/chat',
        description: 'Send message to AI assistant',
        params: `{ message, history[] }`,
      },
      {
        method: 'GET',
        path: '/api/tools',
        description: 'Get list of available tools',
        params: `{ category?, search? }`,
      },
      {
        method: 'POST',
        path: '/api/analysis/blast',
        description: 'Run BLAST analysis',
        params: `{ sequence, database, parameters }`,
      },
    ],
  },
  {
    id: 'database-guide',
    title: 'Database Integration',
    icon: Database,
    color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
    databases: [
      { name: 'NCBI GenBank', url: 'https://www.ncbi.nlm.nih.gov/', desc: 'Nucleotide sequences' },
      { name: 'UniProt', url: 'https://www.uniprot.org/', desc: 'Protein sequences' },
      { name: 'PDB', url: 'https://www.rcsb.org/', desc: 'Protein structures' },
      { name: 'Ensembl', url: 'https://ensembl.org/', desc: 'Genome annotations' },
      { name: 'KEGG', url: 'https://www.genome.jp/kegg/', desc: 'Pathway data' },
      { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/', desc: 'Literature' },
    ],
  },
  {
    id: 'tools-reference',
    title: 'Tools Reference',
    icon: Terminal,
    color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
    categories: [
      'Sequence Analysis (BLAST, Alignment, ORF Finder)',
      'Protein Analysis (Structure, Domains, Properties)',
      'Genomics (Variant Calling, Annotation)',
      'Phylogenetics (Tree Building, Visualization)',
      'Primer Design (PCR, qPCR, Sequencing)',
      'Transcriptomics (RNA-seq Analysis)',
    ],
  },
];

interface DocumentationProps {
  onBack?: () => void;
}

export default function DocumentationSection({ onBack }: DocumentationProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 text-white/70 hover:text-white hover:bg-white/10"
            >
              ← Back to Home
            </Button>
          )}
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <BookOpen className="size-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Documentation</h1>
              <p className="text-white/70 mt-1">Everything you need to know about BioAlign</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {docSections.map((section) => (
          <motion.section
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            id={section.id}
            className="scroll-mt-24"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`size-10 rounded-xl ${section.color} flex items-center justify-center`}>
                <section.icon className="size-5" />
              </div>
              <h2 className="text-2xl font-bold">{section.title}</h2>
            </div>

            {/* Getting Started Content */}
            {section.id === 'getting-started' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Installation Commands</h3>
                  {section.content?.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-sm overflow-x-auto font-mono">
                        {item.code}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(item.code || '')}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedCode === item.code ? (
                          <Check className="size-4 text-green-400" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Quick Start Steps</h3>
                  <div className="bg-card border rounded-xl p-6 space-y-4">
                    {section.content?.[1]?.steps?.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="size-6 rounded-full bg-biored/10 text-biored text-sm font-medium flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-muted-foreground">{step}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
                    <Lightbulb className="size-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Tip:</strong> Use bun instead of npm for faster installations!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* API Reference Content */}
            {section.id === 'api-reference' && (
              <div className="space-y-4">
                {section.endpoints?.map((endpoint, idx) => (
                  <div
                    key={idx}
                    className="bg-card border rounded-xl p-5 hover:border-biored/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="font-mono text-sm font-semibold">{endpoint.path}</code>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{endpoint.description}</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-biored">
                      {endpoint.params}
                    </code>
                  </div>
                ))}
                
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Note:</strong> All API endpoints require authentication except for public documentation.
                  </p>
                </div>
              </div>
            )}

            {/* Database Integration Content */}
            {section.id === 'database-guide' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.databases?.map((db, idx) => (
                  <a
                    key={idx}
                    href={db.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-card border rounded-xl p-5 hover:border-biored/30 hover:shadow-lg transition-all group no-underline"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold group-hover:text-biored transition-colors">{db.name}</h4>
                      <ExternalLink className="size-4 text-muted-foreground group-hover:text-biored" />
                    </div>
                    <p className="text-sm text-muted-foreground">{db.desc}</p>
                  </a>
                ))}
              </div>
            )}

            {/* Tools Reference Content */}
            {section.id === 'tools-reference' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.categories?.map((category, idx) => (
                  <div
                    key={idx}
                    className="bg-card border rounded-xl p-5 hover:border-biored/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ChevronRight className="size-4 text-biored group-hover:translate-x-1 transition-transform" />
                      <h4 className="font-semibold group-hover:text-biored transition-colors">{category.split(' (')[0]}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {category.includes('(') ? category.match(/\(([^)]+)\)/)?.[1] : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        ))}

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t pt-8 text-center"
        >
          <p className="text-muted-foreground text-sm">
            BioAlign v1.0.0 • Last Updated: August 2024 •{' '}
            <a href="#" className="text-biored hover:underline">View Changelog</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
