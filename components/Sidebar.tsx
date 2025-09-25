import React from 'react';
import { View } from '../types';
import { useData } from '../context/DataContext';
import { DashboardIcon, HabitIcon, ClipboardListIcon, GoalIcon, CheckCircleIcon, EducationIcon, TrendingUpIcon } from './icons';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'habits', label: 'Habits', icon: HabitIcon },
  { id: 'assignments', label: 'Assignments', icon: ClipboardListIcon },
  { id: 'goals', label: 'Goals', icon: GoalIcon },
  { id: 'education', label: 'Education', icon: EducationIcon },
];

const NavLink: React.FC<{
  id: View;
  label: string;
  Icon: React.FC<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ id, label, Icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-primary-600 text-white shadow-md'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      <Icon className="w-6 h-6 mr-3" />
      <span>{label}</span>
    </button>
  );
};

const UserProfileCard: React.FC = () => {
    const { userProfile } = useData();
    const progressPercentage = (userProfile.xp / userProfile.xpToNextLevel) * 100;

    return (
        <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center mb-3">
                <TrendingUpIcon className="w-6 h-6 mr-3 text-primary-500"/>
                <div className="font-bold text-lg">Level {userProfile.level}</div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                <div className="bg-primary-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="text-right text-xs mt-1 text-slate-500 dark:text-slate-400">{userProfile.xp} / {userProfile.xpToNextLevel} XP</p>
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  return (
    <nav className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 flex-col justify-between hidden md:flex">
      <div>
        <div className="flex items-center gap-2 mb-8 px-2">
          <CheckCircleIcon className="w-8 h-8 text-primary-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Strike Goal</h1>
        </div>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavLink
                id={item.id as View}
                label={item.label}
                Icon={item.icon}
                isActive={currentView === item.id}
                onClick={() => setView(item.id as View)}
              />
            </li>
          ))}
        </ul>
        <UserProfileCard />
      </div>
      <div className="text-center text-xs text-slate-400 dark:text-slate-500">
        <p>&copy; {new Date().getFullYear()} Strike Goal</p>
        <p>Productivity Perfected.</p>
      </div>
    </nav>
  );
};

export default Sidebar;