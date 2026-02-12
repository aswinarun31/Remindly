import React, { createContext, useContext, useState, ReactNode } from "react";
import { Reminder } from "@/types/reminder";
import { mockReminders } from "@/services/mockData";

interface ReminderContextType {
  reminders: Reminder[];
  addReminder: (r: Omit<Reminder, "id" | "createdAt" | "updatedAt">) => void;
  updateReminder: (id: string, data: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleComplete: (id: string) => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);

  const addReminder = (data: Omit<Reminder, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    setReminders((prev) => [...prev, { ...data, id: Date.now().toString(), createdAt: now, updatedAt: now }]);
  };

  const updateReminder = (id: string, data: Partial<Reminder>) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r)));
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleComplete = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === "completed" ? "pending" : "completed", updatedAt: new Date().toISOString() } : r))
    );
  };

  return (
    <ReminderContext.Provider value={{ reminders, addReminder, updateReminder, deleteReminder, toggleComplete }}>
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) throw new Error("useReminders must be used within ReminderProvider");
  return context;
};
