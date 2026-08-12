'use client';

import React, { useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Microscope, 
  FlaskConical, 
  Dna, 
  Atom,
  Sparkles as SparklesIcon,
  CircleDot
} from 'lucide-react';

// ============================================================================
// COLOR PALETTE
// ============================================================================
const COLORS = {
  primary: '#C1121F',
  coral: '#FF6B6B',
  teal: '#4ECDC4',
  yellow: '#FFE66D',
  purple: '#A855F7',
  blue: '#3B82F6',
  green: '#10B981',
  amber: '#F59E0B',
};

const PASTELS = {
  primary: 'rgba(193, 18, 31, 0.15)',
  coral: 'rgba(255, 107, 107, 0.2)',
  teal: 'rgba(78, 205, 196, 0.15)',
  yellow: 'rgba(255, 230, 109, 0.25)',
  purple: 'rgba(168, 85, 247, 0.15)',
  blue: 'rgba(59, 130, 246, 0.15)',
  green: 'rgba(16, 185, 129, 0.15)',
  amber: 'rgba(245, 158, 11, 0.2)',
};

// Dark mode colors
const DARK_COLORS = {
  ...COLORS,
  primary: '#EF4444',
  coral: '#F87171',
  teal: '#2DD4BF',
  yellow: '#FDE047',
};

// ============================================================================
// INTERFACES
// ============================================================================
interface BaseDoodleProps {
  position?: { x?: number; y?: number };
  size?: number;
  opacity?: number;
  className?: string;
  delay?: number;
}

interface BioDoodlesProps {
  variant?: 'full' | 'minimal' | 'colorful' | 'subtle';
  density?: 'low' | 'medium' | 'high';
  className?: string;
}

// ============================================================================
// GRADIENT DEFINITIONS
// ============================================================================
const Gradients = () => (
  <defs>
    {/* DNA Helix Gradient */}
    <linearGradient id="dnaGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor={COLORS.purple} />
      <stop offset="50%" stopColor={COLORS.blue} />
      <stop offset="100%" stopColor={COLORS.teal} />
    </linearGradient>
    <linearGradient id="dnaGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor={COLORS.coral} />
      <stop offset="50%" stopColor={COLORS.amber} />
      <stop offset="100%" stopColor={COLORS.yellow} />
    </linearGradient>
    
    {/* Molecule Gradient */}
    <radialGradient id="moleculeGradient" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stopColor={COLORS.teal} stopOpacity="0.9" />
      <stop offset="100%" stopColor={COLORS.blue} stopOpacity="0.6" />
    </radialGradient>
    
    {/* Cell Gradient */}
    <radialGradient id="cellGradient" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stopColor={PASTELS.coral} />
      <stop offset="70%" stopColor={PASTELS.primary} />
      <stop offset="100%" stopColor={COLORS.coral} stopOpacity="0.3" />
    </radialGradient>
    <radialGradient id="nucleusGradient" cx="35%" cy="35%" r="60%">
      <stop offset="0%" stopColor={COLORS.purple} stopOpacity="0.8" />
      <stop offset="100%" stopColor={COLORS.primary} stopOpacity="0.6" />
    </radialGradient>
    
    {/* Beaker Gradient */}
    <linearGradient id="beakerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor={COLORS.blue} stopOpacity="0.4" />
      <stop offset="100%" stopColor={COLORS.teal} stopOpacity="0.3" />
    </linearGradient>
    <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={COLORS.green} stopOpacity="0.7" />
      <stop offset="100%" stopColor={COLORS.teal} stopOpacity="0.5" />
    </linearGradient>
    
    {/* Orb Gradients */}
    <radialGradient id="orbPurple" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={COLORS.purple} stopOpacity="0.4" />
      <stop offset="100%" stopColor={COLORS.purple} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="orbBlue" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={COLORS.blue} stopOpacity="0.35" />
      <stop offset="100%" stopColor={COLORS.blue} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="orbTeal" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={COLORS.teal} stopOpacity="0.3" />
      <stop offset="100%" stopColor={COLORS.teal} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="orbCoral" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={COLORS.coral} stopOpacity="0.3" />
      <stop offset="100%" stopColor={COLORS.coral} stopOpacity="0" />
    </radialGradient>

    {/* Glow Filter */}
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    {/* Soft Shadow Filter */}
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.1"/>
    </filter>
  </defs>
);

// ============================================================================
// FLOATING DNA HELIX COMPONENT
// ============================================================================
export const FloatingDNA: React.FC<BaseDoodleProps> = ({
  position = { x: 0, y: 0 },
  size = 120,
  opacity = 0.8,
  className = '',
  delay = 0,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  return (
    <motion.div
      ref={ref}
      className={`absolute pointer-events-none ${className}`}
      style={{ 
        left: position.x !== undefined ? `${position.x}%` : undefined,
        top: position.y !== undefined ? `${position.y}%` : undefined,
        right: position.x === undefined && position.y !== undefined ? undefined : '10%',
        opacity: isInView ? opacity : 0,
        width: size,
        height: size * 1.5,
      }}
      initial={{ scale: 0, rotate: -10 }}
      animate={isInView ? { 
        scale: 1, 
        rotate: [-10, 5, -5, 10, -10],
        y: [0, -10, 0],
      } : {}}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    >
      <svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Gradients />
        
        {/* Left helix strand */}
        <path
          d="M20 5 Q35 15, 20 25 Q5 35, 20 45 Q35 55, 20 65 Q5 75, 20 85 Q35 95, 20 105 Q5 115, 20 120"
          stroke="url(#dnaGradient1)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          filter="url(#glow)"
        />
        
        {/* Right helix strand */}
        <path
          d="M60 5 Q45 15, 60 25 Q75 35, 60 45 Q45 55, 60 65 Q75 75, 60 85 Q45 95, 60 105 Q75 115, 60 120"
          stroke="url(#dnaGradient2)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          filter="url(#glow)"
        />
        
        {/* Base pairs (rungs) */}
        {[15, 35, 55, 75, 95].map((y, i) => (
          <g key={i}>
            <line
              x1={20 + Math.sin(i * 0.8) * 5}
              y1={y}
              x2={60 - Math.sin(i * 0.8) * 5}
              y2={y}
              stroke={i % 2 === 0 ? COLORS.teal : COLORS.amber}
              strokeWidth="2"
              strokeDasharray="4 2"
              opacity="0.7"
            />
            {/* Base pair dots */}
            <circle cx={38} cy={y} r="3" fill={i % 2 === 0 ? COLORS.green : COLORS.yellow} opacity="0.8" />
          </g>
        ))}
        
        {/* Decorative nucleotides on strands */}
        {[10, 30, 50, 70, 90, 110].map((y, i) => (
          <g key={`nuc-${i}`}>
            <circle 
              cx={20 + Math.sin(i * 0.6) * 8} 
              cy={y} 
              r="4" 
              fill={i % 3 === 0 ? COLORS.purple : i % 3 === 1 ? COLORS.coral : COLORS.blue}
              opacity="0.9"
            />
            <circle 
              cx={60 - Math.sin(i * 0.6) * 8} 
              cy={y} 
              r="4" 
              fill={i % 3 === 0 ? COLORS.amber : i % 3 === 1 ? COLORS.teal : COLORS.green}
              opacity="0.9"
            />
          </g>
        ))}
      </svg>
    </motion.div>
  );
};

// ============================================================================
// MOLECULE DOODLE COMPONENT
// ============================================================================
export const MoleculeDoodle: React.FC<BaseDoodleProps & { type?: 'hexagon' | 'ring' | 'chain' | 'complex' }> = ({
  position = { x: 0, y: 0 },
  size = 100,
  opacity = 0.85,
  className = '',
  delay = 0,
  type = 'hexagon',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  const renderMolecule = () => {
    switch (type) {
      case 'hexagon':
        return (
          <>
            {/* Benzene-like hexagon ring */}
            <polygon
              points="50,15 78,32 78,68 50,85 22,68 22,32"
              stroke={COLORS.teal}
              strokeWidth="2.5"
              fill="url(#moleculeGradient)"
              strokeLinejoin="round"
            />
            {/* Inner circle for aromaticity */}
            <circle cx="50" cy="50" r="18" stroke={COLORS.blue} strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.6" />
            {/* Atoms at vertices */}
            {[
              [50, 12], [82, 33], [82, 67], [50, 88], [18, 67], [18, 33]
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="6" 
                fill={i % 2 === 0 ? COLORS.coral : COLORS.purple}
                stroke="white"
                strokeWidth="1.5"
                opacity="0.9"
              />
            ))}
            {/* Substituents */}
            <line x1="18" y1="33" x2="2" y2="22" stroke={COLORS.amber} strokeWidth="2" />
            <circle cx="2" cy="22" r="5" fill={COLORS.green} stroke="white" strokeWidth="1" />
            <line x1="82" y1="67" x2="98" y2="78" stroke={COLORS.amber} strokeWidth="2" />
            <circle cx="98" cy="78" r="5" fill={COLORS.yellow} stroke="white" strokeWidth="1" />
          </>
        );
      
      case 'ring':
        return (
          <>
            {/* Five-membered ring */}
            <polygon
              points="50,10 78,35 65,72 35,72 22,35"
              stroke={COLORS.purple}
              strokeWidth="2.5"
              fill={PASTELS.purple}
              strokeLinejoin="round"
            />
            {/* Six-membered fused ring */}
            <polygon
              points="50,48 78,35 95,58 85,90 57,90 42,72"
              stroke={COLORS.blue}
              strokeWidth="2.5"
              fill={PASTELS.blue}
              strokeLinejoin="round"
            />
            {/* Atom decorations */}
            <circle cx="50" cy="10" r="5" fill={COLORS.coral} stroke="white" strokeWidth="1" />
            <circle cx="95" cy="58" r="5" fill={COLORS.teal} stroke="white" strokeWidth="1" />
            <circle cx="35" cy="72" r="4" fill={COLORS.amber} stroke="white" strokeWidth="1" />
          </>
        );
      
      case 'chain':
        return (
          <>
            {/* Chain of atoms */}
            {[
              { x: 10, y: 50, color: COLORS.coral },
              { x: 28, y: 35, color: COLORS.blue },
              { x: 50, y: 45, color: COLORS.teal },
              { x: 72, y: 30, color: COLORS.purple },
              { x: 90, y: 45, color: COLORS.green },
            ].map((atom, i, arr) => (
              <React.Fragment key={i}>
                {i < arr.length - 1 && (
                  <line
                    x1={atom.x}
                    y1={atom.y}
                    x2={arr[i + 1].x}
                    y2={arr[i + 1].y}
                    stroke={COLORS.amber}
                    strokeWidth="2.5"
                  />
                )}
                <circle
                  cx={atom.x}
                  cy={atom.y}
                  r="8"
                  fill={atom.color}
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Element symbols */}
                <text
                  x={atom.x}
                  y={atom.y + 3}
                  textAnchor="middle"
                  fontSize="8"
                  fill="white"
                  fontWeight="bold"
                >
                  {['C', 'N', 'O', 'P', 'S'][i]}
                </text>
              </React.Fragment>
            ))}
            {/* Branching atoms */}
            <line x1="50" y1="45" x2="50" y2="75" stroke={COLORS.amber} strokeWidth="2" />
            <circle cx="50" cy="80" r="6" fill={COLORS.yellow} stroke="white" strokeWidth="1.5" />
            <line x1="72" y1="30" x2="85" y2="15" stroke={COLORS.amber} strokeWidth="2" />
            <circle cx="88" cy="12" r="5" fill={COLORS.coral} stroke="white" strokeWidth="1.5" />
          </>
        );
      
      case 'complex':
      default:
        return (
          <>
            {/* Central complex molecule */}
            <circle cx="50" cy="50" r="20" fill={PASTELS.teal} stroke={COLORS.teal} strokeWidth="2" />
            
            {/* Surrounding atoms in orbital pattern */}
            {[
              { angle: 0, dist: 35, color: COLORS.coral, size: 8 },
              { angle: 60, dist: 38, color: COLORS.blue, size: 7 },
              { angle: 120, dist: 32, color: COLORS.purple, size: 9 },
              { angle: 180, dist: 36, color: COLORS.green, size: 7 },
              { angle: 240, dist: 34, color: COLORS.amber, size: 8 },
              { angle: 300, dist: 37, color: COLORS.yellow, size: 6 },
            ].map((atom, i) => {
              const rad = (atom.angle * Math.PI) / 180;
              const x = 50 + atom.dist * Math.cos(rad);
              const y = 50 + atom.dist * Math.sin(rad);
              return (
                <g key={i}>
                  <line x1="50" y1="50" x2={x} y2={y} stroke={COLORS.amber} strokeWidth="2" opacity="0.7" />
                  <circle cx={x} cy={y} r={atom.size} fill={atom.color} stroke="white" strokeWidth="1.5" />
                </g>
              );
            })}
            
            {/* Electron cloud effect */}
            <circle cx="50" cy="50" r="45" stroke={COLORS.teal} strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.4" />
            <circle cx="50" cy="50" r="52" stroke={COLORS.blue} strokeWidth="0.5" strokeDasharray="2 6" fill="none" opacity="0.3" />
          </>
        );
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`absolute pointer-events-none ${className}`}
      style={{ 
        left: position.x !== undefined ? `${position.x}%` : undefined,
        top: position.y !== undefined ? `${position.y}%` : undefined,
        right: position.x === undefined ? '5%' : undefined,
        bottom: position.y === undefined ? '15%' : undefined,
        opacity: isInView ? opacity : 0,
        width: size,
        height: size,
      }}
      initial={{ scale: 0, rotate: -180 }}
      animate={isInView ? { 
        scale: 1, 
        rotate: type === 'ring' ? [0, 360] : [-5, 5, -5],
        y: [0, -8, 0],
      } : {}}
      transition={{
        duration: type === 'ring' ? 20 : 6,
        delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Gradients />
        {renderMolecule()}
      </svg>
    </motion.div>
  );
};

// ============================================================================
// CELL ART COMPONENT
// ============================================================================
export const CellArt: React.FC<BaseDoodleProps & { showOrganelles?: boolean }> = ({
  position = { x: 0, y: 0 },
  size = 140,
  opacity = 0.85,
  className = '',
  delay = 0,
  showOrganelles = true,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  return (
    <motion.div
      ref={ref}
      className={`absolute pointer-events-none ${className}`}
      style={{ 
        left: position.x !== undefined ? `${position.x}%` : undefined,
        top: position.y !== undefined ? `${position.y}%` : (position.x === undefined ? '20%' : undefined),
        right: position.x === undefined ? '8%' : undefined,
        opacity: isInView ? opacity : 0,
        width: size,
        height: size,
      }}
      initial={{ scale: 0 }}
      animate={isInView ? { 
        scale: 1,
        y: [0, -12, 0],
        rotate: [0, 3, -3, 0],
      } : {}}
      transition={{
        duration: 7,
        delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    >
      <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Gradients />
        
        {/* Cell membrane (irregular shape for organic feel) */}
        <path
          d="M70 5 
             C95 8, 115 20, 125 40
             C135 60, 135 85, 125 105
             C115 125, 95 135, 70 138
             C45 135, 25 125, 15 105
             C5 85, 5 60, 15 40
             C25 20, 45 8, 70 5Z"
          stroke={COLORS.coral}
          strokeWidth="3"
          fill="url(#cellGradient)"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#softShadow)"
        />
        
        {/* Membrane texture - phospholipid bilayer suggestion */}
        <path
          d="M25 45 Q50 42, 75 47 Q100 52, 118 48"
          stroke={COLORS.coral}
          strokeWidth="1.5"
          strokeDasharray="3 4"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M22 95 Q50 98, 80 93 Q108 88, 120 92"
          stroke={COLORS.coral}
          strokeWidth="1.5"
          strokeDasharray="3 4"
          fill="none"
          opacity="0.4"
        />

        {/* Nucleus */}
        <ellipse
          cx="75"
          cy="70"
          rx="30"
          ry="28"
          stroke={COLORS.purple}
          strokeWidth="2.5"
          fill="url(#nucleusGradient)"
        />
        
        {/* Nucleolus */}
        <ellipse
          cx="82"
          cy="65"
          rx="10"
          ry="9"
          fill={COLORS.primary}
          opacity="0.6"
        />
        
        {/* Nuclear pores */}
        {[[-5, 10], [28, -15], [32, 18], [-8, -8]].map(([dx, dy], i) => (
          <circle key={i} cx={75 + dx} cy={70 + dy} r="3" fill={COLORS.teal} opacity="0.7" />
        ))}

        {showOrganelles && (
          <>
            {/* Mitochondria */}
            <g transform="translate(25, 55)">
              <ellipse cx="18" cy="12" rx="16" ry="8" stroke={COLORS.amber} strokeWidth="2" fill={PASTELS.amber} />
              {/* Inner membrane folds (cristae) */}
              <path d="M8 8 Q14 12, 10 16" stroke={COLORS.amber} strokeWidth="1.5" fill="none" />
              <path d="M16 6 Q22 12, 18 18" stroke={COLORS.amber} strokeWidth="1.5" fill="none" />
              <path d="M24 8 Q28 12, 26 16" stroke={COLORS.amber} strokeWidth="1.5" fill="none" />
            </g>
            
            {/* Golgi apparatus */}
            <g transform="translate(95, 85)">
              <path d="M0 8 Q10 0, 20 6 Q28 12, 18 18 Q8 24, 0 16 Z" stroke={COLORS.blue} strokeWidth="2" fill={PASTELS.blue} />
              <path d="M3 11 Q11 5, 17 9" stroke={COLORS.blue} strokeWidth="1" fill="none" opacity="0.6" />
              <path d="M2 14 Q10 9, 16 13" stroke={COLORS.blue} strokeWidth="1" fill="none" opacity="0.6" />
            </g>
            
            {/* Endoplasmic reticulum */}
            <path
              d="M35 100 Q45 95, 40 105 Q35 115, 50 110 Q60 105, 55 115"
              stroke={COLORS.teal}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Ribosomes (small dots) */}
            {[
              [40, 45], [55, 42], [48, 52], [62, 48], [38, 55]
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.5" fill={COLORS.green} opacity="0.8" />
            ))}
            
            {/* Vesicles */}
            <circle cx="105" cy="55" r="8" stroke={COLORS.purple} strokeWidth="1.5" fill={PASTELS.purple} opacity="0.7" />
            <circle cx="30" cy="90" r="6" stroke={COLORS.coral} strokeWidth="1.5" fill={PASTELS.coral} opacity="0.7" />
            
            {/* Lysosome */}
            <circle cx="100" cy="105" r="7" stroke={COLORS.primary} strokeWidth="1.5" fill={PASTELS.primary} opacity="0.6" />
          </>
        )}
        
        {/* Cytoplasm texture dots */}
        {Array.from({ length: 15 }).map((_, i) => (
          <circle
            key={`cyto-${i}`}
            cx={30 + Math.random() * 80}
            cy={30 + Math.random() * 80}
            r={1 + Math.random() * 2}
            fill={COLORS.teal}
            opacity={0.2 + Math.random() * 0.3}
          />
        ))}
      </svg>
    </motion.div>
  );
};

// ============================================================================
// LAB EQUIPMENT COMPONENT
// ============================================================================
export const LabEquipment: React.FC<BaseDoodleProps & { equipment?: 'beaker' | 'flask' | 'microscope' | 'all' }> = ({
  position = { x: 0, y: 0 },
  size = 100,
  opacity = 0.8,
  className = '',
  delay = 0,
  equipment = 'all',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  const renderEquipment = () => {
    switch (equipment) {
      case 'beaker':
        return (
          <g transform="translate(25, 10)">
            {/* Beaker body */}
            <path
              d="M5 20 L5 80 Q5 92, 17 92 L63 92 Q75 92, 75 80 L75 20"
              stroke={COLORS.blue}
              strokeWidth="2.5"
              fill="url(#beakerGradient)"
              strokeLinejoin="round"
            />
            {/* Liquid inside */}
            <path
              d="M9 50 L9 78 Q9 88, 19 88 L61 88 Q71 88, 71 78 L71 50 Q40 56, 9 50Z"
              fill="url(#liquidGradient)"
            />
            {/* Bubbles in liquid */}
            <circle cx="25" cy="70" r="4" fill="white" opacity="0.5" />
            <circle cx="45" cy="65" r="3" fill="white" opacity="0.4" />
            <circle cx="55" cy="75" r="5" fill="white" opacity="0.3" />
            {/* Spout */}
            <path d="M5 20 Q-2 15, 5 10 L20 10" stroke={COLORS.blue} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Lip */}
            <line x1="5" y1="20" x2="75" y2="20" stroke={COLORS.blue} strokeWidth="3" strokeLinecap="round" />
            {/* Measurement lines */}
            {[35, 50, 65].map((y, i) => (
              <g key={i}>
                <line x1="68" y1={y} x2="74" y2={y} stroke={COLORS.blue} strokeWidth="1" opacity="0.6" />
                {i === 1 && <line x1="68" y1={y} x2="72" y2={y + 8} stroke={COLORS.blue} strokeWidth="1" opacity="0.4" />}
              </g>
            ))}
          </g>
        );
      
      case 'flask':
        return (
          <g transform="translate(25, 5)">
            {/* Erlenmeyer flask */}
            <path
              d="M30 5 L30 35 L5 85 Q0 95, 12 98 L68 98 Q80 95, 75 85 L50 35 L50 5"
              stroke={COLORS.teal}
              strokeWidth="2.5"
              fill={PASTELS.teal}
              strokeLinejoin="round"
            />
            {/* Neck */}
            <rect x="28" y="2" width="24" height="8" stroke={COLORS.teal} strokeWidth="2" fill="none" rx="2" />
            {/* Liquid */}
            <path
              d="M12 75 L15 85 Q18 93, 28 94 L52 94 Q62 93, 65 85 L68 75 Q40 82, 12 75Z"
              fill={COLORS.green}
              opacity="0.5"
            />
            {/* Bubbles rising */}
            <circle cx="35" cy="85" r="3" fill="white" opacity="0.5" />
            <circle cx="48" cy="80" r="2" fill="white" opacity="0.4" />
            <circle cx="40" cy="75" r="2.5" fill="white" opacity="0.3" />
          </g>
        );
      
      case 'microscope':
        return (
          <g transform="translate(15, 5)">
            {/* Base */}
            <ellipse cx="35" cy="95" rx="30" ry="8" stroke={COLORS.purple} strokeWidth="2.5" fill={PASTELS.purple} />
            {/* Arm */}
            <path
              d="M20 90 Q15 60, 25 40 L45 40 Q55 60, 50 90"
              stroke={COLORS.purple}
              strokeWidth="2.5"
              fill={PASTELS.purple}
            />
            {/* Eyepiece tube */}
            <rect x="30" y="8" width="10" height="25" stroke={COLORS.purple} strokeWidth="2" fill={PASTELS.purple} rx="2" transform="rotate(-15, 35, 20)" />
            {/* Eyepiece */}
            <ellipse cx="27" cy="5" rx="7" ry="4" stroke={COLORS.purple} strokeWidth="2" fill={PASTELS.purple} transform="rotate(-15, 27, 5)" />
            {/* Objective lens */}
            <rect x="23" y="38" width="8" height="12" stroke={COLORS.blue} strokeWidth="2" fill={COLORS.blue} opacity="0.5" rx="1" />
            {/* Stage */}
            <rect x="15" y="55" width="40" height="4" stroke={COLORS.purple} strokeWidth="2" fill={PASTELS.purple} rx="1" />
            {/* Focus knob */}
            <circle cx="53" cy="65" r="6" stroke={COLORS.amber} strokeWidth="2" fill={PASTELS.amber} />
            {/* Specimen slide hint */}
            <rect x="28" y="51" width="14" height="3" fill={COLORS.teal} opacity="0.6" rx="1" />
          </g>
        );
      
      case 'all':
      default:
        return (
          <>
            {/* Small beaker */}
            <g transform="translate(5, 50) scale(0.5)">
              <path d="M5 20 L5 80 Q5 92, 17 92 L63 92 Q75 92, 75 80 L75 20" stroke={COLORS.blue} strokeWidth="4" fill={PASTELS.blue} />
              <path d="M10 55 L10 77 Q10 87, 20 87 L60 87 Q70 87, 70 77 L70 55 Q40 62, 10 55Z" fill={COLORS.green} opacity="0.5" />
              <line x1="5" y1="20" x2="75" y2="20" stroke={COLORS.blue} strokeWidth="4" strokeLinecap="round" />
            </g>
            
            {/* Small flask */}
            <g transform="translate(60, 55) scale(0.45)">
              <path d="M30 5 L30 35 L5 85 Q0 95, 12 98 L68 98 Q80 95, 75 85 L50 35 L50 5" stroke={COLORS.teal} strokeWidth="4" fill={PASTELS.teal} />
              <path d="M12 72 L15 85 Q18 93, 28 94 L52 94 Q62 93, 65 85 L68 72 Q40 80, 12 72Z" fill={COLORS.coral} opacity="0.5" />
            </g>
            
            {/* Test tubes */}
            <g transform="translate(35, 5)">
              <rect x="0" y="0" width="12" height="40" rx="6" stroke={COLORS.purple} strokeWidth="2" fill={PASTELS.purple} />
              <rect x="2" y="20" width="8" height="18" rx="4" fill={COLORS.amber} opacity="0.6" />
              
              <rect x="16" y="5" width="12" height="40" rx="6" stroke={COLORS.coral} strokeWidth="2" fill={PASTELS.coral} />
              <rect x="18" y="22" width="8" height="16" rx="4" fill={COLORS.teal} opacity="0.6" />
              
              <rect x="32" y="2" width="12" height="40" rx="6" stroke={COLORS.green} strokeWidth="2" fill={PASTELS.green} />
              <rect x="34" y="18" width="8" height="20" rx="4" fill={COLORS.purple} opacity="0.5" />
            </g>
            
            {/* Petri dish */}
            <g transform="translate(5, 10)">
              <ellipse cx="20" cy="15" rx="18" ry="6" stroke={COLORS.blue} strokeWidth="2" fill={PASTELS.blue} />
              <ellipse cx="20" cy="13" rx="14" ry="4" fill={COLORS.green} opacity="0.3" />
              {/* Colonies */}
              <circle cx="15" cy="12" r="2" fill={COLORS.green} opacity="0.6" />
              <circle cx="24" cy="14" r="1.5" fill={COLORS.green} opacity="0.5" />
              <circle cx="20" cy="10" r="1" fill={COLORS.green} opacity="0.5" />
            </g>
          </>
        );
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`absolute pointer-events-none ${className}`}
      style={{ 
        left: position.x !== undefined ? `${position.x}%` : undefined,
        top: position.y !== undefined ? `${position.y}%` : undefined,
        right: position.x === undefined ? '3%' : undefined,
        bottom: position.y === undefined ? '10%' : undefined,
        opacity: isInView ? opacity : 0,
        width: size,
        height: size,
      }}
      initial={{ y: 50, opacity: 0 }}
      animate={isInView ? { 
        y: [0, -5, 0],
        rotate: equipment === 'all' ? [0, 2, -2, 0] : 0,
      } : {}}
      transition={{
        duration: 5,
        delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Gradients />
        {renderEquipment()}
      </svg>
    </motion.div>
  );
};

// ============================================================================
// SPARKLES / FLOATING PARTICLES COMPONENT
// ============================================================================
export const Sparkles: React.FC<BaseDoodleProps & { count?: number; spread?: number }> = ({
  position = { x: 0, y: 0 },
  size = 150,
  opacity = 0.7,
  className = '',
  delay = 0,
  count = 12,
  spread = 100,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  // Generate random but deterministic particles
  const particles = Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: 10 + ((i * 137.5) % 80), // Golden angle distribution
    y: 10 + ((i * 73.3) % 80),
    size: 2 + (i % 4),
    color: Object.values(COLORS)[i % Object.values(COLORS).length],
    delay: (i * 0.15),
    duration: 2 + (i % 3),
    type: i % 4, // 0: star, 1: circle, 2: diamond, 3: dot
  }));

  const renderParticle = (particle: typeof particles[0]) => {
    const { type, x, y, size, color } = particle;
    
    switch (type) {
      case 0: // Star
        return (
          <g key={particle.id}>
            <path
              d={`M${x} ${y - size} L${x + size * 0.3} ${y - size * 0.3} L${x + size} ${y} L${x + size * 0.3} ${y + size * 0.3} L${x} ${y + size} L${x - size * 0.3} ${y + size * 0.3} L${x - size} ${y} L${x - size * 0.3} ${y - size * 0.3} Z`}
              fill={color}
              opacity="0.8"
            />
          </g>
        );
      case 1: // Circle with glow
        return (
          <circle
            key={particle.id}
            cx={x}
            cy={y}
            r={size}
            fill={color}
            opacity="0.6"
          />
        );
      case 2: // Diamond
        return (
          <rect
            key={particle.id}
            x={x - size * 0.6}
            y={y - size * 0.6}
            width={size * 1.2}
            height={size * 1.2}
            fill={color}
            opacity="0.7"
            transform={`rotate(45, ${x}, ${y})`}
          />
        );
      case 3: // Small dot with ring
      default:
        return (
          <g key={particle.id}>
            <circle cx={x} cy={y} r={size * 0.5} fill={color} opacity="0.9" />
            <circle cx={x} cy={y} r={size * 1.2} stroke={color} strokeWidth="0.5" fill="none" opacity="0.4" />
          </g>
        );
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`absolute pointer-events-none overflow-visible ${className}`}
      style={{ 
        left: position.x !== undefined ? `${position.x}%` : undefined,
        top: position.y !== undefined ? `${position.y}%` : undefined,
        width: size,
        height: size,
        opacity: isInView ? opacity : 0,
      }}
      initial={{ scale: 0 }}
      animate={isInView ? { scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <svg viewBox={`0 0 100 100`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {particles.map((particle) => (
          <motion.g
            key={particle.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? {
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
              y: [0, -8, 0],
              x: [0, particle.id % 2 === 0 ? 3 : -3, 0],
            } : {}}
            transition={{
              duration: particle.duration,
              delay: delay + particle.delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            {renderParticle(particle)}
          </motion.g>
        ))}
      </svg>
    </motion.div>
  );
};

// ============================================================================
// GRADIENT ORBS COMPONENT
// ============================================================================
export const GradientOrbs: React.FC<BaseDoodleProps & { orbs?: Array<{ color: string; size: number; x: number; y: number }> }> = ({
  position = { x: 0, y: 0 },
  size = 400,
  opacity = 0.6,
  className = '',
  delay = 0,
  orbs,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  const defaultOrbs = [
    { color: 'orbPurple', size: 150, x: 20, y: 30 },
    { color: 'orbBlue', size: 120, x: 70, y: 20 },
    { color: 'orbTeal', size: 100, x: 60, y: 70 },
    { color: 'orbCoral', size: 80, x: 15, y: 75 },
  ];

  const orbList = orbs || defaultOrbs;

  return (
    <motion.div
      ref={ref}
      className={`absolute pointer-events-none ${className}`}
      style={{ 
        left: position.x !== undefined ? `${position.x}%` : undefined,
        top: position.y !== undefined ? `${position.y}%` : (position.x === undefined ? 0 : undefined),
        right: position.x === undefined ? 0 : undefined,
        width: size,
        height: size,
        opacity: isInView ? opacity : 0,
      }}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: [0.4, 0.7, 0.4] } : {}}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <Gradients />
        {orbList.map((orb, i) => (
          <motion.circle
            key={i}
            cx={orb.x}
            cy={orb.y}
            r={orb.size / 4}
            fill={`url(#${orb.color})`}
            animate={isInView ? {
              cx: [orb.x, orb.x + 5, orb.x - 3, orb.x],
              cy: [orb.y, orb.y - 5, orb.y + 3, orb.y],
              r: [orb.size / 4, orb.size / 3.8, orb.size / 4.2, orb.size / 4],
            } : {}}
            transition={{
              duration: 10 + i * 2,
              delay: delay + i * 0.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
};

// ============================================================================
// MAIN BIODOODLES WRAPPER COMPONENT
// ============================================================================
export const BioDoodles: React.FC<BioDoodlesProps> = ({
  variant = 'full',
  density = 'medium',
  className = '',
}) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false });

  // Density settings for each element
  const densitySettings = {
    low: { sparklesCount: 6, showAllEquipment: false, orbSize: 300 },
    medium: { sparklesCount: 12, showAllEquipment: true, orbSize: 400 },
    high: { sparklesCount: 20, showAllEquipment: true, orbSize: 500 },
  };

  const settings = densitySettings[density];

  // Variant configurations
  const renderVariant = () => {
    switch (variant) {
      case 'minimal':
        return (
          <>
            <GradientOrbs size={settings.orbSize} opacity={0.3} delay={0.2} />
            <Sparkles count={Math.floor(settings.sparklesCount / 2)} size={120} opacity={0.5} delay={0.4} />
          </>
        );
      
      case 'colorful':
        return (
          <>
            <GradientOrbs 
              size={settings.orbSize} 
              opacity={0.7} 
              delay={0}
              orbs={[
                { color: 'orbPurple', size: 180, x: 15, y: 25 },
                { color: 'orbCoral', size: 140, x: 75, y: 15 },
                { color: 'orbTeal', size: 160, x: 55, y: 75 },
                { color: 'orbBlue', size: 120, x: 10, y: 80 },
              ]}
            />
            <FloatingDNA position={{ x: 5, y: 10 }} size={100} opacity={0.9} delay={0.1} />
            <FloatingDNA position={{ x: 80, y: 60 }} size={80} opacity={0.7} delay={0.5} />
            <MoleculeDoodle position={{ x: 75, y: 15 }} size={90} type="complex" delay={0.2} />
            <MoleculeDoodle position={{ x: 10, y: 70 }} size={70} type="ring" delay={0.6} />
            <CellArt position={{ x: 60, y: 55 }} size={110} showOrganelles delay={0.3} />
            <LabEquipment position={{ x: 2, y: 45 }} size={80} equipment="flask" delay={0.4} />
            <Sparkles count={settings.sparklesCount} size={180} opacity={0.8} delay={0.1} />
          </>
        );
      
      case 'subtle':
        return (
          <>
            <GradientOrbs size={settings.orbSize} opacity={0.2} delay={0.3} />
            <FloatingDNA position={{ x: 85, y: 15 }} size={70} opacity={0.4} delay={0.5} />
            <MoleculeDoodle position={{ x: 5, y: 75 }} size={60} type="hexagon" opacity={0.35} delay={0.7} />
            <Sparkles count={Math.floor(settings.sparklesCount / 3)} size={100} opacity={0.3} delay={0.6} />
          </>
        );
      
      case 'full':
      default:
        return (
          <>
            {/* Background gradient orbs */}
            <GradientOrbs size={settings.orbSize} opacity={0.5} delay={0} />
            
            {/* DNA Helixes */}
            <FloatingDNA position={{ x: 3, y: 5 }} size={130} opacity={0.85} delay={0.1} />
            <FloatingDNA position={{ x: 78, y: 55 }} size={100} opacity={0.7} delay={0.4} />
            
            {/* Molecules */}
            <MoleculeDoodle position={{ x: 70, y: 8 }} size={110} type="complex" delay={0.15} />
            <MoleculeDoodle position={{ x: 8, y: 65 }} size={90} type="hexagon" delay={0.5} />
            <MoleculeDoodle position={{ x: 55, y: 75 }} size={75} type="chain" delay={0.7} />
            
            {/* Cell Art */}
            <CellArt position={{ x: 45, y: 35 }} size={130} showOrganelles delay={0.25} />
            <CellArt position={{ x: 82, y: 20 }} size={90} showOrganelles={false} delay={0.6} />
            
            {/* Lab Equipment */}
            <LabEquipment 
              position={{ x: 2, y: 25 }} 
              size={settings.showAllEquipment ? 100 : 80} 
              equipment={settings.showAllEquipment ? 'all' : 'beaker'} 
              delay={0.3} 
            />
            <LabEquipment position={{ x: 75, y: 80 }} size={70} equipment="microscope" delay={0.8} />
            
            {/* Floating particles/sparkles */}
            <Sparkles count={settings.sparklesCount} size={200} opacity={0.75} delay={0.2} />
            <Sparkles count={Math.floor(settings.sparklesCount / 2)} size={150} position={{ x: 60, y: 10 }} opacity={0.6} delay={0.5} />
          </>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {isInView && renderVariant()}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// EXPORT ALL COMPONENTS
// ============================================================================
export default BioDoodles;

// Re-export individual components for standalone usage
export {
  FloatingDNA as DNAHelix,
  MoleculeDoodle as Molecule,
  CellArt as Cell,
  LabEquipment as LabGear,
  Sparkles as Particles,
  GradientOrbs as Orbs,
};
