import { create } from 'zustand';

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  data?: any;
  level: 'info' | 'warn' | 'error' | 'debug';
}

interface LogStore {
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  unreadCount: number;
  markAllRead: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
  logs: [],
  unreadCount: 0,
  addLog: (entry) =>
    set((state) => {
      const newLog: LogEntry = {
        ...entry,
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
      };
      // Keep last 100 logs
      const updatedLogs = [newLog, ...state.logs].slice(0, 100);
      return {
        logs: updatedLogs,
        unreadCount: state.unreadCount + 1,
      };
    }),
  clearLogs: () => set({ logs: [], unreadCount: 0 }),
  markAllRead: () => set({ unreadCount: 0 }),
}));
