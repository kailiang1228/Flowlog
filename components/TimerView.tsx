import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Tag as TagIcon } from 'lucide-react';
import { Category, LogEntry } from '../types';
import { formatDuration, generateId } from '../utils';
import { getIconComponent } from '../constants';

interface TimerViewProps {
  categories: Category[];
  currentStartTime: number;
  onLog: (entry: LogEntry) => void;
  recentTags: string[];
}

const TimerView: React.FC<TimerViewProps> = ({
  categories,
  currentStartTime,
  onLog,
  recentTags,
}) => {
  const [isLogging, setIsLogging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [timeOffset, setTimeOffset] = useState<number>(0); 

  const calculateElapsed = useCallback(() => {
    const now = Date.now();
    const effectiveEndTime = now - (timeOffset * 60 * 1000);
    return Math.max(0, Math.floor((effectiveEndTime - currentStartTime) / 1000));
  }, [currentStartTime, timeOffset]);

  const [elapsed, setElapsed] = useState<number>(calculateElapsed);

  useEffect(() => {
    setElapsed(calculateElapsed());
    const interval = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateElapsed]);

  const handleStartLog = () => {
    setTimeOffset(0);
    setIsLogging(true);
  };

  const handleCancel = () => {
    setIsLogging(false);
    setSelectedCategory(null);
    setTagInput('');
    setTimeOffset(0);
  };

  const handleConfirmLog = () => {
    if (!selectedCategory) return;

    const now = Date.now();
    const adjustedEndTime = now - (timeOffset * 60 * 1000);
    const finalEndTime = Math.max(adjustedEndTime, currentStartTime + 1000);

    const newEntry: LogEntry = {
      id: generateId(),
      startTime: currentStartTime,
      endTime: finalEndTime,
      categoryId: selectedCategory,
      tag: tagInput.trim(),
    };

    onLog(newEntry);
    setIsLogging(false);
    setSelectedCategory(null);
    setTagInput('');
    setTimeOffset(0);
  };

  const uniqueRecentTags = Array.from(new Set(recentTags)).slice(0, 8); 

  // Logging Mode
  if (isLogging) {
    return (
      <div className="flex flex-col h-full p-4 animate-fade-in overflow-hidden relative">
        {/* Header */}
        <div className="flex-shrink-0 text-center mb-4 pt-2">
           <h2 className="text-lg font-bold dark:text-white mb-1">What did you just do?</h2>
           <span className="text-3xl font-mono text-gray-700 dark:text-gray-300 font-bold block">
            {formatDuration(elapsed)}
           </span>
           
           <div className="flex justify-center gap-2 mt-2">
             <button 
               onClick={() => setTimeOffset(prev => Math.max(0, prev - 5))}
               className="px-3 py-1 text-xs bg-gray-100 dark:bg-slate-800 rounded-md text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 active:scale-95 transition"
             >
               +5m
             </button>
             <button 
               onClick={() => setTimeOffset(prev => prev + 5)}
               className="px-3 py-1 text-xs bg-gray-100 dark:bg-slate-800 rounded-md text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 active:scale-95 transition"
             >
               -5m
             </button>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          {/* Categories Grid - Compact */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 min-h-[70px] ${
                  selectedCategory === cat.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500 transform scale-[0.98]'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <div style={{ color: cat.color }}>{getIconComponent(cat.icon)}</div>
                <span className="font-medium text-xs dark:text-gray-200">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Input & Tags - Added px-1 to container to fix clipping */}
          <div className="space-y-3 px-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TagIcon size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Details (optional)..."
                className="block w-full pl-9 pr-3 py-3 border-0 bg-gray-100 dark:bg-slate-800/80 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {uniqueRecentTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uniqueRecentTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setTagInput(tag)}
                    className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-[11px] rounded-lg text-gray-600 dark:text-gray-300 border border-transparent hover:border-gray-300 dark:hover:border-slate-500 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Footer Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900">
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 px-4 rounded-xl text-gray-500 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLog}
                disabled={!selectedCategory}
                className={`flex-[2] py-3 px-4 rounded-xl text-white font-medium shadow-md transition transform active:scale-95 ${
                  selectedCategory
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                }`}
              >
                Log
              </button>
            </div>
        </div>
      </div>
    );
  }

  // Default Timer View
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-12 animate-fade-in relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center space-y-2 z-10">
        <h1 className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 font-bold">
          Current Session
        </h1>
        <div className="font-mono text-7xl font-bold tracking-tighter text-gray-900 dark:text-white tabular-nums">
          {formatDuration(elapsed)}
        </div>
      </div>

      <div className="w-full max-w-xs z-10">
        <button
          onClick={handleStartLog}
          className="group relative w-full flex flex-col items-center justify-center py-10 px-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700/50"
        >
          <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
            <Plus size={40} strokeWidth={2} />
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white tracking-wide">
            Log Activity
          </span>
        </button>
      </div>
    </div>
  );
};

export default TimerView;