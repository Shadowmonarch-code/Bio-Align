'use client'

import React from 'react'

interface BioDoodlesProps {
  variant?: 'minimal' | 'colorful' | 'playful' | 'elegant'
  density?: 'low' | 'medium' | 'high'
  className?: string
}

export function BioDoodles({ variant = 'colorful', density = 'medium', className = '' }: BioDoodlesProps) {
  const opacity = density === 'low' ? 0.15 : density === 'medium' ? 0.25 : 0.35
  
  const getDoodles = (): React.ReactNode => {
    switch (variant) {
      case 'minimal':
        return (
          <>
            {/* DNA Helix */}
            <g opacity={opacity}>
              <path d="M50,100 Q150,50 250,100 T450,100" stroke="#C1121F" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
              <path d="M50,120 Q150,170 250,120 T450,120" stroke="#C1121F" strokeWidth="2" fill="none" strokeDasharray="5,5"/>
              {[100, 150, 200, 250, 300, 350].map((x) => (
                <line key={x} x1={x} y1={100 + (x % 40 - 20)} x2={x} y2={120 - (x % 40 - 20)} stroke="#C1121F" strokeWidth="1.5" opacity={0.5}/>
              ))}
            </g>
            <circle cx="10%" cy="20%" r="30" fill="#C1121F" opacity={opacity}/>
            <circle cx="90%" cy="80%" r="45" fill="#C1121F" opacity={opacity}/>
            <ellipse cx="85%" cy="15%" rx="25" ry="15" fill="#C1121F" opacity={opacity} transform="rotate(30 85% 15%)"/>
          </>
        )
      
      case 'colorful':
        return (
          <>
            <defs>
              <linearGradient id="dnaGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C1121F"/>
                <stop offset="50%" stopColor="#FF6B6B"/>
                <stop offset="100%" stopColor="#4ECDC4"/>
              </linearGradient>
              <linearGradient id="dnaGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A855F7"/>
                <stop offset="50%" stopColor="#3B82F6"/>
                <stop offset="100%" stopColor="#10B981"/>
              </linearGradient>
              <linearGradient id="cellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#A855F7" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            
            <g opacity={opacity}>
              <path d="M-50,200 Q100,100 250,200 T550,200 T850,200" stroke="url(#dnaGrad1)" strokeWidth="3" fill="none"/>
              <path d="M-50,220 Q100,320 250,220 T550,220 T850,220" stroke="url(#dnaGrad2)" strokeWidth="3" fill="none"/>
            </g>
            
            <g opacity={opacity}>
              <circle cx="5%" cy="10%" r="8" fill="#FF6B6B"/>
              <circle cx="5%" cy="10%" r="15" stroke="#FF6B6B" strokeWidth="1" fill="none"/>
              <circle cx="95%" cy="90%" r="10" fill="#4ECDC4"/>
              <circle cx="92%" cy="85%" r="6" fill="#A855F7"/>
              <line x1="95%" y1="90%" x2="92%" y2="85%" stroke="#666" strokeWidth="1"/>
            </g>
            
            <ellipse cx="88%" cy="12%" rx="35" ry="25" fill="url(#cellGrad)"/>
            <ellipse cx="8%" cy="85%" rx="28" ry="32" fill="url(#cellGrad)"/>
            
            <g opacity={opacity * 0.8} transform="translate(93%, 70%) rotate(25)">
              <path d="M0,0 Q15,-20 30,0 Q15,20 0,0" fill="#10B981"/>
              <line x1="0" y1="0" x2="30" y2="0" stroke="#059669" strokeWidth="1"/>
            </g>
            
            <g opacity={opacity * 0.6} transform="translate(3%, 45%)">
              <ellipse rx="25" ry="15" fill="none" stroke="#F59E0B" strokeWidth="2"/>
              <circle cx="-5" cy="-3" r="4" fill="#F59E0B" opacity={0.6}/>
              <circle cx="5" cy="4" r="3" fill="#F59E0B" opacity={0.6}/>
              <circle cx="-2" cy="6" r="2" fill="#F59E0B" opacity={0.6}/>
            </g>
          </>
        )
        
      case 'playful':
        return (
          <>
            <defs>
              <pattern id="dots" patternUnits="userSpaceOnUse" width="30" height="30">
                <circle cx="15" cy="15" r="2" fill="#C1121F" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
            
            <g opacity={opacity}>
              <g transform="translate(90%, 80%)">
                <circle r="20" fill="#FFE4E6"/>
                <circle cx="-6" cy="-4" r="3" fill="#333"/>
                <circle cx="6" cy="-4" r="3" fill="#333"/>
                <path d="M-8,6 Q0,14 8,6" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M-20,0 Q-30,-10 -35,5" stroke="#C1121F" strokeWidth="2" fill="none"/>
                <path d="M-20,5 Q-30,0 -38,12" stroke="#C1121F" strokeWidth="2" fill="none"/>
              </g>
              
              {['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7'].map((c, i) => (
                <g key={i} transform={`translate(${15 + i * 22}%, ${10 + (i % 3) * 25}%)`}>
                  <path d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z" fill={c}/>
                </g>
              ))}
              
              <path d="M0,400 Q120,384 240,400 T480,400 T720,400 T960,400 T1200,400" 
                    stroke="#FF6B6B" strokeWidth="3" fill="none" opacity={opacity * 1.5} strokeLinecap="round"/>
            </g>
          </>
        )
        
      case 'elegant':
        return (
          <>
            <defs>
              <linearGradient id="elegantGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C1121F"/>
                <stop offset="100%" stopColor="#DC2626"/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <g opacity={opacity * 1.2}>
              <g transform="translate(95%, 5%)" filter="url(#glow)">
                <path d="M0,0 M0,0 Q5,-5 10,0 T20,0 T30,-5 T40,-15 T55,-25 T75,-30"
                      stroke="url(#elegantGold)" strokeWidth="1.5" fill="none"/>
                <circle cx="0" cy="0" r="3" fill="#C1121F"/>
              </g>
              
              <g transform="translate(2%, 60%) rotate(-15)">
                <path d="M0,0 C10,-20 25,-30 40,-25 C25,-15 10,-5 0,0" fill="#059669" opacity={0.4}/>
                <path d="M0,0 C10,-20 25,-30 40,-25" stroke="#059669" strokeWidth="0.5" fill="none"/>
              </g>
              <g transform="translate(5%, 68%) rotate(-5)">
                <path d="M0,0 C15,-18 30,-25 45,-18 C30,-8 15,-2 0,0" fill="#10B981" opacity={0.3}/>
              </g>
              
              <polygon points="1152,74 1176,70 1200,74" fill="none" stroke="#C1121F" strokeWidth="1" opacity={0.5}/>
              <circle cx="48" cy="120" r="12" fill="none" stroke="#A855F7" strokeWidth="0.5" opacity={0.4}/>
              
              {Array.from({length: 20}).map((_, i) => (
                <circle 
                  key={i} 
                  cx={`${Math.random() * 100}%`} 
                  cy={`${Math.random() * 100}%`} 
                  r="1" 
                  fill="#C1121F" 
                  opacity={0.3}
                />
              ))}
            </g>
          </>
        )
      
      default:
        return null
    }
  }

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <svg 
        className="absolute inset-0 w-full h-full" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        {getDoodles()}
      </svg>
    </div>
  )
}
