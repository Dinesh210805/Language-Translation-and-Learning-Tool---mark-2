import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Star, ListChecks, Sparkles } from "lucide-react";

interface LineByLineProps {
  text: string;
  onComplete?: () => void;
}

interface Section {
  type: string;
  content: string;
  translation?: string; // Make translation optional
}

export function LineByLine({ text, onComplete }: LineByLineProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [visibleSections, setVisibleSections] = useState<number>(0);

  useEffect(() => {
    // Parse text into sections
    const parsedSections = text.split("\n").reduce((acc: Section[], line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return acc;

      if (trimmedLine.startsWith("## ")) {
        // Section header
        acc.push({ type: "header", content: trimmedLine.substring(3) });
      } else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
        // List item
        acc.push({ type: "list-item", content: trimmedLine.substring(2) });
      } else if (trimmedLine.includes("(") && trimmedLine.includes(")")) {
        // Translation line
        const [original, translation] = trimmedLine.split(/[()]/);
        acc.push({
          type: "translation",
          content: original.trim(),
          translation: translation.trim(),
        });
      } else {
        // Regular text
        acc.push({ type: "text", content: trimmedLine });
      }
      return acc;
    }, []);

    setSections(parsedSections);
  }, [text]);

  useEffect(() => {
    if (visibleSections < sections.length) {
      const timer = setTimeout(() => {
        setVisibleSections((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [visibleSections, sections.length, onComplete]);

  const getIcon = (header: string) => {
    if (header.includes("Example"))
      return <Book className="w-4 h-4 text-blue-400" />;
    if (header.includes("Practice"))
      return <ListChecks className="w-4 h-4 text-green-400" />;
    if (header.includes("Note"))
      return <Star className="w-4 h-4 text-yellow-400" />;
    if (header.includes("Tip"))
      return <Sparkles className="w-4 h-4 text-purple-400" />;
    return null;
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {sections.slice(0, visibleSections).map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {section.type === "header" && (
              <div className="flex items-center gap-2 text-lg font-semibold text-blue-400 mt-4">
                {getIcon(section.content)}
                <span>{section.content}</span>
              </div>
            )}

            {section.type === "list-item" && (
              <div className="flex items-start gap-2 ml-4">
                <span className="text-blue-400 mt-1">•</span>
                <span>{section.content}</span>
              </div>
            )}

            {section.type === "translation" && (
              <div className="grid grid-cols-2 gap-4 bg-gray-800/30 p-2 rounded-lg">
                <span>{section.content}</span>
                <span className="text-gray-400">{section.translation}</span>
              </div>
            )}

            {section.type === "text" && (
              <p className="text-gray-200">{section.content}</p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
