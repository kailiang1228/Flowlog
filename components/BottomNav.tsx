import React from 'react';
import { Clock, Calendar, PieChart, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const navItems: { view: ViewState; label: string; icon: React.ReactNode }[] = [
    { view: 'timer', label: 'Log', icon: <Clock /> },
    { view: 'timeline', label: 'Review', icon: <Calendar /> },
    { view: 'stats', label: 'Insights', icon: <PieChart /> },
    { view: 'settings', label: 'Settings', icon: <Settings /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentView === item.view
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;