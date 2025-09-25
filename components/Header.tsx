import React from 'react';
import { View } from '../types';
import { MoonIcon, SunIcon, SystemIcon } from './icons';

interface HeaderProps {
  currentView: View;
  theme: string;
  setTheme: (theme: string) => void;
}

const viewTitles: Record<View, string> = {
  dashboard: 'Dashboard',
  habits: 'Habits',
  assignments: 'Assignments',
  goals: 'Goals',
  education: 'Education',
};

const Header: React.FC<HeaderProps> = ({ currentView, theme, setTheme }) => {
  const title = viewTitles[currentView];

  return (
    <header className="flex-shrink-0 bg-white dark:bg-slate-800/70 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">{title}</h1>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-full p-1">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-full ${theme === 'light' ? 'bg-white dark:bg-slate-500' : ''}`}
            aria-label="Light mode"
          >
            <SunIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-full ${theme === 'system' ? 'bg-white dark:bg-slate-500' : ''}`}
            aria-label="System mode"
          >
            <SystemIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-full ${theme === 'dark' ? 'bg-white dark:bg-slate-500' : ''}`}
            aria-label="Dark mode"
          >
            <MoonIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;