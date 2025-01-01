import { Card } from "./Card";
import { Volume2, Plus, BookOpen, AlertCircle, Sparkles, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import { TranslationResponse } from "../../types/translation";

import { speakText, LANGUAGE_TO_SPEECH_CODE } from "../../utils/speech";

interface TranslationDetailsProps {
  details: TranslationResponse;
  targetLang: string;
  onGenerateMoreExamples: () => void;
}

export function TranslationDetails({
  details,
  targetLang,
  onGenerateMoreExamples
}: TranslationDetailsProps) {
  const handleSpeak = async (text: string) => {
    try {
      await speakText(text, LANGUAGE_TO_SPEECH_CODE[targetLang]);
    } catch (error) {
      console.error("Speech synthesis error:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-lg hover:bg-gray-800/40 transition-all">
        <div className="p-8 space-y-8">
          {/* Section title */}
          <div className="border-b border-gray-700/50 pb-4 mb-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Translation Analysis
            </h2>
            <p className="text-gray-400 mt-2">
              Difficulty Level: {details.learning_level}
            </p>
          </div>

          {/* Grammar Section - Enhanced */}
          <div className="col-span-full">
            <h3 className="flex items-center gap-2 text-xl font-medium text-blue-400 mb-4">
              <BookOpen className="w-5 h-5" /> Grammar Analysis
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-3">Sentence Structure</h4>
                <p className="text-gray-300">{details.grammar.structure}</p>
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Tense & Mood</h5>
                  <p className="text-gray-300">{details.grammar.tense_mood}</p>
                </div>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="flex items-center gap-2 text-lg font-medium text-white mb-3">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  Common Mistakes
                </h4>
                <ul className="space-y-2">
                  {details.grammar.common_mistakes.map((mistake, i) => (
                    <li key={i} className="text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-400">⚠</span>
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Pronunciation Guide - Enhanced */}
          <div className="col-span-full bg-gray-700/30 rounded-xl p-6">
            <h3 className="text-xl font-medium text-blue-400 mb-4">
              Pronunciation Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-lg font-mono bg-gray-800/50 px-3 py-1 rounded">
                    {details.pronunciation.ipa}
                  </span>
                  <button
                    onClick={() => handleSpeak(details.translation)}
                    className="p-2 hover:bg-gray-600/50 rounded-full transition-colors"
                  >
                    <Volume2 className="w-5 h-5 text-blue-400" />
                  </button>
                </div>
                <div className="space-y-2">
                  {details.pronunciation.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <p className="text-gray-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Regional Variations</h4>
                <p className="text-gray-300">{details.cultural_context.regional_variations}</p>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Examples Section - With Generate More Button */}
            <div className="col-span-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-blue-400">Example Usage</h3>
                <button
                  onClick={onGenerateMoreExamples}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Generate More Examples
                </button>
              </div>
              <div className="grid gap-4">
                {details.examples.map((example, i) => (
                  <div
                    key={i}
                    className="bg-gray-700/30 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-200 font-medium">
                          {example.original}
                        </p>
                        <p className="text-gray-400 mt-1">
                          {example.translation}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSpeak(example.original)}
                        className="p-2 hover:bg-gray-600/50 rounded-full transition-colors"
                      >
                        <Volume2 className="w-4 h-4 text-blue-400" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                        {example.level}
                      </span>
                      <span className="text-xs text-gray-400">
                        {example.context}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vocabulary Cards - Enhanced Design */}
            <div className="col-span-full">
              <h3 className="text-xl font-medium text-blue-400 mb-4">
                Key Vocabulary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {details.vocabulary.map((item, i) => (
                  <div
                    key={i}
                    className="bg-gray-700/30 rounded-lg p-4 space-y-3 hover:bg-gray-700/40 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-medium text-white">
                        {item.word}
                      </h4>
                      <button
                        onClick={() => handleSpeak(item.word)}
                        className="p-1 hover:bg-gray-600/50 rounded-full transition-colors"
                      >
                        <Volume2 className="w-4 h-4 text-blue-400" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-purple-400 bg-purple-900/20 px-2 py-1 rounded">
                        {item.type}
                      </span>
                      <p className="text-gray-300">{item.meaning}</p>
                      <p className="text-gray-400 text-sm italic">
                        "{item.usage_example}"
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.synonyms.map((syn, j) => (
                          <span
                            key={j}
                            className="text-xs text-blue-300 bg-blue-900/20 px-2 py-1 rounded"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Tips - Enhanced Layout */}
            <div className="col-span-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-6">
              <h3 className="text-xl font-medium text-blue-400 mb-4">
                Practice Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {details.practice_tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-gray-800/30 p-4 rounded-lg"
                  >
                    <span className="text-blue-400 text-xl">•</span>
                    <p className="text-gray-300">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Topics - New Section */}
            <div className="col-span-full">
              <h3 className="text-xl font-medium text-blue-400 mb-4">
                Related Topics
              </h3>
              <div className="flex flex-wrap gap-3">
                {details.related_topics.map((topic, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gray-700/30 text-gray-300 rounded-full hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Cultural Context - Enhanced */}
          <div className="col-span-full">
            <h3 className="flex items-center gap-2 text-xl font-medium text-blue-400 mb-4">
              <Globe2 className="w-5 h-5" /> Cultural Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-3">Usage Context</h4>
                <p className="text-gray-300">{details.cultural_context.usage}</p>
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Formality Level</h5>
                  <p className="text-gray-300">{details.cultural_context.formality}</p>
                </div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-3">Cultural Notes</h4>
                <p className="text-gray-300">{details.cultural_context.cultural_notes}</p>
              </div>
            </div>
          </div>

          {/* Additional Resources Section */}
          <div className="col-span-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-6">
            <h3 className="flex items-center gap-2 text-xl font-medium text-blue-400 mb-4">
              <Sparkles className="w-5 h-5" /> Learning Resources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="#"
                className="block p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <h4 className="text-lg font-medium text-white mb-2">Grammar Guide</h4>
                <p className="text-gray-400 text-sm">Detailed explanations of the grammar points used</p>
              </a>
              <a
                href="#"
                className="block p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <h4 className="text-lg font-medium text-white mb-2">Practice Exercises</h4>
                <p className="text-gray-400 text-sm">Interactive exercises to master this content</p>
              </a>
              <a
                href="#"
                className="block p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <h4 className="text-lg font-medium text-white mb-2">Cultural Deep Dive</h4>
                <p className="text-gray-400 text-sm">Learn more about the cultural context</p>
              </a>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
