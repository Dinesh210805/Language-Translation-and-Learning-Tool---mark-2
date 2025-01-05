import { motion } from "framer-motion";
import { TypewriterText } from "./TypewriterText";
import { MessageActions } from "./MessageActions";
import { cn } from "../../lib/utils";
import { Book, Star, ListChecks, Sparkles, MessageCircle } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: number;
    text: string;
    isBot: boolean;
    options?: string[];
    isTyping?: boolean;
  };
  showOptions: boolean;
  onTypewriterComplete: () => void;
  onOptionClick: (option: string) => void;
  onSpeak: (text: string) => void;
}

export function ChatMessage({
  message,
  showOptions,
  onTypewriterComplete,
  onOptionClick,
  onSpeak,
}: ChatMessageProps) {
  const getIconForSection = (title: string) => {
    if (title.includes("Example")) return <Book className="w-4 h-4" />;
    if (title.includes("Practice")) return <ListChecks className="w-4 h-4" />;
    if (title.includes("Note")) return <Star className="w-4 h-4" />;
    if (title.includes("Tip")) return <Sparkles className="w-4 h-4" />;
    return <MessageCircle className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col gap-2 max-w-[80%] relative">
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={cn(
          "p-4 rounded-2xl shadow-lg backdrop-blur-sm relative overflow-hidden",
          message.isBot
            ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90 text-white"
            : "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
        )}
      >
        {message.isTyping ? (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex gap-2"
          >
            <div className="w-2 h-2 bg-white rounded-full" />
            <div className="w-2 h-2 bg-white rounded-full animation-delay-200" />
            <div className="w-2 h-2 bg-white rounded-full animation-delay-500" />
          </motion.div>
        ) : message.isBot ? (
          <TypewriterText
            text={message.text}
            delay={15}
            onComplete={onTypewriterComplete}
            renderNode={(text) => (
              <div className="space-y-4">
                {text.split("\n").map((line, index) => {
                  const isHeading = line.startsWith("##");
                  const content = isHeading ? line.substring(2).trim() : line;

                  return (
                    <div key={index}>
                      {isHeading ? (
                        <div className="flex items-center gap-2 text-lg font-semibold text-blue-400">
                          {getIconForSection(content)}
                          <span>{content}</span>
                        </div>
                      ) : (
                        <p className="text-gray-200">{content}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          />
        ) : (
          <div>{message.text}</div>
        )}
      </motion.div>

      {message.isBot && !message.isTyping && (
        <MessageActions
          text={message.text}
          onSpeak={() => onSpeak(message.text)}
        />
      )}

      {message.options && message.isBot && !message.isTyping && showOptions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mt-2"
        >
          {message.options.map((option, index) => (
            <motion.button
              key={option}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onOptionClick(option)}
              className="px-4 py-2 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/50 hover:to-gray-700/50 rounded-xl text-sm transition-all hover:scale-105 border border-gray-700/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {option}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
