import { Reminder, Notification, User } from "@/types/reminder";

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

export const mockUser: User = {
  id: "1",
  name: "Alex Johnson",
  email: "alex@example.com",
  avatar: "",
  timezone: "America/New_York",
};

export const mockReminders: Reminder[] = [
  { id: "1", title: "Team standup meeting", description: "Daily sync with the dev team", date: fmt(today), time: "09:00", priority: "high", category: "work", status: "pending", recurring: true, notificationType: "app", createdAt: "2025-01-01", updatedAt: "2025-01-01" },
  { id: "2", title: "Doctor appointment", description: "Annual checkup at City Hospital", date: fmt(today), time: "14:00", priority: "high", category: "health", status: "pending", recurring: false, notificationType: "both", createdAt: "2025-01-05", updatedAt: "2025-01-05" },
  { id: "3", title: "Pay electricity bill", description: "Due by end of month", date: fmt(yesterday), time: "18:00", priority: "medium", category: "finance", status: "overdue", recurring: false, notificationType: "email", createdAt: "2025-01-10", updatedAt: "2025-01-10" },
  { id: "4", title: "Grocery shopping", description: "Weekly groceries from the store", date: fmt(tomorrow), time: "10:00", priority: "low", category: "personal", status: "pending", recurring: true, notificationType: "app", createdAt: "2025-01-12", updatedAt: "2025-01-12" },
  { id: "5", title: "Submit project report", description: "Final Q4 report for the client", date: fmt(yesterday), time: "17:00", priority: "high", category: "work", status: "overdue", recurring: false, notificationType: "email", createdAt: "2025-01-15", updatedAt: "2025-01-15" },
  { id: "6", title: "Morning jog", description: "30 min jog in the park", date: fmt(today), time: "06:30", priority: "low", category: "health", status: "completed", recurring: true, notificationType: "app", createdAt: "2025-01-01", updatedAt: fmt(today) },
  { id: "7", title: "Call insurance company", description: "Renew home insurance policy", date: fmt(nextWeek), time: "11:00", priority: "medium", category: "finance", status: "pending", recurring: false, notificationType: "email", createdAt: "2025-01-20", updatedAt: "2025-01-20" },
  { id: "8", title: "Read a chapter", description: "Continue reading Atomic Habits", date: fmt(today), time: "21:00", priority: "low", category: "personal", status: "pending", recurring: true, notificationType: "app", createdAt: "2025-01-01", updatedAt: "2025-01-01" },
];

export const mockNotifications: Notification[] = [
  { id: "1", title: "Reminder due soon", message: "Team standup meeting in 15 minutes", read: false, createdAt: new Date().toISOString(), reminderId: "1" },
  { id: "2", title: "Overdue reminder", message: "Pay electricity bill is overdue", read: false, createdAt: new Date().toISOString(), reminderId: "3" },
  { id: "3", title: "Completed", message: "Morning jog marked as completed", read: true, createdAt: new Date().toISOString(), reminderId: "6" },
  { id: "4", title: "Overdue reminder", message: "Submit project report is overdue", read: false, createdAt: new Date().toISOString(), reminderId: "5" },
];
