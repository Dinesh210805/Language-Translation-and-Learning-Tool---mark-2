import { motion } from "framer-motion";

interface BackgroundGradientProps {
  colors?: string[];
}

export function BackgroundGradient({
  colors = ["#3b82f6", "#8b5cf6"],
}: BackgroundGradientProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 45, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background: `radial-gradient(circle at center, ${colors[0]}1a, ${colors[1]}0a)`,
        }}
        className="absolute inset-0"
      />
    </div>
  );
}
