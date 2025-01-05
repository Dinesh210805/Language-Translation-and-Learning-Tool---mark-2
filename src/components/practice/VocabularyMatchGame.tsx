import { Exercise } from "../../types/practice";
import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";

interface Props {
  exercise: Exercise;
  onAnswer: (answer: string, correctAnswer: string) => void;
  onSpeak: (text: string) => Promise<void>;
}

export function VocabularyMatchGame({ exercise, onAnswer, onSpeak }: Props) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // Split options into words and translations
  const halfIndex = Math.floor(exercise.options.length / 2);
  const words = exercise.options.slice(0, halfIndex);
  const translations = exercise.options.slice(halfIndex);

  const handleWordClick = (word: string) => {
    if (matchedPairs.includes(word)) return;

    if (selectedWord === null) {
      setSelectedWord(word);
    } else {
      // Simplified matching logic
      const pair = `${selectedWord} - ${word}`;
      const reversePair = `${word} - ${selectedWord}`;
      const isMatch =
        exercise.correct_answer === pair ||
        exercise.correct_answer === reversePair;

      if (isMatch) {
        setMatchedPairs([...matchedPairs, selectedWord, word]);
        onAnswer(pair, exercise.correct_answer);
      } else {
        onAnswer(pair, exercise.correct_answer);
      }
      setSelectedWord(null);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">{exercise.question}</h3>
      <div className="grid grid-cols-2 gap-8">
        {/* Words column */}
        <div className="space-y-2">
          {words.map((word) => (
            <motion.div
              key={word}
              className={`
                w-full p-4 rounded-lg transition-colors flex justify-between items-center
                ${
                  matchedPairs.includes(word)
                    ? "bg-green-500/20"
                    : selectedWord === word
                    ? "bg-blue-500/50"
                    : "bg-gray-800/30 hover:bg-blue-500/20"
                }
                ${
                  matchedPairs.includes(word)
                    ? "cursor-default"
                    : "cursor-pointer"
                }
              `}
              whileHover={!matchedPairs.includes(word) ? { scale: 1.02 } : {}}
              onClick={() =>
                !matchedPairs.includes(word) && handleWordClick(word)
              }
            >
              <span>{word}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeak(word);
                }}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Translations column */}
        <div className="space-y-2">
          {translations.map((translation) => (
            <motion.div
              key={translation}
              className={`
                w-full p-4 rounded-lg transition-colors
                ${
                  matchedPairs.includes(translation)
                    ? "bg-green-500/20"
                    : selectedWord === translation
                    ? "bg-blue-500/50"
                    : "bg-gray-800/30 hover:bg-blue-500/20"
                }
                ${
                  matchedPairs.includes(translation)
                    ? "cursor-default"
                    : "cursor-pointer"
                }
              `}
              whileHover={
                !matchedPairs.includes(translation) ? { scale: 1.02 } : {}
              }
              onClick={() =>
                !matchedPairs.includes(translation) &&
                handleWordClick(translation)
              }
            >
              {translation}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
