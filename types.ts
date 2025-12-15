export interface Category {
  id: string;
  name: string;
  color: string; // Hex code
  icon?: string;
}

export interface LogEntry {
  id: string;
  startTime: number; // Timestamp
  endTime: number; // Timestamp
  categoryId: string;
  tag: string; // The specific detail (e.g., "YouTube", "Math")
}

export type ViewState = 'timer' | 'timeline' | 'stats' | 'settings';

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalDuration: number;
  categoryBreakdown: Record<string, number>;
}