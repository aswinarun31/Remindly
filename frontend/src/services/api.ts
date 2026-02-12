import axios from "axios";
import { Reminder } from "@/types/reminder";
import { mockReminders, mockUser, mockNotifications } from "./mockData";

const api = axios.create({ baseURL: "/api" });

// Mock API service - replace with real endpoints later
export const reminderService = {
  getAll: async (): Promise<Reminder[]> => {
    return Promise.resolve([...mockReminders]);
  },
  getById: async (id: string): Promise<Reminder | undefined> => {
    return Promise.resolve(mockReminders.find((r) => r.id === id));
  },
  create: async (data: Omit<Reminder, "id" | "createdAt" | "updatedAt">): Promise<Reminder> => {
    const newReminder: Reminder = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return Promise.resolve(newReminder);
  },
  update: async (id: string, data: Partial<Reminder>): Promise<Reminder> => {
    const existing = mockReminders.find((r) => r.id === id);
    return Promise.resolve({ ...existing!, ...data, updatedAt: new Date().toISOString() });
  },
  delete: async (id: string): Promise<void> => {
    return Promise.resolve();
  },
};

export const authService = {
  login: async (email: string, password: string) => {
    return Promise.resolve({ user: mockUser, token: "mock-jwt-token" });
  },
  register: async (name: string, email: string, password: string) => {
    return Promise.resolve({ user: { ...mockUser, name, email }, token: "mock-jwt-token" });
  },
  forgotPassword: async (email: string) => {
    return Promise.resolve({ message: "Reset link sent" });
  },
};

export const notificationService = {
  getAll: async () => Promise.resolve([...mockNotifications]),
  markAsRead: async (id: string) => Promise.resolve(),
};

export const userService = {
  getProfile: async () => Promise.resolve(mockUser),
  updateProfile: async (data: Partial<typeof mockUser>) => Promise.resolve({ ...mockUser, ...data }),
};

export default api;
