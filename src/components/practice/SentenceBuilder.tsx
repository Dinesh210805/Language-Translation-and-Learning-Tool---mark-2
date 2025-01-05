import { Exercise } from "../../types/practice";
import { Volume2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  exercise: Exercise;
  onAnswer: (answer: string, correctAnswer: string) => void;
  onSpeak: (text: string) => Promise<void>;
}

export function SentenceBuilder({ exercise, onAnswer, onSpeak }: Props) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [remainingWords, setRemainingWords] = useState<string[]>(
    exercise.options
  );

  const handleWordSelect = (word: string) => {
    setSelectedWords([...selectedWords, word]);
    setRemainingWords(remainingWords.filter((w) => w !== word));
  };

  const handleRemoveWord = (index: number) => {
    const removedWord = selectedWords[index];
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
    setRemainingWords([...remainingWords, removedWord]);
  };

  const handleSubmit = () => {
    const sentence = selectedWords.join(" ").trim();
    onAnswer(sentence, exercise.correct_answer);
  };

  const handleReset = () => {
    setSelectedWords([]);
    setRemainingWords(exercise.options);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">{exercise.question}</h3>

      {/* Built sentence display */}
      <div className="min-h-[60px] p-4 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
        <div className="flex flex-wrap gap-2">
          {selectedWords.map((word, index) => (
            <motion.button
              key={`${word}-${index}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="px-3 py-2 bg-blue-500/20 rounded-lg flex items-center gap-2 group"
              onClick={() => handleRemoveWord(index)}
            >
              <span>{word}</span>
              <span className="text-red-400 opacity-0 group-hover:opacity-100">
                ×
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Available words */}
      <div className="flex flex-wrap gap-2">
        {remainingWords.map((word) => (
          <motion.div
            key={word}
            className="flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            <button
              onClick={() => handleWordSelect(word)}
              className="px-3 py-2 bg-gray-800/30 hover:bg-blue-500/20 rounded-lg transition-colors"
            >
              {word}
            </button>
            <button
              onClick={() => onSpeak(word)}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={selectedWords.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
        >
          Check Answer
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
