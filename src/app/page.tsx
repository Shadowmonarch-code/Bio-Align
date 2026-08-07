'use client'

import React, { useState, useCallback } from 'react'
import Navbar from '@/components/landing/navbar'
import HeroSection from '@/components/landing/hero'
import FeaturesSection from '@/components/landing/features'
import ToolsShowcase from '@/components/landing/tools-showcase'
import WorkflowSection from '@/components/landing/workflow'
import StatisticsSection from '@/components/landing/statistics'
import TestimonialsSection from '@/components/landing/testimonials'
import PartnersSection from '@/components/landing/partners'
import FAQSection from '@/components/landing/faq'
import FooterSection from '@/components/landing/footer'
import DocumentationSection from '@/components/landing/documentation'
import TutorialsSection from '@/components/landing/tutorials'
import SupportPage from '@/components/landing/support-coffee'
import AboutCreator from '@/components/landing/about-creator'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import SettingsSection from '@/components/dashboard/settings'
import ToolsCatalog from '@/components/dashboard/tools-catalog'
import FileUpload from '@/components/dashboard/file-upload'
import { Button } from '@/components/ui/button'
import SequenceAnalysisTool from '@/components/tools/sequence-analysis'

// View types for the application - extended with new views
type ViewType = 'landing' | 'dashboard' | 'tools' | 'analysis' | 'upload' | 'databases' | 'settings' | 'documentation' | 'tutorials' | 'coffee' | 'about'

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('landing')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  // Main navigation handler - switches between views
  const handleNavigate = useCallback((view: string) => {
    setCurrentView(view as ViewType)
    window.scrollTo(0, 0)
  }, [])

  // Tool selection handler - opens analysis view with specific tool
  const handleToolSelect = useCallback((toolId: string) => {
    if (toolId === 'all') {
      setCurrentView('tools')
    } else {
      setSelectedTool(toolId)
      setCurrentView('analysis')
    }
    window.scrollTo(0, 0)
  }, [])

  // Sidebar navigation handler - handles both view and tool navigation
  const handleSidebarNavigate = useCallback((view: string, toolId?: string) => {
    if (toolId) {
      setSelectedTool(toolId)
      setCurrentView('analysis')
    } else {
      setCurrentView(view as ViewType)
    }
    window.scrollTo(0, 0)
  }, [])

  // Go back to landing page
  const handleGoHome = useCallback(() => {
    setCurrentView('landing')
    window.scrollTo(0, 0)
  }, [])

  // Render Landing Page
  if (currentView === 'landing') {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar onNavigate={handleNavigate} />
        
        {/* Hero Section */}
        <section id="hero">
          <HeroSection 
            onStartClick={() => handleNavigate('dashboard')}
            onExploreClick={() => handleNavigate('tools')}
          />
        </section>

        {/* Partners/Trusted By */}
        <section id="partners" className="py-16 border-b border-border/50">
          <PartnersSection />
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative overflow-hidden">
          <FeaturesSection onExploreClick={() => handleNavigate('tools')} />
        </section>

        {/* Popular Tools Showcase */}
        <section id="tools" className="py-24 bg-muted/30">
          <ToolsShowcase onLaunchTool={handleToolSelect} />
        </section>

        {/* Research Workflow */}
        <section id="workflow" className="py-24 relative">
          <WorkflowSection onStartClick={() => handleNavigate('dashboard')} />
        </section>

        {/* About Creator Section */}
        <section id="about" className="py-24 bg-muted/30">
          <AboutCreator onBack={handleGoHome} />
        </section>

        {/* Statistics */}
        <section id="statistics" className="py-24 bg-muted/30">
          <StatisticsSection />
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24">
          <TestimonialsSection />
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-muted/30">
          <FAQSection />
        </section>

        {/* CTA Section */}
        <section id="cta" className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-gradient-to-br from-primary via-biored-dark to-biored p-12 md:p-20 text-center text-white overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold">
                  Ready to Transform Your Research?
                </h2>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Join thousands of researchers who are already using BioAlign to accelerate their discoveries.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button 
                    size="lg"
                    className="px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-all hover:scale-105 shadow-lg cursor-pointer"
                    onClick={() => handleNavigate('dashboard')}
                  >
                    Get Started Free
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => handleNavigate('tools')}
                  >
                    Explore All Tools
                  </Button>
                </div>
                <p className="text-sm text-white/60 pt-2">
                  No credit card required · Free tier available · Setup in 2 minutes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <FooterSection />
      </main>
    )
  }

  // Render Dashboard View
  if (currentView === 'dashboard') {
    return (
      <main className="min-h-screen flex flex-col">
        <DashboardLayout
          title="Dashboard"
          subtitle="Welcome back! Here's your research overview."
          breadcrumbs={[{ label: 'Home', href: '#', onClick: handleGoHome }, { label: 'Dashboard' }]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleNavigate('upload')} className="cursor-pointer">
                Upload Files
              </Button>
              <Button onClick={() => handleNavigate('tools')} className="cursor-pointer bg-biored hover:bg-biored-dark text-white">
                Browse Tools
              </Button>
            </div>
          }
          onSidebarNavigate={handleSidebarNavigate}
        >
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Recent Analyses', value: '12', change: '+3 this week', icon: '📊' },
                { title: 'Saved Projects', value: '5', change: '2 active', icon: '📁' },
                { title: 'Storage Used', value: '2.4 GB', change: 'of 10 GB', icon: '💾' },
                { title: 'API Calls', value: '1,234', change: '-12% vs last week', icon: '🔌' },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                    </div>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { action: 'BLAST Analysis completed', time: '2 hours ago', type: 'success' },
                    { action: 'Sequence uploaded: sample.fasta', time: '5 hours ago', type: 'info' },
                    { action: 'Multiple alignment started', time: '1 day ago', type: 'pending' },
                    { action: 'GC Content analysis', time: '2 days ago', type: 'success' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Launch Tools */}
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="font-semibold mb-4">Quick Launch Tools</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'BLAST Search', icon: '🔍', tool: 'blast' },
                    { name: 'Sequence Align', icon: '🧬', tool: 'align' },
                    { name: 'ORF Finder', icon: '🔎', tool: 'orf' },
                    { name: 'Translate', icon: '🔄', tool: 'translate' },
                    { name: 'GC Content', icon: '📈', tool: 'gc' },
                    { name: 'Primer Design', icon: '🧪', tool: 'primer' },
                  ].map((tool, i) => (
                    <button
                      key={i}
                      onClick={() => handleToolSelect(tool.tool)}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-primary/5 hover:border-primary/30 transition-colors text-left cursor-pointer"
                    >
                      <span>{tool.icon}</span>
                      <span className="text-sm font-medium">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="font-semibold mb-4">Upload New Data</h3>
              <FileUpload />
            </div>
          </div>
        </DashboardLayout>

        
        {/* Sticky Footer */}
        <footer className="mt-auto border-t bg-card py-4 px-6 text-center text-sm text-muted-foreground">
          <p>Developed by <span className="font-semibold text-biored">CBSH, RPCAU</span></p>
          <p className="text-xs mt-1">by Toufik Mahata</p>
        </footer>
      </main>
    )
  }

  // Render Workspaces View
  if (currentView === 'workspaces') {
    return (
      <main className="min-h-screen flex flex-col">
        <DashboardLayout
          title="Workspaces"
          subtitle="Manage your analysis projects and collaborations"
          breadcrumbs={[{ label: 'Home', href: '#', onClick: handleGoHome }, { label: 'Workspaces' }]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleNavigate('dashboard')} className="cursor-pointer">
                ← Dashboard
              </Button>
              <Button className="cursor-pointer bg-biored hover:bg-biored-dark text-white">
                + New Workspace
              </Button>
            </div>
          }
          onSidebarNavigate={handleSidebarNavigate}
        >
          <div className="space-y-6">
            {/* Workspace Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Total Workspaces', value: '5', icon: '📁', color: 'text-blue-500' },
                { title: 'Shared with Me', value: '3', icon: '👥', color: 'text-green-500' },
                { title: 'Recent Activity', value: '12', icon: '⚡', color: 'text-orange-500' },
              ].map((stat, i) => (
                <div key={i} className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Workspaces Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  name: 'BLAST Analysis Project', 
                  desc: 'Comparative genomics study',
                  updated: '2 hours ago',
                  tools: ['BLAST', 'ClustalW'],
                  members: 2,
                  status: 'active'
                },
                { 
                  name: 'RNA-seq Pipeline', 
                  desc: 'Differential expression analysis',
                  updated: '1 day ago',
                  tools: ['STAR', 'DESeq2'],
                  members: 1,
                  status: 'active'
                },
                { 
                  name: 'Primer Design Set', 
                  desc: 'PCR primer collection for experiments',
                  updated: '3 days ago',
                  tools: ['Primer3'],
                  members: 3,
                  status: 'shared'
                },
                { 
                  name: 'Variant Calling Study', 
                  desc: 'SNP analysis from WGS data',
                  updated: '1 week ago',
                  tools: ['GATK', 'VCFtools'],
                  members: 1,
                  status: 'completed'
                },
                { 
                  name: 'Protein Structure Analysis', 
                  desc: 'AlphaFold predictions and docking',
                  updated: '2 weeks ago',
                  tools: ['AlphaFold', 'AutoDock'],
                  members: 2,
                  status: 'active'
                },
              ].map((workspace, i) => (
                <div key={i} className="p-5 rounded-xl border bg-card hover:shadow-lg hover:border-biored/30 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-biored/10 to-biored/20 flex items-center justify-center group-hover:from-biored/20 group-hover:to-biored/30 transition-colors">
                      <span className="text-lg">🧬</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      workspace.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      workspace.status === 'shared' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {workspace.status}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-biored transition-colors">{workspace.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{workspace.desc}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {workspace.tools.map((tool, j) => (
                      <span key={j} className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium">{tool}</span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      👥 {workspace.members} member{workspace.members > 1 ? 's' : ''}
                    </span>
                    <span>{workspace.updated}</span>
                  </div>
                </div>
              ))}

              {/* Add new workspace card */}
              <button 
                onClick={() => alert('Create new workspace feature coming soon!')}
                className="p-5 rounded-xl border border-dashed border-2 border-muted hover:border-biored/50 hover:bg-accent/30 transition-all flex flex-col items-center justify-center min-h-[200px] cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-biored/10 flex items-center justify-center mb-3 transition-colors">
                  <span className="text-2xl group-hover:text-biored transition-colors">+</span>
                </div>
                <p className="font-medium group-hover:text-biored transition-colors">Create New Workspace</p>
                <p className="text-sm text-muted-foreground mt-1">Start a new project</p>
              </button>
            </div>
          </div>
        </DashboardLayout>

        {/* Sticky Footer */}
        <footer className="mt-auto border-t bg-card py-4 px-6 text-center text-sm text-muted-foreground">
          <p>Developed by <span className="font-semibold text-biored">CBSH, RPCAU</span></p>
          <p className="text-xs mt-1">by Toufik Mahata</p>
        </footer>
      </main>
    )
  }

  // Render Tools Catalog
  if (currentView === 'tools') {
    return (
      <main className="min-h-screen flex flex-col">
        <DashboardLayout
          title="Tools Catalog"
          subtitle="Browse and launch 84+ bioinformatics tools"
          breadcrumbs={[{ label: 'Home', href: '#', onClick: handleGoHome }, { label: 'Tools' }]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGoHome} className="cursor-pointer">
                ← Back to Home
              </Button>
              <Button onClick={() => handleNavigate('dashboard')} className="cursor-pointer">
                Dashboard
              </Button>
            </div>
          }
          onSidebarNavigate={handleSidebarNavigate}
        >
          <ToolsCatalog onToolSelect={handleToolSelect} />
        </DashboardLayout>

        
        {/* Sticky Footer */}
        <footer className="mt-auto border-t bg-card py-4 px-6 text-center text-sm text-muted-foreground">
          <p>Developed by <span className="font-semibold text-biored">CBSH, RPCAU</span></p>
          <p className="text-xs mt-1">by Toufik Mahata</p>
        </footer>
      </main>
    )
  }

  // Render Tool Analysis Page
  if (currentView === 'analysis') {
    return (
      <main className="min-h-screen flex flex-col">
        <DashboardLayout
          title={selectedTool ? `${selectedTool} Analysis` : 'Sequence Analysis'}
          subtitle="Perform comprehensive sequence analysis"
          breadcrumbs={[
            { label: 'Home', href: '#', onClick: handleGoHome },
            { label: 'Tools', href: '#', onClick: () => handleNavigate('tools') },
            { label: selectedTool || 'Analysis', href: '#' }
          ]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleNavigate('tools')} className="cursor-pointer">
                ← All Tools
              </Button>
              <Button variant="outline" onClick={() => handleNavigate('dashboard')} className="cursor-pointer">
                Dashboard
              </Button>
            </div>
          }
          onSidebarNavigate={handleSidebarNavigate}
        >
          <SequenceAnalysisTool selectedTool={selectedTool} />
        </DashboardLayout>

        
        {/* Sticky Footer */}
        <footer className="mt-auto border-t bg-card py-4 px-6 text-center text-sm text-muted-foreground">
          <p>Developed by <span className="font-semibold text-biored">CBSH, RPCAU</span></p>
          <p className="text-xs mt-1">by Toufik Mahata</p>
        </footer>
      </main>
    )
  }

  // Render File Upload Page
  if (currentView === 'upload') {
    return (
      <main className="min-h-screen flex flex-col">
        <DashboardLayout
          title="File Upload"
          subtitle="Upload your bioinformatics data files"
          breadcrumbs={[
            { label: 'Home', href: '#', onClick: handleGoHome },
            { label: 'Upload', href: '#' }
          ]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleNavigate('dashboard')} className="cursor-pointer">
                ← Dashboard
              </Button>
              <Button onClick={() => handleNavigate('tools')} className="cursor-pointer">
                Tools
              </Button>
            </div>
          }
          onSidebarNavigate={handleSidebarNavigate}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <FileUpload />
            
            {/* Supported Formats Info */}
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="font-semibold mb-4">Supported File Formats</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { category: 'Sequence', formats: ['FASTA', 'FASTQ', 'GenBank', 'EMBL'] },
                  { category: 'Structure', formats: ['PDB', 'CIF', 'MOL', 'SDF'] },
                  { category: 'Alignment', formats: ['SAM', 'BAM', 'CRAM'] },
                  { category: 'Variant', formats: ['VCF', 'BED', 'GFF', 'GTF'] },
                  { category: 'Data', formats: ['CSV', 'TSV', 'XLSX', 'JSON'] },
                  { category: 'Archive', formats: ['ZIP', 'GZ', 'TAR', 'BZ2'] },
                ].map((group, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-medium text-biored mb-2">{group.category}</p>
                    <div className="flex flex-wrap gap-1">
                      {group.formats.map((fmt, j) => (
                        <span key={j} className="text-xs px-1.5 py-0.5 rounded bg-background border">
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>

        
        {/* Sticky Footer */}
        <footer className="mt-auto border-t bg-card py-4 px-6 text-center text-sm text-muted-foreground">
          <p>Developed by <span className="font-semibold text-biored">CBSH, RPCAU</span></p>
          <p className="text-xs mt-1">by Toufik Mahata</p>
        </footer>
      </main>
    )
  }

  // Render Databases View
  if (currentView === 'databases') {
    return (
      <main className="min-h-screen flex flex-col">
        <DashboardLayout
          title="Databases"
          subtitle="Search and connect to biological databases worldwide"
          breadcrumbs={[{ label: 'Home', href: '#', onClick: handleGoHome }, { label: 'Databases' }]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGoHome} className="cursor-pointer">
                ← Back to Home
              </Button>
              <Button onClick={() => handleNavigate('dashboard')} className="cursor-pointer">
                Dashboard
              </Button>
            </div>
          }
          onSidebarNavigate={handleSidebarNavigate}
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="font-semibold mb-2">🔍 Quick Database Access</h3>
              <p className="text-sm text-muted-foreground">
                Click on any database below to search directly. You can also use the search button in the navbar for quick access to NCBI, UniProt, PDB, and more!
              </p>
            </div>
            
            {/* Database Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'NCBI GenBank', desc: 'Nucleotide sequence database', icon: '🧬', url: 'https://www.ncbi.nlm.nih.gov/', color: 'bg-blue-500' },
                { name: 'UniProt', desc: 'Protein sequence database', icon: '🔬', url: 'https://www.uniprot.org/', color: 'bg-green-500' },
                { name: 'PDB', desc: 'Protein Data Bank structures', icon: '📐', url: 'https://www.rcsb.org/', color: 'bg-purple-500' },
                { name: 'Ensembl', desc: 'Genome annotation database', icon: '🎯', url: 'https://ensembl.org/', color: 'bg-orange-500' },
                { name: 'KEGG', desc: 'Pathway and gene database', icon: '🗺️', url: 'https://www.genome.jp/kegg/', color: 'bg-teal-500' },
                { name: 'PubMed', desc: 'Biomedical literature', icon: '📚', url: 'https://pubmed.ncbi.nlm.nih.gov/', color: 'bg-red-500' },
                { name: 'ClinVar', desc: 'Clinical variants database', icon: '🏥', url: 'https://www.ncbi.nlm.nih.gov/clinvar/', color: 'bg-pink-500' },
                { name: 'dbSNP', desc: 'Single nucleotide polymorphisms', icon: '🧪', url: 'https://www.ncbi.nlm.nih.gov/snp/', color: 'bg-indigo-500' },
                { name: 'AlphaFold DB', desc: 'Predicted protein structures', icon: '🤖', url: 'https://alphafold.ebi.ac.uk/', color: 'bg-cyan-500' },
              ].map((db, i) => (
                <a
                  key={i}
                  href={db.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-xl border bg-card hover:shadow-lg hover:border-biored/30 transition-all group no-underline"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{db.icon}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${db.color} text-white`}>
                      External
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-biored transition-colors">{db.name}</h3>
                  <p className="text-sm text-muted-foreground">{db.desc}</p>
                  <button className="mt-4 text-sm text-biored hover:text-biored-dark font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open Database →
                  </button>
                </a>
              ))}
            </div>
          </div>
        </DashboardLayout>

        
        {/* Sticky Footer */}
        <footer className="mt-auto border-t bg-card py-4 px-6 text-center text-sm text-muted-foreground">
          <p>Developed by <span className="font-semibold text-biored">CBSH, RPCAU</span></p>
          <p className="text-xs mt-1">by Toufik Mahata</p>
        </footer>
      </main>
    )
  }

  // Render Documentation Page
  if (currentView === 'documentation') {
    return (
      <>
        <DocumentationSection onBack={handleGoHome} />
      </>
    )
  }

  // Render Tutorials Page
  if (currentView === 'tutorials') {
    return (
      <>
        <TutorialsSection onBack={handleGoHome} />
      </>
    )
  }

  // Render Support/Buy Me Coffee Page
  if (currentView === 'coffee') {
    return (
      <>
        <SupportPage onBack={handleGoHome} />
      </>
    )
  }

  // Render About Creator Page
  if (currentView === 'about') {
    return (
      <>
        <AboutCreator onBack={handleGoHome} />
      </>
    )
  }

  // Render Settings Page
  if (currentView === 'settings') {
    return (
      <>
        <SettingsSection onBack={() => handleNavigate('dashboard')} />
      </>
    )
  }

  // Fallback - return landing if view not recognized
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar onNavigate={handleNavigate} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
          <Button onClick={handleGoHome} className="bg-biored hover:bg-biored-dark text-white cursor-pointer">
            Go Home
          </Button>
        </div>
      </div>
      <FooterSection />
    </main>
  )
}
