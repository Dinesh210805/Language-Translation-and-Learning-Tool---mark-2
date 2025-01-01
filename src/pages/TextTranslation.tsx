import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Languages,
  ArrowRight,
  Copy,
  Volume2,
  ArrowLeftRight,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { FloatingParticles } from "../components/ui/FloatingParticles";
import { speakText, LANGUAGE_TO_SPEECH_CODE } from "../utils/speech";
import { TranslationDetails } from "../components/ui/TranslationDetails";

interface TranslationResponse {
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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LANGUAGES = {
  auto: "Auto Detect",
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ru: "Russian",
  ta: "Tamil",
} as const;

function TextTranslation() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationDetails, setTranslationDetails] =
    useState<TranslationResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [detectedLang, setDetectedLang] = useState<string | null>(null);

  const switchLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setError("");
    setDetectedLang(null);

    try {
      console.log("Sending translation request:", {
        text: sourceText,
        sourceLang,
        targetLang,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${API_URL}/api/translate/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Translation failed");
      }

      if (!data.translation) {
        throw new Error("No translation received");
      }

      if (sourceLang === "auto" && data.detected_language) {
        setDetectedLang(data.detected_language);
      }

      setTranslatedText(data.translation);
      setTranslationDetails(data);
    } catch (err: unknown) {
      console.error("Translation error details:", err);
      let errorMessage = "Unknown error occurred";

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          errorMessage = "Request timed out. Please try again.";
        } else if (err.message === "Failed to fetch") {
          errorMessage =
            "Cannot connect to the translation service. Please ensure the server is running.";
        } else if (err.message.includes("429")) {
          errorMessage = "Service is busy. Please wait a moment and try again.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(`Failed to translate: ${errorMessage}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = async (text: string, lang: string) => {
    try {
      await speakText(text, LANGUAGE_TO_SPEECH_CODE[lang]);
    } catch (error) {
      console.error("Speech synthesis error:", error);
    }
  };

  const handleGenerateMoreExamples = async () => {
    try {
      setIsTranslating(true);
      // Call API to generate more examples
      const response = await fetch(`${API_URL}/api/translate/examples`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
        }),
      });

      const data = await response.json();
      if (response.ok && translationDetails) {
        setTranslationDetails({
          ...translationDetails,
          examples: [...translationDetails.examples, ...data.examples],
        });
      }
    } catch (error) {
      console.error("Failed to generate more examples:", error);
    } finally {
      setIsTranslating(false);
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
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
            <Languages className="w-12 h-12 text-blue-400 relative" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Universal Translator
          </h1>
        </motion.div>

        <form onSubmit={handleTranslate} className="space-y-8">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
              <div className="flex-1 w-full relative">
                <select
                  id="sourceLang"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full rounded-xl bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 transition-all hover:bg-gray-800/70"
                >
                  {Object.entries(LANGUAGES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
                {detectedLang && sourceLang === "auto" && (
                  <div className="absolute -bottom-6 left-0 text-sm text-blue-400">
                    Detected:{" "}
                    {LANGUAGES[detectedLang as keyof typeof LANGUAGES]}
                  </div>
                )}
              </div>

              <motion.button
                type="button"
                onClick={switchLanguages}
                className="p-3 rounded-full hover:bg-gray-700/50 transition-all hover:scale-110 group"
                whileHover={{ rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                title="Switch languages"
              >
                <ArrowLeftRight className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
              </motion.button>

              <div className="flex-1 w-full">
                <select
                  id="targetLang"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full rounded-xl bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 transition-all hover:bg-gray-800/70"
                >
                  {Object.entries(LANGUAGES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-lg hover:bg-gray-800/40 transition-all">
                <div className="p-4">
                  <textarea
                    id="sourceText"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    rows={6}
                    className="w-full rounded-xl bg-gray-700/30 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500 placeholder-gray-400 transition-all focus:bg-gray-700/50"
                    placeholder="Type or paste your text here..."
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      onClick={() => handleSpeak(sourceText, sourceLang)}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>

              <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-lg hover:bg-gray-800/40 transition-all">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    {translatedText && (
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        onClick={() =>
                          navigator.clipboard.writeText(translatedText)
                        }
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="min-h-[144px] rounded-lg bg-gray-700/50 p-3">
                    {error ? (
                      <p className="text-red-400">{error}</p>
                    ) : (
                      <p className="text-gray-100">
                        {translatedText || "Translation will appear here..."}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      onClick={() => handleSpeak(translatedText, targetLang)}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {translationDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TranslationDetails
                details={translationDetails}
                targetLang={targetLang}
                onGenerateMoreExamples={handleGenerateMoreExamples}
              />
            </motion.div>
          )}

          <div className="flex justify-center pt-8">
            <motion.button
              type="submit"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full text-lg font-semibold transition-all hover:shadow-[0_0_30px_-5px] hover:shadow-blue-500/50 disabled:opacity-50 disabled:hover:shadow-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isTranslating}
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x" />
              <span className="relative flex items-center gap-3">
                {isTranslating ? (
                  <>
                    <motion.div
                      className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Translating...
                  </>
                ) : (
                  <>
                    Translate
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default TextTranslation;
