import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { isWithinInterval, isSameDay, addDays, eachDayOfInterval, format } from 'date-fns';
import { LogEntry, Category } from '../types';
import { formatDuration } from '../utils';

interface StatsViewProps {
  entries: LogEntry[];
  categories: Category[];
}

type TimeRange = 'today' | 'week' | 'month';

const StatsView: React.FC<StatsViewProps> = ({ entries, categories }) => {
  const [range, setRange] = useState<TimeRange>('today');

  // Filter entries based on range
  const filteredEntries = useMemo(() => {
    const now = new Date();
    if (range === 'today') {
      return entries.filter((e) => isSameDay(new Date(e.startTime), now));
    } else if (range === 'week') {
      const end = now;
      const start = addDays(now, -6); // Last 7 days including today
      start.setHours(0,0,0,0);
      return entries.filter((e) => isWithinInterval(new Date(e.startTime), { start, end }));
    } else {
      const end = now;
      const start = addDays(now, -29); // Last 30 days
      start.setHours(0,0,0,0);
      return entries.filter((e) => isWithinInterval(new Date(e.startTime), { start, end }));
    }
  }, [entries, range]);

  // Data for Pie Chart
  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    
    filteredEntries.forEach((e) => {
      // Duration in seconds for Pie Chart
      const duration = (e.endTime - e.startTime) / 1000;
      const current = map.get(e.categoryId) || 0;
      map.set(e.categoryId, current + duration);
    });

    const data = Array.from(map.entries()).map(([catId, duration]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        name: cat?.name || 'Unknown',
        value: duration,
        color: cat?.color || '#999',
      };
    }).sort((a, b) => b.value - a.value);

    return data;
  }, [filteredEntries, categories]);

  // Data for Trend Chart (Week/Month)
  const trendData = useMemo(() => {
    if (range === 'today') return [];

    const end = new Date();
    const start = addDays(end, range === 'week' ? -6 : -29);
    start.setHours(0,0,0,0);
    
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
       const dayStart = day.getTime();
       const dayEnd = dayStart + 86400000;
       
       const totalMilliseconds = entries.reduce((acc, e) => {
         // Check overlap (simplified: based on start time falling in the day)
         if (e.startTime >= dayStart && e.startTime < dayEnd) {
           return acc + (e.endTime - e.startTime);
         }
         return acc;
       }, 0);

       // Convert milliseconds to hours (ms / 1000 / 60 / 60)
       const hours = totalMilliseconds / (1000 * 60 * 60);

       return {
         date: format(day, range === 'week' ? 'EEE' : 'd'), // Mon or 23
         fullDate: format(day, 'MMM d'),
         hours: parseFloat(hours.toFixed(1)),
       };
    });
  }, [entries, range]);

  const totalDuration = pieData.reduce((acc, curr) => acc + curr.value, 0);

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = totalDuration > 0 ? ((data.value / totalDuration) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white dark:bg-slate-800 p-2 shadow-lg rounded border border-gray-100 dark:border-slate-700 text-xs z-50">
          <p className="font-bold text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-gray-500 dark:text-gray-400">{formatDuration(data.value)}</p>
          <p className="text-blue-500 font-medium">{percent}%</p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Trend Chart
  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2 shadow-lg rounded border border-gray-100 dark:border-slate-700 text-xs z-50">
          <p className="font-bold text-gray-900 dark:text-white mb-1">{payload[0].payload.fullDate}</p>
          <p className="text-blue-500 font-medium">{payload[0].value} hrs</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 p-4 overflow-y-auto pb-24">
      <h2 className="text-2xl font-bold mb-4 dark:text-white shrink-0">Insights</h2>
      
      {/* Range Switcher */}
      <div className="flex bg-gray-200 dark:bg-slate-800 rounded-lg p-1 mb-6 shrink-0">
        {(['today', 'week', 'month'] as TimeRange[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md capitalize transition ${
              range === r
                ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Tracked</p>
          <p className="text-xl font-mono font-bold text-gray-900 dark:text-white mt-1">
            {formatDuration(totalDuration)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entries</p>
          <p className="text-xl font-mono font-bold text-gray-900 dark:text-white mt-1">
            {filteredEntries.length}
          </p>
        </div>
      </div>

      {/* Trend Chart (Only for Week/Month) */}
      {range !== 'today' && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-6 flex-col items-center shrink-0">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Activity Trend</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#9ca3af'}} 
                  dy={10}
                />
                <YAxis 
                   hide 
                />
                <Tooltip content={<CustomTrendTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pie Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm mb-6 flex-col items-center shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Distribution</h3>
        <div className="h-64 w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-300 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex h-full items-center justify-center text-gray-400 text-sm">No data for this period</div>
          )}
        </div>
      </div>

      {/* List breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 p-4 border-b border-gray-100 dark:border-slate-700">
          Breakdown by Category
        </h3>
        <div>
          {pieData.map((item) => (
            <div key={item.name} className="flex justify-between items-center p-4 border-b border-gray-50 dark:border-slate-700 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
              </div>
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{formatDuration(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsView;