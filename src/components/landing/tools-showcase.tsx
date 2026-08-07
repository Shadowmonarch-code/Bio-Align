"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Dna, 
  FlaskConical, 
  GitBranch, 
  Wrench,
  Play,
  ChevronRight,
  Layers,
  AlignLeft,
  Zap,
  Target,
  Eye,
  TreePine,
  BarChart3,
  ScanLine,
  ArrowRightLeft,
  SearchCode,
  Percent,
  PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Tool data types
interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// Define categories
const categories: Category[] = [
  { id: "all", name: "All Tools", icon: <Layers className="w-4 h-4" /> },
  { id: "sequence", name: "Sequence Analysis", icon: <Dna className="w-4 h-4" /> },
  { id: "protein", name: "Protein Analysis", icon: <FlaskConical className="w-4 h-4" /> },
  { id: "phylogenetics", name: "Phylogenetics", icon: <GitBranch className="w-4 h-4" /> },
  { id: "utilities", name: "Utilities", icon: <Wrench className="w-4 h-4" /> },
];

// Define tools
const tools: Tool[] = [
  // Sequence Analysis
  {
    id: "blast",
    name: "BLAST",
    description: "Sequence similarity search against comprehensive databases",
    category: "sequence",
    icon: <Search className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "clustal-omega",
    name: "Clustal Omega",
    description: "Multiple sequence alignment for large datasets",
    category: "sequence",
    icon: <AlignLeft className="w-5 h-5" />,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "muscle",
    name: "MUSCLE",
    description: "Fast multiple sequence alignment with high accuracy",
    category: "sequence",
    icon: <Zap className="w-5 h-5" />,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "mafft",
    name: "MAFFT",
    description: "Accurate multiple alignment with various strategies",
    category: "sequence",
    icon: <Target className="w-5 h-5" />,
    color: "from-purple-500 to-pink-500",
  },

  // Protein Analysis
  {
    id: "protparam",
    name: "ProtParam",
    description: "Compute physical and chemical protein properties",
    category: "protein",
    icon: <FlaskConical className="w-5 h-5" />,
    color: "from-red-500 to-rose-500",
  },
  {
    id: "secondary-structure",
    name: "Secondary Structure",
    description: "Predict protein secondary structure elements",
    category: "protein",
    icon: <Layers className="w-5 h-5" />,
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: "transmembrane",
    name: "Transmembrane Prediction",
    description: "Identify transmembrane helices in proteins",
    category: "protein",
    icon: <Eye className="w-5 h-5" />,
    color: "from-teal-500 to-cyan-500",
  },

  // Phylogenetics
  {
    id: "neighbor-joining",
    name: "Neighbor Joining",
    description: "Construct phylogenetic trees using NJ algorithm",
    category: "phylogenetics",
    icon: <GitBranch className="w-5 h-5" />,
    color: "from-emerald-500 to-green-500",
  },
  {
    id: "maximum-likelihood",
    name: "Maximum Likelihood",
    description: "Build trees using maximum likelihood methods",
    category: "phylogenetics",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "from-amber-500 to-yellow-500",
  },
  {
    id: "tree-viewer",
    name: "Tree Viewer",
    description: "Interactive visualization of phylogenetic trees",
    category: "phylogenetics",
    icon: <TreePine className="w-5 h-5" />,
    color: "from-lime-500 to-green-500",
  },

  // Utilities
  {
    id: "reverse-complement",
    name: "Reverse Complement",
    description: "Generate reverse complement of DNA sequences",
    category: "utilities",
    icon: <ArrowRightLeft className="w-5 h-5" />,
    color: "from-slate-500 to-gray-500",
  },
  {
    id: "orf-finder",
    name: "ORF Finder",
    description: "Find open reading frames in nucleotide sequences",
    category: "utilities",
    icon: <SearchCode className="w-5 h-5" />,
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "gc-content",
    name: "GC Content Calculator",
    description: "Calculate GC percentage and composition analysis",
    category: "utilities",
    icon: <Percent className="w-5 h-5" />,
    color: "from-sky-500 to-blue-500",
  },
  {
    id: "primer-designer",
    name: "Primer Designer",
    description: "Design PCR primers with melting temperature optimization",
    category: "utilities",
    icon: <PenTool className="w-5 h-5" />,
    color: "from-fuchsia-500 to-pink-500",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

interface ToolsShowcaseProps {
  onLaunchTool?: (toolId: string) => void;
}

export default function ToolsShowcase({ onLaunchTool }: ToolsShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tools based on category and search
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-background via-white to-background dark:via-[#0A0A0A]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-biored/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-biored/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-biored/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <Badge 
            variant="outline" 
            className="mb-4 px-3 py-1 text-sm border-biored/30 text-biored bg-biored/5"
          >
            <Dna className="w-3.5 h-3.5 mr-1.5" />
            Bioinformatics Toolkit
          </Badge>
          
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Popular{" "}
            <span className="gradient-text">Tools</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access our comprehensive suite of bioinformatics tools designed for researchers, 
            scientists, and students worldwide.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl mx-auto mb-10"
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-biored transition-colors" />
            <Input
              type="text"
              placeholder="Search tools by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 text-base rounded-xl border-border/50 bg-white/80 dark:bg-black/20 backdrop-blur-sm focus:border-biored focus:ring-biored/20 shadow-sm hover:shadow-md transition-shadow"
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className={`gap-2 rounded-full px-4 sm:px-5 transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-biored hover:bg-biored-dark text-white shadow-lg shadow-biored/25"
                    : "hover:bg-biored/5 hover:border-biored/30 hover:text-biored"
                }`}
              >
                {category.icon}
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">
                  {category.name.split(" ")[0]}
                </span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Tools Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${searchQuery}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredTools.map((tool) => (
              <motion.div
                key={tool.id}
                variants={cardVariants}
                layout
                whileHover={{ 
                  y: -6, 
                  transition: { duration: 0.2 } 
                }}
                className="group relative"
              >
                <div className="h-full p-5 rounded-2xl border border-border/50 bg-white/80 dark:bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-biored/5 hover:border-biored/20 transition-all duration-300">
                  {/* Icon & Badge Container */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${tool.color} shadow-lg`}>
                      <div className="text-white">
                        {tool.icon}
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs font-medium bg-muted/80 text-muted-foreground capitalize"
                    >
                      {tool.category === "phylogenetics" ? "Phylo." : tool.category}
                    </Badge>
                  </div>

                  {/* Tool Info */}
                  <h3 className="font-semibold text-lg mb-1.5 group-hover:text-biored transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {tool.description}
                  </p>

                  {/* Launch Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLaunchTool?.(tool.id)}
                    className="w-full gap-2 rounded-lg text-biored hover:bg-biored/10 hover:text-biored-dark group/btn cursor-pointer"
                  >
                    <Play className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    Launch Tool
                    <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                  </Button>

                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-biored/0 to-biored/0 group-hover:from-biored/[0.02] group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tools found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-14"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => onLaunchTool?.('all')}
            className="gap-2 rounded-full px-8 border-biored/30 text-biored hover:bg-biored hover:text-white hover:border-biored transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-biored/20 cursor-pointer"
          >
            Explore All 50+ Tools
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
