import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Speaker, Wand2, Volume2 } from "lucide-react";
import { speakText, LANGUAGE_TO_SPEECH_CODE } from "../utils/speech";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
import { Card } from "../components/ui/Card";
import { FloatingParticles } from "../components/ui/FloatingParticles";
import { TranslationDetails } from "../components/ui/TranslationDetails";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LANGUAGES = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  zh: "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  ja: "Japanese",
  ko: "Korean",
  ru: "Russian",
  ar: "Arabic",
  hi: "Hindi",
  bn: "Bengali",
  tr: "Turkish",
  vi: "Vietnamese",
  th: "Thai",
  nl: "Dutch",
  el: "Greek",
  pl: "Polish",
  ta: "Tamil",
  te: "Telugu",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  pa: "Punjabi",
  ur: "Urdu",
  id: "Indonesian",
  ms: "Malay",
  fil: "Filipino",
  sv: "Swedish",
  da: "Danish",
  no: "Norwegian",
  fi: "Finnish",
  cs: "Czech",
  ro: "Romanian",
  hu: "Hungarian",
  uk: "Ukrainian",
  he: "Hebrew",
} as const;

function VoiceTranslation() {
  const [isRecording, setIsRecording] = useState(false);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [audioStream, setAudioStream] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [translatedAudio, setTranslatedAudio] = useState<string>("");
  const [translationDetails, setTranslationDetails] = useState<any>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string>("");
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  // Simulate audio level changes during recording
  // Initialize AudioContext
  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(ctx);
    return () => {
      ctx.close();
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      setAudioChunks([]);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.start(100); // Record in 100ms chunks
      setAudioStream(mediaRecorder);
      setIsRecording(true);
      setError("");
    } catch (error) {
      console.error("Failed to start recording:", error);
      setError("Failed to access microphone");
    }
  };

  const handleStopRecording = async () => {
    try {
      if (!audioStream || !mediaStream || !audioContext) return;

      setIsTranslating(true);
      audioStream.stop();
      mediaStream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      formData.append("sourceLang", sourceLang);
      formData.append("targetLang", targetLang);

      const response = await fetch(`${API_URL}/api/translate/voice`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Translation failed");

      // Handle the audio data safely
      if (data.audio && typeof data.audio === "string") {
        try {
          // Remove potential data URL prefix if present
          const base64Data = data.audio.replace(
            /^data:audio\/(mp3|wav);base64,/,
            ""
          );

          // Decode base64 to binary
          const binaryString = window.atob(base64Data);
          const audioArray = new Uint8Array(binaryString.length);

          for (let i = 0; i < binaryString.length; i++) {
            audioArray[i] = binaryString.charCodeAt(i);
          }

          // Create audio buffer
          const buffer = await audioContext.decodeAudioData(audioArray.buffer);
          setAudioBuffer(buffer);

          // Store audio URL for backup playback method
          setTranslatedAudio(`data:audio/mp3;base64,${base64Data}`);
        } catch (audioError) {
          console.error("Audio processing error:", audioError);
          throw new Error("Failed to process audio data");
        }
      } else {
        throw new Error("Invalid audio data received");
      }

      // Set translation details if available
      if (data.translationDetails) {
        setTranslationDetails(data.translationDetails);
      } else {
        setTranslationDetails({
          translation: data.translation || "Translation not available",
          details: {},
        });
      }
    } catch (error: any) {
      console.error("Translation failed:", error);
      setError(error.message || "Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  // Add a fallback play method
  const playAudio = async () => {
    try {
      if (audioBuffer && audioContext) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
      } else if (translatedAudio) {
        // Fallback to HTML audio element
        const audio = new Audio(translatedAudio);
        await audio.play();
      } else {
        throw new Error("No audio available");
      }
    } catch (error) {
      console.error("Playback error:", error);
      setError("Failed to play audio");
    }
  };

  // Add text-to-speech handler
  const handleSpeak = async (text: string, lang: string) => {
    try {
      await speakText(text, LANGUAGE_TO_SPEECH_CODE[lang]);
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setError("Failed to play audio");
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (audioStream) {
        audioStream.stop();
      }
    };
  }, [mediaStream, audioStream]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-900 text-white py-8 relative overflow-hidden">
      <FloatingParticles />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto px-4 relative"
      >
        {/* Header section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Universal Voice Translator
          </h1>
          <p className="text-lg text-gray-300">
            Transform your voice into any language instantly
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Language Selection Card */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 backdrop-blur-xl bg-white/10 border border-white/20 hover:border-white/30 transition-all">
              <div className="space-y-6">
                {/* From Language */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Speaking Language
                  </label>
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="w-full rounded-xl bg-black/30 border-gray-700 text-white py-3 px-4 appearance-none hover:bg-black/40 transition-colors focus:ring-2 focus:ring-purple-500"
                  >
                    {Object.entries(LANGUAGES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-[38px] text-gray-400 pointer-events-none">
                    <Wand2 className="w-5 h-5" />
                  </div>
                </div>

                {/* To Language */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Translate To
                  </label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full rounded-xl bg-black/30 border-gray-700 text-white py-3 px-4 appearance-none hover:bg-black/40 transition-colors focus:ring-2 focus:ring-purple-500"
                  >
                    {Object.entries(LANGUAGES).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-[38px] text-gray-400 pointer-events-none">
                    <Wand2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Recording Interface */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 backdrop-blur-xl bg-white/10 border border-white/20 hover:border-white/30 transition-all">
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Animated Recording Button */}
                <div className="relative">
                  <AnimatePresence>
                    {isRecording && (
                      <>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          exit={{ scale: 2, opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute inset-0 rounded-full bg-red-500/30"
                        />
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.2, opacity: 0.2 }}
                          exit={{ scale: 1.7, opacity: 0 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            delay: 0.2,
                          }}
                          className="absolute inset-0 rounded-full bg-red-500/30"
                        />
                      </>
                    )}
                  </AnimatePresence>
                  <motion.button
                    onClick={
                      isRecording ? handleStopRecording : handleStartRecording
                    }
                    className={`relative p-8 rounded-full ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    } transition-all duration-300 shadow-lg hover:shadow-xl`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mic className="w-10 h-10 text-white" />
                  </motion.button>
                </div>

                {/* Status Text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg text-gray-300"
                >
                  {isRecording ? (
                    <span className="flex items-center gap-2">
                      Recording in progress
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        ...
                      </motion.span>
                    </span>
                  ) : (
                    "Tap to start recording"
                  )}
                </motion.p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Translation Result */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-6"
        >
          <Card className="p-6 backdrop-blur-xl bg-white/10 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Speaker className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">
                Translation Result
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
                {error}
              </div>
            )}

            {isTranslating ? (
              <div className="flex items-center justify-center h-32">
                <motion.div
                  className="w-6 h-6 border-3 border-white/30 border-t-blue-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="ml-3 text-gray-300">Translating...</span>
              </div>
            ) : (
              (audioBuffer || translationDetails?.translation) && (
                <div className="space-y-4">
                  {/* Audio Playback Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={playAudio}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/25"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title="Play translated audio"
                      >
                        <Speaker className="w-5 h-5" />
                      </motion.button>
                      {translationDetails?.translation && (
                        <motion.button
                          onClick={() =>
                            handleSpeak(
                              translationDetails.translation,
                              targetLang
                            )
                          }
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-blue-500/25"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Read translation aloud"
                        >
                          <Volume2 className="w-5 h-5" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Translation Text */}
                  <div className="rounded-xl backdrop-blur-lg bg-black/20 border border-white/10 p-6 hover:bg-black/30 transition-colors">
                    <p className="text-white text-lg font-medium">
                      {translationDetails?.translation ||
                        "Translation not available"}
                    </p>
                    {translationDetails?.original_text && (
                      <p className="text-gray-400 mt-3 text-sm border-t border-white/10 pt-3">
                        Original: {translationDetails.original_text}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </Card>

          {/* Translation Details */}
          {translationDetails && !isTranslating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TranslationDetails
                details={translationDetails}
                targetLang={targetLang}
                onGenerateMoreExamples={() => {}}
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default VoiceTranslation;
