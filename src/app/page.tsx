'use client'

import { useState, useCallback } from 'react'
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
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import ToolsCatalog from '@/components/dashboard/tools-catalog'
import FileUpload from '@/components/dashboard/file-upload'
import AIAssistant from '@/components/dashboard/ai-assistant'
import { Button } from '@/components/ui/button'
import SequenceAnalysisTool from '@/components/tools/sequence-analysis'

type ViewType = 'landing' | 'dashboard' | 'tools' | 'analysis' | 'upload'

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('landing')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const handleNavigate = useCallback((view: ViewType) => {
    setCurrentView(view)
    window.scrollTo(0, 0)
  }, [])

  const handleToolSelect = useCallback((toolId: string) => {
    setSelectedTool(toolId)
    setCurrentView('analysis')
    window.scrollTo(0, 0)
  }, [])

  // Render Landing Page
  if (currentView === 'landing') {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar onNavigate={handleNavigate} />
        
        {/* Hero Section */}
        <section id="hero">
          <HeroSection onStartClick={() => handleNavigate('dashboard')} />
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
          <ToolsShowcase onLaunchTool={(toolId) => handleToolSelect(toolId)} />
        </section>

        {/* Research Workflow */}
        <section id="workflow" className="py-24 relative">
          <WorkflowSection onStartClick={() => handleNavigate('dashboard')} />
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
                    className="px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
                    onClick={() => handleNavigate('dashboard')}
                  >
                    Get Started Free
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
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

        {/* AI Assistant - Always Available */}
        <AIAssistant />
      </main>
    )
  }

  // Render Dashboard View
  if (currentView === 'dashboard') {
    return (
      <main className="min-h-screen">
        <DashboardLayout
          title="Dashboard"
          subtitle="Welcome back! Here's your research overview."
          breadcrumbs={[{ label: 'Home', href: '#' }, { label: 'Dashboard' }]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleNavigate('upload')}>
                Upload Files
              </Button>
              <Button onClick={() => handleNavigate('tools')}>
                Browse Tools
              </Button>
            </div>
          }
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
                <div key={i} className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
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
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
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
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-primary/5 hover:border-primary/30 transition-colors text-left"
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

        <AIAssistant />
      </main>
    )
  }

  // Render Tools Catalog
  if (currentView === 'tools') {
    return (
      <main className="min-h-screen">
        <DashboardLayout
          title="Tools Catalog"
          subtitle="Browse and launch 84+ bioinformatics tools"
          breadcrumbs={[{ label: 'Home', href: '#' }, { label: 'Tools' }]}
          actions={
            <Button variant="outline" onClick={() => handleNavigate('landing')}>
              Back to Home
            </Button>
          }
        >
          <ToolsCatalog onToolSelect={handleToolSelect} />
        </DashboardLayout>

        <AIAssistant />
      </main>
    )
  }

  // Render Tool Analysis Page
  if (currentView === 'analysis') {
    return (
      <main className="min-h-screen">
        <DashboardLayout
          title={selectedTool ? `${selectedTool} Analysis` : 'Sequence Analysis'}
          subtitle="Perform comprehensive sequence analysis"
          breadcrumbs={[
            { label: 'Home', href: '#' },
            { label: 'Tools', href: '#', onClick: () => handleNavigate('tools') },
            { label: selectedTool || 'Analysis', href: '#' }
          ]}
          actions={
            <Button variant="outline" onClick={() => handleNavigate('tools')}>
              ← All Tools
            </Button>
          }
        >
          <SequenceAnalysisTool />
        </DashboardLayout>

        <AIAssistant />
      </main>
    )
  }

  // Render File Upload Page
  if (currentView === 'upload') {
    return (
      <main className="min-h-screen">
        <DashboardLayout
          title="File Upload"
          subtitle="Upload your bioinformatics data files"
          breadcrumbs={[
            { label: 'Home', href: '#' },
            { label: 'Upload', href: '#' }
          ]}
          actions={
            <Button variant="outline" onClick={() => handleNavigate('dashboard')}>
              ← Dashboard
            </Button>
          }
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <FileUpload showFullOptions={true} />
            
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
                    <p className="text-xs font-medium text-primary mb-2">{group.category}</p>
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

        <AIAssistant />
      </main>
    )
  }

  return null
}
