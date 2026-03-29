import React from 'react';
import { HexCoord } from '../types';

interface HexTileProps {
  coord: HexCoord;
  size: number;
  pixelPos: { x: number; y: number };
  isHighlighted: boolean;
  highlightColor?: string;
  onClick: () => void;
  children?: React.ReactNode;
}

export const HexTile: React.FC<HexTileProps> = ({ 
  coord, 
  size, 
  pixelPos, 
  isHighlighted, 
  highlightColor = 'rgba(59, 130, 246, 0.5)',
  onClick,
  children 
}) => {
  const points = [];
  const gapFactor = 0.92;
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i + 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    points.push(`${pixelPos.x + size * gapFactor * Math.cos(angle_rad)},${pixelPos.y + size * gapFactor * Math.sin(angle_rad)}`);
  }

  // Create shadow points (offset for depth)
  const shadowPoints = [];
  const shadowOffset = 4;
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i + 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    shadowPoints.push(`${pixelPos.x + size * gapFactor * Math.cos(angle_rad) + shadowOffset},${pixelPos.y + size * gapFactor * Math.sin(angle_rad) + shadowOffset}`);
  }

  return (
    <g onClick={onClick} className="cursor-pointer group water-hex">
      {/* Deep shadow for 3D effect */}
      <polygon
        points={shadowPoints.join(' ')}
        fill="rgba(0, 0, 0, 0.4)"
        className="transition-all duration-200"
      />
      
      {/* Water texture overlay */}
      <defs>
        <linearGradient id={`waterGrad-${coord.q}-${coord.r}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {isHighlighted && highlightColor?.includes('239, 68, 68') ? (
            <>
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#dc2626" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.7" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor={isHighlighted ? '#f59e0b' : '#0ea5e9'} stopOpacity={isHighlighted ? 0.9 : 0.8} />
              <stop offset="30%" stopColor={isHighlighted ? '#d97706' : '#0284c7'} stopOpacity={isHighlighted ? 0.8 : 0.7} />
              <stop offset="70%" stopColor={isHighlighted ? '#b45309' : '#0369a1'} stopOpacity={isHighlighted ? 0.7 : 0.6} />
              <stop offset="100%" stopColor={isHighlighted ? '#92400e' : '#075985'} stopOpacity={isHighlighted ? 0.6 : 0.5} />
            </>
          )}
        </linearGradient>
        
        {/* Water ripple pattern */}
        <pattern id={`waterPattern-${coord.q}-${coord.r}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" fill="rgba(255, 255, 255, 0.1)" className="water-ripple">
            <animate attributeName="r" values="1;2;1" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
          </circle>
        </pattern>
      </defs>
      
      <polygon
        points={points.join(' ')}
        fill={`url(#waterGrad-${coord.q}-${coord.r})`}
        stroke={isHighlighted && highlightColor?.includes('239, 68, 68') ? '#dc2626' : (isHighlighted ? '#d97706' : '#0ea5e9')}
        strokeWidth={isHighlighted ? '2.5' : '1.5'}
        className="transition-all duration-200 group-hover:stroke-blue-400 group-hover:stroke-[2.5] group-active:brightness-125"
      />
      
      {/* Water texture overlay */}
      <polygon
        points={points.join(' ')}
        fill={`url(#waterPattern-${coord.q}-${coord.r})`}
        opacity="0.4"
        className="pointer-events-none"
      />
      
      {/* Inner highlight line for depth */}
      <polygon
        points={points.join(' ')}
        fill="none"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="0.8"
        className="transition-all duration-200 group-hover:stroke-white/30"
      />
      
      {/* Highlight glow when selected */}
      {isHighlighted && (
        <polygon
          points={points.join(' ')}
          fill="none"
          stroke={highlightColor}
          strokeWidth="0.5"
          opacity="0.6"
          className="animate-pulse"
        />
      )}
      
      {/* Random bubbles for underwater effect */}
      {Math.random() > 0.7 && (
        <circle
          cx={pixelPos.x + (Math.random() - 0.5) * size * 0.6}
          cy={pixelPos.y + (Math.random() - 0.5) * size * 0.6}
          r={Math.random() * 1.5 + 0.5}
          fill="rgba(255, 255, 255, 0.3)"
          className="bubble-animation pointer-events-none"
          style={{
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${4 + Math.random() * 2}s`
          }}
        />
      )}
      
      {children}
    </g>
  );
};
