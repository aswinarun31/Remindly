import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useReminders } from "@/context/ReminderContext";
import ReminderCard from "@/components/reminders/ReminderCard";
import ReminderForm from "@/components/reminders/ReminderForm";
import ReminderFilters from "@/components/reminders/ReminderFilters";
import { Reminder } from "@/types/reminder";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Reminders = () => {
  const { reminders, addReminder, updateReminder, deleteReminder, toggleComplete } = useReminders();
  const [formOpen, setFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: "all", priority: "all", category: "all", date: "" });

  const filtered = reminders.filter((r) => {
    if (filters.status !== "all" && r.status !== filters.status) return false;
    if (filters.priority !== "all" && r.priority !== filters.priority) return false;
    if (filters.category !== "all" && r.category !== filters.category) return false;
    if (filters.date && r.date !== filters.date) return false;
    return true;
  });

  const handleCreate = (data: any) => {
    addReminder({ ...data, status: "pending" });
    toast.success("Reminder created");
  };

  const handleEdit = (data: any) => {
    if (editingReminder) {
      updateReminder(editingReminder.id, data);
      toast.success("Reminder updated");
      setEditingReminder(null);
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteReminder(deleteId);
      toast.success("Reminder deleted");
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reminders</h1>
          <p className="text-muted-foreground">Manage all your reminders</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Reminder
        </Button>
      </div>

      <ReminderFilters filters={filters} onChange={setFilters} />

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No reminders match your filters</div>
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

      <ReminderForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} mode="create" />
      {editingReminder && (
        <ReminderForm
          open={!!editingReminder}
          onOpenChange={(open) => !open && setEditingReminder(null)}
          onSubmit={handleEdit}
          defaultValues={editingReminder}
          mode="edit"
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Reminders;
