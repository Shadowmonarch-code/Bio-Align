"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, CheckCircle2, Circle, ArrowRight, Info } from "lucide-react"

export interface QuickStep {
  icon: React.ReactNode
  title: string
  description: string
  details?: string[]
}

export interface QuickStartGuideProps {
  steps: QuickStep[]
  toolName?: string
}

const StepStatus = {
  COMPLETED: "completed",
  ACTIVE: "active",
  PENDING: "pending",
} as const

type StepStatusType = (typeof StepStatus)[keyof typeof StepStatus]

function getStepStatus(index: number, activeIndex: number): StepStatusType {
  if (index < activeIndex) return StepStatus.COMPLETED
  if (index === activeIndex) return StepStatus.ACTIVE
  return StepStatus.PENDING
}

export function QuickStartGuide({ steps, toolName }: QuickStartGuideProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  const handleStepClick = (index: number) => {
    setActiveStep(index)
    setExpandedStep(expandedStep === index ? null : index)
  }

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1)
      setExpandedStep(null)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      {toolName && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <Info className="h-4 w-4 text-[#C1121F]" />
          <span className="text-sm font-medium text-muted-foreground">
            Quick Start Guide —{" "}
            <span className="text-[#C1121F] font-semibold">{toolName}</span>
          </span>
        </motion.div>
      )}

      {/* Stepper Container */}
      <div className="relative">
        {/* Desktop: Horizontal Layout */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between relative">
            {/* Connection Lines */}
            <div className="absolute top-6 left-0 right-0 flex justify-center px-12">
              {steps.slice(0, -1).map((_, index) => (
                <motion.div
                  key={`line-${index}`}
                  className="h-0.5 flex-1 max-w-[120px] mx-2 bg-gray-200 dark:bg-gray-700 relative overflow-hidden rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-[#C1121F] rounded-full"
                    initial={{ width: "0%" }}
                    animate={{
                      width:
                        getStepStatus(index, activeStep) === StepStatus.COMPLETED
                          ? "100%"
                          : "0%",
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Steps */}
            {steps.map((step, index) => {
              const status = getStepStatus(index, activeStep)
              const isExpanded = expandedStep === index

              return (
                <motion.div
                  key={index}
                  className="relative z-10 flex flex-col items-center flex-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Step Button */}
                  <button
                    onClick={() => handleStepClick(index)}
                    className={`
                      group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 cursor-pointer
                      ${
                        status === StepStatus.ACTIVE
                          ? "bg-red-50 dark:bg-red-950/30 shadow-lg shadow-red-100 dark:shadow-red-900/20 scale-105"
                          : status === StepStatus.COMPLETED
                          ? "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          : "opacity-60 hover:opacity-80 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }
                    `}
                  >
                    {/* Icon Container */}
                    <motion.div
                      className={`
                        relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                        ${
                          status === StepStatus.ACTIVE
                            ? "bg-[#C1121F] text-white shadow-md shadow-red-200 dark:shadow-red-900/40"
                            : status === StepStatus.COMPLETED
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                        }
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={
                        status === StepStatus.ACTIVE
                          ? {
                              boxShadow: [
                                "0 0 0 0 rgba(193, 18, 31, 0.4)",
                                "0 0 0 8px rgba(193, 18, 31, 0)",
                              ],
                            }
                          : {}
                      }
                      transition={{
                        boxShadow: {
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: "loop",
                        },
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {status === StepStatus.COMPLETED ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <CheckCircle2 className="w-6 h-6" />
                          </motion.div>
                        ) : status === StepStatus.ACTIVE ? (
                          <motion.div
                            key="icon-active"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            {step.icon}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="circle"
                            initial={{ scale: 1 }}
                            animate={{ scale: 1 }}
                          >
                            <Circle className="w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Active Pulse Ring */}
                      {status === StepStatus.ACTIVE && (
                        <motion.span
                          className="absolute inset-0 rounded-full border-2 border-[#C1121F]"
                          animate={{
                            scale: [1, 1.3],
                            opacity: [0.8, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "loop",
                          }}
                        />
                      )}
                    </motion.div>

                    {/* Step Number Badge */}
                    <span
                      className={`
                        absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center
                        ${
                          status === StepStatus.ACTIVE
                            ? "bg-white dark:bg-gray-900 text-[#C1121F]"
                            : status === StepStatus.COMPLETED
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }
                      `}
                    >
                      {status === StepStatus.COMPLETED ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        index + 1
                      )}
                    </span>

                    {/* Title & Description */}
                    <div className="text-center min-w-[100px]">
                      <p
                        className={`
                          font-semibold text-xs sm:text-sm transition-colors
                          ${
                            status === StepStatus.ACTIVE
                              ? "text-[#C1121F]"
                              : status === StepStatus.COMPLETED
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-600 dark:text-gray-400"
                          }
                        `}
                      >
                        {step.title}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-2 hidden sm:block">
                        {step.description}
                      </p>
                    </div>

                    {/* Expand Indicator */}
                    {step.details && step.details.length > 0 && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight
                          className={`
                            w-4 h-4 mt-1 transition-colors
                            ${
                              status === StepStatus.ACTIVE
                                ? "text-[#C1121F]"
                                : "text-gray-400"
                            }
                          `}
                        />
                      </motion.div>
                    )}
                  </button>

                  {/* Expanded Details Panel */}
                  <AnimatePresence>
                    {isExpanded && step.details && step.details.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="mt-3 w-full max-w-[180px] overflow-hidden"
                      >
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
                          <ul className="space-y-1.5">
                            {step.details.map((detail, detailIndex) => (
                              <motion.li
                                key={detailIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: detailIndex * 0.05 }}
                                className="flex items-start gap-2 text-xs text-muted-foreground"
                              >
                                <ArrowRight className="w-3 h-3 text-[#C1121F] mt-0.5 flex-shrink-0" />
                                <span>{detail}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Mobile: Vertical Layout */}
        <div className="md:hidden space-y-3">
          {steps.map((step, index) => {
            const status = getStepStatus(index, activeStep)
            const isExpanded = expandedStep === index

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700">
                    <motion.div
                      className="absolute inset-x-0 top-0 bg-[#C1121F]"
                      initial={{ height: "0%" }}
                      animate={{
                        height:
                          status === StepStatus.COMPLETED ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* Step Card */}
                <button
                  onClick={() => handleStepClick(index)}
                  className={`
                    w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-300
                    ${
                      status === StepStatus.ACTIVE
                        ? "bg-red-50 dark:bg-red-950/30 border-2 border-[#C1121F]"
                        : status === StepStatus.COMPLETED
                        ? "bg-green-50 dark:bg-green-950/20 border-2 border-transparent hover:border-green-200 dark:hover:border-green-800"
                        : "bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent opacity-70"
                    }
                  `}
                >
                  {/* Icon */}
                  <motion.div
                    className={`
                      relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      ${
                        status === StepStatus.ACTIVE
                          ? "bg-[#C1121F] text-white"
                          : status === StepStatus.COMPLETED
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AnimatePresence mode="wait">
                      {status === StepStatus.COMPLETED ? (
                        <CheckCircle2 key="check-mobile" className="w-5 h-5" />
                      ) : status === StepStatus.ACTIVE ? (
                        <motion.div
                          key="icon-mobile"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {step.icon}
                        </motion.div>
                      ) : (
                        <Circle key="circle-mobile" className="w-4 h-4" />
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`
                          font-semibold text-sm truncate
                          ${
                            status === StepStatus.ACTIVE
                              ? "text-[#C1121F]"
                              : status === StepStatus.COMPLETED
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-600 dark:text-gray-400"
                          }
                        `}
                      >
                        {step.title}
                      </p>
                      {step.details && step.details.length > 0 && (
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                        >
                          <ChevronRight
                            className={`w-4 h-4 flex-shrink-0 ${status === StepStatus.ACTIVE ? "text-[#C1121F]" : "text-gray-400"}`}
                          />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && step.details && step.details.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="ml-13 pl-16 overflow-hidden"
                    >
                      <div className="py-2 pr-3">
                        <ul className="space-y-1.5">
                          {step.details.map((detail, detailIndex) => (
                            <motion.li
                              key={detailIndex}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: detailIndex * 0.05 }}
                              className="flex items-start gap-2 text-xs text-muted-foreground"
                            >
                              <ArrowRight className="w-3 h-3 text-[#C1121F] mt-0.5 flex-shrink-0" />
                              <span>{detail}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-muted-foreground">
          Step{" "}
          <span className="font-semibold text-[#C1121F]">{activeStep + 1}</span>{" "}
          of{" "}
          <span className="font-semibold">{steps.length}</span>
        </p>

        {activeStep < steps.length - 1 && (
          <motion.button
            onClick={handleNext}
            className="
              flex items-center gap-1.5 px-4 py-2 
              bg-[#C1121F] hover:bg-[#A00F1A] 
              text-white text-sm font-medium
              rounded-lg shadow-sm hover:shadow-md
              transition-all duration-200
            "
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}

        {activeStep === steps.length - 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            All Steps Complete!
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default QuickStartGuide
