export interface Lesson {
  id: string;
  title: string;
  level: string;
  description: string;
  video_options?: VideoOption[];
  video_id?: string;
  duration: string;
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
