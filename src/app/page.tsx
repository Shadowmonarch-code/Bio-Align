'use client'

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react'

import Navbar from '@/components/landing/navbar'
import HeroSection from '@/components/landing/hero'
import FeaturesSection from '@/components/landing/features'
import ToolsShowcase from '@/components/landing/tools-showcase'
import HowToUseGuide from '@/components/landing/how-to-use'
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
import {
  SectionNav,
  BackToTopLink,
} from '@/components/ui/section-nav'

import { SequenceAnalysisModule } from '@/components/tools/sequence-analysis'
import AlignmentModule from '@/components/tools/alignment'
import BlastSearchModule from '@/components/tools/blast'
import PhylogeneticsModule from '@/components/tools/phylogenetics'
import ProteinAnalysisModule from '@/components/tools/protein-analysis'
import StructuralBiologyModule from '@/components/tools/structural-biology'
import GenomicsModule from '@/components/tools/genomics'
import MolecularDockingModule from '@/components/tools/molecular-docking'

import DatasetManager from '@/components/dataset/dataset-manager'
import PlantBreedingModule from '@/components/plant-breeding/plant-breeding-module'
import ThesisStudio from '@/components/thesis/thesis-studio'
import AnalyzeMyData from '@/components/ai/analyze-my-data'

import { ErrorBoundary } from '@/components/error-boundary'


// ============================================================
// VIEW TYPES
// ============================================================

type ViewType =
  | 'landing'
  | 'dashboard'
  | 'tools'
  | 'analysis'
  | 'upload'
  | 'databases'
  | 'settings'
  | 'documentation'
  | 'tutorials'
  | 'coffee'
  | 'about'
  | 'workspaces'
  | 'dataset'
  | 'plant-breeding'
  | 'thesis'
  | 'analyze-data'


export default function Home() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [currentView, setCurrentView] =
    useState<ViewType>('landing')

  const [selectedTool, setSelectedTool] =
    useState<string | null>(null)

  const [selectedPlantBreedingTool, setSelectedPlantBreedingTool] =
    useState<string>('genetic-params')


  // ==========================================================
  // MOBILE / BROWSER BACK NAVIGATION
  // ==========================================================

  const viewHistoryRef = useRef<ViewType[]>(['landing'])

  const isHandlingBackRef = useRef(false)


  /**
   * Push a new view into browser history.
   *
   * This makes Android/iOS browser gesture-back work
   * correctly inside the SPA.
   */
  const pushToHistory = useCallback(
    (view: ViewType) => {

      if (isHandlingBackRef.current) {
        return
      }

      const history = viewHistoryRef.current

      const lastView =
        history[history.length - 1]

      // Don't create duplicate history entries
      if (view === lastView) {
        return
      }

      history.push(view)

      window.history.pushState(
        {
          __bioalign_view: view,
        },
        '',
        window.location.pathname
      )
    },
    []
  )


  /**
   * Handle browser back button and mobile
   * swipe-back gesture.
   */
  useEffect(() => {

    const handlePopState = () => {

      if (isHandlingBackRef.current) {
        return
      }

      isHandlingBackRef.current = true

      setTimeout(() => {
        isHandlingBackRef.current = false
      }, 50)


      const history =
        viewHistoryRef.current


      // If there is an internal page to go back to
      if (history.length > 1) {

        // Remove current page
        history.pop()

        const previousView =
          history[history.length - 1]

        setCurrentView(previousView)

        window.scrollTo({
          top: 0,
          behavior: 'instant',
        })

        return
      }

      // At landing page.
      // Browser is allowed to handle the back action.
    }


    window.addEventListener(
      'popstate',
      handlePopState
    )


    // Initialize browser history state
    window.history.replaceState(
      {
        __bioalign_view: 'landing',
      },
      '',
      window.location.pathname
    )


    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      )
    }

  }, [])


  // ==========================================================
  // MAIN NAVIGATION
  // ==========================================================

  const handleNavigate = useCallback(
    (view: string) => {

      const nextView =
        view as ViewType

      pushToHistory(nextView)

      setCurrentView(nextView)

      window.scrollTo({
        top: 0,
        behavior: 'instant',
      })
    },
    [pushToHistory]
  )


  // ==========================================================
  // TOOL SELECTION
  // ==========================================================

  const handleToolSelect = useCallback(
    (toolId: string) => {

      if (toolId === 'all') {

        pushToHistory('tools')

        setCurrentView('tools')

      } else {

        setSelectedTool(toolId)

        pushToHistory('analysis')

        setCurrentView('analysis')
      }

      window.scrollTo({
        top: 0,
        behavior: 'instant',
      })
    },
    [pushToHistory]
  )


  // ==========================================================
  // SIDEBAR NAVIGATION
  // ==========================================================

  const handleSidebarNavigate = useCallback(
    (
      view: string,
      toolId?: string
    ) => {

      // ------------------------------------------------------
      // Tool navigation
      // ------------------------------------------------------

      if (toolId) {

        setSelectedTool(toolId)

        pushToHistory('analysis')

        setCurrentView('analysis')

      }

      // ------------------------------------------------------
      // Plant Breeding navigation
      // ------------------------------------------------------

      else if (
        view === 'plant-breeding' ||
        view.startsWith('/plant-breeding')
      ) {

        const pbToolMatch =
          view.match(
            /\/plant-breeding\/(.+)/
          )


        if (
          pbToolMatch &&
          pbToolMatch[1]
        ) {

          const toolPath =
            pbToolMatch[1]


          const pathToTabMap:
            Record<string, string> = {

            'genetic-params':
              'genetic-params',

            'experimental-design':
              'experimental-design',

            'crd':
              'experimental-design',

            'rcbd':
              'experimental-design',

            'factorial':
              'experimental-design',

            'quantitative-genetics':
              'quantitative-genetics',

            'correlation':
              'correlation-regression',

            'path-analysis':
              'path-analysis',

            'selection-index':
              'selection-index',

            'gxe':
              'gxe-interaction',

            'gxe-interaction':
              'gxe-interaction',

            'ammi':
              'ammi-analysis',

            'ammi-analysis':
              'ammi-analysis',

            'gge-biplot':
              'gge-biplot',

            'diversity':
              'diversity-analysis',

            'molecular-breeding':
              'molecular-breeding',

            'population-genetics':
              'population-genetics',
          }


          const tabId =
            pathToTabMap[toolPath] ||
            toolPath


          setSelectedPlantBreedingTool(
            tabId
          )
        }


        pushToHistory(
          'plant-breeding'
        )

        setCurrentView(
          'plant-breeding'
        )
      }

      // ------------------------------------------------------
      // Normal page navigation
      // ------------------------------------------------------

      else {

        const nextView =
          view as ViewType

        pushToHistory(nextView)

        setCurrentView(nextView)
      }


      window.scrollTo({
        top: 0,
        behavior: 'instant',
      })
    },
    [pushToHistory]
  )


  // ==========================================================
  // GO HOME
  // ==========================================================

  const handleGoHome = useCallback(
    () => {

      pushToHistory('landing')

      setCurrentView('landing')

      window.scrollTo({
        top: 0,
        behavior: 'instant',
      })
    },
    [pushToHistory]
  )


  // ==========================================================
  // RENDER LANDING PAGE
  // ==========================================================

  if (currentView === 'landing') {
    return (
      <main className="min-h-screen flex flex-col">

        <Navbar
          onNavigate={handleNavigate}
        />

        {/* Hero Section */}
        <section
          id="hero"
          className="relative"
        >
          <HeroSection
            onStartClick={() =>
              handleNavigate('dashboard')
            }
            onExploreClick={() =>
              handleNavigate('tools')
            }
          />
        </section>


        {/* Partners */}
        <section
          id="partners"
          className="py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <PartnersSection />

            <div className="flex justify-end mt-4">
              <BackToTopLink />
            </div>

          </div>
        </section>


        {/* Features */}
        <section
          id="features"
          className="py-24 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <FeaturesSection
              onExploreClick={() =>
                handleNavigate('tools')
              }
            />

            <div className="flex justify-end mt-8 pt-6 border-t border-border/50">
              <BackToTopLink />
            </div>

          </div>
        </section>


        {/* Popular Tools */}
        <section
          id="tools"
          className="py-24 relative overflow-hidden"
        >
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <ToolsShowcase
              onLaunchTool={handleToolSelect}
            />

            <div className="flex justify-end mt-8 pt-6 border-t border-border/50">
              <BackToTopLink />
            </div>

          </div>
        </section>


        {/* How To Use */}
        <section
          id="how-to-use"
          className="py-24 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <HowToUseGuide />

            <div className="flex justify-end mt-8 pt-6 border-t border-border/50">
              <BackToTopLink />
            </div>

          </div>
        </section>


        {/* Research Workflow */}
        <section
          id="workflow"
          className="py-24 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <WorkflowSection
              onStartClick={() =>
                handleNavigate('dashboard')
              }
            />

            <div className="flex justify-end mt-8 pt-6 border-t border-border/50">
              <BackToTopLink />
            </div>

          </div>
        </section>


        {/* About Creator */}
        <section
          id="about"
          className="py-24 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <AboutCreator
              onBack={handleGoHome}
            />

            <div className="flex justify-end mt-8 pt-6 border-t border-border/50">
              <BackToTopLink />
            </div>

          </div>
        </section>


        {/* Statistics */}
        <section
          id="statistics"
          className="py-24 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <StatisticsSection />

            <div className="flex justify-end mt-8 pt-6 border-t border-border/50">
              <BackToTopLink />
            </div>

          </div>
        </section>


        {/* Testimonials */}
        <section
          id="testimonials"
          className="py-24 relative"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <TestimonialsSection />

            <div className="flex justify-end mt-8 pt-6 border-t border-border/50">
              <BackToTopLink />
            </div>

          </div>
        </section>


        {/* FAQ */}
        <section
          id="faq"
          className="py-24 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <FAQSection />

            <div className="flex justify-end mt-8 pt-6 border-t border-border/50">
              <BackToTopLink />
            </div>

          </div>
        </section>


        {/* CTA */}
        <section
          id="cta"
          className="py-24 relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div
              className="
                relative
                rounded-3xl
                bg-gradient-to-br
                from-[#051F20]
                via-[#163832]
                to-[#235347]
                dark:from-[#163832]
                dark:via-[#235347]
                dark:to-[#8EB69B]
                p-12
                md:p-20
                text-center
                text-[#DAF1DE]
                dark:text-[#051F20]
                overflow-hidden
              "
            >

              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">

                <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />

                <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />

                <div className="absolute inset-0 scientific-grid opacity-50" />

              </div>


              <div className="relative z-10 space-y-6">

                <h2 className="text-3xl md:text-5xl font-bold">
                  Ready to Accelerate Your Research?
                </h2>


                <p className="text-xl text-[#DAF1DE]/80 dark:text-[#051F20]/80 max-w-2xl mx-auto">
                  Join thousands of scientists who are already using BioAlign to make groundbreaking discoveries.
                </p>


                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">

                  <Button
                    size="lg"
                    className="
                      px-8
                      py-4
                      bg-[#DAF1DE]
                      dark:bg-[#051F20]
                      text-[#163832]
                      dark:text-[#8EB69B]
                      font-semibold
                      rounded-xl
                      hover:bg-white
                      dark:hover:bg-[#0B2B26]
                      transition-all
                      hover:scale-105
                      shadow-lg
                      shadow-[#163832]/25
                      cursor-pointer
                    "
                    onClick={() =>
                      handleNavigate('dashboard')
                    }
                  >
                    Start Analyzing Free
                  </Button>


                  <Button
                    size="lg"
                    variant="outline"
                    className="
                      px-8
                      py-4
                      border-2
                      border-[#DAF1DE]/30
                      dark:border-[#8EB69B]/30
                      text-[#DAF1DE]
                      dark:text-[#8EB69B]
                      font-semibold
                      rounded-xl
                      hover:bg-[#DAF1DE]/10
                      dark:hover:bg-[#8EB69B]/10
                      transition-all
                      cursor-pointer
                    "
                    onClick={() =>
                      handleNavigate('tools')
                    }
                  >
                    Explore All Tools
                  </Button>

                </div>


                <p className="text-sm text-[#DAF1DE]/60 dark:text-[#051F20]/60 pt-2">
                  No credit card required · Free tier available · Setup in 2 minutes
                </p>

              </div>

            </div>

          </div>
        </section>


        {/* Footer */}
        <FooterSection />


        {/* Floating Navigation */}
        <SectionNav
          showIndicator={true}
          scrollThreshold={300}
        />

      </main>
    )
  }


  // ==========================================================
  // KEEP YOUR EXISTING VIEWS BELOW THIS POINT
  // ==========================================================

  // Dashboard
  if (currentView === 'dashboard') {
    return (
      <main className="min-h-screen flex flex-col">

        <DashboardLayout
          title="Dashboard"
          subtitle="Welcome back! Here's your research overview."

          breadcrumbs={[
            {
              label: 'Home',
              href: '#',
              onClick: handleGoHome,
            },
            {
              label: 'Dashboard',
            },
          ]}

          actions={
            <div className="flex gap-2">

              <Button
                variant="outline"
                onClick={handleGoHome}
                className="cursor-pointer"
              >
                ← Back to Home
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  handleNavigate('upload')
                }
                className="cursor-pointer"
              >
                Upload Files
              </Button>

              <Button
                onClick={() =>
                  handleNavigate('tools')
                }
                className="cursor-pointer bg-green-brand dark:bg-red-brand hover:bg-green-hover dark:hover:bg-red-dark text-white"
              >
                Browse Tools
              </Button>

            </div>
          }

          onSidebarNavigate={
            handleSidebarNavigate
          }
        >

          <div className="space-y-8">

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {[
                {
                  title: 'Recent Analyses',
                  value: '12',
                  change: '+3 this week',
                  icon: '📊',
                },
                {
                  title: 'Saved Projects',
                  value: '5',
                  change: '2 active',
                  icon: '📁',
                },
                {
                  title: 'Storage Used',
                  value: '2.4 GB',
                  change: 'of 10 GB',
                  icon: '💾',
                },
                {
                  title: 'API Calls',
                  value: '1,234',
                  change: '-12% vs last week',
                  icon: '🔌',
                },
              ].map((stat, i) => (

                <div
                  key={i}
                  className="
                    p-6
                    rounded-xl
                    border
                    bg-card
                    hover:shadow-md
                    transition-shadow
                    cursor-pointer
                    hover:border-primary/30
                  "
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>

                      <p className="text-2xl font-bold mt-1">
                        {stat.value}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.change}
                      </p>

                    </div>

                    <span className="text-2xl">
                      {stat.icon}
                    </span>

                  </div>

                </div>

              ))}

            </div>


            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Recent Activity */}
              <div className="p-6 rounded-xl border bg-card">

                <h3 className="font-semibold mb-4">
                  Recent Activity
                </h3>

                <div className="space-y-4">

                  {[
                    {
                      action:
                        'BLAST Analysis completed',
                      time:
                        '2 hours ago',
                      type:
                        'success',
                    },
                    {
                      action:
                        'Sequence uploaded: sample.fasta',
                      time:
                        '5 hours ago',
                      type:
                        'info',
                    },
                    {
                      action:
                        'Multiple alignment started',
                      time:
                        '1 day ago',
                      type:
                        'pending',
                    },
                    {
                      action:
                        'GC Content analysis',
                      time:
                        '2 days ago',
                      type:
                        'success',
                    },
                  ].map((activity, i) => (

                    <div
                      key={i}
                      className="
                        flex
                        items-center
                        gap-3
                        p-3
                        rounded-lg
                        bg-muted/50
                        cursor-pointer
                        hover:bg-muted
                        transition-colors
                      "
                    >

                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.type === 'success'
                            ? 'bg-red-500'
                            : activity.type === 'pending'
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                        }`}
                      />

                      <div className="flex-1 min-w-0">

                        <p className="text-sm truncate">
                          {activity.action}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              </div>


              {/* Quick Launch Tools */}
              <div className="p-6 rounded-xl border bg-card">

                <h3 className="font-semibold mb-4">
                  Quick Launch Tools
                </h3>

                <div className="grid grid-cols-2 gap-3">

                  {[
                    {
                      name: 'BLAST Search',
                      icon: '🔍',
                      tool: 'blast',
                    },
                    {
                      name: 'Sequence Align',
                      icon: '🧬',
                      tool: 'align',
                    },
                    {
                      name: 'ORF Finder',
                      icon: '🔎',
                      tool: 'orf',
                    },
                    {
                      name: 'Translate',
                      icon: '🔄',
                      tool: 'translate',
                    },
                    {
                      name: 'GC Content',
                      icon: '📈',
                      tool: 'gc',
                    },
                    {
                      name: 'Primer Design',
                      icon: '🧪',
                      tool: 'primer',
                    },
                  ].map((tool, i) => (

                    <button
                      key={i}
                      onClick={() =>
                        handleToolSelect(tool.tool)
                      }
                      className="
                        flex
                        items-center
                        gap-3
                        p-3
                        rounded-lg
                        border
                        hover:bg-primary/5
                        hover:border-primary/30
                        transition-colors
                        text-left
                        cursor-pointer
                      "
                    >

                      <span>
                        {tool.icon}
                      </span>

                      <span className="text-sm font-medium">
                        {tool.name}
                      </span>

                    </button>

                  ))}

                </div>

              </div>

            </div>


            {/* File Upload */}
            <div className="p-6 rounded-xl border bg-card">

              <h3 className="font-semibold mb-4">
                Upload New Data
              </h3>

              <FileUpload />

            </div>

          </div>

        </DashboardLayout>


        <footer className="mt-auto border-t bg-card py-4 px-6 text-center text-sm text-muted-foreground">

          <p>
            Developed by{' '}
            <span className="font-semibold text-green-brand dark:text-red-brand">
              CBSH, RPCAU
            </span>
          </p>

          <p className="text-xs mt-1">
            by Toufik Mahata & Dr. Nitesh Kumar Sharma
          </p>

        </footer>

      </main>
    )
  }


  // ==========================================================
  // IMPORTANT:
  // Keep the rest of your original views here:
  //
  // workspaces
  // tools
  // analysis
  // upload
  // databases
  // documentation
  // tutorials
  // coffee
  // about
  // settings
  // plant-breeding
  // dataset
  // thesis
  // analyze-data
  //
  // They do not need the duplicate hook block.
  // ==========================================================


  // Fallback
  return (
    <main className="min-h-screen flex flex-col">

      <Navbar
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex items-center justify-center">

        <div className="text-center space-y-4">

          <h1 className="text-2xl font-bold">
            Page Not Found
          </h1>

          <p className="text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>

          <Button
            onClick={handleGoHome}
            className="
              bg-green-brand
              dark:bg-red-brand
              hover:bg-green-hover
              dark:hover:bg-red-dark
              text-white
              cursor-pointer
            "
          >
            Go Home
          </Button>

        </div>

      </div>

      <FooterSection />

    </main>
  )
}
