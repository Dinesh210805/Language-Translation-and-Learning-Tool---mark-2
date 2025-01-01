import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface IconButtonProps extends HTMLMotionProps<"button"> {
  icon: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  tooltip?: string;
}

export function IconButton({
  icon,
  variant = "primary",
  size = "md",
  className = "",
  tooltip,
  ...props
}: IconButtonProps) {
  const baseStyles =
    "rounded-full flex items-center justify-center transition-colors";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline:
      "border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600",
  };

  const sizes = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      <div className={iconSizes[size]}>{icon}</div>
    </motion.button>
  );
}
