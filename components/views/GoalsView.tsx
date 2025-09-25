import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Goal, Milestone, GoalCategory } from '../../types';
import Modal from '../Modal';
import { PlusIcon, MoreVerticalIcon, EditIcon, TrashIcon, TagIcon } from '../icons';

const categoryBgColors: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/50',
    green: 'bg-green-100 dark:bg-green-900/50',
    purple: 'bg-purple-100 dark:bg-purple-900/50',
    red: 'bg-red-100 dark:bg-red-900/50',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/50',
    pink: 'bg-pink-100 dark:bg-pink-900/50',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/50',
    gray: 'bg-slate-100 dark:bg-slate-700',
};
const categoryTextColors: Record<string, string> = {
    blue: 'text-blue-800 dark:text-blue-300',
    green: 'text-green-800 dark:text-green-300',
    purple: 'text-purple-800 dark:text-purple-300',
    red: 'text-red-800 dark:text-red-300',
    yellow: 'text-yellow-800 dark:text-yellow-300',
    pink: 'text-pink-800 dark:text-pink-300',
    indigo: 'text-indigo-800 dark:text-indigo-300',
    gray: 'text-slate-800 dark:text-slate-300',
};
const availableColors = ['blue', 'green', 'purple', 'red', 'yellow', 'pink', 'indigo', 'gray'];
const colorSwatches: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    pink: 'bg-pink-500',
    indigo: 'bg-indigo-500',
    gray: 'bg-slate-500',
};


const GoalItem: React.FC<{ goal: Goal, onEdit: (goal: Goal) => void }> = ({ goal, onEdit }) => {
    const { toggleMilestoneCompletion, deleteGoal, updateGoal, goalCategories } = useData();
    const [menuOpen, setMenuOpen] = useState(false);
    const [newMilestone, setNewMilestone] = useState('');
    
    const category = goalCategories.find(c => c.id === goal.categoryId);

    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    const progress = goal.milestones.length > 0 ? (completedMilestones / goal.milestones.length) * 100 : 0;
    
    const handleAddMilestone = (e: React.FormEvent) => {
        e.preventDefault();
        if(newMilestone.trim()){
            const milestone: Milestone = { id: crypto.randomUUID(), name: newMilestone, completed: false };
            updateGoal({ ...goal, milestones: [...goal.milestones, milestone] });
            setNewMilestone('');
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${category ? categoryBgColors[category.color] ?? categoryBgColors.gray : categoryBgColors.gray} ${category ? categoryTextColors[category.color] ?? categoryTextColors.gray : categoryTextColors.gray}`}>
                      {category ? category.name : 'Uncategorized'}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">{goal.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{goal.description}</p>
                </div>
                <div className="relative">
                     <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <MoreVerticalIcon className="w-5 h-5" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-700 rounded-md shadow-lg z-10">
                            <button onClick={() => { onEdit(goal); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">
                                <EditIcon className="w-4 h-4 mr-2" /> Edit
                            </button>
                            <button onClick={() => { deleteGoal(goal.id); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-600">
                                <TrashIcon className="w-4 h-4 mr-2" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-medium">Progress</span>
                    <span className="font-semibold text-primary-600 dark:text-primary-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-primary-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-sm">Milestones</h4>
                {goal.milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center">
                        <input type="checkbox" checked={milestone.completed} onChange={() => toggleMilestoneCompletion(goal.id, milestone.id)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                        <span className={`ml-3 text-sm ${milestone.completed ? 'line-through text-slate-500' : ''}`}>{milestone.name}</span>
                    </div>
                ))}
                <form onSubmit={handleAddMilestone} className="flex gap-2">
                    <input type="text" value={newMilestone} onChange={e => setNewMilestone(e.target.value)} placeholder="Add a new milestone..." className="flex-1 input-style text-sm py-1"/>
                    <button type="submit" className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Add</button>
                </form>
            </div>
        </div>
    );
};

const GoalsView: React.FC = () => {
    const { goals, addGoal, updateGoal } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const handleOpenModal = (goal: Goal | null = null) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };
    
    const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'milestones'>) => {
        if(editingGoal) {
            updateGoal({ ...editingGoal, ...goalData });
        } else {
            addGoal(goalData);
        }
        setIsModalOpen(false);
        setEditingGoal(null);
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Goals</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm">
                        <TagIcon className="w-4 h-4 mr-2" /> Manage Categories
                    </button>
                    <button onClick={() => handleOpenModal()} className="flex items-center bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors text-sm">
                        <PlusIcon className="w-4 h-4 mr-2" /> Add Goal
                    </button>
                </div>
            </div>
            {goals.length > 0 ? (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {goals.map(goal => <GoalItem key={goal.id} goal={goal} onEdit={handleOpenModal} />)}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">No goals set yet.</p>
                    <p className="text-slate-500 dark:text-slate-400">Define your long-term ambitions to get started!</p>
                </div>
            )}
            {isModalOpen && <GoalFormModal goal={editingGoal} onClose={() => setIsModalOpen(false)} onSave={handleSaveGoal}/>}
            {isCategoryModalOpen && <GoalCategoryManagerModal onClose={() => setIsCategoryModalOpen(false)} />}
        </div>
    );
};

const GoalFormModal: React.FC<{
    goal: Goal | null,
    onClose: () => void,
    onSave: (goalData: Omit<Goal, 'id' | 'milestones'>) => void,
}> = ({ goal, onClose, onSave }) => {
    const { goalCategories } = useData();
    const [name, setName] = useState(goal?.name || '');
    const [description, setDescription] = useState(goal?.description || '');
    const [categoryId, setCategoryId] = useState(goal?.categoryId || (goalCategories.length > 0 ? goalCategories[0].id : ''));
    
    useEffect(() => {
        if (!goal && goalCategories.length > 0) {
            setCategoryId(goalCategories[0].id);
        }
    }, [goal, goalCategories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim() && categoryId){
            onSave({ name, description, categoryId });
        }
    }
    
    return (
        <Modal title={goal ? "Edit Goal" : "Add New Goal"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="goal-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Goal</label>
                    <input type="text" id="goal-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full input-style" placeholder="e.g., Learn to play guitar" />
                </div>
                <div>
                    <label htmlFor="goal-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                    {goalCategories.length > 0 ? (
                        <select id="goal-category" value={categoryId} onChange={e => setCategoryId(e.target.value)} className="mt-1 block w-full input-style">
                        {goalCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">No categories found. Please add a category first in 'Manage Categories'.</p>
                    )}
                </div>
                <div>
                    <label htmlFor="goal-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <textarea id="goal-desc" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full input-style" placeholder="Why is this goal important to you?"></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                    <button type="submit" disabled={!categoryId || !name.trim()} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-primary-800 disabled:cursor-not-allowed">{goal ? 'Save Changes' : 'Create Goal'}</button>
                </div>
            </form>
        </Modal>
    )
}

const GoalCategoryManagerModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { goalCategories, addGoalCategory, updateGoalCategory, deleteGoalCategory } = useData();
    const [editingCategory, setEditingCategory] = useState<GoalCategory | null>(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState(availableColors[0]);

    useEffect(() => {
        if(editingCategory) {
            setName(editingCategory.name);
            setColor(editingCategory.color);
        }
    }, [editingCategory]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim()) return;

        if(editingCategory) {
            updateGoalCategory({ ...editingCategory, name, color });
        } else {
            addGoalCategory({ name, color });
        }
        resetForm();
    };

    const resetForm = () => {
        setEditingCategory(null);
        setName('');
        setColor(availableColors[0]);
    };

    const handleEdit = (category: GoalCategory) => {
        setEditingCategory(category);
    };

    const handleDelete = (id: string) => {
        if(confirm('Are you sure you want to delete this category? This cannot be undone.')) {
            deleteGoalCategory(id);
        }
    }
    
    return (
        <Modal title="Manage Goal Categories" onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium mb-2">Existing Categories</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {goalCategories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                                <div className="flex items-center">
                                    <span className={`w-4 h-4 rounded-full mr-3 ${colorSwatches[cat.color] ?? colorSwatches.gray}`}></span>
                                    <span>{cat.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(cat)} className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><EditIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(cat.id)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t dark:border-slate-600 pt-4">
                     <h3 className="text-lg font-medium mb-2">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                     <form onSubmit={handleSave} className="space-y-3">
                         <div>
                            <label htmlFor="cat-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category Name</label>
                            <input type="text" id="cat-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full input-style" placeholder="e.g., Health & Fitness" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Color</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {availableColors.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={`w-8 h-8 rounded-full transition-all ${colorSwatches[c]} ${color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-primary-500' : ''}`}
                                    ></button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            {editingCategory && <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">Cancel Edit</button>}
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">{editingCategory ? 'Save Changes' : 'Add Category'}</button>
                        </div>
                     </form>
                </div>
            </div>
        </Modal>
    )
}


export default GoalsView;