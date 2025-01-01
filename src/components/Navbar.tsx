import React from "react";
import { Link } from "react-router-dom";
import {
  Globe2,
  Mic,
  BookOpen,
  PenTool,
  MessageSquare,
  Trophy,
  History,
} from "lucide-react";

function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Globe2 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">LangLearn</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <NavLink
              to="/translate/text"
              icon={<Globe2 className="w-5 h-5" />}
              text="Text"
            />
            <NavLink
              to="/translate/voice"
              icon={<Mic className="w-5 h-5" />}
              text="Voice"
            />
            <NavLink
              to="/learn"
              icon={<BookOpen className="w-5 h-5" />}
              text="Learn"
            />
            <NavLink
              to="/practice"
              icon={<PenTool className="w-5 h-5" />}
              text="Practice"
            />
            <NavLink
              to="/chatbot"
              icon={<MessageSquare className="w-5 h-5" />}
              text="Chat"
            />
            <NavLink
              to="/achievements"
              icon={<Trophy className="w-5 h-5" />}
              text="Achievements"
            />
            <NavLink
              to="/history"
              icon={<History className="w-5 h-5" />}
              text="History"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  to,
  icon,
  text,
}: {
  to: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

export default Navbar;
