import { useState } from "react";
import { Reminder } from "@/context/ReminderContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, Edit2, Trash2, RotateCcw, Lock, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import RescheduleDialog from "./RescheduleDialog";

interface ReminderCardProps {
  reminder: Reminder;
  onEdit?: (r: Reminder) => void;
  onDelete?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
}

const priorityConfig = {
  high: { label: "High", className: "priority-high" },
  medium: { label: "Medium", className: "priority-medium" },
  low: { label: "Low", className: "priority-low" },
};

const statusConfig = {
  pending: { label: "Pending", icon: Clock, className: "text-warning" },
  completed: { label: "Completed", icon: Check, className: "text-success" },
  overdue: { label: "Overdue", icon: Clock, className: "text-destructive" },
};

const ReminderCard = ({ reminder, onEdit, onDelete, onToggleComplete }: ReminderCardProps) => {
  const { isStudent } = useAuth();
  const priority = priorityConfig[reminder.priority] ?? priorityConfig.medium;
  const status = statusConfig[reminder.status] ?? statusConfig.pending;
  const StatusIcon = status.icon;
  const isLocked = reminder.isLocked;

  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  return (
    <>
      <Card
        className={cn(
          "animate-fade-in p-4 transition-shadow hover:shadow-md",
          reminder.status === "completed" && "opacity-70",
          isLocked && "border-primary/30 bg-primary/[0.02]"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {isLocked && (
                <Badge variant="outline" className="gap-1 border-primary/40 text-primary text-xs">
                  <Lock className="h-3 w-3" /> Admin Task
                </Badge>
              )}
              <h3 className={cn("font-semibold", reminder.status === "completed" && "line-through")}>
                {reminder.title}
              </h3>
              <Badge variant="outline" className={cn("text-xs", priority.className)}>
                {priority.label}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {reminder.category}
              </Badge>
            </div>

            {reminder.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{reminder.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <StatusIcon className={cn("h-3.5 w-3.5", status.className)} />
                {status.label}
              </span>
              <span>{reminder.date}</span>
              <span>{reminder.time}</span>
              {reminder.durationMinutes && (
                <span>{reminder.durationMinutes} min</span>
              )}
              {reminder.recurring && (
                <span className="flex items-center gap-1">
                  <RotateCcw className="h-3 w-3" /> Recurring
                </span>
              )}
            </div>

            {/* Created by info */}
            {isLocked && reminder.createdBy && (
              <p className="text-xs text-muted-foreground mt-1">
                Set by <span className="font-medium text-primary">{reminder.createdBy.name}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Complete toggle — available to all */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleComplete?.(reminder.id)}
              title={reminder.status === "completed" ? "Mark pending" : "Mark complete"}
            >
              <Check className={cn("h-4 w-4", reminder.status === "completed" && "text-success")} />
            </Button>

            {/* Admin reminders: students can request reschedule */}
            {isLocked && isStudent && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary"
                title="Request rescheduling"
                onClick={() => setRescheduleOpen(true)}
              >
                <CalendarClock className="h-4 w-4" />
              </Button>
            )}

            {/* Own reminders: edit + delete */}
            {!isLocked && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit?.(reminder)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onDelete?.(reminder.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Admin can still edit/delete their own locked reminders */}
            {isLocked && !isStudent && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit?.(reminder)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onDelete?.(reminder.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Reschedule dialog — only mounts when needed */}
      {rescheduleOpen && (
        <RescheduleDialog
          open={rescheduleOpen}
          onOpenChange={setRescheduleOpen}
          reminder={{
            id: reminder.id,
            title: reminder.title,
            date: reminder.date,
            time: reminder.time,
          }}
        />
      )}
    </>
  );
};

export default ReminderCard;
