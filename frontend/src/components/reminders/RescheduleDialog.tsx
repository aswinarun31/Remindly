import { useState } from "react";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarClock, Bell } from "lucide-react";
import { useReminders } from "@/context/ReminderContext";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reminder: {
        id: string;
        title: string;
        date: string;
        time: string;
    };
}

const RescheduleDialog = ({ open, onOpenChange, reminder }: Props) => {
    const { requestReschedule } = useReminders();
    const { push } = useNotifications();
    const { user } = useAuth();

    const studentName = user?.name || "A student";

    const [proposedDate, setProposedDate] = useState(reminder.date);
    const [proposedTime, setProposedTime] = useState(reminder.time);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!proposedDate || !proposedTime) {
            toast.error("Please provide a proposed date and time");
            return;
        }
        if (proposedDate === reminder.date && proposedTime === reminder.time) {
            toast.error("Proposed time must be different from the original");
            return;
        }

        setLoading(true);
        try {
            await requestReschedule(reminder.id, { proposedDate, proposedTime, reason });

            // 1️⃣ Student confirmation notification
            push({
                type: "reschedule_requested",
                title: "Reschedule Request Submitted",
                message: `You requested to reschedule "${reminder.title}" to ${proposedDate} at ${proposedTime}. Awaiting admin approval.`,
                reminderId: reminder.id,
            });

            // 2️⃣ Admin-targeted notification (visible when admin is on same client
            //    or when the admin dashboard loads and checks pending requests)
            push({
                type: "reschedule_requested",
                title: `⚠️ [Admin] Reschedule Request`,
                message: `${studentName} has requested to reschedule "${reminder.title}" → ${proposedDate} at ${proposedTime}.${reason ? ` Reason: ${reason}` : ""
                    } — review in Admin Dashboard.`,
                reminderId: reminder.id,
            });

            onOpenChange(false);
            setReason("");
        } catch (err: any) {
            // Error toast already handled in context
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <CalendarClock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle>Request Rescheduling</DialogTitle>
                            <DialogDescription className="text-xs mt-0.5">
                                Admin will review and approve or reject your request.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Reminder info */}
                    <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm space-y-0.5">
                        <p className="font-medium">{reminder.title}</p>
                        <p className="text-muted-foreground text-xs">
                            Current: {reminder.date} at {reminder.time}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Proposed Date *</Label>
                            <Input
                                type="date"
                                value={proposedDate}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setProposedDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Proposed Time *</Label>
                            <Input
                                type="time"
                                value={proposedTime}
                                onChange={(e) => setProposedTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Reason <span className="text-muted-foreground text-xs">(optional)</span></Label>
                        <Textarea
                            placeholder="Why do you need to reschedule?"
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Submitting…" : "Submit Request"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RescheduleDialog;
