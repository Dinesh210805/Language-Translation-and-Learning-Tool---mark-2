import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Play, Loader } from "lucide-react";
import type { Lesson, LessonContent, SectionContent } from "../types/learning";
import { LESSONS_DATA } from "../data/lessons";

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

  const renderVideo = (videoUrl?: string) => {
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

        {captions && (
          <>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Video Captions</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {captions.split("\n\n").map((section, idx) => (
                  <p key={idx} className="text-gray-700 mb-2">
                    {section}
                  </p>
                ))}
              </div>
            </div>
            <button
              onClick={() => generateCourseSummary(captions)}
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating Summary...
                </span>
              ) : (
                "Generate Course Summary"
              )}
            </button>
          </>
        )}

        {renderCourseSummary()}
      </div>
    );
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
      const lesson = LESSONS_DATA[
        selectedLanguage as keyof typeof LESSONS_DATA
      ]?.beginner.find((l) => l.title === currentLesson.title);

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{lessonContent.title}</h2>
            <button
              onClick={() => {
                setCurrentLesson(null);
                setLessonContent(null);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to lessons
            </button>
          </div>

          {lesson && renderVideo(lesson.videoUrl)}

          <div className="grid gap-6">
            {lessonContent.sections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="border-l-4 border-blue-500 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h3>
                  <div className="prose prose-gray max-w-none">
                    {typeof section.content === "string"
                      ? section.content
                      : Array.isArray(section.content)
                      ? section.content.map(
                          (item: SectionContent, idx: number) => (
                            <div key={idx}>
                              <p>
                                <strong>{item.word}</strong>: {item.translation}
                              </p>
                              <p>
                                <em>{item.example}</em>
                              </p>
                            </div>
                          )
                        )
                      : JSON.stringify(section.content)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {summary && (
            <div className="mt-8 p-4 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Summary
              </h3>
              <p>{summary}</p>
            </div>
          )}

          {lessonContent.quiz && lessonContent.quiz.length > 0 && (
            <div className="mt-8 p-4 bg-white rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quiz</h3>
              {lessonContent.quiz.map((question, idx) => (
                <div key={idx} className="mb-4">
                  <p className="font-medium mb-2">{question.question}</p>
                  <div className="space-y-2">
                    {question.options.map((option, optIdx) => (
                      <label
                        key={optIdx}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          value={option}
                          className="text-blue-600"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  lessonContent.quiz && evaluateQuiz(lessonContent.quiz)
                }
                className="mt-4 p-2 bg-blue-600 text-white rounded"
              >
                Submit Quiz
              </button>
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
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {lesson.title}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-600">
                    Level: {lesson.level}
                  </span>
                  <span className="text-sm text-gray-600">
                    Duration: {lesson.duration}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSelectLesson(lesson)}
                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              >
                <Play className="w-5 h-5" />
              </button>
            </div>
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4"
    >
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl text-white font-bold">Interactive Lessons</h1>
        <select
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="ml-auto p-2 border rounded"
        >
          {availableLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {renderLessonContent()}
    </motion.div>
  );
}

export default Learning;
