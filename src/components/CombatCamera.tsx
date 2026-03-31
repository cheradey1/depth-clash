import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CombatCameraProps {
  shake: boolean;
  children: React.ReactNode;
}

export const CombatCamera: React.FC<CombatCameraProps> = ({ shake, children }) => {
  const [activeShake, setActiveShake] = useState(false);

  useEffect(() => {
    if (!shake) return;
    setActiveShake(true);
    const timer = window.setTimeout(() => setActiveShake(false), 360);
    return () => window.clearTimeout(timer);
  }, [shake]);

  return (
    <motion.div
      animate={activeShake ? {
        x: [0, -10, 10, -8, 8, -4, 4, 0],
        y: [0, -6, 6, -4, 4, -2, 2, 0]
      } : { x: 0, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};
