'use client'

import React from 'react'

interface ColorfulDividerProps {
  style?: 'gentle' | 'organic' | 'dramatic' | 'sharp' | 'wave' | 'blob'
  colors?: string[]
  className?: string
}

export function ColorfulDivider({ 
  style = 'organic', 
  colors = ['#C1121F', '#FF6B6B', '#4ECDC4'], 
  className = '' 
}: ColorfulDividerProps) {
  
  const getDivider = () => {
    switch (style) {
      case 'gentle':
        return (
          <div className={`relative h-16 w-full overflow-hidden ${className}`}>
            <svg viewBox="0 0 1200 80" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gentleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  {colors.map((c, i) => (
                    <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} stopOpacity="0.3"/>
                  ))}
                </linearGradient>
              </defs>
              <path 
                d="M0,40 Q150,20 300,35 T600,30 T900,40 T1200,25 L1200,80 L0,80 Z" 
                fill="url(#gentleGrad)"
              />
              <path 
                d="M0,50 Q200,60 400,45 T800,55 T1200,40 L1200,80 L0,80 Z" 
                fill={colors[0]} 
                fillOpacity="0.15"
              />
            </svg>
          </div>
        )
        
      case 'organic':
        return (
          <div className={`relative h-24 w-full overflow-hidden ${className}`}>
            <svg viewBox="0 0 1200 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="organicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  {colors.map((c, i) => (
                    <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} stopOpacity="0.4"/>
                  ))}
                </linearGradient>
                <filter id="blur">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2"/>
                </filter>
              </defs>
              {/* Organic blob shapes */}
              <ellipse cx="10%" cy="70%" rx="180" ry="50" fill={colors[0] || '#C1121F'} fillOpacity="0.2" filter="url(#blur)"/>
              <ellipse cx="40%" cy="65%" rx="220" ry="55" fill={colors[1] || '#FF6B6B'} fillOpacity="0.2" filter="url(#blur)"/>
              <ellipse cx="75%" cy="72%" rx="200" ry="48" fill={colors[2] || '#4ECDC4'} fillOpacity="0.2" filter="url(#blur)"/>
              <ellipse cx="95%" cy="68%" rx="150" ry="42" fill={colors[0] || '#C1121F'} fillOpacity="0.15" filter="url(#blur)"/>
              
              {/* Wave overlay */}
              <path 
                d="M0,60 C200,80 400,40 600,65 C800,90 1000,50 1200,70 L1200,100 L0,100 Z"
                fill="url(#organicGrad)"
                opacity="0.5"
              />
            </svg>
          </div>
        )
        
      case 'dramatic':
        return (
          <div className={`relative h-20 w-full overflow-hidden ${className}`}>
            <svg viewBox="0 0 1200 90" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="dramaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  {colors.map((c, i) => (
                    <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c}/>
                  ))}
                </linearGradient>
              </defs>
              {/* Sharp geometric shapes */}
              <polygon 
                points="0,90 0,30 150,50 300,20 450,45 600,15 750,40 900,25 1050,50 1200,30 1200,90"
                fill="url(#dramaGrad)"
                opacity="0.7"
              />
              <polygon 
                points="0,90 0,55 200,65 400,50 600,70 800,55 1000,68 1200,58 1200,90"
                fill={colors[0]}
                opacity="0.3"
              />
            </svg>
          </div>
        )
        
      case 'sharp':
        return (
          <div className={`relative h-12 w-full overflow-hidden ${className}`}>
            <svg viewBox="0 0 1200 60" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sharpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  {colors.map((c, i) => (
                    <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} stopOpacity="0.8"/>
                  ))}
                </linearGradient>
              </defs>
              {/* Sharp zigzag pattern */}
              <polyline 
                points="0,60 0,20 100,35 200,15 300,30 400,10 500,28 600,12 700,32 800,18 900,38 1000,22 1100,36 1200,18 1200,60"
                fill="url(#sharpGrad)"
              />
            </svg>
          </div>
        )
        
      case 'wave':
        return (
          <div className={`relative h-16 w-full overflow-hidden ${className}`}>
            <svg viewBox="0 0 1200 80" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  {colors.map((c, i) => (
                    <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} stopOpacity="0.5"/>
                  ))}
                </linearGradient>
              </defs>
              {/* Multiple wave layers */}
              <path 
                d="M0,40 Q75,20 150,40 T300,40 T450,40 T600,40 T750,40 T900,40 T1050,40 T1200,40 L1200,80 L0,80 Z"
                fill="url(#waveGrad)"
                className="animate-wave"
              />
              <path 
                d="M0,50 Q100,65 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50 L1200,80 L0,80 Z"
                fill={colors[0]}
                fillOpacity="0.2"
                style={{animationDelay: '1s'}}
              />
            </svg>
          </div>
        )
        
      case 'blob':
        return (
          <div className={`relative h-32 w-full overflow-hidden ${className}`}>
            <svg viewBox="0 0 1200 130" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="blobGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colors[0] || '#C1121F'} stopOpacity="0.3"/>
                  <stop offset="100%" stopColor={colors[1] || '#FF6B6B'} stopOpacity="0.2"/>
                </linearGradient>
                <linearGradient id="blobGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors[2] || '#4ECDC4'} stopOpacity="0.25"/>
                  <stop offset="100%" stopColor={colors[0] || '#C1121F'} stopOpacity="0.15"/>
                </linearGradient>
              </defs>
              {/* Blob shapes */}
              <path 
                d="M0,100 C100,60 200,120 350,80 C500,40 550,110 700,85 C850,60 950,115 1100,75 C1150,62 1180,90 1200,95 L1200,130 L0,130 Z"
                fill="url(#blobGrad1)"
                className="animate-blob-1"
              />
              <path 
                d="M0,110 C150,140 300,85 480,105 C660,125 780,75 950,100 C1080,118 1150,95 1200,102 L1200,130 L0,130 Z"
                fill="url(#blobGrad2)"
                className="animate-blob-2"
              />
            </svg>
          </div>
        )
    }
  }

  return getDivider()
}
