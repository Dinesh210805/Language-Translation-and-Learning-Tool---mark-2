import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsDark(!isDark)}
      className="fixed top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/50"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 360 : 0 }}
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-blue-600" />
        ) : (
          <Sun className="w-5 h-5 text-orange-500" />
        )}
      </motion.div>
    </motion.button>
  );
}