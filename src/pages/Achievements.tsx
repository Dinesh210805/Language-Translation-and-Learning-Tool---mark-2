import { motion } from 'framer-motion';
import { Trophy, Star, Clock, Target } from 'lucide-react';

function Achievements() {
  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: Star,
      progress: 100,
      completed: true,
    },
    {
      id: 2,
      title: 'Quick Learner',
      description: 'Complete 5 lessons in one day',
      icon: Clock,
      progress: 60,
      completed: false,
    },
    {
      id: 3,
      title: 'Practice Makes Perfect',
      description: 'Complete 10 practice exercises',
      icon: Target,
      progress: 30,
      completed: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Achievements</h1>
      </div>

      <div className="grid gap-6">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: 1.02 }}
              className={`p-6 bg-white rounded-lg shadow-sm border ${
                achievement.completed ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  achievement.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    achievement.completed ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {achievement.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{achievement.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Progress: {achievement.progress}%
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default Achievements;