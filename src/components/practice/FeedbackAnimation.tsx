import { motion, AnimatePresence } from "framer-motion";

import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  isCorrect: boolean | null;
  points?: number;
}

export function FeedbackAnimation({ isCorrect, points }: Props) {
  return (
    <AnimatePresence>
      {isCorrect !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            ${isCorrect ? "text-green-500" : "text-red-500"} text-6xl`}
        >
          {isCorrect ? (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-24 h-24" />
              {points && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl font-bold text-green-400"
                >
                  +{points} points!
                </motion.div>
              )}
            </div>
          ) : (
            <XCircle className="w-24 h-24" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
