export interface TranslationResponse {
  translation: string;
  literal: string;
  cultural_context: {
    usage: string;
    formality: string;
    cultural_notes: string;
    regional_variations: string;
  };
  grammar: {
    explanation: string;
    key_points: string[];
    tense_mood: string;
    structure: string;
    common_mistakes: string[];
  };
  examples: Array<{
    original: string;
    translation: string;
    context: string;
    level: string;
  }>;
  idioms: Array<{
    phrase: string;
    meaning: string;
    usage: string;
    equivalent: string;
  }>;
  practice_tips: string[];
  pronunciation: {
    ipa: string;
    tips: string[];
    common_challenges: string;
  };
  vocabulary: Array<{
    word: string;
    type: string;
    meaning: string;
    synonyms: string[];
    usage_example: string;
  }>;
  learning_level: string;
  related_topics: string[];
}
