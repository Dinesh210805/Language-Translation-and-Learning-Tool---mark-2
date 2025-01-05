export type ExerciseType =
  | "vocabulary-match"
  | "sentence-builder"
  | "listening-challenge"
  | "pronunciation-game"
  | "word-puzzle"
  | "conversation-sim"
  | "memory-cards"
  | "fill-blanks";

export interface Exercise {
  type: ExerciseType;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  points: number;
  hints?: string[];
  audio_url?: string;
  image_url?: string;
  time_limit?: number;
  context?: string;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  usage: string;
}

export interface PracticeSet {
  exercises: Exercise[];
  vocabulary: VocabularyItem[];
}

export type DifficultyLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
