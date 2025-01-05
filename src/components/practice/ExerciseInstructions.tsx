import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

interface Props {
  type: string;
  instructions: Record<string, string>;
}

export function ExerciseInstructions({ type, instructions }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-5 h-5 text-blue-400" />
        <h4 className="text-lg font-semibold text-blue-400">How to Play</h4>
      </div>
      <p className="text-gray-300">
        {instructions[type] || instructions.default}
      </p>
    </motion.div>
  );
}
