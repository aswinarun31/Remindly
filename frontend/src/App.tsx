import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ReminderProvider } from "@/context/ReminderContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import { NotificationProvider } from "@/context/NotificationContext";

// Pages
import Reminders from "@/pages/Reminders";
import CalendarView from "@/pages/CalendarView";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import AuthCallback from "@/pages/AuthCallback";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import AdminDashboard from "@/pages/AdminDashboard";
import Notifications from "@/pages/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ReminderProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* ── Public routes ───────────────────────────────── */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* ── Protected: any authenticated user ──────────── */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<Reminders />} />
                      <Route path="/calendar" element={<CalendarView />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/notifications" element={<Notifications />} />
                    </Route>
                  </Route>

                  {/* ── Admin-only routes ───────────────────────────── */}
                  <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route element={<AppLayout />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ReminderProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
