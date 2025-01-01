import { motion } from "framer-motion";
import {
  History as HistoryIcon,
  Globe2,
  BookOpen,
  PenTool,
} from "lucide-react";

function History() {
  const activities = [
    {
      id: 1,
      type: "translation",
      icon: Globe2,
      title: "Text Translation",
      description: 'Translated "Hello, how are you?" to Spanish',
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "lesson",
      icon: BookOpen,
      title: "Lesson Completed",
      description: "Basic Greetings - Spanish",
      timestamp: "1 day ago",
    },
    {
      id: 3,
      type: "practice",
      icon: PenTool,
      title: "Practice Exercise",
      description: "Vocabulary Quiz - Score: 8/10",
      timestamp: "2 days ago",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <HistoryIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Learning History</h1>
      </div>

      <div className="space-y-6">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {activity.title}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{activity.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default History;
