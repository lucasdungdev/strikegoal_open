import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Habit, Task, Subject, Goal, Milestone, Priority, ScheduleEntry, UserProfile, AttendanceStatus, Subtask, GoalCategory } from '../types';

interface DataContextProps {
  habits: Habit[];
  tasks: Task[];
  subjects: Subject[];
  goals: Goal[];
  goalCategories: GoalCategory[];
  schedule: ScheduleEntry[];
  userProfile: UserProfile;
  addHabit: (habit: Omit<Habit, 'id' | 'completions'>) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, date: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'subtasks'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addSubtask: (taskId: string, subtaskName: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'milestones'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  toggleMilestoneCompletion: (goalId: string, milestoneId: string) => void;
  addGoalCategory: (category: Omit<GoalCategory, 'id'>) => void;
  updateGoalCategory: (category: GoalCategory) => void;
  deleteGoalCategory: (id: string) => void;
  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id' | 'completions'>) => void;
  updateScheduleEntry: (entry: ScheduleEntry) => void;
  deleteScheduleEntry: (id: string) => void;
  cloneWeek: (sourceWeekId: string, targetWeekId: string) => void;
  setAttendance: (scheduleId: string, date: string, status: AttendanceStatus | null) => void;
  addXP: (amount: number) => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

const initialSubjects: Subject[] = [
  { id: 'academics', name: 'Academics', color: 'blue' },
  { id: 'personal', name: 'Personal', color: 'green' },
  { id: 'job', name: 'Job/Internship', color: 'purple' },
];

const initialGoalCategories: GoalCategory[] = [
    { id: 'academic', name: 'Academic', color: 'blue' },
    { id: 'personal', name: 'Personal', color: 'green' },
    { id: 'career', name: 'Career', color: 'purple' },
];

const calculateXpToNextLevel = (level: number) => {
    return Math.floor(100 * Math.pow(1.2, level - 1));
}

const initialProfile: UserProfile = {
    level: 1,
    xp: 0,
    xpToNextLevel: calculateXpToNextLevel(1)
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', initialSubjects);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [goalCategories, setGoalCategories] = useLocalStorage<GoalCategory[]>('goalCategories', initialGoalCategories);
  const [schedule, setSchedule] = useLocalStorage<ScheduleEntry[]>('schedule', []);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('userProfile', initialProfile);
  
  const addXP = (amount: number) => {
    setUserProfile(prevProfile => {
        let newXp = prevProfile.xp + amount;
        let newLevel = prevProfile.level;
        let newXpToNextLevel = prevProfile.xpToNextLevel;

        while (newXp >= newXpToNextLevel) {
            newXp -= newXpToNextLevel;
            newLevel++;
            newXpToNextLevel = calculateXpToNextLevel(newLevel);
        }
        return { level: newLevel, xp: newXp, xpToNextLevel: newXpToNextLevel };
    });
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'completions'>) => {
    const newHabit: Habit = { ...habit, id: crypto.randomUUID(), completions: {} };
    setHabits([...habits, newHabit]);
  };
  
  const updateHabit = (updatedHabit: Habit) => {
    setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  }
  
  const toggleHabitCompletion = (id: string, date: string) => {
    let wasCompleted = false;
    const habit = habits.find(h => h.id === id);
    if(habit) {
        wasCompleted = !!habit.completions[date];
    }

    setHabits(habits.map(h => {
      if (h.id === id) {
        const newCompletions = { ...h.completions };
        if (newCompletions[date]) {
          delete newCompletions[date];
        } else {
          newCompletions[date] = true;
        }
        return { ...h, completions: newCompletions };
      }
      return h;
    }));

    if (!wasCompleted) {
        addXP(10); // Grant 10 XP for completing a habit
    }
  };
  
  const addTask = (task: Omit<Task, 'id' | 'completed' | 'createdAt'| 'subtasks'>) => {
    const newTask: Task = { ...task, id: crypto.randomUUID(), completed: false, createdAt: Date.now(), subtasks: [] };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
        addXP(15); // Grant 15 XP for completing a task
    }
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addSubtask = (taskId: string, subtaskName: string) => {
    const newSubtask: Subtask = { id: crypto.randomUUID(), name: subtaskName, completed: false };
    setTasks(tasks.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSubtask] } : t));
  };

  const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const newSubtasks = t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
        return { ...t, subtasks: newSubtasks };
      }
      return t;
    }));
  };
  
  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => {
        if (t.id === taskId) {
            return { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) };
        }
        return t;
    }));
  };

  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSubject: Subject = { ...subject, id: crypto.randomUUID() };
    setSubjects([...subjects, newSubject]);
  };
  
  const addGoal = (goal: Omit<Goal, 'id' | 'milestones'>) => {
    const newGoal: Goal = { ...goal, id: crypto.randomUUID(), milestones: [] };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (updatedGoal: Goal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  }
  
  const toggleMilestoneCompletion = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m),
        };
      }
      return g;
    }));
  };

  const addGoalCategory = (category: Omit<GoalCategory, 'id'>) => {
    const newCategory: GoalCategory = { ...category, id: crypto.randomUUID() };
    setGoalCategories([...goalCategories, newCategory]);
  };
  
  const updateGoalCategory = (updatedCategory: GoalCategory) => {
    setGoalCategories(goalCategories.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  };
  
  const deleteGoalCategory = (id: string) => {
    if (goals.some(g => g.categoryId === id)) {
        alert("Cannot delete a category that is currently assigned to one or more goals.");
        return;
    }
    setGoalCategories(goalCategories.filter(c => c.id !== id));
  };

  const addScheduleEntry = (entry: Omit<ScheduleEntry, 'id' | 'completions'>) => {
    const newEntry: ScheduleEntry = { ...entry, id: crypto.randomUUID(), completions: {} };
    setSchedule([...schedule, newEntry]);
  };

  const updateScheduleEntry = (updatedEntry: ScheduleEntry) => {
    setSchedule(schedule.map(e => e.id === updatedEntry.id ? updatedEntry : e));
  };

  const deleteScheduleEntry = (id: string) => {
    setSchedule(schedule.filter(e => e.id !== id));
  };

  const cloneWeek = (sourceWeekId: string, targetWeekId: string) => {
    const entriesToClone = schedule.filter(e => e.weekId === sourceWeekId);

    const targetWeekHasEntries = schedule.some(e => e.weekId === targetWeekId);
    if (targetWeekHasEntries) {
      alert(`Target week ${targetWeekId} already has entries. Cloning aborted to prevent duplicates.`);
      return;
    }

    const newEntries = entriesToClone.map(entry => ({
      ...entry,
      id: crypto.randomUUID(),
      weekId: targetWeekId,
      completions: {},
    }));

    setSchedule(prevSchedule => [...prevSchedule, ...newEntries]);
  };

  const setAttendance = (scheduleId: string, date: string, status: AttendanceStatus | null) => {
    const entry = schedule.find(e => e.id === scheduleId);
    if (!entry) return;

    const oldStatus = entry.completions?.[date];

    setSchedule(schedule.map(e => {
        if (e.id === scheduleId) {
            const newCompletions = { ...(e.completions || {}) };
            if (status) {
                newCompletions[date] = status;
            } else {
                delete newCompletions[date];
            }
            return { ...e, completions: newCompletions };
        }
        return e;
    }));

    if (status === AttendanceStatus.Attended && oldStatus !== AttendanceStatus.Attended) {
        addXP(5);
    }
  };


  return (
    <DataContext.Provider value={{
      habits, tasks, subjects, goals, goalCategories, schedule, userProfile,
      addHabit, updateHabit, deleteHabit, toggleHabitCompletion,
      addTask, updateTask, deleteTask, toggleTaskCompletion,
      addSubtask, toggleSubtaskCompletion, deleteSubtask,
      addSubject,
      addGoal, updateGoal, deleteGoal, toggleMilestoneCompletion,
      addGoalCategory, updateGoalCategory, deleteGoalCategory,
      addScheduleEntry, updateScheduleEntry, deleteScheduleEntry, cloneWeek, setAttendance,
      addXP
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextProps => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};