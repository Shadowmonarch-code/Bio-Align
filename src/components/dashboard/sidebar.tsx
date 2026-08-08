"use client"

import * as React from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Navigation icons - Existing + New
import {
  LayoutDashboard,
  Wrench,
  FolderKanban,
  Database,
  Dna,
  Microscope,
  CircleDot,
  FlaskConical,
  TreePine,
  Atom,
  Scissors,
  TestTube,
  Settings,
  BookOpen,
  PanelLeftClose,
  PanelLeft,
  // Bioinformatics icons
  Search,
  Layers,
  Target,
  // Plant Breeding icons
  Leaf,
  Sprout,
  Wheat,
  Flower2,
  Beaker,
  Calculator,
  GitBranch,
  Network,
  Grid3X3,
  ListChecks,
  Activity,
  TrendingUp,
  // Visualization icons
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  // AI & Thesis icons
  Brain,
  GraduationCap,
  FileText,
  PenTool,
  Table2,
  Lightbulb,
  ClipboardList,
  Presentation,
  Globe,
  ImagePlus,
  Workflow,
  Zap,
  Sparkles,
} from "lucide-react"

// Types
interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
  icon: React.ComponentType<{ className?: string }>
  color?: string
  emoji?: string
}

interface NestedNavGroup {
  title: string
  items: NavItem[]
}

/**
 * Extracts view name and optional toolId from an href
 * Maps URL paths to internal view names for navigation
 */
function getNavigationTarget(href: string): { view: string; toolId?: string } {
  // Tool items - map to analysis view with toolId
  if (href.startsWith("/dashboard/tools/")) {
    const toolId = href.replace("/dashboard/tools/", "")
    return { view: "analysis", toolId }
  }

  // Plant Breeding section - all map to plant-breeding view
  if (href.startsWith("/plant-breeding")) {
    return { view: "plant-breeding" }
  }

  // Bioinformatics section - map to analysis view with toolId
  if (href.startsWith("/bioinformatics")) {
    const toolId = href.replace("/bioinformatics/", "")
    return { view: "analysis", toolId }
  }

  // Thesis Studio section - map to thesis view
  if (href.startsWith("/thesis")) {
    return { view: "thesis" }
  }

  // Visualization section - could map to a visualization view or tools
  if (href.startsWith("/visualization")) {
    const toolId = href.replace("/visualization/", "")
    return { view: "analysis", toolId: `viz-${toolId}` }
  }

  // Main navigation items
  switch (href) {
    case "/dashboard":
      return { view: "dashboard" }
    case "/analyze-data":
      return { view: "analyze-data" }
    case "/dashboard/workspaces":
    case "/dashboard/projects":
      return { view: "workspaces" }
    case "/dashboard/databases":
      return { view: "databases" }
    case "/docs":
      return { view: "documentation" }
    case "/dashboard/settings":
      return { view: "settings" }
    case "/dashboard/workflows":
      return { view: "workspaces" }
    default:
      // Fallback: try to extract meaningful view name
      const path = href.replace(/^\//, "")
      // Map common patterns
      if (path.startsWith("plant-breeding")) return { view: "plant-breeding" }
      if (path.startsWith("bioinformatics")) return { view: "analysis", toolId: path.replace("bioinformatics/", "") }
      if (path.startsWith("thesis")) return { view: "thesis" }
      return { view: "dashboard" }
  }
}

// ==================== NAVIGATION DATA ====================

// Main Navigation Items
const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Analyze My Data", href: "/analyze-data", icon: Sparkles, isActive: true },
  { title: "Projects", href: "/dashboard/projects", icon: FolderKanban },
]

// Bioinformatics Tools Section
const bioinformaticsNavItems: NavItem[] = [
  { title: "Sequence Analysis", href: "/bioinformatics/sequence", icon: Dna },
  { title: "Alignment", href: "/bioinformatics/alignment", icon: Layers },
  { title: "BLAST Search", href: "/bioinformatics/blast", icon: Search },
  { title: "Phylogenetics", href: "/bioinformatics/phylogenetics", icon: TreePine },
  { title: "Protein Analysis", href: "/bioinformatics/protein", icon: Microscope },
  { title: "Structural Biology", href: "/bioinformatics/structure", icon: Atom },
  { title: "Genomics", href: "/bioinformatics/genomics", icon: CircleDot },
  { title: "Transcriptomics", href: "/bioinformatics/transcriptomics", icon: FlaskConical },
  { title: "Proteomics", href: "/bioinformatics/proteomics", icon: TestTube },
  { title: "Metagenomics", href: "/bioinformatics/metagenomics", icon: Globe },
  { title: "Molecular Docking", href: "/bioinformatics/docking", icon: Target },
  { title: "Biological Databases", href: "/bioinformatics/databases", icon: Database },
]

// Experimental Design Sub-section for Plant Breeding
const experimentalDesignItems: NavItem[] = [
  { title: "CRD Analysis", href: "/plant-breeding/experimental-design/crd", icon: Grid3X3 },
  { title: "RCBD Analysis", href: "/plant-breeding/experimental-design/rcbd", icon: Grid3X3 },
  { title: "Factorial Design", href: "/plant-breeding/experimental-design/factorial", icon: Network },
]

// Plant Breeding Tools Section
const plantBreedingNavItems: (NavItem | NestedNavGroup)[] = [
  { title: "Genetic Parameters", href: "/plant-breeding/genetic-params", icon: Calculator },
  { 
    title: "Experimental Design", 
    href: "/plant-breeding/experimental-design", 
    icon: Beaker,
  } as NavItem,
  { title: "Quantitative Genetics", href: "/plant-breeding/quantitative-genetics", icon: TrendingUp },
  { title: "Correlation & Regression", href: "/plant-breeding/correlation", icon: TrendingUp },
  { title: "Path Analysis", href: "/plant-breeding/path-analysis", icon: GitBranch },
  { title: "Selection Index", href: "/plant-breeding/selection-index", icon: ListChecks },
  { title: "G×E Interaction", href: "/plant-breeding/gxe", icon: Activity },
  { title: "AMMI Analysis", href: "/plant-breeding/ammi", icon: LineChart },
  { title: "GGE Biplot", href: "/plant-breeding/gge-biplot", icon: ScatterChart },
  { title: "Diversity Analysis", href: "/plant-breeding/diversity", icon: Network },
  { title: "Molecular Breeding", href: "/plant-breeding/molecular-breeding", icon: Dna },
  { title: "Population Genetics", href: "/plant-breeding/population-genetics", icon: Dna },
]

// Thesis Studio Items
const thesisNavItems: NavItem[] = [
  { title: "Dataset Manager", href: "/thesis/datasets", icon: Database },
  { title: "Statistical Analysis", href: "/thesis/statistics", icon: BarChart3 },
  { title: "Visualization Studio", href: "/thesis/visualization", icon: PieChart },
  { title: "Figure Generator", href: "/thesis/figures", icon: ImagePlus },
  { title: "Table Generator", href: "/thesis/tables", icon: Table2 },
  { title: "Research Notes", href: "/thesis/notes", icon: PenTool },
  { title: "Report Builder", href: "/thesis/reports", icon: FileText },
]

// Visualization Items
const visualizationNavItems: NavItem[] = [
  { title: "Scientific Charts", href: "/visualization/charts", icon: BarChart3 },
  { title: "Biological Diagrams", href: "/visualization/diagrams", icon: Atom },
  { title: "Networks & Graphs", href: "/visualization/networks", icon: Network },
  { title: "Genome Browser", href: "/visualization/genome-browser", icon: Globe },
  { title: "Protein Viewer", href: "/visualization/protein-viewer", icon: Microscope },
  { title: "Publication Figures", href: "/visualization/publication-figures", icon: Presentation },
]

// Other Navigation Items
const otherNavItems: NavItem[] = [
  { title: "Workflows", href: "/dashboard/workflows", icon: Workflow },
  { title: "Documentation", href: "/docs", icon: BookOpen },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

// ==================== SECTION DEFINITIONS ====================

interface SectionDefinition {
  id: string
  title: string
  emoji: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  items: NavItem[]
  nestedGroups?: { [key: string]: NavItem[] }
}

const collapsibleSections: SectionDefinition[] = [
  {
    id: "bioinformatics",
    title: "Bioinformatics",
    emoji: "🧬",
    icon: Dna,
    color: "#10B981",
    items: bioinformaticsNavItems,
  },
  {
    id: "plant-breeding",
    title: "Plant Breeding",
    emoji: "🌱",
    icon: Leaf,
    color: "#22C55E",
    items: plantBreedingNavItems as NavItem[],
    nestedGroups: {
      "Experimental Design": experimentalDesignItems,
    },
  },
  {
    id: "thesis-studio",
    title: "Thesis Studio",
    emoji: "📊",
    icon: GraduationCap,
    color: "#6366F1",
    items: thesisNavItems,
  },
  {
    id: "visualization",
    title: "Visualization",
    emoji: "📈",
    icon: BarChart3,
    color: "#F59E0B",
    items: visualizationNavItems,
  },
]

// ==================== SIDEBAR CONTENT COMPONENT ====================

interface SidebarContentProps {
  collapsed: boolean
  activeItem: string
  openSections: Record<string, boolean>
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  onNavigate?: (view: string, toolId?: string) => void
}

function SidebarContent({
  collapsed,
  activeItem,
  openSections,
  setOpenSections,
  onNavigate,
}: SidebarContentProps) {
  const { 
    isAuthenticated,
    userDisplayName, 
    userEmail, 
    userInitials,
  } = useUser()

  // Handle navigation click
  const handleNavClick = React.useCallback(
    (href: string) => {
      if (onNavigate) {
        const { view, toolId } = getNavigationTarget(href)
        onNavigate(view, toolId)
      }
    },
    [onNavigate]
  )

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const renderNavItem = (item: NavItem, isSubItem = false, sectionColor?: string) => {
    const isActive = item.href === activeItem || item.isActive
    
    if (collapsed && !isSubItem) {
      return (
        <Tooltip key={item.title}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={isSubItem ? "sm" : "default"}
              className={cn(
                "w-full justify-center relative",
                isSubItem ? "h-8 px-2" : "h-10",
                isActive && sectionColor 
                  ? `bg-[${sectionColor}]/10 hover:bg-[${sectionColor}]/15` 
                  : isActive && "bg-biored/10 text-biored hover:bg-biored/15 hover:text-biored",
                !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={() => handleNavClick(item.href)}
            >
              <item.icon className={cn(
                "size-4 shrink-0", 
                isActive && (sectionColor ? `text-[${sectionColor}]` : "text-biored")
              )} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.title}
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <Button
        key={item.title}
        variant="ghost"
        size={isSubItem ? "sm" : "default"}
        className={cn(
          "w-full justify-start gap-3 relative",
          isSubItem ? "h-8 pl-7 text-sm" : "h-10 px-3",
          isActive && sectionColor
            ? `bg-[${sectionColor}]/10 text-[${sectionColor}] hover:bg-[${sectionColor}]/15 font-medium`
            : isActive && "bg-biored/10 text-biored hover:bg-biored/15 hover:text-biored font-medium",
          !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
        onClick={() => handleNavClick(item.href)}
      >
        {isActive && (
          <motion.div
            layoutId={`activeIndicator-${item.title}`}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
            style={{ backgroundColor: sectionColor || 'var(--biored)' }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        <item.icon className={cn(
          "size-4 shrink-0", 
          isActive && (sectionColor || "text-biored")
        )} />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.title}
          </motion.span>
        )}
      </Button>
    )
  }

  const renderCollapsibleSection = (section: SectionDefinition) => {
    const isOpen = openSections[section.id] ?? false
    const hasNestedGroups = section.nestedGroups && Object.keys(section.nestedGroups).length > 0

    if (collapsed) {
      return (
        <div key={section.id} className="space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="default"
                className="w-full justify-center h-10 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => toggleSection(section.id)}
              >
                <span style={{ color: section.color }} className="size-4 flex items-center justify-center">
                  <section.icon className="size-4" />
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span className="flex items-center gap-2">
                <span>{section.emoji}</span>
                <span>{section.title}</span>
              </span>
            </TooltipContent>
          </Tooltip>
        </div>
      )
    }

    return (
      <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="default"
            className="w-full justify-between h-10 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group"
          >
            <div className="flex items-center gap-3">
              <span style={{ color: section.color }} className="size-4 shrink-0 flex items-center justify-center transition-colors group-hover:opacity-80">
                <section.icon 
                  className="size-4" 
                />
              </span>
              <span className="font-medium">{section.emoji} {section.title}</span>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="size-4 opacity-50" />
            </motion.div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-0.5 pl-2">
              {section.items.map((item) => {
                // Check if this item has a nested group
                const nestedKey = Object.keys(section.nestedGroups || {}).find(
                  key => item.href.includes(key.toLowerCase().replace(/\s+/g, "-"))
                )
                
                if (nestedKey && section.nestedGroups) {
                  const nestedItems = section.nestedGroups[nestedKey]
                  const isNestedOpen = openSections[`${section.id}-${nestedKey}`] ?? false
                  
                  return (
                    <Collapsible key={item.title} open={isNestedOpen} onOpenChange={() => 
                      setOpenSections(prev => ({ ...prev, [`${section.id}-${nestedKey}`]: !isNestedOpen }))
                    }>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between h-8 pl-6 pr-3 text-sm hover:bg-sidebar-accent/50"
                        >
                          <div className="flex items-center gap-2">
                            <span style={{ color: section.color }} className="size-3.5 flex items-center justify-center">
                              <item.icon className="size-3.5" />
                            </span>
                            <span>{item.title}</span>
                          </div>
                          <motion.div
                            animate={{ rotate: isNestedOpen ? 90 : 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <ChevronRight className="size-3 opacity-50" />
                          </motion.div>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="py-1 space-y-0.5 pl-4">
                            {nestedItems.map((nestedItem) => 
                              renderNavItem(nestedItem, true, section.color)
                            )}
                          </div>
                        </motion.div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                }
                
                return renderNavItem(item, true, section.color)
              })}
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className={cn(
        "flex items-center h-16 border-b border-sidebar-border px-4",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-biored to-biored-dark shadow-lg shadow-biored/25">
          <Dna className="size-5 text-white" />
        </div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="text-lg font-bold tracking-tight gradient-text">BioAlign</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-2">
                Main
              </p>
            )}
            {mainNavItems.map((item) => renderNavItem(item))}
          </div>

          {/* Separator after main */}
          <Separator className="bg-sidebar-border/50" />

          {/* Collapsible Sections */}
          {collapsibleSections.map((section) => (
            <div key={section.id} className="space-y-1">
              {renderCollapsibleSection(section)}
            </div>
          ))}

          {/* Separator before other */}
          <Separator className="bg-sidebar-border/50" />

          {/* AI Assistant - Special standalone item */}
          <div className="space-y-1">
            {renderNavItem(
              { 
                title: "AI Assistant", 
                href: "/ai-assistant", 
                icon: Brain 
              }, 
              false, 
              "#A855F7"
            )}
          </div>

          {/* Other Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-2 mt-4">
                System
              </p>
            )}
            {otherNavItems.map((item) => renderNavItem(item))}
          </div>
        </div>
      </ScrollArea>

      {/* User Profile Section - Only show when authenticated */}
      <Separator className="bg-sidebar-border" />
      {isAuthenticated ? (
        <div className={cn(
          "flex items-center h-16 px-4 border-t border-sidebar-border",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <Avatar className="size-9 ring-2 ring-biored/20">
            <AvatarImage src={undefined} alt={userDisplayName} />
            <AvatarFallback className="bg-biored/10 text-biored text-sm font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden whitespace-nowrap"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{userDisplayName}</span>
                  <span className="text-xs text-muted-foreground mt-0.5 truncate max-w-[150px]">
                    {userEmail}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className={cn(
          "flex items-center h-16 px-4 border-t border-sidebar-border justify-center",
        )}>
          <span className="text-xs text-muted-foreground">Not signed in</span>
        </div>
      )}
    </div>
  )
}

// ==================== DESKTOP SIDEBAR COMPONENT ====================

export function DashboardSidebar({
  collapsed = false,
  onToggle,
  activeItem = "/dashboard",
  onNavigate,
}: {
  collapsed?: boolean
  onToggle?: () => void
  activeItem?: string
  onNavigate?: (view: string, toolId?: string) => void
}) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    bioinformatics: false,
    "plant-breeding": false,
    "thesis-studio": false,
    visualization: false,
  })

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 300 }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 30,
        }}
        className="fixed left-0 top-0 z-40 h-screen glass border-r border-border/50 flex flex-col overflow-hidden"
      >
        <SidebarContent
          collapsed={collapsed}
          activeItem={activeItem}
          openSections={openSections}
          setOpenSections={setOpenSections}
          onNavigate={onNavigate}
        />

        {/* Collapse Toggle Button */}
        <div className="absolute -right-3 top-20 z-50">
          <Button
            onClick={onToggle}
            size="icon"
            variant="outline"
            className="size-6 rounded-full bg-background border shadow-md hover:bg-accent"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {collapsed ? (
                <ChevronLeft className="size-3" />
              ) : (
                <ChevronRight className="size-3" />
              )}
            </motion.div>
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}

// ==================== MOBILE SIDEBAR COMPONENT ====================

export function MobileSidebar({
  open,
  onClose,
  activeItem = "/dashboard",
  onNavigate,
}: {
  open: boolean
  onClose: () => void
  activeItem?: string
  onNavigate?: (view: string, toolId?: string) => void
}) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    bioinformatics: false,
    "plant-breeding": false,
    "thesis-studio": false,
    visualization: false,
  })

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="left" className="w-80 p-0 glass">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <SidebarContent
          collapsed={false}
          activeItem={activeItem}
          openSections={openSections}
          setOpenSections={setOpenSections}
          onNavigate={onNavigate}
        />
      </SheetContent>
    </Sheet>
  )
}

// ==================== SIDEBAR STATE HOOK ====================

export function useSidebarState() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const isMobile = useIsMobile()

  const toggle = React.useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev)
    } else {
      setCollapsed((prev) => !prev)
    }
  }, [isMobile])

  return {
    collapsed,
    setCollapsed,
    mobileOpen,
    setMobileOpen,
    isMobile,
    toggle,
  }
}

export default DashboardSidebar
