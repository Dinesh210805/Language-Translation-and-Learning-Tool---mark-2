import { useState } from "react";

import { Copy, Volume2, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";

interface MessageActionsProps {
  text: string;
  onSpeak: () => void;
}

export function MessageActions({ text, onSpeak }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 mt-2"
    >
      <button
        onClick={handleCopy}
        className="p-1 hover:bg-gray-700/30 rounded-md transition-colors"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
      <button
        onClick={onSpeak}
        className="p-1 hover:bg-gray-700/30 rounded-md transition-colors"
        title="Read aloud"
      >
        <Volume2 className="w-4 h-4 text-gray-400" />
      </button>
      <div className="flex items-center gap-1 ml-2">
        <button
          onClick={() => setLiked(true)}
          className={`p-1 hover:bg-gray-700/30 rounded-md transition-colors ${
            liked === true ? "text-green-400" : "text-gray-400"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => setLiked(false)}
          className={`p-1 hover:bg-gray-700/30 rounded-md transition-colors ${
            liked === false ? "text-red-400" : "text-gray-400"
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
