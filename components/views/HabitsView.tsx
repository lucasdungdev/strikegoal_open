
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Habit } from '../../types';
import { PlusIcon, FireIcon, MoreVerticalIcon, EditIcon, TrashIcon } from '../icons';
import { calculateStreak, getTodayDateString } from '../../utils/helpers';
import Modal from '../Modal';

const HabitCard: React.FC<{ habit: Habit, onEdit: (habit: Habit) => void, onDelete: (id: string) => void }> = ({ habit, onEdit, onDelete }) => {
    const { toggleHabitCompletion } = useData();
    const today = getTodayDateString();
    const isCompletedToday = habit.completions[today];
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm relative">
            <div className="flex items-start justify-between">
                <div className="flex items-center">
                    <span className="text-4xl mr-4">{habit.icon}</span>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{habit.name}</h3>
                        <div className="flex items-center text-orange-500 mt-1">
                            <FireIcon className="w-5 h-5 mr-1" />
                            <span className="font-semibold">{calculateStreak(habit)} Day Streak</span>
                        </div>
                    </div>
                </div>
                <div className="relative">
                     <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <MoreVerticalIcon className="w-5 h-5" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-700 rounded-md shadow-lg z-10">
                            <button onClick={() => { onEdit(habit); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">
                                <EditIcon className="w-4 h-4 mr-2" /> Edit
                            </button>
                            <button onClick={() => { onDelete(habit.id); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-600">
                                <TrashIcon className="w-4 h-4 mr-2" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4">
                 <button 
                    onClick={() => toggleHabitCompletion(habit.id, today)}
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${isCompletedToday ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                    {isCompletedToday ? 'Completed Today!' : 'Mark as Complete'}
                </button>
            </div>
        </div>
    );
};


const HabitsView: React.FC = () => {
    const { habits, addHabit, updateHabit, deleteHabit } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    const handleOpenModal = (habit: Habit | null = null) => {
        setEditingHabit(habit);
        setIsModalOpen(true);
    };

    const handleSaveHabit = (name: string, icon: string) => {
        if (editingHabit) {
            updateHabit({ ...editingHabit, name, icon });
        } else {
            addHabit({ name, icon, color: 'blue' }); // color is static for now
        }
        setIsModalOpen(false);
        setEditingHabit(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Habits</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Habit
                </button>
            </div>
            {habits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habits.map(habit => (
                        <HabitCard key={habit.id} habit={habit} onEdit={handleOpenModal} onDelete={deleteHabit} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">You haven't added any habits yet.</p>
                    <p className="text-slate-500 dark:text-slate-400">Click "Add Habit" to get started!</p>
                </div>
            )}
            {isModalOpen && (
                <HabitFormModal
                    habit={editingHabit}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveHabit}
                />
            )}
        </div>
    );
};

const HabitFormModal: React.FC<{
    habit: Habit | null;
    onClose: () => void;
    onSave: (name: string, icon: string) => void;
}> = ({ habit, onClose, onSave }) => {
    const [name, setName] = useState(habit?.name || '');
    const [icon, setIcon] = useState(habit?.icon || '💪');
    const icons = ['💪', '🧘', '📖', '💧', '🏃', '🍎', '🎨', '🎵', '✍️', '😴'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name, icon);
        }
    };
    
    return (
        <Modal title={habit ? "Edit Habit" : "Add New Habit"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="habit-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Habit Name</label>
                    <input
                        type="text"
                        id="habit-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="e.g., Read for 15 minutes"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Icon</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {icons.map(i => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setIcon(i)}
                                className={`w-12 h-12 rounded-lg text-2xl flex items-center justify-center transition-all ${icon === i ? 'bg-primary-500 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-primary-500' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'}`}
                            >
                                {i}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">{habit ? 'Save Changes' : 'Create Habit'}</button>
                </div>
            </form>
        </Modal>
    )
}

export default HabitsView;
