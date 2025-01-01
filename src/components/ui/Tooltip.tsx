import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: '-translate-x-1/2 -translate-y-full -mt-2 left-1/2 bottom-full',
    bottom: '-translate-x-1/2 translate-y-full mt-2 left-1/2 top-full',
    left: '-translate-x-full -translate-y-1/2 -ml-2 top-1/2 right-full',
    right: 'translate-x-full -translate-y-1/2 ml-2 top-1/2 left-full',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute z-50 ${positions[position]}`}
          >
            <div className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}