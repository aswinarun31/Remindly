import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService, reminderService } from "@/services/api";
import { toast } from "sonner";
import {
    Users, Bell, ShieldCheck, RefreshCw, CheckCircle2, XCircle,
    Crown, UserRound, Clock, CalendarDays, Plus, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserRecord {
    id: string;
    name: string;
    email: string;
    role: "admin" | "student";
    avatar: string | null;
    createdAt: string;
}

interface RescheduleReq {
    id: string;
    reminder: { id: string; title: string; date: string; time: string };
    requestedBy: { id: string; name: string; email: string };
    proposedDate: string;
    proposedTime: string;
    reason: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
}

const AdminDashboard = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [requests, setRequests] = useState<RescheduleReq[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingReqs, setLoadingReqs] = useState(true);

    // Create reminder dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        priority: "medium",
        category: "academic",
        targetFilter: "all",
        assignedTo: [] as string[],
        durationMinutes: 60,
    });

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch {
            toast.error("Failed to load users");
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchRequests = async () => {
        setLoadingReqs(true);
        try {
            const data = await reminderService.getAllRescheduleRequests();
            setRequests(data);
        } catch {
            toast.error("Failed to load reschedule requests");
        } finally {
            setLoadingReqs(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRequests();
    }, []);

    const handleRoleChange = async (userId: string, newRole: "admin" | "student") => {
        try {
            await userService.updateRole(userId, newRole);
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
            );
            toast.success(`Role updated to ${newRole}`);
        } catch {
            toast.error("Failed to update role");
        }
    };

    const handleReview = async (requestId: string, status: "approved" | "rejected") => {
        try {
            await reminderService.reviewRescheduleRequest(requestId, status);
            setRequests((prev) =>
                prev.map((r) => (r.id === requestId ? { ...r, status } : r))
            );
            toast.success(`Request ${status}`);
        } catch {
            toast.error("Failed to update request");
        }
    };

    const handleCreateReminder = async () => {
        if (!form.title || !form.date || !form.time) {
            toast.error("Title, date, and time are required");
            return;
        }
        setCreating(true);
        try {
            const payload: Record<string, unknown> = {
                ...form,
                assignedTo: form.targetFilter === "all" ? [] : form.assignedTo,
            };
            await reminderService.adminCreate(payload);
            toast.success("Reminder created for students!");
            setDialogOpen(false);
            setForm({ title: "", description: "", date: "", time: "", priority: "medium", category: "academic", targetFilter: "all", assignedTo: [], durationMinutes: 60 });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to create reminder");
        } finally {
            setCreating(false);
        }
    };

    const students = users.filter((u) => u.role === "student");
    const admins = users.filter((u) => u.role === "admin");
    const pendingReqs = requests.filter((r) => r.status === "pending");

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage students, reminders, and reschedule requests
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Reminder
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Reminder for Students</DialogTitle>
                            <DialogDescription>
                                This reminder will be locked — students cannot modify it, only request rescheduling.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label>Title *</Label>
                                <Input
                                    placeholder="e.g. Assignment Submission"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Additional details…"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>Date *</Label>
                                    <Input
                                        type="date"
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Time *</Label>
                                    <Input
                                        type="time"
                                        value={form.time}
                                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>Priority</Label>
                                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Duration (minutes)</Label>
                                    <Input
                                        type="number"
                                        min={15}
                                        value={form.durationMinutes}
                                        onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>Assign To</Label>
                                <Select value={form.targetFilter} onValueChange={(v) => setForm({ ...form, targetFilter: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Students</SelectItem>
                                        <SelectItem value="specific">Specific Students</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {form.targetFilter === "specific" && (
                                <div className="space-y-1">
                                    <Label>Select Students</Label>
                                    <div className="max-h-36 overflow-y-auto rounded border p-2 space-y-1">
                                        {students.map((s) => (
                                            <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-accent rounded px-1 py-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={form.assignedTo.includes(s.id)}
                                                    onChange={(e) => {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            assignedTo: e.target.checked
                                                                ? [...prev.assignedTo, s.id]
                                                                : prev.assignedTo.filter((id) => id !== s.id),
                                                        }));
                                                    }}
                                                />
                                                <span>{s.name}</span>
                                                <span className="text-muted-foreground ml-auto">{s.email}</span>
                                            </label>
                                        ))}
                                        {students.length === 0 && (
                                            <p className="text-muted-foreground text-xs text-center py-2">No students found</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateReminder} disabled={creating}>
                                {creating ? "Creating…" : "Create Reminder"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Students", value: students.length, icon: UserRound, color: "text-blue-500" },
                    { label: "Total Admins", value: admins.length, icon: Crown, color: "text-amber-500" },
                    { label: "Pending Requests", value: pendingReqs.length, icon: Clock, color: "text-orange-500" },
                    { label: "Total Users", value: users.length, icon: Users, color: "text-primary" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label}>
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className={`rounded-xl bg-muted p-3 ${color}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">{label}</p>
                                <p className="text-2xl font-bold">{value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="users">
                <TabsList>
                    <TabsTrigger value="users" className="gap-2">
                        <Users className="h-4 w-4" /> Users
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reschedule Requests
                        {pendingReqs.length > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                {pendingReqs.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* ── Users Tab ── */}
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>Manage roles — promote students to admin or demote admins.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingUsers ? (
                                <div className="flex justify-center py-10">
                                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {users.map((u) => (
                                        <div key={u.id} className="flex items-center justify-between py-3 gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">
                                                        {u.name}
                                                        {u.id === user?.id && (
                                                            <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                                                    {u.role === "admin" ? <Crown className="h-3 w-3 mr-1" /> : <UserRound className="h-3 w-3 mr-1" />}
                                                    {u.role}
                                                </Badge>
                                                {u.id !== user?.id && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                                                                Change Role <ChevronDown className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => handleRoleChange(u.id, "admin")}
                                                                disabled={u.role === "admin"}
                                                            >
                                                                <Crown className="h-4 w-4 mr-2 text-amber-500" />
                                                                Promote to Admin
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleRoleChange(u.id, "student")}
                                                                disabled={u.role === "student"}
                                                            >
                                                                <UserRound className="h-4 w-4 mr-2 text-blue-500" />
                                                                Demote to Student
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {users.length === 0 && (
                                        <p className="text-center text-muted-foreground py-10 text-sm">No users found</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Reschedule Requests Tab ── */}
                <TabsContent value="requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Reschedule Requests</CardTitle>
                            <CardDescription>Students have requested to reschedule these admin-locked reminders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingReqs ? (
                                <div className="flex justify-center py-10">
                                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {requests.map((req) => (
                                        <div key={req.id} className="py-4 space-y-2">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1 min-w-0">
                                                    <p className="font-semibold text-sm">{req.reminder?.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Requested by <span className="font-medium text-foreground">{req.requestedBy?.name}</span>
                                                        {" · "}{new Date(req.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <div className="flex gap-4 text-xs mt-1">
                                                        <span className="text-muted-foreground">
                                                            Original: <span className="text-foreground font-medium">{req.reminder?.date} {req.reminder?.time}</span>
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            Proposed: <span className="text-primary font-medium">{req.proposedDate} {req.proposedTime}</span>
                                                        </span>
                                                    </div>
                                                    {req.reason && (
                                                        <p className="text-xs text-muted-foreground italic">"{req.reason}"</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {req.status === "pending" ? (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 gap-1 text-xs text-green-600 border-green-200 hover:bg-green-50"
                                                                onClick={() => handleReview(req.id, "approved")}
                                                            >
                                                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                                                onClick={() => handleReview(req.id, "rejected")}
                                                            >
                                                                <XCircle className="h-3.5 w-3.5" /> Reject
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Badge
                                                            variant={req.status === "approved" ? "default" : "destructive"}
                                                            className="capitalize"
                                                        >
                                                            {req.status === "approved"
                                                                ? <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                : <XCircle className="h-3 w-3 mr-1" />
                                                            }
                                                            {req.status}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {requests.length === 0 && (
                                        <p className="text-center text-muted-foreground py-10 text-sm">
                                            No reschedule requests yet
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboard;
