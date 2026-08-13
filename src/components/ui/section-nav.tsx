'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ChevronUp } from 'lucide-react'

interface SectionNavProps {
  /** Show section indicator dot */
  showIndicator?: boolean
  /** Scroll threshold to show button (in pixels) */
  scrollThreshold?: number
  /** Position from bottom */
  bottom?: number
  /** Position from right */
  right?: number
}

export function SectionNav({
  showIndicator = true,
  scrollThreshold = 300,
  bottom = 24,
  right = 24,
}: SectionNavProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      setIsVisible(scrolled > scrollThreshold)
      
      // Calculate scroll progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrolled / docHeight) * 100 : 0
      setScrollProgress(Math.min(progress, 100))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrollThreshold])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
          className="fixed z-50"
          style={{ bottom, right }}
        >
          <div className="flex flex-col items-end gap-3">
            {/* Optional scroll progress indicator */}
            {showIndicator && (
              <motion.div 
                className="relative w-10 h-10 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {/* Progress ring background */}
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${scrollProgress * 0.973} 97.3`}
                    className="text-emerald-500 dark:text-emerald-400"
                    style={{ transition: 'stroke-dasharray 0.3s ease' }}
                  />
                </svg>
                <span className="absolute text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                  {Math.round(scrollProgress)}%
                </span>
              </motion.div>
            )}

            {/* Main back to top button */}
            <button
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              className="
                group relative flex items-center justify-center
                w-12 h-12 min-w-[44px] min-h-[44px]
                bg-white/80 dark:bg-black/50
                backdrop-blur-lg
                border border-gray-200/50 dark:border-white/10
                rounded-full
                shadow-lg shadow-gray-900/10 dark:shadow-black/30
                hover:bg-white dark:hover:bg-black/70
                hover:border-emerald-300/50 dark:hover:border-emerald-500/30
                hover:shadow-xl hover:shadow-emerald-500/10
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                active:scale-95
                transition-all duration-300 ease-out
                cursor-pointer
              "
            >
              {/* Glow effect on hover */}
              <div className="
                absolute inset-0 rounded-full
                bg-gradient-to-br from-emerald-400/20 to-teal-400/20
                opacity-0 group-hover:opacity-100
                blur-xl transition-opacity duration-300
              " />
              
              {/* Icon container */}
              <div className="relative flex items-center justify-center">
                <ArrowUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:-translate-y-0.5 transition-transform duration-300" />
                
                {/* Subtle pulse animation */}
                <div className="
                  absolute inset-0 rounded-full
                  bg-emerald-500/20
                  animate-ping
                  opacity-0 group-hover:opacity-100
                " style={{ animationDuration: '2s' }} />
              </div>
              
              {/* Tooltip */}
              <div className="
                absolute right-full mr-3 px-3 py-1.5
                bg-gray-900 dark:bg-white
                text-white dark:text-gray-900
                text-xs font-medium rounded-lg
                opacity-0 group-hover:opacity-100
                pointer-events-none
                transform translate-x-2 group-hover:translate-x-0
                transition-all duration-200
                whitespace-nowrap
              ">
                Back to Top
                <div className="
                  absolute left-full top-1/2 -translate-y-1/2
                  border-4 border-transparent
                  border-l-gray-900 dark:border-l-white
                " />
              </div>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Reusable inline "Back to Top" link for sections
interface BackToTopLinkProps {
  /** Additional CSS classes */
  className?: string
  /** Custom label text */
  label?: string
  /** Whether to show icon only on mobile */
  iconOnlyMobile?: boolean
}

export function BackToTopLink({ 
  className = '', 
  label = 'Back to Top',
  iconOnlyMobile = true 
}: BackToTopLinkProps) {
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [])

  return (
    <button
      onClick={scrollToTop}
      className={`
        group inline-flex items-center gap-2
        px-4 py-2
        text-sm font-medium
        text-muted-foreground
        hover:text-emerald-600 dark:hover:text-emerald-400
        rounded-lg
        hover:bg-accent
        transition-colors duration-200
        cursor-pointer
        ${className}
      `}
      aria-label="Scroll back to top of page"
    >
      <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-200" />
      <span className={iconOnlyMobile ? 'hidden sm:inline' : ''}>{label}</span>
    </button>
  )
}

// Section-specific back to top with positioning
interface SectionBackToTopProps {
  /** Section ID for reference */
  sectionId?: string
  /** Alignment */
  align?: 'left' | 'right' | 'center'
}

export function SectionBackToTop({ align = 'right' }: SectionBackToTopProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  return (
    <div className={`flex ${alignmentClasses[align]} mt-8 pt-6 border-t border-border/50`}>
      <BackToTopLink />
    </div>
  )
}

export default SectionNav
