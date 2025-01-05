import React from "react";
import { motion } from "framer-motion";

interface AvatarProps {
  fallback: React.ReactNode;
  className?: string;
}

export function Avatar({ fallback, className = "" }: AvatarProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={className}
    >
      {fallback}
    </motion.div>
  );
}
