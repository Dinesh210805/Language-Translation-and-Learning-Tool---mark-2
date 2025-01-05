export interface Lesson {
  id: string;
  title: string;
  level: string;
  description: string;
  duration: string;
  videoUrl: string; // Add this property
  video_id?: string;
  video_options?: VideoOption[];
}

export interface VideoOption {
  id: string;
  title: string;
}

export interface Chapter {
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Language {
  chapters: Record<string, Chapter>;
  levels: string[];
}

export interface SectionContent {
  word: string;
  translation: string;
  example: string;
}

export interface LessonContent {
  title: string;
  sections: {
    title: string;
    content: string | SectionContent[];
  }[];
  summary?: string;
  quiz?: {
    question: string;
    options: string[];
    answer: string;
  }[];
}
