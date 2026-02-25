import { useNavigate } from "react-router-dom";
import { Bell, Star, Trash2, CalendarClock, Info, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications, AppNotification } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";

const typeIcon: Record<AppNotification["type"], React.ReactNode> = {
  reminder_created: <Bell className="h-3.5 w-3.5 text-primary" />,
  reschedule_requested: <CalendarClock className="h-3.5 w-3.5 text-amber-500" />,
  reschedule_reviewed: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
  info: <Info className="h-3.5 w-3.5 text-muted-foreground" />,
};

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllRead, toggleFavorite, deleteNotification } =
    useNotifications();
  const navigate = useNavigate();

  const visible = notifications.filter((n) => !n.isArchived).slice(0, 6);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[340px] p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Badge className="h-4 px-1.5 text-[10px]">{unreadCount} new</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-0.5 px-2 text-xs text-primary"
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[320px] overflow-y-auto divide-y">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            visible.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={cn(
                  "group flex items-start gap-2 px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/50",
                  !n.isRead && "bg-primary/5"
                )}
              >
                {/* Unread dot */}
                <div
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    !n.isRead ? "bg-primary" : "bg-transparent"
                  )}
                />

                {/* Type icon */}
                <div className="mt-0.5 shrink-0">{typeIcon[n.type]}</div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-medium leading-snug line-clamp-1">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{n.timestamp}</p>
                </div>

                {/* Actions (visible on hover) */}
                <div className="flex shrink-0 flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(n.id); }}
                  >
                    <Star className={cn("h-3 w-3", n.isFavorite && "fill-yellow-400 text-yellow-400")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer → view all */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs gap-1.5 text-primary hover:text-primary"
            onClick={() => navigate("/notifications")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
