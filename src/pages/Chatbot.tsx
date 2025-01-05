import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  Loader2,
  Settings,
  Sparkles,
  Book,
  Brain,
} from "lucide-react";
import { FloatingParticles } from "../components/ui/FloatingParticles";
import { ChatMessage } from "../components/ui/ChatMessage";
import { Avatar } from "../components/ui/Avatar";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  options?: string[];
  isTyping?: boolean;
}

interface ChatbotProps {
  defaultLanguage?: string;
}

const LANGUAGES = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
} as const;

export function Chatbot({ defaultLanguage = "en" }: ChatbotProps) {
  const [message, setMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI language tutor. How can I help you learn today?",
      isBot: true,
      options: [
        "Help me practice speaking",
        "Teach me grammar",
        "Vocabulary help",
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<"casual" | "formal">("casual");
  const [expertise, setExpertise] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [showOptions, setShowOptions] = useState<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    const welcomeMessages = {
      en: "Hello! I'm your AI language tutor. How can I help you learn today?",
      es: "¡Hola! Soy tu tutor de idiomas AI. ¿Cómo puedo ayudarte a aprender hoy?",
      fr: "Bonjour! Je suis votre tuteur de langue AI. Comment puis-je vous aider à apprendre aujourd'hui?",
      de: "Hallo! Ich bin dein KI-Sprachlehrer. Wie kann ich dir heute beim Lernen helfen?",
    };

    setMessages([
      {
        id: Date.now(),
        text:
          welcomeMessages[newLanguage as keyof typeof welcomeMessages] ||
          welcomeMessages.en,
        isBot: true,
        options: [
          "Help me practice speaking",
          "Teach me grammar",
          "Vocabulary help",
        ],
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !isRecording) return;

    const userMessage: Message = {
      id: Date.now(),
      text: message,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chatbot`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.isBot ? "assistant" : "user",
              content: msg.text,
              language: selectedLanguage,
            })),
            language: selectedLanguage,
            theme,
            expertise,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Add typing indicator
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: "", isBot: true, isTyping: true },
      ]);

      // Simulate typing effect
      await new Promise((resolve) => setTimeout(resolve, 500));

      setMessages((prev) =>
        prev.map((msg) =>
          msg.isTyping
            ? {
                id: Date.now(),
                text: data.response,
                isBot: true,
                options: data.options,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, I encountered an error. Please try again.",
          isBot: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOptionClick = (option: string) => {
    setMessage(option);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleTypewriterComplete = (messageId: number) => {
    setShowOptions(messageId);
  };

  const handleSpeak = async (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-900 text-white py-8 relative overflow-hidden">
      <FloatingParticles />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient" />

      <div className="max-w-6xl mx-auto px-4 relative">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-6"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-70 animate-pulse" />
              <Brain className="w-12 h-12 text-blue-400 relative" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                AI Language Tutor
              </h1>
              <p className="text-gray-400 mt-1">
                Your personal language learning assistant
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-4 py-2 rounded-xl bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500 transition-all hover:bg-gray-800/70"
            >
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Settings Panel */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="col-span-3 bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-white/10 p-4 space-y-4"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Tutor Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">
                    Teaching Style
                  </label>
                  <select
                    value={theme}
                    onChange={(e) =>
                      setTheme(e.target.value as "casual" | "formal")
                    }
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700/50 border-gray-600"
                  >
                    <option value="casual">Casual & Friendly</option>
                    <option value="formal">Formal & Academic</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    Expertise Level
                  </label>
                  <select
                    value={expertise}
                    onChange={(e) =>
                      setExpertise(
                        e.target.value as
                          | "beginner"
                          | "intermediate"
                          | "advanced"
                      )
                    }
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700/50 border-gray-600"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              showSettings ? "col-span-9" : "col-span-12"
            } bg-gray-800/30 backdrop-blur-lg rounded-2xl border border-white/10 h-[600px] flex flex-col`}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-start gap-3 ${
                      msg.isBot ? "justify-start" : "justify-end"
                    }`}
                  >
                    {msg.isBot && (
                      <Avatar
                        className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"
                        fallback={<Book className="w-4 h-4 text-white" />}
                      />
                    )}
                    <ChatMessage
                      message={msg}
                      showOptions={showOptions === msg.id}
                      onTypewriterComplete={() =>
                        handleTypewriterComplete(msg.id)
                      }
                      onOptionClick={handleOptionClick}
                      onSpeak={(text) => handleSpeak(text, selectedLanguage)}
                    />
                    {!msg.isBot && (
                      <Avatar
                        className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center"
                        fallback="U"
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-white/10 bg-gray-800/30"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-3 rounded-xl transition-colors ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-700/50 hover:bg-gray-600/50"
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isTyping}
                  className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
