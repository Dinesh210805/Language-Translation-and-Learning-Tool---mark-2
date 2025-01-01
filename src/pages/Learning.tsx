import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play } from 'lucide-react';

function Learning() {
  const lessons = [
    { id: 1, title: 'Basic Greetings', level: 'Beginner', duration: '10 min' },
    { id: 2, title: 'Numbers 1-10', level: 'Beginner', duration: '15 min' },
    { id: 3, title: 'Common Phrases', level: 'Beginner', duration: '20 min' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Interactive Lessons</h1>
      </div>

      <div className="grid gap-4">
        {lessons.map((lesson) => (
          <motion.div
            key={lesson.id}
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{lesson.title}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-600">Level: {lesson.level}</span>
                  <span className="text-sm text-gray-600">Duration: {lesson.duration}</span>
                </div>
              </div>
              <button className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
                <Play className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default Learning;