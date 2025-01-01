import React from 'react';
import { motion } from 'framer-motion';
import { PenTool } from 'lucide-react';

function Practice() {
  const exercises = [
    { id: 1, title: 'Vocabulary Quiz', type: 'Multiple Choice', difficulty: 'Easy' },
    { id: 2, title: 'Grammar Practice', type: 'Fill in the blanks', difficulty: 'Medium' },
    { id: 3, title: 'Listening Exercise', type: 'Audio Quiz', difficulty: 'Hard' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <PenTool className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Practice Exercises</h1>
      </div>

      <div className="grid gap-6">
        {exercises.map((exercise) => (
          <motion.div
            key={exercise.id}
            whileHover={{ scale: 1.02 }}
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <h3 className="text-xl font-medium text-gray-900 mb-2">{exercise.title}</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {exercise.type}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {exercise.difficulty}
              </span>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Start Exercise
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default Practice;