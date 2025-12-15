import { format, differenceInSeconds } from 'date-fns';

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60); // Fix: Ensure seconds are integers

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatTimeOfDay = (timestamp: number): string => {
  return format(new Date(timestamp), 'HH:mm');
};

export const formatDate = (timestamp: number): string => {
  return format(new Date(timestamp), 'yyyy-MM-dd');
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const downloadCSV = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};