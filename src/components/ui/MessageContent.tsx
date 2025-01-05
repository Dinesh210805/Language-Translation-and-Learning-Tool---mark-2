import React from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Book, Star, ListChecks, Sparkles } from "lucide-react";

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  const sections = content.split(/(?=##\s)/).filter(Boolean);

  const renderSection = (section: string, index: number) => {
    const isHeading = section.startsWith("##");
    const title = isHeading
      ? section.split("\n")[0].replace("##", "").trim()
      : "";
    const sectionContent = isHeading
      ? section.split("\n").slice(1).join("\n")
      : section;

    const getIcon = (title: string) => {
      if (title.toLowerCase().includes("example"))
        return <Book className="w-4 h-4 text-indigo-400" />;
      if (title.toLowerCase().includes("practice"))
        return <ListChecks className="w-4 h-4 text-green-400" />;
      if (title.toLowerCase().includes("tip"))
        return <Star className="w-4 h-4 text-yellow-400" />;
      if (title.toLowerCase().includes("note"))
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      return null;
    };

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="rounded-lg overflow-hidden"
      >
        {isHeading && (
          <div className="bg-indigo-600/20 p-3 flex items-center gap-2 rounded-t-lg border-b border-indigo-500/20">
            {getIcon(title)}
            <h3 className="text-sm font-medium text-white">{title}</h3>
          </div>
        )}
        <div
          className={`p-3 ${isHeading ? "bg-indigo-600/10" : ""} rounded-b-lg`}
        >
          <ReactMarkdown
            className="prose prose-invert max-w-none prose-p:leading-relaxed prose-li:my-1"
            components={{
              ul: ({ children }) => (
                <ul className="space-y-2 my-2 list-none">
                  {React.Children.map(children, (child) => (
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1.5">•</span>
                      {child}
                    </li>
                  ))}
                </ul>
              ),
              li: ({ children }) => (
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-gray-300"
                >
                  {children}
                </motion.li>
              ),
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 rounded bg-gray-800 text-pink-400">
                  {children}
                </code>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-indigo-400">
                  {children}
                </strong>
              ),
            }}
          >
            {sectionContent}
          </ReactMarkdown>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
}
