import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export default api;

// ── Reminder Service ──────────────────────────────────────────────────────────

export const reminderService = {
  getAll: async () => {
    const res = await api.get("/reminders");
    return res.data;
  },

  // Admin creates reminder for students
  adminCreate: async (data: Record<string, unknown>) => {
    const res = await api.post("/reminders/admin", data);
    return res.data;
  },

  // Student creates personal reminder (backend checks overlap)
  studentCreate: async (data: Record<string, unknown>) => {
    const res = await api.post("/reminders/student", data);
    return res.data;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const res = await api.put(`/reminders/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    await api.delete(`/reminders/${id}`);
  },

  toggleComplete: async (id: string) => {
    const res = await api.patch(`/reminders/${id}/toggle`);
    return res.data;
  },

  // Student: request rescheduling of an admin reminder
  requestReschedule: async (reminderId: string, data: { proposedDate: string; proposedTime: string; reason?: string }) => {
    const res = await api.post(`/reminders/${reminderId}/reschedule`, data);
    return res.data;
  },

  // Student: get their reschedule requests
  getMyRescheduleRequests: async () => {
    const res = await api.get("/reminders/reschedule/mine");
    return res.data;
  },

  // Admin: get all reschedule requests
  getAllRescheduleRequests: async () => {
    const res = await api.get("/reminders/reschedule/all");
    return res.data;
  },

  // Admin: approve or reject a reschedule request
  reviewRescheduleRequest: async (requestId: string, status: "approved" | "rejected") => {
    const res = await api.patch(`/reminders/reschedule/${requestId}/review`, { status });
    return res.data;
  },
};

// ── Auth Service ──────────────────────────────────────────────────────────────

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },
  register: async (name: string, email: string, password: string) => {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

// ── User Service (Admin operations) ──────────────────────────────────────────

export const userService = {
  getAllUsers: async () => {
    const res = await api.get("/auth/users");
    return res.data;
  },
  updateRole: async (userId: string, role: "admin" | "student") => {
    const res = await api.patch(`/auth/users/${userId}/role`, { role });
    return res.data;
  },
};
