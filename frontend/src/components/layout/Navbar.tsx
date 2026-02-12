import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ListChecks,
  Menu,
  Settings,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Reminders", icon: ListChecks, path: "/" },
  // { label: "Calendar", icon: CalendarDays, path: "/calendar" },
  // { label: "Profile", icon: User, path: "/profile" },
  // { label: "Settings", icon: Settings, path: "/settings" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-card px-4 lg:px-6 relative justify-between">
      {/* Left Side: Mobile Menu & Desktop Logo */}
      <div className="flex items-center gap-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center px-4 border-b">
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Bell className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">Remindly</span>
              </Link>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Logo */}
        <Link to="/" className="hidden lg:flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Bell className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Remindly</span>
        </Link>
      </div>

      {/* Center: Desktop Navigation & Mobile Logo */}

      {/* Mobile Logo (Centered) */}
      <Link
        to="/"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 lg:hidden"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Bell className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">Remindly</span>
      </Link>

      {/* Desktop Navigation (Centered) */}
      <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        <NotificationDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">
                {user?.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => { logout(); navigate("/login"); }}
            >
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
