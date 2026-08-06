"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  Command,
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
  DashboardSidebar,
  MobileSidebar,
  useSidebarState,
} from "./sidebar"

// Types
interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

// Search Dialog Component (simplified - can be enhanced with cmdk)
function SearchDialog() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="relative h-9 w-full max-w-sm justify-start gap-2 text-sm text-muted-foreground sm:pr-12"
            onClick={() => setOpen(true)}
          >
            <Search className="size-4" />
            <span className="hidden lg:inline-flex">Search...</span>
            <span className="inline-flex lg:hidden">Search</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <Command className="size-3" />K
            </kbd>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Search <kbd className="rounded border bg-muted px-1 text-xs">⌘K</kbd></p>
        </TooltipContent>
      </Tooltip>

      {/* Search Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border bg-background shadow-2xl"
            >
              <div className="flex items-center border-b px-4">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  placeholder="Search tools, workspaces, databases..."
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoFocus
                />
                <kbd className="pointer-events-none flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ESC
                </kbd>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">Start typing to search...</p>
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Quick Actions
                  </p>
                  {[
                    { icon: DnaIcon, label: "Run Sequence Analysis", shortcut: "S" },
                    { icon: FolderIcon, label: "Open Workspace", shortcut: "W" },
                    { icon: BrainIcon, label: "Ask AI Assistant", shortcut: "A" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                    >
                      <action.icon className="size-4 text-muted-foreground" />
                      <span>{action.label}</span>
                      <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10px]">
                        {action.shortcut}
                      </kbd>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Simple icons for quick actions
function DnaIcon({ className }: { className?: string }) {
  // Using a simple placeholder - in real app would import from lucide-react
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 15c6.667-6 13.333 0 20-6M2 9c6.667 6 13.333 0 20 6M12 3v18"/></svg>
}

function FolderIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
}

function BrainIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0 .73 3.53 2.5 2.5 0 0 0 0 2.86 2.5 2.5 0 0 0-.73 3.53 2.5 2.5 0 0 0 1.98 3A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.46 2.5 2.5 0 0 0 1.98-3 2.5 2.5 0 0 0-.73-3.53 2.5 2.5 0 0 0 0-2.86 2.5 2.5 0 0 0 .73-3.53 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5z"/><circle cx="12" cy="12" r="3"/></svg>
}

// Theme Toggle Component
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9">
        <Sun className="size-4" />
      </Button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <AnimatePresence mode="wait">
            {theme === "dark" ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="size-4" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="size-4" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Switch to {theme === "dark" ? "light" : "dark"} mode
      </TooltipContent>
    </Tooltip>
  )
}

// Notification Bell Component
function NotificationBell() {
  const [notificationCount] = React.useState(3)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 relative">
          <Bell className="size-4" />
          {notificationCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-biored text-[10px] font-bold text-white"
            >
              {notificationCount}
            </motion.span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Notifications ({notificationCount})</TooltipContent>
    </Tooltip>
  )
}

// User Menu Component
function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 gap-2 pl-2 pr-3">
          <Avatar className="size-7 ring-2 ring-biored/20">
            <AvatarImage src="/avatars/user.png" alt="User" />
            <AvatarFallback className="bg-biored/10 text-biored text-xs font-medium">
              BA
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-flex text-sm font-medium">User</span>
          <ChevronRight className="size-3.5 rotate-90 text-muted-foreground hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">BioAlign User</p>
            <p className="text-xs leading-none text-muted-foreground">
              user@bioalign.io
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HelpCircle className="mr-2 size-4" />
          Help & Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Header Component
function Header({
  onMobileMenuClick,
  title,
  subtitle,
  actions,
  breadcrumbs = [],
}: {
  onMobileMenuClick: () => void
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden size-9"
        onClick={onMobileMenuClick}
      >
        <Menu className="size-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Left section */}
      <div className="flex flex-1 items-center gap-4">
        {/* Search */}
        <SearchDialog />

        {/* Spacer for mobile */}
        <div className="hidden md:block" />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <Separator orientation="vertical" className="mx-1 h-6 hidden sm:block" />
        <UserMenu />
      </div>
    </header>
  )
}

// Main Dashboard Layout Component
export default function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
  breadcrumbs = [],
}: DashboardLayoutProps) {
  const sidebarState = useSidebarState()

  // Default breadcrumbs if not provided
  const defaultBreadcrumbs = title
    ? [{ label: "Dashboard", href: "/dashboard" }, { label: title }]
    : []

  const displayBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <DashboardSidebar
            collapsed={sidebarState.collapsed}
            onToggle={sidebarState.toggle}
          />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          open={sidebarState.mobileOpen}
          onClose={() => sidebarState.setMobileOpen(false)}
        />

        {/* Main Content Area */}
        <motion.main
          animate={{
            marginLeft: sidebarState.isMobile ? 0 : sidebarState.collapsed ? 64 : 280,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="min-h-screen flex flex-col"
        >
          {/* Header */}
          <Header
            onMobileMenuClick={sidebarState.toggle}
            title={title}
            subtitle={subtitle}
            actions={actions}
            breadcrumbs={displayBreadcrumbs}
          />

          {/* Page Title & Breadcrumbs Section */}
          {(title || displayBreadcrumbs.length > 0) && (
            <div className="border-b bg-background/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4">
              {/* Breadcrumbs */}
              {displayBreadcrumbs.length > 0 && (
                <Breadcrumb className="mb-2">
                  <BreadcrumbList>
                    {displayBreadcrumbs.map((crumb, index) => (
                      <React.Fragment key={crumb.label}>
                        <BreadcrumbItem>
                          {index === displayBreadcrumbs.length - 1 || !crumb.href ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < displayBreadcrumbs.length - 1 && (
                          <BreadcrumbSeparator />
                        )}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}

              {/* Title & Actions Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  {title && (
                    <motion.h1
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-bold tracking-tight"
                    >
                      {title}
                    </motion.h1>
                  )}
                  {subtitle && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm text-muted-foreground mt-1"
                    >
                      {subtitle}
                    </motion.p>
                  )}
                </div>
                {actions && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    {actions}
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6 lg:p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </div>
          </ScrollArea>
        </motion.main>
      </div>
    </TooltipProvider>
  )
}

// Export individual components for customization
export {
  Header,
  SearchDialog,
  ThemeToggle,
  NotificationBell,
  UserMenu,
  DashboardSidebar,
  MobileSidebar,
  useSidebarState,
}
