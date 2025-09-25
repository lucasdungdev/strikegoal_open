import React, { useState, useEffect, useCallback } from 'react';
import { DataProvider } from './context/DataContext';
import { View } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/views/Dashboard';
import HabitsView from './components/views/HabitsView';
import TasksView from './components/views/TasksView';
import GoalsView from './components/views/GoalsView';
import EducationView from './components/views/EducationView';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const renderView = useCallback(() => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'habits':
        return <HabitsView />;
      case 'assignments':
        return <TasksView />;
      case 'goals':
        return <GoalsView />;
      case 'education':
        return <EducationView />;
      default:
        return <Dashboard />;
    }
  }, [view]);

  return (
    <DataProvider>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
        <Sidebar currentView={view} setView={setView} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header currentView={view} theme={theme} setTheme={setTheme} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
            {renderView()}
          </main>
        </div>
      </div>
    </DataProvider>
  );
};

export default App;