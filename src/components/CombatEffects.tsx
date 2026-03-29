import React from 'react';
import { motion } from 'motion/react';

interface ProjectileProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  onComplete: () => void;
}

export const Projectile: React.FC<ProjectileProps> = ({ start, end, onComplete }) => {
  // Calculate control point for parabolic arc
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2 - 120;

  const path = `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  const straightLine = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

  return (
    <g className="pointer-events-none">
      <defs>
        <filter id="projectileGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Launch glow */}
      <motion.circle
        cx={start.x}
        cy={start.y}
        r={15}
        fill="rgba(255, 165, 0, 0.3)"
        initial={{ r: 15, opacity: 1 }}
        animate={{ r: [15, 25, 0], opacity: [1, 0.5, 0] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Guiding Line (Dashed) */}
      <motion.path
        d={straightLine}
        fill="none"
        stroke="rgba(255, 165, 0, 0.5)"
        strokeWidth="2"
        strokeDasharray="4 4"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 0.8, times: [0, 0.2, 1] }}
      />

      {/* Smoke Trail - Enhanced */}
      <motion.path
        d={path}
        fill="none"
        stroke="rgba(255, 165, 0, 0.5)"
        strokeWidth="8"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Inner bright trail */}
      <motion.path
        d={path}
        fill="none"
        stroke="rgba(255, 200, 0, 0.8)"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      
      {/* Missile Body */}
      <motion.g
        initial={{ offsetDistance: "0%", scale: 1 }}
        animate={{ offsetDistance: "100%", scale: [1, 1.2, 1] }}
        style={{ offsetPath: `path("${path}")`, offsetRotate: "auto" }}
        transition={{ duration: 0.6, ease: "linear" }}
        onAnimationComplete={onComplete}
        filter="url(#projectileGlow)"
      >
        {/* Outer glow */}
        <circle r="12" fill="rgba(255, 165, 0, 0.6)" />
        {/* Middle glow */}
        <circle r="8" fill="rgba(255, 165, 0, 0.8)" />
        {/* Core */}
        <path d="M -6,0 L 6,0 M 0,-2 L 4,0 L 0,2 Z" fill="white" stroke="orange" strokeWidth="1.5" />
        {/* Engine Flame */}
        <motion.circle
          r="4"
          cx="-6"
          fill="rgba(255, 100, 0, 0.9)"
          animate={{ scale: [1, 1.5, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 0.1, repeat: Infinity }}
        />
        {/* Tail flame */}
        <motion.path
          d="M -8,-2 L -12,-5 L -8,0 L -12,5 L -8,2 Z"
          fill="rgba(255, 100, 0, 0.7)"
          animate={{ opacity: [0.7, 1, 0.7], scaleY: [1, 1.2, 1] }}
          transition={{ duration: 0.15, repeat: Infinity }}
        />
      </motion.g>

      {/* Spark trail particles */}
      {[...Array(4)].map((_, i) => {
        const offset = (i / 4);
        return (
          <motion.circle
            key={`spark-${i}`}
            cx={start.x + (end.x - start.x) * offset}
            cy={start.y + (end.y - start.y) * offset + midY * (1 - Math.abs(offset * 2 - 1))}
            r="1.5"
            fill="rgba(255, 200, 0, 0.8)"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: offset * 0.3 }}
          />
        );
      })}
    </g>
  );
};

export const Explosion: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  return (
    <g className="pointer-events-none">
      <defs>
        <filter id="explosionGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Initial flash glow */}
      <motion.circle
        cx={x}
        cy={y}
        r={40}
        fill="rgba(255, 215, 0, 0.6)"
        initial={{ r: 40, opacity: 1 }}
        animate={{ r: [40, 60, 80], opacity: [1, 0.6, 0] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        filter="url(#explosionGlow)"
      />

      {/* Outer shockwave - bright */}
      <motion.circle
        cx={x}
        cy={y}
        initial={{ r: 0, opacity: 1, strokeWidth: 12 }}
        animate={{ r: 80, opacity: 0, strokeWidth: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        fill="none"
        stroke="rgba(255, 215, 0, 0.8)"
        filter="url(#explosionGlow)"
      />

      {/* Inner shockwave */}
      <motion.circle
        cx={x}
        cy={y}
        initial={{ r: 0, opacity: 0.6, strokeWidth: 8 }}
        animate={{ r: 60, opacity: 0, strokeWidth: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        fill="none"
        stroke="rgba(255, 165, 0, 0.8)"
      />
      
      {/* Main Blast - Red */}
      <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} filter="url(#explosionGlow)">
        <motion.circle
          cx={x}
          cy={y}
          initial={{ r: 0 }}
          animate={{ r: [0, 45, 40] }}
          transition={{ duration: 0.35 }}
          fill="rgba(255, 50, 0, 0.9)"
        />
        {/* Yellow center */}
        <motion.circle
          cx={x}
          cy={y}
          initial={{ r: 0 }}
          animate={{ r: [0, 30, 25] }}
          transition={{ duration: 0.25, delay: 0.05 }}
          fill="rgba(255, 215, 0, 1)"
        />
        {/* White hot core */}
        <motion.circle
          cx={x}
          cy={y}
          initial={{ r: 0 }}
          animate={{ r: [0, 15, 10] }}
          transition={{ duration: 0.2, delay: 0.1 }}
          fill="rgba(255, 255, 255, 0.9)"
        />
      </motion.g>

      {/* Large impact particles */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const distance = 50 + Math.random() * 30;
        return (
          <motion.circle
            key={`large-particle-${i}`}
            cx={x}
            cy={y}
            r={3 + Math.random() * 2}
            fill={i % 3 === 0 ? 'rgba(255, 215, 0, 1)' : i % 3 === 1 ? 'rgba(255, 100, 0, 0.9)' : 'rgba(255, 50, 0, 0.8)'}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ 
              x: Math.cos(angle) * distance, 
              y: Math.sin(angle) * distance, 
              opacity: 0,
              scale: [1, 1.2, 0.5]
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            filter="url(#explosionGlow)"
          />
        );
      })}

      {/* Small sparks */}
      {[...Array(16)].map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const distance = 70 + Math.random() * 40;
        return (
          <motion.circle
            key={`spark-${i}`}
            cx={x}
            cy={y}
            r={1}
            fill="rgba(255, 255, 100, 0.9)"
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ 
              x: Math.cos(angle) * distance, 
              y: Math.sin(angle) * distance, 
              opacity: 0,
              scale: 0
            }}
            transition={{ duration: 0.7, ease: "easeOut", delay: Math.random() * 0.1 }}
          />
        );
      })}

      {/* Smoke cloud - dark */}
      <motion.circle
        cx={x}
        cy={y}
        r={20}
        fill="rgba(80, 80, 80, 0.5)"
        initial={{ r: 20, opacity: 0.5 }}
        animate={{ r: [20, 50, 60], opacity: [0.5, 0.3, 0] }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
      />
    </g>
  );
};
