"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Info,
  ExternalLink,
  Clock,
  FileText,
  BarChart3,
  Star,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface ToolInfoCardProps {
  name: string
  description: string
  organization: string
  website: string
  useCases: string[]
  inputFormats: string[]
  outputTypes: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  processingTime: string
  features?: string[]
}

const difficultyConfig = {
  beginner: {
    label: "Beginner",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    icon: CheckCircle,
    description: "Easy to use, minimal bioinformatics knowledge required",
  },
  intermediate: {
    label: "Intermediate",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    icon: AlertCircle,
    description: "Requires some familiarity with bioinformatics concepts",
  },
  advanced: {
    label: "Advanced",
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    icon: Star,
    description: "Expert-level tool, significant domain knowledge needed",
  },
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType
  title: string
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="size-4 text-[#C1121F]" />
      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
        {title}
      </h4>
    </div>
  )
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <motion.span
          key={item}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
          className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
        >
          {item}
        </motion.span>
      ))}
    </div>
  )
}

function UseCaseItem({ useCase, index }: { useCase: string; index: number }) {
  return (
    <motion.li
      variants={itemVariants}
      className="flex items-start gap-2 text-sm text-muted-foreground"
    >
      <ArrowRight className="size-3.5 mt-0.5 shrink-0 text-[#C1121F]" />
      <span>{useCase}</span>
    </motion.li>
  )
}

function FeatureItem({ feature, index }: { feature: string; index: number }) {
  return (
    <motion.li
      variants={itemVariants}
      className="flex items-start gap-2 text-sm text-muted-foreground"
    >
      <CheckCircle className="size-3.5 mt-0.5 shrink-0 text-emerald-500" />
      <span>{feature}</span>
    </motion.li>
  )
}

export function ToolInfoCard({
  name,
  description,
  organization,
  website,
  useCases,
  inputFormats,
  outputTypes,
  difficulty,
  processingTime,
  features,
}: ToolInfoCardProps) {
  const config = difficultyConfig[difficulty]
  const DifficultyIcon = config.icon

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card className="overflow-hidden border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
        {/* Header Section */}
        <CardHeader className="pb-4">
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-2">
                <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                  {name}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {description}
                </CardDescription>
              </div>
            </div>

            {/* Organization & Metadata Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 bg-[#C1121F]/5 border-[#C1121F]/20 text-[#C1121F] hover:bg-[#C1121F]/10"
              >
                <BookOpen className="size-3" />
                {organization}
              </Badge>

              <Badge className={cn("gap-1.5", config.className)}>
                <DifficultyIcon className="size-3" />
                {config.label}
              </Badge>

              <Badge variant="secondary" className="gap-1.5">
                <Clock className="size-3" />
                {processingTime}
              </Badge>
            </div>
          </motion.div>
        </CardHeader>

        {/* Content Sections */}
        <CardContent className="space-y-6 pb-4">
          {/* Use Cases Section */}
          {useCases.length > 0 && (
            <motion.section variants={itemVariants}>
              <SectionHeader icon={Info} title="What It Does" />
              <ul className="space-y-2">
                {useCases.map((useCase, index) => (
                  <UseCaseItem key={index} useCase={useCase} index={index} />
                ))}
              </ul>
            </motion.section>
          )}

          {/* Input Formats Section */}
          {inputFormats.length > 0 && (
            <motion.section variants={itemVariants}>
              <SectionHeader icon={FileText} title="Input Requirements" />
              <TagList items={inputFormats} />
              <p className="mt-2 text-xs text-muted-foreground/70">
                Accepted file formats and data types
              </p>
            </motion.section>
          )}

          {/* Output Types Section */}
          {outputTypes.length > 0 && (
            <motion.section variants={itemVariants}>
              <SectionHeader icon={BarChart3} title="Output You Can Expect" />
              <TagList items={outputTypes} />
              <p className="mt-2 text-xs text-muted-foreground/70">
                Generated results and file types
              </p>
            </motion.section>
          )}

          {/* Features Section (Optional) */}
          {features && features.length > 0 && (
            <motion.section variants={itemVariants}>
              <SectionHeader icon={Star} title="Key Features" />
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <FeatureItem key={index} feature={feature} index={index} />
                ))}
              </ul>
            </motion.section>
          )}

          {/* Difficulty Info */}
          <motion.section
            variants={itemVariants}
            className="rounded-lg border bg-muted/30 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <DifficultyIcon className="size-4 text-[#C1121F]" />
              <span className="text-sm font-semibold">Difficulty Level</span>
              <Badge
                variant="outline"
                className={cn("ml-auto", config.className)}
              >
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </motion.section>
        </CardContent>

        {/* Footer with Action Button */}
        <CardFooter className="pt-4 border-t bg-muted/20">
          <Button
            asChild
            className="w-full sm:w-auto bg-[#C1121F] hover:bg-[#C1121F]/90 text-white shadow-md hover:shadow-lg transition-all duration-200 group"
          >
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <ExternalLink className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              Open Official Tool
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default ToolInfoCard
