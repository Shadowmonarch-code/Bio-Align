"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Star,
  Grid3X3,
  List,
  Clock,
  ChevronDown,
  ChevronUp,
  Rocket,
  Sparkles,
  Filter,
  X,
  Heart,
  ExternalLink,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  toolCategories,
  getAllTools,
  searchTools,
  recentlyUsedTools,
  popularTools,
  type BioTool,
  type ToolCategory,
  type ToolStatus,
} from "@/lib/tools-data"

// ==================== TYPES ====================
type ViewMode = "grid" | "list"
type SortOption = "name" | "category" | "recent" | "popular"

// ==================== ICON COMPONENTS ====================
function StatusIcon({ status }: { status: ToolStatus }) {
  switch (status) {
    case "available":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </TooltipTrigger>
          <TooltipContent>Available</TooltipContent>
        </Tooltip>
      )
    case "coming-soon":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Clock className="size-4 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent>Coming Soon</TooltipContent>
        </Tooltip>
      )
    case "beta":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Sparkles className="size-4 text-blue-500" />
          </TooltipTrigger>
          <TooltipContent>Beta</TooltipContent>
        </Tooltip>
      )
    case "deprecated":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Circle className="size-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>Deprecated</TooltipContent>
        </Tooltip>
      )
  }
}

// ==================== SKELETON LOADING STATES ====================
function CategoryCardSkeleton() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="size-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function ToolCardSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 p-4 rounded-lg border bg-card/50">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    )
  }
  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="size-5 rounded-full" />
          </div>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== CATEGORY CARD COMPONENT ====================
function CategoryCard({
  category,
  isExpanded,
  onToggle,
  onClick,
}: {
  category: ToolCategory
  isExpanded: boolean
  onToggle: () => void
  onClick: () => void
}) {
  const Icon = category.icon
  const availableTools = category.tools.filter(
    (t) => t.status === "available"
  ).length

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "group glass-card cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1",
          isExpanded && "ring-2 ring-primary/20 border-primary/30"
        )}
        onClick={() => {
          onToggle()
          if (!isExpanded) onClick()
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className={cn(
                "size-12 rounded-xl flex items-center justify-center shrink-0",
                "bg-gradient-to-br shadow-lg"
              )}
              style={{
                background: `linear-gradient(135deg, ${category.color}20, ${category.color}40)`,
                color: category.color,
              }}
            >
              <Icon className="size-6" />
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {category.name}
                </CardTitle>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="size-4 text-muted-foreground" />
                </motion.div>
              </div>
              <CardDescription className="text-sm line-clamp-2 mb-3">
                {category.description}
              </CardDescription>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-xs font-medium"
                  style={{
                    backgroundColor: `${category.color}15`,
                    color: category.color,
                    borderColor: `${category.color}30`,
                  }}
                >
                  {category.tools.length} tools
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs text-emerald-600 border-emerald-300 dark:border-emerald-700"
                >
                  {availableTools} available
                </Badge>
              </div>
            </div>

            {/* Action Button */}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
            >
              <ExternalLink className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== TOOL CARD COMPONENT ====================
function ToolCard({
  tool,
  viewMode,
  isFavorite,
  onToggleFavorite,
  onLaunch,
}: {
  tool: BioTool
  viewMode: ViewMode
  isFavorite: boolean
  onToggleFavorite: () => void
  onLaunch: () => void
}) {
  const Icon = tool.icon
  const category = toolCategories.find((c) => c.id === tool.category)

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "group flex items-center gap-4 p-4 rounded-lg border bg-card/50 backdrop-blur-sm",
          "hover:bg-accent/50 hover:border-primary/20 transition-all duration-200"
        )}
      >
        {/* Icon */}
        <div
          className="size-10 rounded-lg flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${category?.color || "#64748B"}15`,
            color: category?.color || "#64748B",
          }}
        >
          <Icon className="size-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{tool.name}</span>
            <StatusIcon status={tool.status} />
          </div>
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {tool.description}
          </p>
        </div>

        {/* Badge & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className="hidden sm:inline-flex text-xs"
            style={{
              borderColor: `${category?.color}40`,
              color: category?.color,
            }}
          >
            {category?.name}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-8",
                    isFavorite && "text-yellow-500 hover:text-yellow-600"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite()
                  }}
                >
                  <Heart
                    className={cn("size-4", isFavorite && "fill-current")}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFavorite ? "Remove from favorites" : "Add to favorites"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            size="sm"
            disabled={tool.status !== "available"}
            onClick={onLaunch}
            className="gap-1.5"
          >
            {tool.status === "available" ? (
              <>
                <Rocket className="size-3.5" />
                Launch
              </>
            ) : (
              "Coming Soon"
            )}
          </Button>
        </div>
      </motion.div>
    )
  }

  // Grid View
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="glass-card h-full overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={cn(
                "size-10 rounded-lg flex items-center justify-center shrink-0",
                "bg-gradient-to-br shadow-sm"
              )}
              style={{
                background: `linear-gradient(135deg, ${category?.color || "#64748B"}15, ${category?.color || "#64748B"}30)`,
                color: category?.color || "#64748B",
              }}
            >
              <Icon className="size-5" />
            </motion.div>
            <div className="flex items-center gap-1">
              <StatusIcon status={tool.status} />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-7 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity",
                        isFavorite && "opacity-100 text-yellow-500 hover:text-yellow-600"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite()
                      }}
                    >
                      <Heart
                        className={cn("size-3.5", isFavorite && "fill-current")}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFavorite ? "Remove from favorites" : "Add to favorites"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Title & Description */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1.5 group-hover:text-primary transition-colors truncate">
              {tool.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <Badge
              variant="secondary"
              className="text-[10px] font-medium px-1.5 py-0"
              style={{
                backgroundColor: `${category?.color || "#64748B"}10`,
                color: category?.color || "#64748B",
              }}
            >
              {category?.name}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2.5 text-xs gap-1.5"
              disabled={tool.status !== "available"}
              onClick={onLaunch}
            >
              {tool.status === "available" ? (
                <>
                  <Rocket className="size-3" />
                  Launch
                </>
              ) : (
                "Soon"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ==================== EMPTY STATE COMPONENT ====================
function EmptyState({
  type,
  query,
}: {
  type: "no-results" | "no-favorites" | "empty"
  query?: string
}) {
  const configs = {
    "no-results": {
      icon: Search,
      title: "No tools found",
      description:
        query && query.length > 0
          ? `No results for "${query}". Try a different search term or browse categories.`
          : "No tools match your current filters.",
    },
    "no-favorites": {
      icon: Star,
      title: "No favorite tools yet",
      description:
        "Click the heart icon on any tool to add it to your favorites for quick access.",
    },
    empty: {
      icon: Filter,
      title: "No tools available",
      description: "Check back later for new tools and updates.",
    },
  }

  const config = configs[type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{config.description}</p>
    </motion.div>
  )
}

// ==================== MAIN TOOLS CATALOG COMPONENT ====================
interface ToolsCatalogProps {
  onToolSelect?: (toolId: string) => void
}

export default function ToolsCatalog({ onToolSelect }: ToolsCatalogProps) {
  // State
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid")
  const [expandedCategories, setExpandedCategories] = React.useState<
    Set<string>
  >(new Set())
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState<ToolStatus | "all">(
    "all"
  )

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Load favorites from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("bioalign-favorites")
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)))
      }
    } catch (error) {
      console.error("Failed to load favorites:", error)
    }
  }, [])

  // Save favorites to localStorage
  const saveFavorites = React.useCallback((newFavs: Set<string>) => {
    setFavorites(newFavs)
    try {
      localStorage.setItem(
        "bioalign-favorites",
        JSON.stringify(Array.from(newFavs))
      )
    } catch (error) {
      console.error("Failed to save favorites:", error)
    }
  }, [])

  // Toggle favorite
  const toggleFavorite = React.useCallback(
    (toolId: string) => {
      const newFavs = new Set(favorites)
      if (newFavs.has(toolId)) {
        newFavs.delete(toolId)
      } else {
        newFavs.add(toolId)
      }
      saveFavorites(newFavs)
    },
    [favorites, saveFavorites]
  )

  // Toggle category expansion
  const toggleCategory = React.useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }, [])

  // Get filtered tools
  const getFilteredTools = React.useCallback((): BioTool[] => {
    let tools: BioTool[]

    switch (activeTab) {
      case "recent":
        tools = recentlyUsedTools
        break
      case "favorites":
        tools = getAllTools().filter((t) => favorites.has(t.id))
        break
      case "popular":
        tools = popularTools
        break
      default:
        tools = getAllTools()
    }

    // Apply search filter
    if (searchQuery.trim()) {
      tools = searchTools(searchQuery.trim())
    }

    // Apply status filter
    if (statusFilter !== "all") {
      tools = tools.filter((t) => t.status === statusFilter)
    }

    // Apply tab-specific filtering
    if (activeTab === "favorites") {
      tools = tools.filter((t) => favorites.has(t.id))
    }

    return tools
  }, [searchQuery, activeTab, statusFilter, favorites])

  // Get filtered categories
  const getFilteredCategories = React.useCallback((): ToolCategory[] => {
    if (!searchQuery.trim() && statusFilter === "all") {
      return toolCategories
    }

    return toolCategories
      .map((cat) => ({
        ...cat,
        tools: cat.tools.filter((tool) => {
          const matchesSearch =
            !searchQuery.trim() ||
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          const matchesStatus =
            statusFilter === "all" || tool.status === statusFilter
          return matchesSearch && matchesStatus
        }),
      }))
      .filter((cat) => cat.tools.length > 0)
  }, [searchQuery, statusFilter])

  // Handle tool launch
  const handleLaunch = React.useCallback((tool: BioTool) => {
    console.log(`Launching tool: ${tool.name} (${tool.id})`)
    // Call the parent's onToolSelect callback if provided
    if (onToolSelect) {
      onToolSelect(tool.id)
    }
  }, [onToolSelect])

  // Clear search
  const clearSearch = React.useCallback(() => {
    setSearchQuery("")
  }, [])

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        {/* Header skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-14 w-full max-w-2xl" />
        </div>
        {/* Categories grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  const filteredCategories = getFilteredCategories()
  const filteredTools = getFilteredTools()

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* ==================== HEADER SECTION ==================== */}
        <div className="space-y-4">
          {/* Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Tools Catalog
              </h1>
              <p className="text-muted-foreground mt-1">
                {getAllTools().length} bioinformatics tools across{" "}
                {toolCategories.length} categories
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="size-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="size-8 p-0"
                  onClick={() => setViewMode("list")}
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search tools by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 bg-background/50 backdrop-blur-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-8"
                onClick={clearSearch}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ToolStatus | "all")
                }
                className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="beta">Beta</option>
                <option value="coming-soon">Coming Soon</option>
              </select>
            </div>

            {/* Active Filters Display */}
            {(statusFilter !== "all" || searchQuery) && (
              <div className="flex items-center gap-2">
                {statusFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={() => setStatusFilter("all")}
                  >
                    Status: {statusFilter}
                    <X className="size-3" />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={clearSearch}
                  >
                    Search: {searchQuery}
                    <X className="size-3" />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Count */}
            <span className="ml-auto text-sm text-muted-foreground">
              {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""}{" "}
              found
            </span>
          </div>
        </div>

        {/* ==================== TABS SECTION ==================== */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="gap-1.5">
              <Grid3X3 className="size-4" />
              All Tools
            </TabsTrigger>
            <TabsTrigger value="recent" className="gap-1.5">
              <Clock className="size-4" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-1.5">
              <Star className="size-4" />
              Favorites
              {favorites.size > 0 && (
                <span className="size-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {favorites.size}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="popular" className="gap-1.5">
              <Sparkles className="size-4" />
              Popular
            </TabsTrigger>
          </TabsList>

          {/* ==================== CONTENT SECTIONS ==================== */}
          <TabsContent value="all" className="mt-6 space-y-6">
            {/* Categories Grid */}
            {!searchQuery.trim() && statusFilter === "all" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredCategories.map((category) => (
                      <CategoryCard
                        key={category.id}
                        category={category}
                        isExpanded={expandedCategories.has(category.id)}
                        onToggle={() => toggleCategory(category.id)}
                        onClick={() =>
                          setActiveTab(`category-${category.id}`)
                        }
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Expanded Category Tools */}
                <AnimatePresence>
                  {Array.from(expandedCategories).map((categoryId) => {
                    const category = toolCategories.find(
                      (c) => c.id === categoryId
                    )
                    if (!category) return null

                    return (
                      <motion.div
                        key={`expanded-${categoryId}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="w-1 h-6 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <h2 className="text-lg font-semibold">
                            {category.name} Tools
                          </h2>
                          <Badge variant="secondary">{category.tools.length}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto"
                            onClick={() => toggleCategory(categoryId)}
                          >
                            Collapse
                          </Button>
                        </div>
                        <div
                          className={
                            viewMode === "grid"
                              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                              : "space-y-2"
                          }
                        >
                          <AnimatePresence mode="popLayout">
                            {category.tools.map((tool) => (
                              <ToolCard
                                key={tool.id}
                                tool={tool}
                                viewMode={viewMode}
                                isFavorite={favorites.has(tool.id)}
                                onToggleFavorite={() => toggleFavorite(tool.id)}
                                onLaunch={() => handleLaunch(tool)}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </>
            ) : (
              /* Filtered Results */
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-2"
                }
              >
                <AnimatePresence mode="popLayout">
                  {filteredTools.length > 0 ? (
                    filteredTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        viewMode={viewMode}
                        isFavorite={favorites.has(tool.id)}
                        onToggleFavorite={() => toggleFavorite(tool.id)}
                        onLaunch={() => handleLaunch(tool)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full">
                      <EmptyState type="no-results" query={searchQuery} />
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Recent Tab */}
          <TabsContent value="recent" className="mt-6">
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-2"
              }
            >
              <AnimatePresence mode="popLayout">
                {recentlyUsedTools.length > 0 ? (
                  recentlyUsedTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      viewMode={viewMode}
                      isFavorite={favorites.has(tool.id)}
                      onToggleFavorite={() => toggleFavorite(tool.id)}
                      onLaunch={() => handleLaunch(tool)}
                    />
                  ))
                ) : (
                  <EmptyState type="empty" />
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="mt-6">
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-2"
              }
            >
              <AnimatePresence mode="popLayout">
                {filteredTools.length > 0 ? (
                  filteredTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      viewMode={viewMode}
                      isFavorite={true}
                      onToggleFavorite={() => toggleFavorite(tool.id)}
                      onLaunch={() => handleLaunch(tool)}
                    />
                  ))
                ) : (
                  <EmptyState type="no-favorites" />
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Popular Tab */}
          <TabsContent value="popular" className="mt-6">
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-2"
              }
            >
              <AnimatePresence mode="popLayout">
                {popularTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    viewMode={viewMode}
                    isFavorite={favorites.has(tool.id)}
                    onToggleFavorite={() => toggleFavorite(tool.id)}
                    onLaunch={() => handleLaunch(tool)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Individual Category Tabs (generated dynamically) */}
          {toolCategories.map((category) => (
            <TabsContent
              key={category.id}
              value={`category-${category.id}`}
              className="mt-6"
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <div
                  className="size-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${category.color}20, ${category.color}40)`,
                    color: category.color,
                  }}
                >
                  <category.icon className="size-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-sm"
                  style={{
                    backgroundColor: `${category.color}15`,
                    color: category.color,
                  }}
                >
                  {category.tools.length} tools
                </Badge>
              </div>

              {/* Tools Grid/List */}
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-2"
                }
              >
                <AnimatePresence mode="popLayout">
                  {category.tools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      viewMode={viewMode}
                      isFavorite={favorites.has(tool.id)}
                      onToggleFavorite={() => toggleFavorite(tool.id)}
                      onLaunch={() => handleLaunch(tool)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
