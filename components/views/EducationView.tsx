import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { ScheduleEntry, DayOfWeek, AttendanceStatus } from '../../types';
import Modal from '../Modal';
import { PlusIcon, MoreVerticalIcon, EditIcon, TrashIcon, ClockIcon, LocationIcon, UserIcon, EducationIcon, CheckIcon, XIcon } from '../icons';
import { getWeekId, getWeekDateRange, addDays, getCurrentDayOfWeek, getMonday } from '../../utils/helpers';

const ScheduleEntryCard: React.FC<{ entry: ScheduleEntry, dateString: string, isCurrent: boolean, onEdit: (entry: ScheduleEntry) => void, onDelete: (id: string) => void }> = ({ entry, dateString, isCurrent, onEdit, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { setAttendance } = useData();
    const status = entry.completions?.[dateString];

    const handleSetAttendance = (newStatus: AttendanceStatus) => {
        if (status === newStatus) {
            setAttendance(entry.id, dateString, null); // Toggle off
        } else {
            setAttendance(entry.id, dateString, newStatus);
        }
    };

    let cardClasses = "bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm relative text-left transition-all";
    if (isCurrent) {
        cardClasses += " ring-2 ring-primary-500 bg-primary-50 dark:bg-slate-700/80";
    } else if (status === AttendanceStatus.Attended) {
        cardClasses += " bg-green-50 dark:bg-slate-700/50";
    } else if (status === AttendanceStatus.Missed) {
        cardClasses += " opacity-60 bg-slate-50 dark:bg-slate-800/80";
    }

    return (
        <div className={cardClasses}>
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-primary-600 dark:text-primary-400 pr-6">{entry.courseName}</h4>
                <div className="relative flex-shrink-0">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 -mr-1 -mt-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <MoreVerticalIcon className="w-4 h-4" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-700 rounded-md shadow-lg z-20">
                            <button onClick={() => { onEdit(entry); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">
                                <EditIcon className="w-4 h-4 mr-2" /> Edit
                            </button>
                            <button onClick={() => { onDelete(entry.id); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-600">
                                <TrashIcon className="w-4 h-4 mr-2" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
             <div className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 space-y-1">
                <div className="flex items-center">
                    <ClockIcon className="w-3 h-3 mr-1.5 text-slate-400 flex-shrink-0"/>
                    <span>{entry.startTime} - {entry.endTime}</span>
                </div>
                {entry.location && (
                    <div className="flex items-center">
                        <LocationIcon className="w-3 h-3 mr-1.5 text-slate-400 flex-shrink-0"/>
                        <span>{entry.location}</span>
                    </div>
                )}
                 {entry.instructor && (
                    <div className="flex items-center">
                        <UserIcon className="w-3 h-3 mr-1.5 text-slate-400 flex-shrink-0"/>
                        <span>{entry.instructor}</span>
                    </div>
                )}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button 
                    onClick={() => handleSetAttendance(AttendanceStatus.Attended)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${status === AttendanceStatus.Attended ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-600 hover:bg-green-200 dark:hover:bg-green-600'}`}
                    aria-label="Mark as attended"
                >
                    <CheckIcon className="w-5 h-5"/>
                </button>
                <button 
                    onClick={() => handleSetAttendance(AttendanceStatus.Missed)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${status === AttendanceStatus.Missed ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-600 hover:bg-red-200 dark:hover:bg-red-600'}`}
                    aria-label="Mark as missed"
                >
                    <XIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

const EducationView: React.FC = () => {
    const { schedule, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry, cloneWeek } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const currentWeekId = useMemo(() => getWeekId(currentDate), [currentDate]);
    const weekDateRange = useMemo(() => getWeekDateRange(currentDate), [currentDate]);
    const monday = useMemo(() => getMonday(currentDate), [currentDate]);

    const handlePrevWeek = () => setCurrentDate(prev => addDays(prev, -7));
    const handleNextWeek = () => setCurrentDate(prev => addDays(prev, 7));
    const handleToday = () => setCurrentDate(new Date());

    const handleCloneWeek = () => {
        const targetWeekId = getWeekId(addDays(currentDate, 7));
        if (confirm(`Clone this week's schedule to the next week (${getWeekDateRange(addDays(currentDate, 7))})? This will not overwrite existing entries.`)) {
             cloneWeek(currentWeekId, targetWeekId);
        }
    };

    const handleOpenModal = (entry: ScheduleEntry | null = null) => {
        setEditingEntry(entry);
        setIsModalOpen(true);
    };

    const handleSaveEntry = (entryData: Omit<ScheduleEntry, 'id' | 'weekId' | 'completions'>) => {
        if (editingEntry) {
            updateScheduleEntry({ ...editingEntry, ...entryData });
        } else {
            addScheduleEntry({ ...entryData, weekId: currentWeekId });
        }
        setIsModalOpen(false);
        setEditingEntry(null);
    };

    const scheduleForCurrentWeek = useMemo(() => {
        return schedule.filter(e => e.weekId === currentWeekId);
    }, [schedule, currentWeekId]);

    const weekDays = [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday];
    const todayDayOfWeek = getCurrentDayOfWeek();
    const actualCurrentWeekId = getWeekId(new Date());

    const calculateTimePositionPercent = (time: Date) => {
        const totalMinutesInDay = 24 * 60;
        const currentMinutes = time.getHours() * 60 + time.getMinutes();
        return (currentMinutes / totalMinutesInDay) * 100;
    };
    const timeIndicatorPosition = calculateTimePositionPercent(currentTime);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold order-1 sm:order-2">{weekDateRange}</h2>
                <div className="flex items-center gap-2 order-2 sm:order-1">
                    <button onClick={handlePrevWeek} className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600">Prev</button>
                    <button onClick={handleToday} className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600">Today</button>
                    <button onClick={handleNextWeek} className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600">Next</button>
                </div>
                 <div className="flex items-center gap-2 order-3">
                    <button onClick={handleCloneWeek} className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600">Clone Week</button>
                    <button onClick={() => handleOpenModal()} className="flex items-center bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors text-sm">
                        <PlusIcon className="w-4 h-4 mr-2" /> Add Class
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 items-start">
                {weekDays.map((day, index) => {
                    const dayDate = addDays(monday, index);
                    const dateString = dayDate.toISOString().split('T')[0];
                    const isToday = day === todayDayOfWeek && currentWeekId === actualCurrentWeekId;
                    
                    return (
                        <div key={day} className={`relative bg-slate-100 dark:bg-slate-800/50 p-3 rounded-xl min-h-[50vh] ${isToday ? 'bg-primary-50 dark:bg-slate-900/50' : ''}`}>
                            <h3 className="font-bold text-center mb-3 text-slate-700 dark:text-slate-200">{day}</h3>
                            <div className="space-y-3">
                                {scheduleForCurrentWeek
                                    .filter(e => e.dayOfWeek === day)
                                    .sort((a,b) => a.startTime.localeCompare(b.startTime))
                                    .map(entry => {
                                        const [startH, startM] = entry.startTime.split(':').map(Number);
                                        const [endH, endM] = entry.endTime.split(':').map(Number);
                                        const start = new Date(dayDate);
                                        start.setHours(startH, startM, 0, 0);
                                        const end = new Date(dayDate);
                                        end.setHours(endH, endM, 0, 0);
                                        const isCurrent = currentTime >= start && currentTime < end;

                                        return <ScheduleEntryCard key={entry.id} entry={entry} dateString={dateString} isCurrent={isCurrent} onEdit={handleOpenModal} onDelete={deleteScheduleEntry} />
                                    })
                                }
                            </div>
                            {isToday && (
                                <div className="absolute left-2 right-2 z-10" style={{ top: `${timeIndicatorPosition}%` }}>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
                                        <div className="w-full h-0.5 bg-red-500"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {scheduleForCurrentWeek.length === 0 && (
                 <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg flex flex-col items-center mt-4">
                    <EducationIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">This week's schedule is empty.</p>
                    <p className="text-slate-500 dark:text-slate-400">Click "Add Class" to build your timetable!</p>
                </div>
            )}

            {isModalOpen && (
                <ScheduleFormModal
                    entry={editingEntry}
                    onClose={() => { setIsModalOpen(false); setEditingEntry(null); }}
                    onSave={handleSaveEntry}
                />
            )}
        </div>
    );
};

const ScheduleFormModal: React.FC<{
    entry: ScheduleEntry | null;
    onClose: () => void;
    onSave: (data: Omit<ScheduleEntry, 'id' | 'weekId' | 'completions'>) => void;
}> = ({ entry, onClose, onSave }) => {
    const [courseName, setCourseName] = useState(entry?.courseName || '');
    const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(entry?.dayOfWeek || DayOfWeek.Monday);
    const [startTime, setStartTime] = useState(entry?.startTime || '09:00');
    const [endTime, setEndTime] = useState(entry?.endTime || '10:00');
    const [location, setLocation] = useState(entry?.location || '');
    const [instructor, setInstructor] = useState(entry?.instructor || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (courseName.trim()) {
            onSave({ courseName, dayOfWeek, startTime, endTime, location, instructor });
        }
    };

    return (
        <Modal title={entry ? "Edit Class" : "Add New Class"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="course-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Course Name</label>
                    <input type="text" id="course-name" value={courseName} onChange={e => setCourseName(e.target.value)} required className="mt-1 block w-full input-style" placeholder="e.g., Introduction to Psychology" />
                </div>
                <div>
                    <label htmlFor="day-of-week" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Day of the Week</label>
                    <select id="day-of-week" value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value as DayOfWeek)} className="mt-1 block w-full input-style">
                        {Object.values(DayOfWeek).map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start-time" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Start Time</label>
                        <input type="time" id="start-time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="mt-1 block w-full input-style" />
                    </div>
                    <div>
                        <label htmlFor="end-time" className="block text-sm font-medium text-slate-700 dark:text-slate-300">End Time</label>
                        <input type="time" id="end-time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="mt-1 block w-full input-style" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Location (Optional)</label>
                    <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full input-style" placeholder="e.g., Building 4, Room 201" />
                </div>
                 <div>
                    <label htmlFor="instructor" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Instructor (Optional)</label>
                    <input type="text" id="instructor" value={instructor} onChange={e => setInstructor(e.target.value)} className="mt-1 block w-full input-style" placeholder="e.g., Dr. Smith" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">{entry ? 'Save Changes' : 'Add Class'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default EducationView;