import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TextTranslation from './pages/TextTranslation';
import VoiceTranslation from './pages/VoiceTranslation';
import Learning from './pages/Learning';
import Practice from './pages/Practice';
import Chatbot from './pages/Chatbot';
import Achievements from './pages/Achievements';
import History from './pages/History';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/translate/text" element={<TextTranslation />} />
            <Route path="/translate/voice" element={<VoiceTranslation />} />
            <Route path="/learn" element={<Learning />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;