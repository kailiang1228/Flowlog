import React, { useState, useMemo } from 'react';
import { format, isSameDay, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Tag, X, History } from 'lucide-react';
import { LogEntry, Category } from '../types';
import { formatDuration, formatTimeOfDay } from '../utils';
import { getIconComponent } from '../constants';

interface TimelineViewProps {
  entries: LogEntry[];
  categories: Category[];
  onUpdateEntry?: (entry: LogEntry) => void;
  onDeleteEntry?: (id: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ 
  entries, 
  categories,
  onUpdateEntry,
  onDeleteEntry
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const dailyEntries = useMemo(() => {
    return entries
      .filter((entry) => isSameDay(new Date(entry.startTime), selectedDate))
      .sort((a, b) => a.startTime - b.startTime);
  }, [entries, selectedDate]);

  const getCategory = (id: string) => categories.find((c) => c.id === id);

  const handlePrevDay = () => setSelectedDate((prev) => addDays(prev, -1));
  const handleNextDay = () => setSelectedDate((prev) => addDays(prev, 1));
  const isToday = isSameDay(selectedDate, new Date());

  const handleSaveEdit = () => {
    if (editingEntry && onUpdateEntry) {
      onUpdateEntry(editingEntry);
      setEditingEntry(null);
      setConfirmDeleteId(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingEntry || !onDeleteEntry) return;

    if (confirmDeleteId === editingEntry.id) {
      // Confirmed
      onDeleteEntry(editingEntry.id);
      setEditingEntry(null);
      setConfirmDeleteId(null);
    } else {
      // First click
      setConfirmDeleteId(editingEntry.id);
      setTimeout(() => {
         setConfirmDeleteId(prev => (prev === editingEntry.id ? null : prev));
      }, 3000);
    }
  };

  const openEdit = (entry: LogEntry) => {
    setEditingEntry(entry);
    setConfirmDeleteId(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900">
      {/* Date Header */}
      <div className="px-4 py-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition">
            <ChevronLeft size={20} className="dark:text-white" />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg dark:text-white">
              {isToday ? 'Today' : format(selectedDate, 'EEEE')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <CalendarIcon size={12} />
              {format(selectedDate, 'MMM d, yyyy')}
            </span>
          </div>

          <button 
            onClick={handleNextDay} 
            disabled={isToday}
            className={`p-2 rounded-full transition ${isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
          >
            <ChevronRight size={20} className="dark:text-white" />
          </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {dailyEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <History size={48} strokeWidth={1.5} className="mb-2 opacity-20" />
            <p className="text-sm">No activity logged for this day.</p>
          </div>
        ) : (
          <div className="relative pl-4 pb-20">
            {/* Vertical Line */}
            <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-slate-700/50 z-0"></div>

            {dailyEntries.map((entry, index) => {
              const category = getCategory(entry.categoryId);
              const duration = Math.floor((entry.endTime - entry.startTime) / 1000);
              
              return (
                <div key={entry.id} className="relative z-10 mb-3 flex group">
                  {/* Time Column */}
                  <div className="w-12 text-xs text-gray-400 font-mono pt-3 text-right pr-4 shrink-0">
                    {formatTimeOfDay(entry.startTime)}
                  </div>

                  {/* Dot */}
                  <div 
                    className="w-3 h-3 rounded-full mt-3.5 border-2 border-white dark:border-slate-900 shrink-0 shadow-sm"
                    style={{ backgroundColor: category?.color || '#ccc' }}
                  ></div>

                  {/* Content Card */}
                  <div 
                    onClick={() => openEdit(entry)}
                    className="ml-4 flex-1 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {category?.name || 'Unknown'}
                        </h3>
                        {entry.tag && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            <Tag size={10} className="shrink-0" />
                            <span className="truncate">{entry.tag}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 px-2 py-1 rounded-md shrink-0">
                        {formatDuration(duration)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* End marker */}
            <div className="relative z-10 flex mt-4">
               <div className="w-12 text-xs text-gray-400 font-mono text-right pr-4 shrink-0">
                 {formatTimeOfDay(dailyEntries[dailyEntries.length-1].endTime)}
               </div>
               <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-slate-600 mt-0.5 border-2 border-white dark:border-slate-900"></div>
               <div className="ml-4 text-xs text-gray-400 pt-0.5">End of log</div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal / Drawer */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4 sm:p-0">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 animate-slide-up mb-safe sm:mb-0">
             <div className="flex justify-between items-center">
               <h3 className="text-lg font-bold dark:text-white">Edit Entry</h3>
               <button onClick={() => setEditingEntry(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
                 <X size={20} />
               </button>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setEditingEntry({...editingEntry, categoryId: cat.id})}
                      className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                        editingEntry.categoryId === cat.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                          : 'border-gray-100 dark:border-slate-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <div style={{color: editingEntry.categoryId === cat.id ? undefined : cat.color}}>{getIconComponent(cat.icon)}</div>
                      <span className="text-[10px] truncate w-full text-center font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Tag / Note</label>
                <input 
                  type="text" 
                  value={editingEntry.tag}
                  onChange={(e) => setEditingEntry({...editingEntry, tag: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Details..."
                />
             </div>
             
             <div className="pt-2 flex gap-3">
               <button 
                 onClick={handleDeleteClick}
                 className={`flex-1 p-3 rounded-xl font-medium transition ${
                   confirmDeleteId === editingEntry.id 
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30' 
                    : 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40'
                 }`}
               >
                 {confirmDeleteId === editingEntry.id ? 'Confirm?' : 'Delete'}
               </button>
               <button 
                 onClick={handleSaveEdit}
                 className="flex-[2] p-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition"
               >
                 Save Changes
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;