import { motion } from "framer-motion";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
      className={`bg-gray/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg ${className}`}
    >
      {children}
    </motion.div>
  );
}
