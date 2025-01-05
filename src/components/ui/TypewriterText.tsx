import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  renderNode?: (text: string) => React.ReactNode;
}

export function TypewriterText({
  text,
  delay = 15,
  onComplete,
  renderNode,
}: TypewriterTextProps): JSX.Element {
  const [isComplete, setIsComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        // Speed up for common punctuation
        let increment = 1;
        if ([" ", ",", ".", "!", "?"].includes(text[currentIndex])) {
          increment = 2;
        }

        setDisplayedText(
          (prev) => prev + text.slice(currentIndex, currentIndex + increment)
        );
        setCurrentIndex((prev) => prev + increment);
      }, delay);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, delay, text, onComplete, isComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="whitespace-pre-wrap"
    >
      {renderNode ? (
        renderNode(displayedText)
      ) : (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {displayedText}
        </motion.span>
      )}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [0, 1] }}
          transition={{ repeat: Infinity, duration: 0.3 }}
          className="ml-0.5 inline-block w-0.5 h-4 bg-current"
        />
      )}
    </motion.div>
  );
}
