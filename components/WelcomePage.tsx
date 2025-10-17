import React from 'react';
import { A19Icon } from './icons/A19Icon';
import { PortfolioIcon } from './icons/PortfolioIcon';
import { LandingPageIcon } from './icons/LandingPageIcon';
import { QuizIcon } from './icons/QuizIcon';
import { TodoListIcon } from './icons/TodoListIcon';

interface WelcomePageProps {
  setPrompt: (prompt: string) => void;
}

const examplePrompts = [
    {
        icon: <PortfolioIcon />,
        title: "Portfolio",
        prompt: "A portfolio website for a graphic designer, featuring a masonry grid layout for projects."
    },
    {
        icon: <LandingPageIcon />,
        title: "Landing Page",
        prompt: "A landing page for a new meditation app with a calming blue and green color scheme."
    },
    {
        icon: <QuizIcon />,
        title: "Interactive Quiz",
        prompt: "An interactive quiz about space exploration with multiple-choice questions."
    },
    {
        icon: <TodoListIcon />,
        title: "To-Do App",
        prompt: "A simple to-do list application with functionality to add, delete, and mark tasks as complete."
    }
];

export const WelcomePage: React.FC<WelcomePageProps> = ({ setPrompt }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center h-full text-center p-8 relative overflow-hidden"
    >
      
      <div className="relative z-10">
        <A19Icon className="w-44 h-44 mb-4 mx-auto" />
        <h1 className="text-5xl font-bold mb-3 bg-gradient-bg bg-clip-text text-transparent animate-pulse-light">
          A19 AI Web Developer
        </h1>
        <p className="text-lg text-gray-400 mb-12 max-w-2xl">
          I turn your ideas into code. Describe the website you want, and I'll build it live.
        </p>
      </div>

      <div className="w-full max-w-5xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {examplePrompts.map((item, index) => (
                  <button 
                    key={index} 
                    onClick={() => setPrompt(item.prompt)}
                    className="group p-6 bg-panel-bg/60 backdrop-blur-sm border border-gray-700 rounded-xl text-left hover:border-accent-purple transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="text-gray-400 group-hover:text-accent-purple transition-colors duration-300 mb-3">
                        {React.cloneElement(item.icon, { className: 'w-8 h-8' })}
                    </div>
                    <h3 className="font-bold text-lg text-gray-200 mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.prompt}</p>
                  </button>
              ))}
          </div>
      </div>
    </div>
  );
};