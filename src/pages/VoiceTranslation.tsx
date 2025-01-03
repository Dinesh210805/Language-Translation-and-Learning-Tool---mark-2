import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Speaker } from "lucide-react";
import { Card } from "../components/ui/Card";
import { GradientText } from "../components/ui/GradientText";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function VoiceTranslation() {
  const [isRecording, setIsRecording] = useState(false);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioStream, setAudioStream] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [translatedAudio, setTranslatedAudio] = useState<string>("");
  const [translationDetails, setTranslationDetails] = useState<any>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string>("");

  // Simulate audio level changes during recording
  React.useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random());
      }, 100);
      return () => clearInterval(interval);
    }
    setAudioLevel(0);
  }, [isRecording]);

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
      if (!audioStream || !mediaStream) return;

      setIsTranslating(true);
      audioStream.stop();
      mediaStream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);

      // Wait for the last chunk
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

      const audioUrl = `data:audio/mp3;base64,${data.audio}`;
      setTranslatedAudio(audioUrl);
      setTranslationDetails(data);
    } catch (error: any) {
      console.error("Translation failed:", error);
      setError(error.message || "Translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  // Clean up on unmount
  React.useEffect(() => {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4"
    >
      <div className="flex items-center gap-3 mb-8">
        <Mic className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">
          <GradientText from="from-purple-600" to="to-pink-600">
            Voice Translation
          </GradientText>
        </h1>
      </div>

      <div className="space-y-8">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sourceLang"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                From
              </label>
              <select
                id="sourceLang"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="targetLang"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                To
              </label>
              <select
                id="targetLang"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
              >
                <option value="es">Spanish</option>
                <option value="en">English</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.15 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    className="absolute inset-0 bg-red-500 rounded-full"
                    style={{ transform: `scale(${1 + audioLevel})` }}
                  />
                )}
              </AnimatePresence>
              <motion.button
                onClick={
                  isRecording ? handleStopRecording : handleStartRecording
                }
                className={`relative p-8 rounded-full transition-colors ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic className="w-10 h-10 text-white" />{" "}
              </motion.button>
            </div>
            <p className="text-lg text-gray-600">
              {isRecording ? "Listening..." : "Click to start recording"}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Speaker className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold">Translation</h2>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          {isTranslating ? (
            <div className="flex items-center justify-center h-32">
              <motion.div
                className="w-6 h-6 border-3 border-gray-300 border-t-blue-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="ml-3 text-gray-600">Translating...</span>
            </div>
          ) : (
            translatedAudio && (
              <div className="space-y-4">
                <audio controls src={translatedAudio} className="w-full" />
                <p className="text-gray-700">
                  {translationDetails?.translation}
                </p>
              </div>
            )
          )}
        </Card>
      </div>
    </motion.div>
  );
}

export default VoiceTranslation;
