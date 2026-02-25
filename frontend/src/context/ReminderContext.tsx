import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { reminderService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Reminder {
  id: string;
  _id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: "low" | "medium" | "high";
  category: string;
  status: "pending" | "completed" | "overdue";
  recurring: boolean;
  notificationType: "email" | "app" | "both";
  createdBy: { id: string; name: string; email: string; role: string } | null;
  createdByRole: "admin" | "student";
  assignedTo: { id: string; name: string; email: string }[];
  isLocked: boolean;
  durationMinutes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OverlapError {
  message: string;
  overlapping: { id: string; title: string; date: string; time: string; durationMinutes: number }[];
}

interface ReminderContextType {
  reminders: Reminder[];
  loading: boolean;
  addReminder: (
    data: Omit<Reminder, "id" | "createdAt" | "updatedAt" | "createdBy" | "assignedTo" | "createdByRole" | "isLocked">,
    options?: { asAdmin?: boolean; assignedTo?: string[]; targetFilter?: string }
  ) => Promise<void>;
  updateReminder: (id: string, data: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  requestReschedule: (
    reminderId: string,
    data: { proposedDate: string; proposedTime: string; reason?: string }
  ) => Promise<void>;
  refetch: () => Promise<void>;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchReminders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await reminderService.getAll();
      setReminders(data);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [isAuthenticated]);

  const addReminder = async (
    data: Omit<Reminder, "id" | "createdAt" | "updatedAt" | "createdBy" | "assignedTo" | "createdByRole" | "isLocked">,
    options?: { asAdmin?: boolean; assignedTo?: string[]; targetFilter?: string }
  ) => {
    try {
      let newReminder: Reminder;
      if (options?.asAdmin) {
        newReminder = await reminderService.adminCreate({
          ...data,
          assignedTo: options.assignedTo || [],
          targetFilter: options.targetFilter || "all",
        });
      } else {
        newReminder = await reminderService.studentCreate(data);
      }
      setReminders((prev) => [...prev, newReminder]);
      toast.success("Reminder created!");
    } catch (error: any) {
      // Re-throw so the UI can handle overlap errors specially
      throw error;
    }
  };

  const updateReminder = async (id: string, data: Partial<Reminder>) => {
    try {
      const updated = await reminderService.update(id, data as Record<string, unknown>);
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast.success("Reminder updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update reminder");
      throw error;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await reminderService.delete(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reminder deleted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete reminder");
      throw error;
    }
  };

  const toggleComplete = async (id: string) => {
    try {
      const updated = await reminderService.toggleComplete(id);
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const requestReschedule = async (
    reminderId: string,
    data: { proposedDate: string; proposedTime: string; reason?: string }
  ) => {
    try {
      await reminderService.requestReschedule(reminderId, data);
      toast.success("Reschedule request submitted!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit request");
      throw error;
    }
  };

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        loading,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleComplete,
        requestReschedule,
        refetch: fetchReminders,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) throw new Error("useReminders must be used within ReminderProvider");
  return context;
};
