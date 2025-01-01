import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe2,
  Mic,
  BookOpen,
  PenTool,
  MessageSquare,
  Trophy,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { GradientText } from "../components/ui/GradientText";
import { FloatingParticles } from "../components/ui/FloatingParticles";

function Home() {
  return (
    <>
      <FloatingParticles />
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl"
          />
          <h1 className="text-5xl text-white md:text-7xl font-bold mb-6 tracking-tight">
            Master Any Language with{" "}
            <GradientText>AI-Powered Learning</GradientText>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your all-in-one platform for language learning. Translate, practice,
            and achieve fluency with our interactive tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            to="/translate/text"
            icon={<Globe2 className="w-8 h-8" />}
            title="Text Translation"
            description="Translate text between multiple languages instantly"
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            to="/translate/voice"
            icon={<Mic className="w-8 h-8" />}
            title="Voice Translation"
            description="Speak and hear translations in real-time"
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            to="/learn"
            icon={<BookOpen className="w-8 h-8" />}
            title="Interactive Lessons"
            description="Learn with structured, engaging content"
            gradient="from-orange-500 to-red-500"
          />
          <FeatureCard
            to="/practice"
            icon={<PenTool className="w-8 h-8" />}
            title="Practice Exercises"
            description="Test your knowledge with quizzes and exercises"
            gradient="from-green-500 to-emerald-500"
          />
          <FeatureCard
            to="/chatbot"
            icon={<MessageSquare className="w-8 h-8" />}
            title="AI Language Tutor"
            description="Get instant help from our AI language tutor"
            gradient="from-violet-500 to-purple-500"
          />
          <FeatureCard
            to="/achievements"
            icon={<Trophy className="w-8 h-8" />}
            title="Track Progress"
            description="Earn achievements and track your learning journey"
            gradient="from-yellow-500 to-orange-500"
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all hover:gap-4"
          >
            Start Learning Now
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </>
  );
}

interface FeatureCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({
  to,
  icon,
  title,
  description,
  gradient,
}: FeatureCardProps) {
  return (
    <Card className="group relative overflow-hidden">
      <Link to={to} className="block p-6">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
        />
        <div className="relative">
          <div className="text-blue-600 mb-4 transform group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-500">{description}</p>
        </div>
      </Link>
    </Card>
  );
}

export default Home;
