import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle } from "lucide-react";
import { useReminders } from "@/context/ReminderContext";
import { useAuth } from "@/context/AuthContext";
import ReminderCard from "@/components/reminders/ReminderCard";
import ReminderForm from "@/components/reminders/ReminderForm";
import ReminderFilters from "@/components/reminders/ReminderFilters";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/reminders-sidebar/app-sidebar";
import CalendarView from "../pages/CalendarView";
import { Reminder } from "@/context/ReminderContext";

// ── Overlap warning dialog ────────────────────────────────────────────────────
interface OverlapItem {
  id: string; title: string; date: string; time: string; durationMinutes: number;
}

interface OverlapDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  overlapping: OverlapItem[];
  onBookAlternate: () => void;
}

const OverlapDialog = ({ open, onOpenChange, overlapping, onBookAlternate }: OverlapDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <DialogTitle>Time Slot Conflict</DialogTitle>
        </div>
        <DialogDescription>
          Your chosen time overlaps with the following admin-scheduled task(s). You cannot book this slot.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        {overlapping.map((r) => (
          <div key={r.id} className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm">
            <p className="font-medium">{r.title}</p>
            <p className="text-xs text-muted-foreground">
              {r.date} at {r.time} · {r.durationMinutes} min
            </p>
          </div>
        ))}
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={onBookAlternate}>Pick Another Time</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const Reminders = () => {
  const { reminders, addReminder, updateReminder, deleteReminder, toggleComplete } = useReminders();
  const { isAdmin, isStudent } = useAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: "all", priority: "all", category: "all", date: "" });
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"list" | "week">("list");

  // Overlap state
  const [overlapOpen, setOverlapOpen] = useState(false);
  const [overlapping, setOverlapping] = useState<OverlapItem[]>([]);
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  // Sync date picker with filters
  useEffect(() => {
    if (date) {
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
      const dateStr = adjustedDate.toISOString().split("T")[0];
      setFilters((prev) => ({ ...prev, date: dateStr }));
    } else {
      setFilters((prev) => ({ ...prev, date: "" }));
    }
  }, [date]);

  const filtered = reminders.filter((r) => {
    if (filters.status !== "all" && r.status !== filters.status) return false;
    if (filters.priority !== "all" && r.priority !== filters.priority) return false;
    if (filters.category !== "all" && r.category !== filters.category) return false;
    if (filters.date && r.date !== filters.date) return false;
    return true;
  });

  // Create reminder — handles overlap errors for students
  const handleCreate = async (data: any) => {
    try {
      if (isStudent) {
        await addReminder({ ...data, status: "pending" });
      } else {
        // Admin creates via the admin endpoint (locked, broadcast by default)
        await addReminder(
          { ...data, status: "pending" },
          { asAdmin: true, targetFilter: "all", assignedTo: [] }
        );
      }
      setFormOpen(false);
    } catch (err: any) {
      const apiMsg = err?.response?.data;
      if (err?.response?.status === 409 && apiMsg?.overlapping) {
        // Overlap detected — show conflict dialog
        setOverlapping(apiMsg.overlapping);
        setPendingFormData(data);
        setFormOpen(false);
        setOverlapOpen(true);
      } else {
        toast.error(apiMsg?.message || "Failed to create reminder");
      }
    }
  };

  const handleEdit = async (data: any) => {
    if (editingReminder) {
      try {
        await updateReminder(editingReminder.id, data);
        setEditingReminder(null);
      } catch {
        // error toast handled in context
      }
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteReminder(deleteId);
      setDeleteId(null);
    }
  };

  const resetFilters = () => {
    setDate(undefined);
    setFilters({ status: "all", priority: "all", category: "all", date: "" });
  };

  // "Pick another time" — re-open form with same data pre-filled
  const handleBookAlternate = () => {
    setOverlapOpen(false);
    setFormOpen(true);
  };

  return (
    <SidebarProvider className="min-h-[calc(100vh-4rem)]">
      <AppSidebar date={date} setDate={setDate} onViewWeek={() => setViewMode("week")} />
      <SidebarInset>
        <div className="space-y-6 pt-4 px-2">
          {viewMode === "list" ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="lg:hidden" />
                  <div>
                    <h1 className="text-2xl font-bold">Your Reminders</h1>
                    {isStudent && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        🔒 Admin tasks cannot be modified — click the calendar icon to request rescheduling.
                      </p>
                    )}
                  </div>
                </div>
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isAdmin ? "Create Reminder for Students" : "New Reminder"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <ReminderFilters filters={filters} onChange={setFilters} />
                {filters.date && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground hover:text-foreground">
                    Clear Date
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {filtered.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    {filters.date ? `No reminders found for ${filters.date}` : "No reminders match your filters"}
                    {filters.date && (
                      <div className="mt-2">
                        <Button variant="link" onClick={resetFilters}>View all reminders</Button>
                      </div>
                    )}
                  </div>
                ) : (
                  filtered.map((r) => (
                    <ReminderCard
                      key={r.id}
                      reminder={r}
                      onEdit={(r) => setEditingReminder(r)}
                      onDelete={(id) => setDeleteId(id)}
                      onToggleComplete={toggleComplete}
                    />
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="lg:hidden" />
                <Button variant="outline" size="sm" onClick={() => setViewMode("list")}>Back to List</Button>
              </div>
              <CalendarView defaultView="week" hideHeader={true} />
            </div>
          )}

          {/* Create form */}
          <ReminderForm
            open={formOpen}
            onOpenChange={setFormOpen}
            onSubmit={handleCreate}
            mode="create"
            defaultValues={pendingFormData}
          />

          {/* Edit form */}
          {editingReminder && (
            <ReminderForm
              open={!!editingReminder}
              onOpenChange={(open) => !open && setEditingReminder(null)}
              onSubmit={handleEdit}
              defaultValues={editingReminder}
              mode="edit"
            />
          )}

          {/* Overlap conflict dialog */}
          <OverlapDialog
            open={overlapOpen}
            onOpenChange={setOverlapOpen}
            overlapping={overlapping}
            onBookAlternate={handleBookAlternate}
          />

          {/* Delete confirm */}
          <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Reminders;
