import React from 'react';
import { motion } from 'motion/react';
import { Ship as ShipType, PlayerID, ShipTheme } from '../types';
import { Ship as ShipIcon } from 'lucide-react';

interface ShipProps {
  ship: ShipType;
  pixelPos: { x: number; y: number };
  isSelected: boolean;
  count: number;
  shipTheme?: ShipTheme;
  onDragStart?: () => void;
  onClick?: () => void;
}

// Ship image mappings for each theme and player color
export const SHIP_IMAGE_MAP: Record<ShipTheme, Record<'blue' | 'red', string>> = {
  'classic': { blue: '/assets/ships/blue_1.png', red: '/assets/ships/red_1.png' },
  'neon': { blue: '/assets/ships/blue_2.png', red: '/assets/ships/red_2.png' },
  'stealth': { blue: '/assets/ships/blue_3.png', red: '/assets/ships/red_3.png' },
  'elite': { blue: '/assets/ships/blue_4.png', red: '/assets/ships/red_4.png' }
};

export const SubmarineIcon: React.FC<{ color: string; isSelected?: boolean; size?: number }> = ({ color, isSelected = false, size = 64 }) => {
  const glowColor = color === '#3b82f6' ? '#60a5fa' : '#fca5a5';
  const accentColor = color === '#3b82f6' ? '#0ea5e9' : '#fbbf24';
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
      <defs>
        {/* Enhanced Glow effect for Clash Royale style */}
        <filter id="submarineGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feMerge>
            <feMergeNode in="offsetblur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        {/* Gradient for hull - enhanced with accent colors */}
        <linearGradient id="hullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="50%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
        {/* Accent gradient */}
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <g transform="rotate(-90 32 32)" filter="url(#submarineGlow)">
        {/* Deep shadow for 3D effect */}
        <ellipse 
          cx="32" cy="37" rx="30" ry="8" 
          fill="rgba(0, 0, 0, 0.4)"
        />
        
        {/* Main Hull - enhanced Clash Royale torpedo shape */}
        <path
          d="M 8,32 Q 12,24 26,23 L 50,23 Q 58,23 60,32 Q 58,41 50,41 L 26,41 Q 12,40 8,32 Z"
          fill="url(#hullGradient)"
          stroke={color}
          strokeWidth={isSelected ? 4 : 3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Hull accent stripe */}
        <path
          d="M 10,32 Q 14,27 26,26 L 48,26 Q 55,26 58,32"
          fill="none"
          stroke={accentColor}
          strokeWidth={isSelected ? 2 : 1.5}
          strokeLinecap="round"
          opacity="0.7"
        />
        
        {/* Outer hull bright highlight */}
        <path
          d="M 8,32 Q 12,24 26,23 L 50,23 Q 58,23 60,32"
          fill="none"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth={isSelected ? 2.5 : 2}
          strokeLinecap="round"
        />
        
        {/* Conning Tower - enhanced */}
        <rect 
          x="25" y="25" width="14" height="14" rx="3"
          fill={color}
          stroke="white"
          strokeWidth="2"
          opacity="0.9"
        />
        {/* Tower accent */}
        <rect 
          x="26" y="26" width="12" height="6" rx="2"
          fill={accentColor}
          opacity="0.6"
        />
        
        {/* Periscope - enhanced */}
        <g>
          <rect 
            x="30.5" y="16" width="3" height="10"
            fill={color}
            stroke="white"
            strokeWidth="1.5"
            rx="1.5"
          />
          <circle cx="32" cy="15" r="2.5" fill={accentColor} stroke="white" strokeWidth="1.5" />
        </g>
        
        {/* Front torpedo slots */}
        <circle cx="58" cy="28" r="3.5" fill={color} stroke={accentColor} strokeWidth="1.5" opacity="0.9" />
        <circle cx="58" cy="36" r="3.5" fill={color} stroke={accentColor} strokeWidth="1.5" opacity="0.9" />
        <line x1="56" y1="32" x2="50" y2="32" stroke={accentColor} strokeWidth="2" opacity="0.6" />
        
        {/* Rear stabilizer fins */}
        <path 
          d="M 6,27 L 0,23 L 4,27 Z" 
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
        <path 
          d="M 6,37 L 0,41 L 4,37 Z" 
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
        
        {/* Engine propeller */}
        <circle cx="2" cy="32" r="3" fill="none" stroke={color} strokeWidth="2" />
        <line x1="2" y1="29" x2="2" y2="35" stroke={color} strokeWidth="1.5" />
        <line x1="-1" y1="32" x2="5" y2="32" stroke={color} strokeWidth="1.5" />
        
        {/* Enhanced selection indicator */}
        {isSelected && (
          <g>
            <circle cx="32" cy="18" r="5" fill="none" stroke={glowColor} strokeWidth="1.5" opacity="0.9" className="animate-pulse" />
            <circle cx="32" cy="32" r="32" fill="none" stroke={glowColor} strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
          </g>
        )}
      </g>
    </svg>
  );
};

export const Ship: React.FC<ShipProps> = ({ ship, pixelPos, isSelected, count, shipTheme = 'classic', onDragStart, onClick }) => {
  const color = ship.owner === 'Player1' ? '#3b82f6' : '#ef4444'; // Blue vs Red
  const playerColor = ship.owner === 'Player1' ? 'blue' : 'red';
  const shipImageSrc = SHIP_IMAGE_MAP[shipTheme]?.[playerColor];

  return (
    <motion.g
      initial={false}
      animate={{ x: pixelPos.x, y: pixelPos.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="cursor-pointer"
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
    >
      {/* Background tactical glow shadow - only animates when selected */}
      <motion.circle
        r={45}
        fill={color}
        fillOpacity={isSelected ? 0.15 : 0.08}
        filter="url(#shipGlow)"
        animate={isSelected ? {
          r: [45, 50, 45],
          fillOpacity: [0.2, 0.25, 0.2],
        } : { r: 45, fillOpacity: 0.08 }}
        transition={isSelected ? { duration: 2, repeat: Infinity } : { duration: 0.3 }}
      />

      {/* Outer tactical ring - only animates when selected */}
      <motion.circle
        r={36}
        fill="transparent"
        stroke={color}
        strokeWidth={isSelected ? 3.5 : 2}
        strokeOpacity={isSelected ? 1 : 0.5}
        animate={isSelected ? {
          r: [36, 40, 36],
          strokeOpacity: [1, 1, 1],
        } : { r: 36, strokeOpacity: 0.5 }}
        transition={isSelected ? { duration: 2.5, repeat: Infinity } : { duration: 0.3 }}
      />
      
      {/* Inner tactical ring - accent */}
      <circle
        r={30}
        fill="transparent"
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity={isSelected ? 0.6 : 0.2}
        strokeDasharray="4,3"
      />

      {/* Submarine Icon/Image with shadow */}
      <g transform="translate(-32, -32)" shapeRendering="crispEdges">
        {shipImageSrc ? (
          <image 
            x="0" y="0" width="64" height="64" 
            xlinkHref={shipImageSrc}
            opacity={isSelected ? 1 : 0.95}
            imageRendering="crisp-edges"
            preserveAspectRatio="none"
            style={{ filter: 'none' }}
          />
        ) : (
          <>
            <defs>
              <filter id="shipGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              </filter>
            </defs>
            <SubmarineIcon color={color} isSelected={isSelected} />
          </>
        )}
      </g>

      {/* Rotating selection ring */}
      {isSelected && (
        <motion.circle
          r="38"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="8,4"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          opacity="0.6"
        />
      )}
      
      {/* Hover glow effect */}
      {!isSelected && (
        <motion.circle
          r={36}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          opacity={0}
          whileHover={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Stack Count Indicator with Clash Royale style */}
      {count > 1 && (
        <g transform="translate(28, -28)">
          <defs>
            <linearGradient id={`countGrad-${ship.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <circle 
            r="14" 
            fill={`url(#countGrad-${ship.id})`}
            stroke="white"
            strokeWidth="2.5"
            filter="url(#shipGlow)"
          />
          <text
            y="5"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            className="pointer-events-none font-mono"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}
          >
            {count}
          </text>
        </g>
      )}
    </motion.g>
  );
};
