import { Exercise } from "../../types/practice";
import { Volume2 } from "lucide-react";

interface Props {
  exercise: Exercise;
  onAnswer: (answer: string, correctAnswer: string) => void;
  onSpeak: (text: string) => Promise<void>;
}

export function WordPuzzle({ exercise, onAnswer, onSpeak }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{exercise.question}</h3>
      <div className="grid grid-cols-4 gap-2">
        {exercise.options.map((letter) => (
          <div key={letter} className="flex gap-2">
            <button
              onClick={() => onAnswer(letter, exercise.correct_answer)}
              className="flex-1 p-4 bg-gray-800/30 hover:bg-blue-500/20 rounded-lg transition-colors text-center"
            >
              {letter}
            </button>
            <button
              onClick={() => onSpeak(letter)}
              className="p-4 bg-gray-800/30 hover:bg-blue-500/20 rounded-lg transition-colors"
              title="Listen to pronunciation"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
