import { Habit, DayOfWeek } from '../types';

export const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const calculateStreak = (habit: Habit): number => {
  const completions = habit.completions;
  const sortedDates = Object.keys(completions)
    .filter(date => completions[date])
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (sortedDates.length === 0) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date();
  
  // Check if today is completed
  const todayStr = currentDate.toISOString().split('T')[0];
  if(sortedDates[0] === todayStr){
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);
  } else {
    // Check if yesterday was completed
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if(sortedDates[0] !== yesterdayStr) {
      return 0; // Streak is broken if neither today nor yesterday is the last completion
    }
    currentDate.setDate(currentDate.getDate() - 1);
  }


  for (let i = streak > 0 ? 1 : 0; i < sortedDates.length; i++) {
    const expectedDateStr = currentDate.toISOString().split('T')[0];
    if (sortedDates[i] === expectedDateStr) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export const priorityColor = (priority: string): string => {
  switch (priority) {
    case 'High':
      return 'text-red-500';
    case 'Medium':
      return 'text-yellow-500';
    case 'Low':
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
};

export const getCurrentDayOfWeek = (): DayOfWeek => {
    const days: DayOfWeek[] = [DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday];
    const todayIndex = new Date().getDay();
    return days[todayIndex];
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Returns ISO week number and year as a string "YYYY-WW"
export const getWeekId = (d: Date): string => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-${weekNumber}`;
};

export const getWeekDateRange = (date: Date): string => {
  const dayOfWeek = date.getDay(); // Sunday - 0, Monday - 1
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = addDays(date, diffToMonday);
  const sunday = addDays(monday, 6);

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const mondayStr = monday.toLocaleDateString(undefined, options);
  const sundayStr = sunday.toLocaleDateString(undefined, options);

  if (monday.getFullYear() !== sunday.getFullYear()) {
    return `${monday.toLocaleDateString(undefined, { ...options, year: 'numeric' })} - ${sunday.toLocaleDateString(undefined, { ...options, year: 'numeric' })}`;
  }
  
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.toLocaleDateString(undefined, { month: 'short' })} ${monday.getDate()} - ${sunday.getDate()}, ${sunday.getFullYear()}`;
  }

  return `${mondayStr} - ${sundayStr}, ${date.getFullYear()}`;
};

export const formatTimeDiff = (ms: number): string => {
    if (ms <= 0) return "Starting now...";

    let totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
};

export const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
};