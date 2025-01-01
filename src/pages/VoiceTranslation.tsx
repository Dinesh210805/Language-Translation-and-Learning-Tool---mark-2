import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Speaker, Wand2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { GradientText } from '../components/ui/GradientText';

function VoiceTranslation() {
  const [isRecording, setIsRecording] = useState(false);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [audioLevel, setAudioLevel] = useState(0);

  // Simulate audio level changes during recording
  React.useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random());
      }, 100);
      return () => clearInterval(interval);
    }
    setAudioLevel(0);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implement voice recording
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Implement voice translation
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4"
    >
      <div className="flex items-center gap-3 mb-8">
        <Mic className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">
          <GradientText from="from-purple-600" to="to-pink-600">
            Voice Translation
          </GradientText>
        </h1>
      </div>

      <div className="space-y-8">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sourceLang" className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <select
                id="sourceLang"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div>
              <label htmlFor="targetLang" className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <select
                id="targetLang"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
              >
                <option value="es">Spanish</option>
                <option value="en">English</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.15 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    className="absolute inset-0 bg-red-500 rounded-full"
                    style={{ transform: `scale(${1 + audioLevel})` }}
                  />
                )}
              </AnimatePresence>
              <motion.button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`relative p-8 rounded-full transition-colors ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic className="w-10 h-10 text-white" />
              </motion.button>
            </div>
            <p className="text-lg text-gray-600">
              {isRecording ? 'Listening...' : 'Click to start recording'}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Speaker className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold">Translation</h2>
          </div>
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 text-gray-500">
              <Wand2 className="w-5 h-5" />
              <span>Your translation will appear here...</span>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

export default VoiceTranslation;