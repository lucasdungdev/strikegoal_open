import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Task, Subject, Priority } from '../../types';
import { PlusIcon, MoreVerticalIcon, EditIcon, TrashIcon, ChevronDownIcon, BookOpenIcon } from '../icons';
import Modal from '../Modal';
import { priorityColor } from '../../utils/helpers';

const SubtaskItem: React.FC<{ taskId: string, subtask: Task['subtasks'][0], onToggle: () => void, onDelete: () => void }> = ({ subtask, onToggle, onDelete }) => {
    return (
        <div className="flex items-center py-1 px-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600/50">
            <input
                type="checkbox"
                checked={subtask.completed}
                onChange={onToggle}
                className="h-4 w-4 rounded border-gray-300 dark:border-slate-500 text-primary-600 focus:ring-primary-500 cursor-pointer bg-transparent"
            />
            <span className={`ml-3 text-sm flex-1 ${subtask.completed ? 'line-through text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>{subtask.name}</span>
            <button onClick={onDelete} className="p-1 rounded-full hover:bg-slate-300 dark:hover:bg-slate-500 opacity-50 hover:opacity-100">
                <TrashIcon className="w-3 h-3 text-red-500"/>
            </button>
        </div>
    );
};

const TaskItem: React.FC<{ task: Task, onToggle: (id: string) => void, onEdit: (task: Task) => void, onDelete: (id: string) => void }> = ({ task, onToggle, onEdit, onDelete }) => {
    const { addSubtask, toggleSubtaskCompletion, deleteSubtask } = useData();
    const [menuOpen, setMenuOpen] = useState(false);
    const [subtasksVisible, setSubtasksVisible] = useState(false);
    const [newSubtaskName, setNewSubtaskName] = useState('');
    
    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubtaskName.trim()) {
            addSubtask(task.id, newSubtaskName);
            setNewSubtaskName('');
        }
    };
    
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;

    return (
        <div className={`transition-all rounded-lg ${task.completed ? 'bg-slate-100 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
            <div className="flex items-center p-3">
                <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggle(task.id)}
                    className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer bg-transparent flex-shrink-0"
                />
                <div className="ml-4 flex-1 cursor-pointer" onClick={() => setSubtasksVisible(!subtasksVisible)}>
                    <span className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{task.name}</span>
                    {task.dueDate && <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>}
                </div>
                {task.subtasks.length > 0 && (
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-4">{completedSubtasks}/{task.subtasks.length}</span>
                )}
                <span className={`text-sm font-semibold mr-4 ${priorityColor(task.priority)}`}>{task.priority}</span>
                <button onClick={() => setSubtasksVisible(!subtasksVisible)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                    <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${subtasksVisible ? 'rotate-180' : ''}`} />
                </button>
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <MoreVerticalIcon className="w-5 h-5 text-slate-500" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-700 rounded-md shadow-lg z-10">
                            <button onClick={() => { onEdit(task); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">
                                <EditIcon className="w-4 h-4 mr-2" /> Edit
                            </button>
                            <button onClick={() => { onDelete(task.id); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-600">
                                <TrashIcon className="w-4 h-4 mr-2" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {subtasksVisible && (
                <div className="pb-3 px-4 ml-5 border-l-2 border-slate-200 dark:border-slate-700">
                    <div className="pl-4 space-y-1">
                        {task.subtasks.map(st => 
                            <SubtaskItem key={st.id} taskId={task.id} subtask={st} onToggle={() => toggleSubtaskCompletion(task.id, st.id)} onDelete={() => deleteSubtask(task.id, st.id)} />
                        )}
                        <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
                            <input type="text" value={newSubtaskName} onChange={e => setNewSubtaskName(e.target.value)} placeholder="Add a sub-task..." className="flex-1 input-style text-sm py-1"/>
                            <button type="submit" className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">Add</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const TasksView: React.FC = () => {
    const { tasks, subjects, addTask, updateTask, deleteTask, toggleTaskCompletion } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const tasksBySubject = useMemo(() => {
        const grouped: { [key: string]: Task[] } = {};
        subjects.forEach(p => grouped[p.id] = []);
        tasks.forEach(t => {
            if (grouped[t.subjectId]) {
                grouped[t.subjectId].push(t);
            }
        });
        return grouped;
    }, [tasks, subjects]);

    const handleOpenModal = (task: Task | null = null) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'subtasks'>) => {
        if(editingTask) {
            updateTask({ ...editingTask, ...taskData });
        } else {
            addTask(taskData);
        }
        setIsModalOpen(false);
        setEditingTask(null);
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Assignments</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Assignment
                </button>
            </div>
            <div className="space-y-8">
                {subjects.map(subject => (
                    (tasksBySubject[subject.id]?.length > 0) && (
                        <div key={subject.id}>
                            <h3 className="text-xl font-semibold mb-3 px-1 flex items-center">
                                <BookOpenIcon className="w-5 h-5 mr-3 text-primary-500"/>
                                {subject.name}
                            </h3>
                            <div className="space-y-2">
                                {tasksBySubject[subject.id].sort((a,b)=> a.createdAt - b.createdAt).map(task => (
                                    <TaskItem key={task.id} task={task} onToggle={toggleTaskCompletion} onEdit={handleOpenModal} onDelete={deleteTask} />
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>
             {isModalOpen && <TaskFormModal task={editingTask} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} />}
        </div>
    );
};


const TaskFormModal: React.FC<{
    task: Task | null;
    onClose: () => void;
    onSave: (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'subtasks'>) => void;
}> = ({ task, onClose, onSave }) => {
    const { subjects } = useData();
    const [name, setName] = useState(task?.name || '');
    const [subjectId, setSubjectId] = useState(task?.subjectId || 'academics');
    const [dueDate, setDueDate] = useState(task?.dueDate || '');
    const [priority, setPriority] = useState<Priority>(task?.priority || Priority.Medium);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({ name, subjectId, dueDate: dueDate || undefined, priority });
        }
    };
    
    return (
        <Modal title={task ? "Edit Assignment" : "Add New Assignment"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="task-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assignment Name</label>
                    <input type="text" id="task-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full input-style" placeholder="e.g., Psychology 101 Mid-term Essay" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="task-subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                        <select id="task-subject" value={subjectId} onChange={e => setSubjectId(e.target.value)} className="mt-1 block w-full input-style">
                            {subjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="task-priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
                         <select id="task-priority" value={priority} onChange={e => setPriority(e.target.value as Priority)} className="mt-1 block w-full input-style">
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="task-duedate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Due Date</label>
                    <input type="date" id="task-duedate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full input-style" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">{task ? 'Save Changes' : 'Create Assignment'}</button>
                </div>
            </form>
        </Modal>
    )
}


export default TasksView;