import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Bell, Search, Star, Clipboard, Trash2, MoreVertical,
    CalendarClock, Info, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, AppNotification } from "@/context/NotificationContext";

// ── Icon by notification type ─────────────────────────────────────────────────
const typeIcon: Record<AppNotification["type"], React.ReactNode> = {
    reminder_created: <Bell className="h-4 w-4 text-primary" />,
    reschedule_requested: <CalendarClock className="h-4 w-4 text-amber-500" />,
    reschedule_reviewed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    info: <Info className="h-4 w-4 text-muted-foreground" />,
};

// ── Notification Row ──────────────────────────────────────────────────────────
const NotificationRow = ({
    notification,
    onRead,
    onFavorite,
    onDelete,
}: {
    notification: AppNotification;
    onRead: (id: string) => void;
    onFavorite: (id: string) => void;
    onDelete: (id: string) => void;
}) => (
    <div
        onClick={() => onRead(notification.id)}
        className={cn(
            "flex items-center gap-2 sm:gap-3 rounded-lg p-2 sm:p-3 transition-colors cursor-pointer min-w-0 group",
            !notification.isRead
                ? "bg-primary/5 hover:bg-primary/10 border border-primary/10"
                : "hover:bg-muted/50"
        )}
    >
        {/* Unread dot */}
        <div
            className={cn(
                "h-2 w-2 shrink-0 rounded-full transition-colors",
                !notification.isRead ? "bg-primary" : "bg-transparent"
            )}
        />

        {/* Type icon */}
        <div className="shrink-0 hidden sm:block">
            {typeIcon[notification.type]}
        </div>

        {/* Favourite */}
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => { e.stopPropagation(); onFavorite(notification.id); }}
        >
            {notification.isFavorite ? (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
                <Star className="h-4 w-4 text-muted-foreground" />
            )}
        </Button>

        {/* Clipboard icon (visual decoration) */}
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hidden sm:flex" disabled>
            <Clipboard className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* Content */}
        <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-medium truncate", !notification.isRead && "text-foreground")}>
                {notification.title}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{notification.message}</p>
        </div>

        {/* Timestamp */}
        <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
            {notification.timestamp}
        </span>

        {/* Delete */}
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const Notifications = () => {
    const { notifications, markAsRead, markAllRead, toggleFavorite, deleteNotification } =
        useNotifications();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const filtered = notifications.filter((n) => {
        const matchesSearch =
            n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeTab === "archive") return matchesSearch && n.isArchived;
        if (activeTab === "favorite") return matchesSearch && n.isFavorite;
        return matchesSearch && !n.isArchived;
    });

    const allCount = notifications.filter((n) => !n.isArchived).length;
    const archiveCount = notifications.filter((n) => n.isArchived).length;
    const favoriteCount = notifications.filter((n) => n.isFavorite).length;
    const unreadCount = notifications.filter((n) => !n.isRead && !n.isArchived).length;

    return (
        <Card className="w-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                    <Bell className="h-6 w-6" />
                    <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
                    {unreadCount > 0 && (
                        <Badge className="h-5 px-1.5 text-[10px]">{unreadCount} new</Badge>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={markAllRead}>
                        Mark all read
                    </Button>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Count + Search */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        {notifications.length} notification{notifications.length !== 1 && "s"}
                    </p>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search notifications…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full sm:w-auto sm:inline-flex">
                        <TabsTrigger value="all" className="gap-2 flex-1 sm:flex-none">
                            <Badge variant="secondary">{allCount}</Badge>
                            All
                        </TabsTrigger>
                        <TabsTrigger value="archive" className="flex-1 sm:flex-none">
                            {archiveCount} Archive
                        </TabsTrigger>
                        <TabsTrigger value="favorite" className="gap-1 flex-1 sm:flex-none">
                            <Star className="h-3.5 w-3.5" />
                            {favoriteCount} Saved
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-4">
                        <div className="space-y-1">
                            {filtered.map((n) => (
                                <NotificationRow
                                    key={n.id}
                                    notification={n}
                                    onRead={markAsRead}
                                    onFavorite={toggleFavorite}
                                    onDelete={deleteNotification}
                                />
                            ))}

                            {filtered.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                                        <Bell className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        {searchQuery
                                            ? "No notifications match your search"
                                            : activeTab === "archive"
                                                ? "No archived notifications"
                                                : activeTab === "favorite"
                                                    ? "No saved notifications yet"
                                                    : "You're all caught up! 🎉"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default Notifications;
