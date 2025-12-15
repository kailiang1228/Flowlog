import React, { useState, useEffect } from 'react';
import { LogEntry, Category, ViewState } from './types';
import { DEFAULT_CATEGORIES } from './constants';
import { downloadCSV, formatDate, formatTimeOfDay, formatDuration } from './utils';
import BottomNav from './components/BottomNav';
import TimerView from './components/TimerView';
import TimelineView from './components/TimelineView';
import StatsView from './components/StatsView';
import { Moon, Sun, Download, Trash2, Github, Upload, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewState>('timer');
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [confirmReset, setConfirmReset] = useState(false);
  
  // Persisted Data
  const [entries, setEntries] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('flowlog_entries');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentStartTime, setCurrentStartTime] = useState<number>(() => {
    const saved = localStorage.getItem('flowlog_startTime');
    if (saved) return parseInt(saved, 10);
    
    // Default to Midnight (00:00) of today if new
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('flowlog_theme');
    return saved === 'dark';
  });

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('flowlog_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('flowlog_startTime', currentStartTime.toString());
  }, [currentStartTime]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('flowlog_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('flowlog_theme', 'light');
    }
  }, [darkMode]);

  // --- Handlers ---
  const handleLog = (entry: LogEntry) => {
    setEntries((prev) => [...prev, entry]);
    setCurrentStartTime(entry.endTime); // The end of this task is start of next
  };

  const handleUpdateEntry = (updatedEntry: LogEntry) => {
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
  };

  const handleDeleteEntry = (id: string) => {
    // Smart Delete: If deleting the LATEST entry, reset currentStartTime to "Undo" the action
    const entryToDelete = entries.find(e => e.id === id);
    if (entryToDelete) {
      // Check if this entry is the latest one (its end time matches current start time, or close enough)
      // Or safer: check if no other entry has a startTime >= this one's endTime
      // Simple logic: Is this the entry with the max endTime?
      const maxEndTime = Math.max(...entries.map(e => e.endTime));
      
      if (entryToDelete.endTime === maxEndTime) {
         setCurrentStartTime(entryToDelete.startTime);
      }
    }
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flowlog_backup_${formatDate(Date.now())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed)) {
          if(window.confirm(`Found ${parsed.length} entries. Overwrite current data?`)) {
            setEntries(parsed);
            alert('Import successful!');
          }
        } else {
          alert('Invalid JSON format');
        }
      } catch (err) {
        alert('Error parsing JSON');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const exportCSV = () => {
    const header = 'Date,StartTime,EndTime,Duration(s),Category,Tag\n';
    const rows = entries.map(e => {
      const date = formatDate(e.startTime);
      const start = formatTimeOfDay(e.startTime);
      const end = formatTimeOfDay(e.endTime);
      const duration = Math.floor((e.endTime - e.startTime) / 1000);
      const catName = categories.find(c => c.id === e.categoryId)?.name || 'Unknown';
      const safeTag = e.tag.includes(',') ? `"${e.tag}"` : e.tag;
      return `${date},${start},${end},${duration},${catName},${safeTag}`;
    }).join('\n');
    
    downloadCSV(header + rows, `flowlog_export_${formatDate(Date.now())}.csv`);
  };

  const clearAllData = () => {
    setEntries([]);
    // Reset to Midnight Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCurrentStartTime(today.getTime());
  };

  const recentTags = entries
    .slice(-50)
    .map(e => e.tag)
    .filter(t => t.length > 0)
    .reverse();

  // --- Render Settings View Inline ---
  const renderSettings = () => (
    <div className="p-6 space-y-6 animate-fade-in bg-white dark:bg-slate-900 h-full overflow-y-auto pb-24">
      <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
      
      {/* Appearance */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Appearance</h3>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl active:scale-[0.98] transition"
        >
          <span className="font-medium dark:text-gray-200">
            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </span>
          {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-500" />}
        </button>
      </section>

      {/* Data Management */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data Management</h3>
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
          
          <button onClick={exportCSV} className="w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-slate-700 transition active:bg-gray-200">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium dark:text-gray-200">Export CSV</span>
              <Download size={18} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">For analysis in Excel or Google Sheets.</p>
          </button>

          <button onClick={exportJSON} className="w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-slate-700 transition active:bg-gray-200">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium dark:text-gray-200">Backup JSON</span>
              <Download size={18} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">Full backup for transferring to another device.</p>
          </button>

          <label className="w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-slate-700 transition active:bg-gray-200 cursor-pointer block">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium dark:text-gray-200">Import JSON</span>
              <Upload size={18} className="text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">Restore data from a JSON backup file.</p>
            <input type="file" accept=".json" onChange={importJSON} className="hidden" />
          </label>

        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-3 pt-4">
        { !confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 active:scale-[0.98] transition"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">Reset All Data</span>
              <span className="text-xs opacity-70">Deletes history & resets timer to 00:00</span>
            </div>
            <Trash2 size={20} />
          </button>
        ) : (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 animate-fade-in">
             <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-3">
               Are you sure? This will delete all logs permanently.
             </p>
             <div className="flex gap-3">
               <button 
                 onClick={() => setConfirmReset(false)}
                 className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 font-medium"
               >
                 Cancel
               </button>
               <button 
                 onClick={() => { clearAllData(); setConfirmReset(false); }}
                 className="flex-1 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium shadow-sm"
               >
                 Confirm Reset
               </button>
             </div>
          </div>
        )}
      </section>

      <div className="pt-4 text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">FlowLog v1.2</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white dark:bg-slate-900 shadow-2xl overflow-hidden relative">
      <main className="flex-1 overflow-hidden pb-16">
        {view === 'timer' && (
          <TimerView 
            categories={categories}
            currentStartTime={currentStartTime}
            onLog={handleLog}
            recentTags={recentTags}
          />
        )}
        {view === 'timeline' && (
          <TimelineView 
            entries={entries} 
            categories={categories} 
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        )}
        {view === 'stats' && (
          <StatsView entries={entries} categories={categories} />
        )}
        {view === 'settings' && renderSettings()}
      </main>
      
      <BottomNav currentView={view} onNavigate={setView} />
    </div>
  );
};

export default App;