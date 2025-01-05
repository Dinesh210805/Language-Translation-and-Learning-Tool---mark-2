import { useState } from "react";
import { motion } from "framer-motion";
import { PracticeSet, ExerciseType, DifficultyLevel } from "../types/practice";
import {
  PenTool,
  Book,
  Headphones,
  Puzzle,
  MessageCircle,
  LayoutGrid,
  Edit,
} from "lucide-react";
import { Card } from "../components/ui/card2";
import { FloatingParticles } from "../components/ui/FloatingParticles";
import { speakText, LANGUAGE_TO_SPEECH_CODE } from "../utils/speech";
import { VocabularyMatchGame } from "../components/practice/VocabularyMatchGame";
import { SentenceBuilder } from "../components/practice/SentenceBuilder";
import { WordPuzzle } from "../components/practice/WordPuzzle";
import { ExerciseInstructions } from "../components/practice/ExerciseInstructions";
import { FeedbackAnimation } from "../components/practice/FeedbackAnimation";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EXERCISE_TYPES: Record<
  ExerciseType,
  { icon: React.ReactNode; description: string }
> = {
  "vocabulary-match": {
    icon: <Book className="w-5 h-5" />,
    description: "Match words and meanings in a fun memory game",
  },
  "sentence-builder": {
    icon: <PenTool className="w-5 h-5" />,
    description: "Build sentences by arranging words",
  },
  "listening-challenge": {
    icon: <Headphones className="w-5 h-5" />,
    description: "Test your listening skills with audio challenges",
  },
  "pronunciation-game": {
    icon: <MessageCircle className="w-5 h-5" />,
    description: "Practice pronunciation with interactive games",
  },
  "word-puzzle": {
    icon: <Puzzle className="w-5 h-5" />,
    description: "Solve word puzzles and crosswords",
  },
  "conversation-sim": {
    icon: <MessageCircle className="w-5 h-5" />,
    description: "Practice real-life conversations",
  },
  "memory-cards": {
    icon: <LayoutGrid className="w-5 h-5" />,
    description: "Test your memory with card matching",
  },
  "fill-blanks": {
    icon: <Edit className="w-5 h-5" />,
    description: "Complete sentences with missing words",
  },
};

const INSTRUCTIONS = {
  "vocabulary-match":
    "Match each word with its correct translation. Click a word to select it, then click its matching translation.",
  "sentence-builder":
    "Arrange the words in the correct order to form a proper sentence. Click words in sequence.",
  "word-puzzle":
    "Find and select words hidden in the puzzle. Click and drag to select letters.",
  default:
    "Follow the instructions and choose the correct answer. Use the speaker icon to hear pronunciations.",
};

function Practice() {
  const [selectedLanguage, setSelectedLanguage] = useState("Spanish");
  const [selectedType, setSelectedType] =
    useState<ExerciseType>("vocabulary-match");
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>("A1");
  const [exercises, setExercises] = useState<PracticeSet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string>("");
  const [feedbackState, setFeedbackState] = useState<{
    isCorrect: boolean | null;
    points: number;
  }>({ isCorrect: null, points: 0 });

  // Add English to available languages
  const availableLanguages = ["English", "Spanish", "German", "French"];

  const getCurrentExercise = () => {
    if (!exercises?.exercises || exercises.exercises.length === 0) {
      return null;
    }
    return exercises.exercises[currentExerciseIndex];
  };

  // Add new state for practice session
  const [practiceCount, setPracticeCount] = useState(1);

  // Helper function to generate meaningful sentences for each language
  type ExerciseContent = {
    type: string;
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    difficulty: string;
    points: number;
  };

  type ExercisesByType = {
    "vocabulary-match": ExerciseContent[];
    "sentence-builder": ExerciseContent[];
    "listening-challenge": ExerciseContent[];
    "pronunciation-game": ExerciseContent[];
    "word-puzzle": ExerciseContent[];
    "conversation-sim": ExerciseContent[];
    "memory-cards": ExerciseContent[];
    "fill-blanks": ExerciseContent[];
  };

  // Create an empty exercise array template
  const emptyExercises: ExercisesByType = {
    "vocabulary-match": [],
    "sentence-builder": [],
    "listening-challenge": [],
    "pronunciation-game": [],
    "word-puzzle": [],
    "conversation-sim": [],
    "memory-cards": [],
    "fill-blanks": [],
  };

  type ExercisesByLevel = {
    [K in DifficultyLevel]: ExercisesByType;
  };

  type ExercisesByLanguage = {
    [K in "English" | "Spanish"]: ExercisesByLevel;
  };

  const getMeaningfulExercises = (
    type: ExerciseType,
    level: DifficultyLevel,
    language: "English" | "Spanish"
  ) => {
    const exercises: ExercisesByLanguage = {
      English: {
        A1: {
          ...emptyExercises,
          "vocabulary-match": [
            {
              type: "vocabulary-match",
              question: "Match these word pairs",
              options: ["Hello", "Hi", "Goodbye", "Bye", "Thanks", "Thank you"],
              correct_answer: "Hello - Hi",
              explanation: "These are common greeting words",
              difficulty: "A1",
              points: 10,
            },
          ],
          "sentence-builder": [
            {
              type: "sentence-builder",
              question: "Build a simple sentence",
              options: ["I", "am", "learning", "English"],
              correct_answer: "I am learning English",
              explanation: "Subject + Be verb + Verb+ing + Object",
              difficulty: "A1",
              points: 10,
            },
          ],
        },
        A2: { ...emptyExercises },
        B1: { ...emptyExercises },
        B2: { ...emptyExercises },
        C1: { ...emptyExercises },
        C2: { ...emptyExercises },
      },
      Spanish: {
        A1: {
          ...emptyExercises,
          "vocabulary-match": [
            {
              type: "vocabulary-match",
              question: "Match Spanish and English words",
              options: ["Hola", "Hello", "Adiós", "Goodbye"],
              correct_answer: "Hola - Hello",
              explanation: "Basic Spanish greetings",
              difficulty: "A1",
              points: 10,
            },
          ],
          "sentence-builder": [
            {
              type: "sentence-builder",
              question: "Build a Spanish sentence",
              options: ["Yo", "hablo", "español"],
              correct_answer: "Yo hablo español",
              explanation: "Subject + Verb + Object in Spanish",
              difficulty: "A1",
              points: 10,
            },
          ],
        },
        A2: { ...emptyExercises },
        B1: { ...emptyExercises },
        B2: { ...emptyExercises },
        C1: { ...emptyExercises },
        C2: { ...emptyExercises },
      },
    };

    return exercises[language]?.[level]?.[type] || [];
  };

  // Main exercise handling function
  const handleStartExercise = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Special handling for English language exercises
      if (selectedLanguage === "English") {
        // Generate local exercises for English
        const englishExercises = await generateEnglishExercises(
          selectedType,
          selectedLevel
        );
        setExercises({ exercises: englishExercises, vocabulary: [] });
        setCurrentExerciseIndex(0);
        setScore(0);
        setShowExplanation(false);
        setIsLoading(false);
        return;
      }

      console.log("Starting exercise with:", {
        language: selectedLanguage,
        type: selectedType,
        level: selectedLevel,
      });

      // Fetch exercises from API for other languages
      const response = await fetch(`${API_URL}/api/practice/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage,
          type: selectedType,
          level: selectedLevel,
        }),
      });

      const data = await response.json();
      console.log("Received exercises:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to load exercises");
      }

      if (
        !data ||
        !Array.isArray(data.exercises) ||
        data.exercises.length === 0
      ) {
        throw new Error("Invalid exercise data received");
      }

      setExercises(data);
      setCurrentExerciseIndex(0);
      setScore(0);
      setShowExplanation(false);
    } catch (err) {
      console.error("Failed to load exercises:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load exercises";
      if (errorMessage.includes("Failed to fetch")) {
        setError(
          "Cannot connect to server. Please make sure the server is running."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to generate English exercises
  const generateEnglishExercises = async (
    type: ExerciseType,
    level: DifficultyLevel
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/generate-exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          level,
          language: "English",
          model: "llama-3.3-70b-versatile",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate exercises");
      }

      const data = await response.json();
      return data.exercises;
    } catch (error) {
      console.error("Failed to generate exercises:", error);
      // Fallback to predefined exercises
      return getMeaningfulExercises(type, level, "English");
    }
  };

  // Answer evaluation
  const handleAnswer = async (answer: string, correctAnswer: string) => {
    if (!exercises?.exercises.length) return;

    const currentExercise = exercises.exercises[currentExerciseIndex];
    const isCorrect =
      answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    setFeedbackState({
      isCorrect,
      points: isCorrect ? currentExercise.points : 0,
    });

    if (isCorrect) {
      setScore((prev) => prev + currentExercise.points);
      new Audio("/sounds/success.mp3").play().catch(() => {});
    } else {
      new Audio("/sounds/error.mp3").play().catch(() => {});
      alert(
        `Incorrect! The correct answer is: ${correctAnswer}\n\nExplanation: ${currentExercise.explanation}`
      );
    }

    setShowExplanation(true);
    if (!exercises?.exercises) return;

    setShowExplanation(false);
    if (currentExerciseIndex < exercises.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  };

  const handleSpeak = async (text: string) => {
    try {
      const langCode = LANGUAGE_TO_SPEECH_CODE[selectedLanguage.toLowerCase()];
      await speakText(text, langCode);
    } catch (error) {
      console.error("Speech synthesis error:", error);
    }
  };

  // Practice continuation
  const handlePracticeMore = async () => {
    setPracticeCount((prev) => prev + 1);
    setShowExplanation(false);
    setCurrentExerciseIndex(0);
    setScore(0);
    await handleStartExercise();
  };

  // Add handleNext function
  const handleNext = () => {
    if (!exercises?.exercises) return;

    setShowExplanation(false);
    if (currentExerciseIndex < exercises.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  };

  const renderExerciseContent = () => {
    const exercise = getCurrentExercise();
    if (!exercise) return null;

    switch (exercise.type) {
      case "vocabulary-match":
        return (
          <VocabularyMatchGame
            exercise={exercise}
            onAnswer={handleAnswer}
            onSpeak={handleSpeak}
          />
        );
      case "sentence-builder":
        return (
          <SentenceBuilder
            exercise={exercise}
            onAnswer={handleAnswer}
            onSpeak={handleSpeak}
          />
        );
      case "word-puzzle":
        return (
          <WordPuzzle
            exercise={exercise}
            onAnswer={handleAnswer}
            onSpeak={handleSpeak}
          />
        );
      default:
        return (
          <div className="text-center text-gray-400">
            Exercise type not implemented yet
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-900 text-white py-8 relative overflow-hidden">
      <FloatingParticles />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto px-4 relative"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4 mb-12"
        >
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
            <PenTool className="w-12 h-12 text-blue-400 relative" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Practice Center
          </h1>
        </motion.div>

        {/* Language and Level Selection */}
        {isLoading ? (
          <div className="text-center">
            <p className="text-xl">Loading exercises...</p>
          </div>
        ) : (
          !exercises && (
            <div className="mb-6 flex gap-4">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-gray-800/30 border border-gray-700/50 text-white rounded-lg p-2"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <select
                value={selectedLevel}
                onChange={(e) =>
                  setSelectedLevel(e.target.value as DifficultyLevel)
                }
                className="bg-gray-800/30 border border-gray-700/50 text-white rounded-lg p-2"
              >
                <option value="A1">A1 (Beginner)</option>
                <option value="A2">A2 (Elementary)</option>
                <option value="B1">B1 (Intermediate)</option>
                <option value="B2">B2 (Upper Intermediate)</option>
                <option value="C1">C1 (Advanced)</option>
                <option value="C2">C2 (Mastery)</option>
              </select>
            </div>
          )
        )}

        {/* Add error display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Exercise Selection */}
        {!exercises && !isLoading && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Object.entries(EXERCISE_TYPES).map(
              ([type, { icon, description }]) => (
                <motion.div
                  key={type}
                  onClick={() => setSelectedType(type as ExerciseType)}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className={`transition-all ${
                      selectedType === type
                        ? "bg-blue-500/20 border-blue-500/50"
                        : "bg-gray-800/30 border-gray-700/50"
                    }`}
                  >
                    <div className="p-6 flex flex-col items-center text-center gap-4">
                      {icon}
                      <h3 className="text-xl font-semibold capitalize">
                        {type}
                      </h3>
                      <p className="text-gray-400">{description}</p>
                    </div>
                  </Card>
                </motion.div>
              )
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8">
            <motion.div
              className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="mt-4 text-gray-400">Loading exercises...</p>
          </div>
        )}

        {/* Exercise Content */}
        {exercises && getCurrentExercise() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold">Current Score: {score}</div>
              <div className="text-md text-gray-400">
                Practice Session: {practiceCount}
              </div>
            </div>

            {showExplanation && getCurrentExercise() && (
              <div className="p-4 bg-blue-500/20 rounded-lg">
                <p>{getCurrentExercise()?.explanation}</p>
              </div>
            )}
            <div className="space-y-4">
              {renderExerciseContent()}
              {showExplanation && (
                <button
                  onClick={handleNext}
                  className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                >
                  {currentExerciseIndex <
                  (exercises?.exercises?.length || 0) - 1
                    ? "Next Question"
                    : "Finish Practice"}
                </button>
              )}
            </div>
            {/* Show Practice More button when exercise set is complete */}
            {currentExerciseIndex === exercises.exercises.length - 1 &&
              showExplanation && (
                <div className="flex gap-4">
                  <button
                    onClick={handlePracticeMore}
                    className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
                  >
                    Practice More
                  </button>
                  <button
                    onClick={() => {
                      setExercises(null);
                      setPracticeCount(1);
                    }}
                    className="mt-4 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold"
                  >
                    Choose Different Exercise
                  </button>
                </div>
              )}
          </motion.div>
        )}

        {/* Start Exercise Button */}
        {!exercises && !isLoading && (
          <motion.button
            onClick={handleStartExercise}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Exercise
          </motion.button>
        )}

        {/* Add instructions when exercise is active */}
        {exercises && getCurrentExercise() && (
          <ExerciseInstructions
            type={selectedType}
            instructions={INSTRUCTIONS}
          />
        )}

        {/* Add feedback animation */}
        <FeedbackAnimation
          isCorrect={feedbackState.isCorrect}
          points={feedbackState.points}
        />

        {/* Progress indicator */}
        {exercises && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span>
                Progress: {currentExerciseIndex + 1}/
                {exercises.exercises.length}
              </span>
              <span>Score: {score}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: "0%" }}
                animate={{
                  width: `${
                    ((currentExerciseIndex + 1) / exercises.exercises.length) *
                    100
                  }%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Practice;
