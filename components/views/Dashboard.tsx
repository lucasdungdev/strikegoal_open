import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { getGreeting, getTodayDateString, calculateStreak, priorityColor, getCurrentDayOfWeek, getWeekId, formatTimeDiff } from '../../utils/helpers';
import { HabitIcon, ClipboardListIcon, FireIcon, CheckCircleIcon, EducationIcon, ClockIcon, LocationIcon, CheckIcon, XIcon } from '../icons';
import { Habit, Task, ScheduleEntry } from '../../types';

const Dashboard: React.FC = () => {
  const { habits, tasks, schedule, userProfile, toggleHabitCompletion, toggleTaskCompletion } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for the countdown
    return () => clearInterval(timer);
  }, []);

  const today = getTodayDateString();
  const todayWeekId = getWeekId(currentTime);
  const todayDayOfWeek = getCurrentDayOfWeek();

  const todaysHabits = habits;
  const todaysSchedule = schedule
    .filter(entry => entry.weekId === todayWeekId && entry.dayOfWeek === todayDayOfWeek)
    .sort((a,b) => a.startTime.localeCompare(b.startTime));
  
  const upcomingTasks = useMemo(() => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return tasks
      .filter(task => !task.completed && task.dueDate && new Date(task.dueDate) <= sevenDaysFromNow)
      .sort((a,b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [tasks, currentTime]);
  
  const completedTodayCount = tasks.filter(task => task.completed && task.dueDate === today).length;
  const overallProgress = tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;

  // Schedule status logic
  let currentClass: ScheduleEntry | null = null;
  let nextClass: ScheduleEntry | null = null;
  for (const entry of todaysSchedule) {
      const [startHour, startMinute] = entry.startTime.split(':').map(Number);
      const startTime = new Date(currentTime);
      startTime.setHours(startHour, startMinute, 0, 0);

      const [endHour, endMinute] = entry.endTime.split(':').map(Number);
      const endTime = new Date(currentTime);
      endTime.setHours(endHour, endMinute, 0, 0);
      
      if (currentTime >= startTime && currentTime < endTime) {
          currentClass = entry;
          break;
      }
      if (currentTime < startTime && !nextClass) {
          nextClass = entry;
      }
  }
  const isAClassInProgress = !!currentClass;
  const allClassesDone = todaysSchedule.length > 0 && !nextClass && !currentClass;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{getGreeting()}!</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">You're on Level <span className="font-bold text-primary-500">{userProfile.level}</span>. Ready to make today count?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center text-green-500">
                <CheckCircleIcon className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">Assignments Completed Today</h3>
            </div>
            <p className="text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">{completedTodayCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center text-orange-500">
                <FireIcon className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">Best Habit Streak</h3>
            </div>
            <p className="text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">
                {Math.max(0, ...habits.map(calculateStreak))} days
            </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center text-primary-500">
                <ClipboardListIcon className="w-6 h-6 mr-2" />
                <h3 className="text-lg font-semibold">Overall Progress</h3>
            </div>
            <p className="text-4xl font-bold mt-2 text-slate-800 dark:text-slate-100">{overallProgress.toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Today's Habits */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <HabitIcon className="w-6 h-6 mr-3 text-primary-500" />
              <h2 className="text-xl font-bold">Today's Habits</h2>
            </div>
            <div className="space-y-3">
              {todaysHabits.length > 0 ? todaysHabits.map(habit => (
                <HabitItem key={habit.id} habit={habit} today={today} onToggle={toggleHabitCompletion} />
              )) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">No habits set. Add one to start building streaks!</p>}
            </div>
          </div>
          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center mb-4">
              <ClipboardListIcon className="w-6 h-6 mr-3 text-red-500" />
              <h2 className="text-xl font-bold">Upcoming Deadlines</h2>
            </div>
            <div className="space-y-3">
              {upcomingTasks.length > 0 ? upcomingTasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={toggleTaskCompletion} />
              )) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">No deadlines in the next 7 days. You're all clear!</p>}
            </div>
          </div>
        </div>

        {/* Right Column (Schedule) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm lg:col-span-1">
          <div className="flex items-center mb-4">
            <EducationIcon className="w-6 h-6 mr-3 text-primary-500" />
            <h2 className="text-xl font-bold">Today's Schedule</h2>
          </div>
          <div className="mb-4 text-center">
            {nextClass && !isAClassInProgress && (
              <CountdownTimer nextClass={nextClass} currentTime={currentTime} />
            )}
            {allClassesDone && (
              <p className="p-3 bg-green-50 dark:bg-slate-700/50 rounded-lg text-sm font-medium text-green-600 dark:text-green-400">All classes finished for today!</p>
            )}
          </div>
          <div className="space-y-3">
            {todaysSchedule.length > 0 ? todaysSchedule.map(entry => (
              <ScheduleItem 
                key={entry.id} 
                entry={entry} 
                currentTime={currentTime} 
                isNext={!isAClassInProgress && nextClass?.id === entry.id}
              />
            )) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">No classes scheduled for today. Enjoy the free time!</p>}
          </div>
        </div>
      </div>
    </div>
  );
};


const HabitItem: React.FC<{ habit: Habit, today: string, onToggle: (id: string, date: string) => void }> = ({ habit, today, onToggle }) => {
    const isCompleted = habit.completions[today];
    return (
        <div className={`flex items-center justify-between p-3 rounded-lg transition-all ${isCompleted ? 'bg-green-100 dark:bg-green-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
            <div className="flex items-center">
                <span className="text-2xl mr-3">{habit.icon}</span>
                <div>
                    <span className={`font-medium ${isCompleted ? 'line-through text-slate-500' : ''}`}>{habit.name}</span>
                    <div className="flex items-center text-sm text-orange-500">
                        <FireIcon className="w-4 h-4 mr-1"/>
                        <span>{calculateStreak(habit)} Day Streak</span>
                    </div>
                </div>
            </div>
            <button
                onClick={() => onToggle(habit.id, today)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-slate-300 dark:border-slate-500 hover:bg-green-200 dark:hover:bg-green-800'
                }`}
            >
                {isCompleted && <CheckCircleIcon className="w-7 h-7" />}
            </button>
        </div>
    );
}

const TaskItem: React.FC<{ task: Task, onToggle: (id: string) => void }> = ({ task, onToggle }) => (
    <div className="flex items-start p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
        <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="h-5 w-5 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer flex-shrink-0"
        />
        <div className="ml-3 flex-1">
          <span className="font-medium">{task.name}</span>
          {task.dueDate && <p className={`text-sm font-bold ${new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-slate-500'}`}>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>}
        </div>
        <span className={`text-sm font-semibold ${priorityColor(task.priority)}`}>{task.priority}</span>
    </div>
)

const CountdownTimer: React.FC<{ nextClass: ScheduleEntry, currentTime: Date }> = ({ nextClass, currentTime }) => {
    const [startHour, startMinute] = nextClass.startTime.split(':').map(Number);
    const startTime = new Date(currentTime);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const timeDiff = startTime.getTime() - currentTime.getTime();

    return (
        <div className="p-3 bg-primary-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-300">Next class starts in:</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formatTimeDiff(timeDiff)}</p>
        </div>
    )
}

const ScheduleItem: React.FC<{ entry: ScheduleEntry, currentTime: Date, isNext: boolean }> = ({ entry, currentTime, isNext }) => {
    const [startHour, startMinute] = entry.startTime.split(':').map(Number);
    const [endHour, endMinute] = entry.endTime.split(':').map(Number);

    const startTime = new Date(currentTime);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(currentTime);
    endTime.setHours(endHour, endMinute, 0, 0);

    const isCurrent = currentTime >= startTime && currentTime < endTime;
    const isPast = currentTime >= endTime;
    
    const today = getTodayDateString();
    const attendanceStatus = entry.completions?.[today];
    
    const isAttended = attendanceStatus === 'attended';
    const isNotCompleted = isPast && !isAttended;

    let cardClasses = "p-3 bg-slate-100 dark:bg-slate-700 rounded-lg transition-all border-l-4 border-transparent";
    let badge = null;

    if (isCurrent) {
        cardClasses = "p-3 bg-slate-100 dark:bg-slate-700 rounded-lg transition-all border-l-4 border-green-500";
        badge = <span className="text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">Now</span>;
    } else if (isNext) {
        cardClasses = "p-3 bg-primary-50 dark:bg-slate-700/80 rounded-lg transition-all border-l-4 border-primary-500 shadow-md";
        badge = <span className="text-xs font-bold bg-primary-500 text-white px-2 py-0.5 rounded-full">Next</span>;
    } else if (isNotCompleted) {
        cardClasses = "p-3 bg-yellow-50 dark:bg-slate-700/80 rounded-lg transition-all border-l-4 border-yellow-500";
        badge = <span className="text-xs font-bold bg-yellow-500 text-white px-2 py-0.5 rounded-full">Not Completed</span>;
    } else if (isPast && isAttended) {
        cardClasses += " opacity-60";
    }

    return (
    <div className={cardClasses}>
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
                 {attendanceStatus === 'attended' && <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />}
                 {attendanceStatus === 'missed' && <XIcon className="w-4 h-4 text-red-500 flex-shrink-0" />}
                <p className="font-semibold text-primary-600 dark:text-primary-400">{entry.courseName}</p>
            </div>
            {badge}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 space-y-1">
            <div className="flex items-center">
                <ClockIcon className="w-4 h-4 mr-2"/>
                <span>{entry.startTime} - {entry.endTime}</span>
            </div>
            {entry.location && 
                <div className="flex items-center">
                    <LocationIcon className="w-4 h-4 mr-2"/>
                    <span>{entry.location}</span>
                </div>
            }
        </div>
    </div>
    );
};


export default Dashboard;