import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReminders } from "@/context/ReminderContext";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface CalendarViewProps {
  defaultView?: "month" | "week";
  hideHeader?: boolean;
}

const CalendarView = ({ defaultView = "month", hideHeader = false }: CalendarViewProps) => {
  const { reminders } = useReminders();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<"month" | "week">(defaultView);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const remindersByDate = useMemo(() => {
    const map: Record<string, typeof reminders> = {};
    reminders.forEach((r) => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    return map;
  }, [reminders]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [year, month]);

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const todayStr = fmt(new Date());

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const selectedReminders = selectedDate ? remindersByDate[selectedDate] || [] : [];

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">View reminders on calendar</p>
          </div>
          <div className="flex gap-2">
            <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>Month</Button>
            <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>Week</Button>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="h-5 w-5" /></Button>
            <h2 className="text-lg font-semibold">
              {view === "month" ? `${MONTHS[month]} ${year}` : `Week of ${weekDays[0].toLocaleDateString()}`}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => navigate(1)}><ChevronRight className="h-5 w-5" /></Button>
          </div>

          {view === "month" ? (
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map((d) => (
                <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
              ))}
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayReminders = remindersByDate[dateStr] || [];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "flex min-h-[72px] flex-col items-start rounded-lg p-2 text-sm transition-colors hover:bg-accent",
                      isToday && "bg-primary/5 font-bold",
                      isSelected && "ring-2 ring-primary"
                    )}
                  >
                    <span className={cn(isToday && "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs")}>
                      {day}
                    </span>
                    {dayReminders.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-0.5">
                        {dayReminders.slice(0, 3).map((r) => (
                          <div
                            key={r.id}
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              r.status === "overdue" ? "bg-destructive" : r.status === "completed" ? "bg-success" : "bg-primary"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((d) => {
                const dateStr = fmt(d);
                const dayReminders = remindersByDate[dateStr] || [];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "flex min-h-[120px] flex-col rounded-lg border p-2 text-sm transition-colors hover:bg-accent",
                      isToday && "border-primary bg-primary/5",
                      isSelected && "ring-2 ring-primary"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">{DAYS[d.getDay()]}</span>
                    <span className={cn("text-lg font-semibold", isToday && "text-primary")}>{d.getDate()}</span>
                    <div className="mt-1 space-y-1">
                      {dayReminders.slice(0, 2).map((r) => (
                        <div key={r.id} className="truncate rounded bg-primary/10 px-1 text-[10px] text-primary">{r.title}</div>
                      ))}
                      {dayReminders.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{dayReminders.length - 2} more</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Reminders */}
      {selectedDate && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="font-semibold">
            Reminders for {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </h3>
          {selectedReminders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reminders for this date</p>
          ) : (
            selectedReminders.map((r) => (
              <Card key={r.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.time} · {r.category}</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    r.priority === "high" ? "priority-high" : r.priority === "medium" ? "priority-medium" : "priority-low"
                  )}>{r.priority}</Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
