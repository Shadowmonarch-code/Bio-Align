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

// Navigation icons
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

  // Main navigation items
  switch (href) {
    case "/dashboard":
      return { view: "dashboard" }
    case "/dashboard/workspaces":
      return { view: "workspaces" }
    case "/dashboard/databases":
      return { view: "databases" }
    case "/docs":
      return { view: "documentation" }
    case "/dashboard/settings":
      return { view: "settings" }
    default:
      // Fallback: use the path as view name
      return { view: href.replace(/^\//, "") }
  }
}

// Navigation data
const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, isActive: true },
  { title: "Workspaces", href: "/dashboard/workspaces", icon: FolderKanban },
  { title: "Databases", href: "/dashboard/databases", icon: Database },
]

const toolsNavItems: NavItem[] = [
  { title: "Sequence Analysis", href: "/dashboard/tools/sequence", icon: Dna },
  { title: "Protein Analysis", href: "/dashboard/tools/protein", icon: Microscope },
  { title: "Genomics", href: "/dashboard/tools/genomics", icon: CircleDot },
  { title: "Transcriptomics", href: "/dashboard/tools/transcriptomics", icon: FlaskConical },
  { title: "Phylogenetics", href: "/dashboard/tools/phylogenetics", icon: TreePine },
  { title: "Molecular Docking", href: "/dashboard/tools/docking", icon: Atom },
  { title: "CRISPR Tools", href: "/dashboard/tools/crispr", icon: Scissors },
  { title: "Primer Design", href: "/dashboard/tools/primer", icon: TestTube },
  { title: "Utilities", href: "/dashboard/tools/utilities", icon: Settings },
]

const otherNavItems: NavItem[] = [
  { title: "Documentation", href: "/docs", icon: BookOpen },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

// Sidebar content component (shared between desktop and mobile)
function SidebarContent({
  collapsed,
  activeItem,
  toolsOpen,
  setToolsOpen,
  onNavigate,
}: {
  collapsed: boolean
  activeItem: string
  toolsOpen: boolean
  setToolsOpen: (open: boolean) => void
  onNavigate?: (view: string, toolId?: string) => void
}) {
  const { 
    isAuthenticated,
    userDisplayName, 
    userEmail, 
    userInitials,
    status 
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

  const renderNavItem = (item: NavItem, isSubItem = false) => {
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
                isActive && "bg-biored/10 text-biored hover:bg-biored/15 hover:text-biored",
                !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={() => handleNavClick(item.href)}
            >
              <item.icon className={cn("size-4 shrink-0", isActive && "text-biored")} />
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
          isActive && "bg-biored/10 text-biored hover:bg-biored/15 hover:text-biored font-medium",
          !isActive && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
        onClick={() => handleNavClick(item.href)}
      >
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-biored rounded-r-full"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        <item.icon className={cn("size-4 shrink-0", isActive && "text-biored")} />
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
        <div className="px-3 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-2">
                Main
              </p>
            )}
            {mainNavItems.map((item) => renderNavItem(item))}
          </div>

          {/* Tools Section - Collapsible */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-2">
                Tools
              </p>
            )}
            
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="default"
                    className="w-full justify-center h-10 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() => onNavigate?.("tools")}
                  >
                    <Wrench className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Tools</TooltipContent>
              </Tooltip>
            ) : (
              <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="default"
                    className="w-full justify-between h-10 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() => onNavigate?.("tools")}
                  >
                    <div className="flex items-center gap-3">
                      <Wrench className="size-4 shrink-0" />
                      <span>Tools</span>
                    </div>
                    <motion.div
                      animate={{ rotate: toolsOpen ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="size-4" />
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
                    <div className="mt-1 space-y-0.5">
                      {toolsNavItems.map((item) => renderNavItem(item, true))}
                    </div>
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* Other Navigation */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-2">
                Other
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

// Desktop Sidebar Component
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
  const [toolsOpen, setToolsOpen] = React.useState(true)

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 280 }}
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
          toolsOpen={toolsOpen}
          setToolsOpen={setToolsOpen}
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

// Mobile Sidebar Component (Sheet-based)
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
  const [toolsOpen, setToolsOpen] = React.useState(true)

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="left" className="w-72 p-0 glass">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <SidebarContent
          collapsed={false}
          activeItem={activeItem}
          toolsOpen={toolsOpen}
          setToolsOpen={setToolsOpen}
          onNavigate={onNavigate}
        />
      </SheetContent>
    </Sheet>
  )
}

// Hook for sidebar state management
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
