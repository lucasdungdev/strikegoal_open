export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  completions: { [date: string]: boolean }; // YYYY-MM-DD -> true
}

export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
}

export interface Task {
  id: string;
  name: string;
  subjectId: string;
  dueDate?: string; // YYYY-MM-DD
  priority: Priority;
  completed: boolean;
  createdAt: number;
  subtasks: Subtask[];
}

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Milestone {
  id: string;
  name: string;
  completed: boolean;
}

export interface GoalCategory {
  id: string;
  name: string;
  color: string; // e.g., 'blue', 'green'
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  milestones: Milestone[];
  categoryId: string;
}

export enum DayOfWeek {
  Sunday = 'Sunday',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
}

export enum AttendanceStatus {
  Attended = 'attended',
  Missed = 'missed',
}

export interface ScheduleEntry {
  id: string;
  weekId: string; // e.g., "2024-28" for the 28th week of 2024
  courseName: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  location?: string;
  instructor?: string;
  completions: { [date: string]: AttendanceStatus }; // YYYY-MM-DD -> 'attended' | 'missed'
}

export interface UserProfile {
    level: number;
    xp: number;
    xpToNextLevel: number;
}

export type View = 'dashboard' | 'habits' | 'assignments' | 'goals' | 'education';