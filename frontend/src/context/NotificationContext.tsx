import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    isFavorite: boolean;
    isArchived: boolean;
    type: "reminder_created" | "reschedule_requested" | "reschedule_reviewed" | "info";
    /** Optional: link to associated reminder */
    reminderId?: string;
}

interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    push: (n: Omit<AppNotification, "id" | "isRead" | "isFavorite" | "isArchived" | "timestamp">) => void;
    markAsRead: (id: string) => void;
    markAllRead: () => void;
    toggleFavorite: (id: string) => void;
    deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ── Helpers ───────────────────────────────────────────────────────────────────

const generateId = () => Math.random().toString(36).slice(2, 10);

const formatTimestamp = () => {
    return new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const unreadCount = notifications.filter((n) => !n.isRead && !n.isArchived).length;

    const push = useCallback(
        (n: Omit<AppNotification, "id" | "isRead" | "isFavorite" | "isArchived" | "timestamp">) => {
            const newNotif: AppNotification = {
                ...n,
                id: generateId(),
                isRead: false,
                isFavorite: false,
                isArchived: false,
                timestamp: "Just Now",
            };
            setNotifications((prev) => [newNotif, ...prev]);
        },
        []
    );

    const markAsRead = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }, []);

    const toggleFavorite = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
        );
    }, []);

    const deleteNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                push,
                markAsRead,
                markAllRead,
                toggleFavorite,
                deleteNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
    return ctx;
};
