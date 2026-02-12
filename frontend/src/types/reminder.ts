export type Priority = "low" | "medium" | "high";
export type ReminderStatus = "pending" | "completed" | "overdue";
export type NotificationType = "email" | "app" | "both";
export type Category = "work" | "personal" | "health" | "finance" | "other";

export interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: Priority;
  category: Category;
  status: ReminderStatus;
  recurring: boolean;
  notificationType: NotificationType;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  reminderId?: string;
}
