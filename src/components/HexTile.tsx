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

  // Determine fill color based on state
  let fillColor = '#0ea5e9';
  let strokeColor = '#0ea5e9';
  let strokeWidth = '1.5';

  if (isHighlighted && highlightColor?.includes('239, 68, 68')) {
    fillColor = '#ef4444';
    strokeColor = '#dc2626';
    strokeWidth = '2.5';
  } else if (isHighlighted) {
    fillColor = '#f59e0b';
    strokeColor = '#d97706';
    strokeWidth = '2.5';
  }

  return (
    <g onClick={onClick} style={{ pointerEvents: 'auto' }}>
      {/* Deep shadow for 3D effect */}
      <polygon
        points={shadowPoints.join(' ')}
        fill="rgba(0, 0, 0, 0.4)"
        style={{ transition: 'all 200ms ease-out' }}
      />
      
      {/* Main hex tile */}
      <polygon
        points={points.join(' ')}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{ 
          transition: 'all 200ms ease-out',
          cursor: 'pointer',
          opacity: isHighlighted ? 0.85 : 0.7
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as SVGPolygonElement;
          el.setAttribute('stroke', '#60a5fa');
          el.setAttribute('stroke-width', '2.5');
          el.setAttribute('opacity', '0.95');
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as SVGPolygonElement;
          el.setAttribute('stroke', strokeColor);
          el.setAttribute('stroke-width', strokeWidth);
          el.setAttribute('opacity', isHighlighted ? '0.85' : '0.7');
        }}
        onMouseDown={(e) => {
          const el = e.currentTarget as SVGPolygonElement;
          el.setAttribute('opacity', '1');
          el.setAttribute('stroke-width', '3');
        }}
        onMouseUp={(e) => {
          const el = e.currentTarget as SVGPolygonElement;
          el.setAttribute('opacity', isHighlighted ? '0.85' : '0.7');
          el.setAttribute('stroke-width', strokeWidth);
        }}
      />
      
      {/* Inner highlight line for depth */}
      <polygon
        points={points.join(' ')}
        fill="none"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="0.8"
        style={{ transition: 'all 200ms ease-out' }}
      />
      
      {/* Highlight glow when selected */}
      {isHighlighted && (
        <polygon
          points={points.join(' ')}
          fill="none"
          stroke={highlightColor}
          strokeWidth="0.5"
          opacity="0.6"
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      )}
      
      {children}
    </g>
  );
};
