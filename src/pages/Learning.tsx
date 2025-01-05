import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Loader, GraduationCap, Volume2 } from "lucide-react";
import { speakText, LANGUAGE_TO_SPEECH_CODE } from "../utils/speech";
import type { Lesson, LessonContent, SectionContent } from "../types/learning";
import { LESSONS_DATA } from "../data/lessons";
import { Card } from "../components/ui/card2";
import { FloatingParticles } from "../components/ui/FloatingParticles";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function Learning() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Spanish");
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [captions, setCaptions] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [courseTimestamps, setCourseTimestamps] = useState<
    Array<{ time: string; topic: string }>
  >([]);
  const [courseSummary, setCourseSummary] = useState<{
    mainPoints: string[];
    keyVocabulary: Array<{ word: string; meaning: string }>;
    conceptBreakdown: Array<{ concept: string; explanation: string }>;
    culturalInsights: string[];
    practiceExercises: Array<{ type: string; description: string }>;
  } | null>(null);

  const availableLanguages = Object.keys(LESSONS_DATA);

  const handleSelectLesson = async (lesson: Lesson) => {
    setIsLoading(true);
    setError("");
    setCaptions("");
    setSummary("");
    setCourseSummary(null); // Reset course summary when switching lessons
    setCourseTimestamps([]); // Reset timestamps

    try {
      const response = await fetch(`${API_URL}/api/learning/lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson: lesson.title,
          language: selectedLanguage,
          level: lesson.level,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load lesson");
      }

      if (!data || !data.sections) {
        throw new Error("Invalid lesson content received");
      }

      setCurrentLesson(lesson);
      setLessonContent(data);

      if (lesson.video_id) {
        const captions = await fetchCaptions(lesson.video_id);
        if (captions.includes("Captions not available")) {
          setCaptions(captions);
        } else {
          setCaptions(captions);
          const summary = await generateSummaryFromCaptions(
            captions,
            selectedLanguage
          );
          setSummary(summary);
        }
      }
    } catch (error) {
      console.error("Error loading lesson:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load lesson"
      );
      // Don't reset currentLesson here
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCaptions = async (videoId: string): Promise<string> => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}/api/youtube/captions?videoId=${videoId}&language=${selectedLanguage.toLowerCase()}`
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error || data.details || "Failed to fetch captions"
        );
      }

      // Ensure we have captions data
      if (!data.captions?.original && !data.captions?.translated) {
        throw new Error(`No captions available for ${selectedLanguage}`);
      }

      const translatedLang =
        data.language?.translated?.toUpperCase() ||
        selectedLanguage.toUpperCase();
      const originalText = data.captions.original || "";
      const translatedText = data.captions.translated || "";

      // Return single language version
      return `${translatedLang}:\n${translatedText || originalText}`;
    } catch (error) {
      console.error("Error fetching captions:", error);
      return `Captions not available in ${selectedLanguage}. ${
        error instanceof Error ? error.message : ""
      }`;
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummaryFromCaptions = async (
    captions: string,
    language: string
  ): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/api/generate-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          captions,
          language,
        }),
      });

      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error("Error generating summary:", error);
      return "Summary not available.";
    }
  };

  const generateCourseSummary = async (captions: string) => {
    try {
      setError("");
      setIsLoading(true);

      // Clean and prepare captions
      const cleanedCaptions = captions
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .substring(0, 8000);

      const response = await fetch(`${API_URL}/api/learning/course-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          captions: cleanedCaptions,
          language: selectedLanguage.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "Failed to generate summary"
        );
      }

      if (!data.summary) {
        throw new Error("Invalid summary format received");
      }

      setCourseSummary(data.summary);
      if (data.timestamps && data.timestamps.length > 0) {
        setCourseTimestamps(data.timestamps);
      }

      // Scroll to summary
      document
        .getElementById("course-summary")
        ?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error generating course summary:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate course summary"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (text: string, lang: string) => {
    try {
      const langCode = LANGUAGE_TO_SPEECH_CODE[lang.toLowerCase()];
      await speakText(text, langCode);
    } catch (error) {
      console.error("Speech synthesis error:", error);
    }
  };

  const renderCourseSummary = () => {
    if (!courseSummary) return null;

    return (
      <div id="course-summary" className="mt-8 space-y-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-2xl font-bold mb-4">Course Summary</h3>

          {/* Main Points */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">
              Main Learning Points
            </h4>
            <ul className="list-disc pl-5 space-y-2">
              {courseSummary.mainPoints.map((point, idx) => (
                <li key={idx} className="text-gray-200">
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Key Vocabulary */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">
              Key Vocabulary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseSummary.keyVocabulary.map((item, idx) => (
                <div key={idx} className="bg-white/5 p-3 rounded-lg">
                  <span className="font-medium text-blue-300">{item.word}</span>
                  <span className="text-gray-300"> - {item.meaning}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Concept Breakdown */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-blue-400 mb-2">
              Concept Breakdown
            </h4>
            <div className="space-y-4">
              {courseSummary.conceptBreakdown.map((item, idx) => (
                <div key={idx} className="bg-white/5 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-300 mb-2">
                    {item.concept}
                  </h5>
                  <p className="text-gray-300">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* New Cultural Insights Section */}
          {courseSummary.culturalInsights && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-blue-400 mb-2">
                Cultural Insights
              </h4>
              <ul className="list-disc pl-5 space-y-2">
                {courseSummary.culturalInsights.map((insight, idx) => (
                  <li key={idx} className="text-gray-200">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Enhanced Practice Exercises Section */}
          {courseSummary.practiceExercises && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-blue-400 mb-2">
                Practice Activities
              </h4>
              <div className="space-y-4">
                {courseSummary.practiceExercises.map((exercise, idx) => (
                  <div key={idx} className="bg-white/5 p-4 rounded-lg">
                    <h5 className="font-medium text-blue-300 mb-2">
                      {exercise.type}
                    </h5>
                    <div className="text-gray-300 whitespace-pre-line">
                      {exercise.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Timeline Section */}
          {courseTimestamps && courseTimestamps.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-blue-400 mb-2">
                Video Timeline
              </h4>
              <div className="space-y-2">
                {courseTimestamps.map((stamp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => {
                      // TODO: Add timestamp navigation functionality
                      console.log(`Navigate to ${stamp.time}`);
                    }}
                  >
                    <span className="text-blue-300 font-mono min-w-[60px]">
                      {stamp.time}
                    </span>
                    <span className="text-gray-300">→</span>
                    <span className="text-gray-200 flex-1">{stamp.topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVideo = (videoUrl?: string, videoId?: string) => {
    if (!videoUrl) return null;

    return (
      <div className="space-y-6">
        <div className="aspect-video w-full">
          <iframe
            src={videoUrl}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {videoId && (
          <button
            onClick={async () => {
              const captions = await fetchCaptions(videoId);
              if (!captions.includes("Captions not available")) {
                setCaptions(captions);
                await generateCourseSummary(captions);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load Captions and Summary
          </button>
        )}

        {captions && (
          <>
            <div className="mt-4 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                Video Captions
              </h3>
              <div className="text-gray-300 space-y-2">
                {captions.split("\n\n").map((section, idx) => (
                  <p key={idx} className="text-gray-300">
                    {section}
                  </p>
                ))}
              </div>
            </div>
            {!isLoading && !courseSummary && (
              <button
                onClick={() => generateCourseSummary(captions)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Course Summary
              </button>
            )}
          </>
        )}

        {renderCourseSummary()}
      </div>
    );
  };

  const renderVocabularyItem = (item: SectionContent, idx: number) => (
    <div
      key={idx}
      className="group p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
    >
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-blue-300">
            {item.word}
          </span>
          <button
            onClick={() => handleSpeak(item.word, selectedLanguage)}
            className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
        <span className="text-gray-300">{item.translation}</span>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 italic">{item.example}</span>
          <button
            onClick={() => handleSpeak(item.example, selectedLanguage)}
            className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = (section: any, content: any) => {
    if (section.title === "Key Vocabulary" && Array.isArray(content)) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {content.map((item: SectionContent, idx: number) =>
            renderVocabularyItem(item, idx)
          )}
        </div>
      );
    }

    // Handle other section types
    return typeof content === "string" ? (
      <div className="text-gray-300">{content}</div>
    ) : null;
  };

  const renderLessonContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading your lesson...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError("")}
            className="mt-2 text-sm text-red-500 hover:text-red-700"
          >
            Try again
          </button>
        </div>
      );
    }

    if (currentLesson && lessonContent?.sections) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {lessonContent.title}
            </h2>
            <button
              onClick={() => {
                setCurrentLesson(null);
                setLessonContent(null);
                setCaptions("");
                setSummary("");
                setCourseSummary(null);
              }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              ← Back to lessons
            </button>
          </div>

          {currentLesson.videoUrl &&
            renderVideo(currentLesson.videoUrl, currentLesson.video_id)}

          <div className="grid gap-6">
            {lessonContent.sections.map((section, index) => (
              <div
                key={index}
                className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {section.title}
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    {renderSectionContent(section, section.content)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Update Quiz section styling */}
          {lessonContent.quiz && lessonContent.quiz.length > 0 && (
            <div className="mt-8 p-6 bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl">
              <h3 className="text-2xl font-semibold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Quiz
              </h3>
              {lessonContent.quiz.map((question, idx) => (
                <div key={idx} className="mb-8">
                  <p className="text-white font-medium mb-4">
                    {question.question}
                  </p>
                  <div className="space-y-3">
                    {question.options.map((option, optIdx) => (
                      <label
                        key={optIdx}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          value={option}
                          className="text-blue-500 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-gray-300 group-hover:text-white transition-colors">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  lessonContent.quiz && evaluateQuiz(lessonContent.quiz)
                }
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Submit Quiz
              </button>
            </div>
          )}

          {/* Summary section */}
          {summary && (
            <div className="mt-8 p-6 bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 rounded-xl">
              <h3 className="text-2xl font-semibold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Summary
              </h3>
              <p className="text-gray-300">{summary}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {LESSONS_DATA[
          selectedLanguage as keyof typeof LESSONS_DATA
        ]?.beginner.map((lesson) => (
          <motion.div
            key={lesson.id}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-lg hover:bg-gray-800/40 transition-all">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-400">
                      Level: {lesson.level}
                    </span>
                    <span className="text-sm text-gray-400">
                      Duration: {lesson.duration}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectLesson(lesson)}
                  className="p-3 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors group-hover:scale-110"
                >
                  <Play className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  const evaluateQuiz = (
    quiz: { question: string; options: string[]; answer: string }[]
  ) => {
    let score = 0;
    quiz.forEach((q, idx) => {
      const selectedOption = (
        document.querySelector(
          `input[name="question-${idx}"]:checked`
        ) as HTMLInputElement
      )?.value;
      if (selectedOption === q.answer) {
        score++;
      }
    });
    alert(`You scored ${score} out of ${quiz.length}`);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    setCurrentLesson(null);
    setLessonContent(null);
    setCaptions("");
    setSummary("");
    setCourseSummary(null);
    setCourseTimestamps([]);
    setError("");
  };

  const renderLessonList = () => {
    const languageLessons =
      LESSONS_DATA[selectedLanguage as keyof typeof LESSONS_DATA];

    if (!languageLessons || !languageLessons.beginner) {
      return (
        <div className="p-4 text-white bg-red-500/20 rounded-lg">
          No lessons available for {selectedLanguage}
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {languageLessons.beginner.map((lesson) => (
          <motion.div
            key={lesson.id}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-lg hover:bg-gray-800/40 transition-all">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {lesson.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-400">
                      Level: {lesson.level}
                    </span>
                    <span className="text-sm text-gray-400">
                      Duration: {lesson.duration}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectLesson(lesson)}
                  className="p-3 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors group-hover:scale-110"
                >
                  <Play className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
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
            <GraduationCap className="w-12 h-12 text-blue-400 relative" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Interactive Lessons
          </h1>
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="ml-auto p-2 rounded-xl bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 transition-all hover:bg-gray-800/70"
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <motion.div
                className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="mt-4 text-gray-400">Loading your lesson...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => setError("")}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                Try again
              </button>
            </div>
          ) : currentLesson && lessonContent ? (
            renderLessonContent()
          ) : (
            renderLessonList()
          )}
        </motion.div>

        {currentLesson && lessonContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {renderCourseSummary()}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default Learning;
