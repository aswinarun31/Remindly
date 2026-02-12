import { Reminder } from "@/types/reminder";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, Edit2, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const priority = priorityConfig[reminder.priority];
  const status = statusConfig[reminder.status];
  const StatusIcon = status.icon;

  return (
    <Card className={cn("animate-fade-in p-4 transition-shadow hover:shadow-md", reminder.status === "completed" && "opacity-70")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn("font-semibold", reminder.status === "completed" && "line-through")}>{reminder.title}</h3>
            <Badge variant="outline" className={cn("text-xs", priority.className)}>{priority.label}</Badge>
            <Badge variant="secondary" className="text-xs capitalize">{reminder.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{reminder.description}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <StatusIcon className={cn("h-3.5 w-3.5", status.className)} />
              {status.label}
            </span>
            <span>{reminder.date}</span>
            <span>{reminder.time}</span>
            {reminder.recurring && (
              <span className="flex items-center gap-1">
                <RotateCcw className="h-3 w-3" /> Recurring
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleComplete?.(reminder.id)} title={reminder.status === "completed" ? "Undo" : "Complete"}>
            <Check className={cn("h-4 w-4", reminder.status === "completed" && "text-success")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit?.(reminder)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete?.(reminder.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ReminderCard;
