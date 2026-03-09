import { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, LogOut, Menu, X, Bell, ChevronRight,
  MoveRight, FileText, MessageSquare, BedDouble, User,
  Users, CheckSquare, BarChart3, Wrench, ClipboardList,
  Settings, Upload, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navByRole: Record<string, NavItem[]> = {
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "Movement Log", href: "/student/movement", icon: MoveRight },
    { label: "Leave Application", href: "/student/leave", icon: FileText },
    { label: "Complaints", href: "/student/complaints", icon: MessageSquare },
    { label: "Room Allocation", href: "/student/room", icon: BedDouble },
    { label: "Profile", href: "/student/profile", icon: User },
  ],
  warden: [
    { label: "Dashboard", href: "/warden", icon: LayoutDashboard },
    { label: "Student Movement", href: "/warden/movement", icon: MoveRight },
    { label: "Leave Requests", href: "/warden/leave", icon: FileText },
    { label: "Complaints", href: "/warden/complaints", icon: MessageSquare },
    { label: "Reports", href: "/warden/reports", icon: BarChart3 },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Manage Students", href: "/admin/students", icon: Users },
    { label: "Upload CGPA", href: "/admin/cgpa", icon: Upload },
    { label: "Room Setup", href: "/admin/rooms", icon: BedDouble },
    { label: "User Management", href: "/admin/users", icon: Shield },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  ],
  maintenance: [
    { label: "Assigned Complaints", href: "/maintenance", icon: ClipboardList },
    { label: "Update Status", href: "/maintenance/update", icon: CheckSquare },
    { label: "Profile", href: "/maintenance/profile", icon: User },
  ],
};

const roleLabels: Record<string, string> = {
  student: "Student",
  warden: "Warden",
  admin: "Administrator",
  maintenance: "Maintenance",
};

const roleColors: Record<string, string> = {
  student: "text-blue-400",
  warden: "text-green-400",
  admin: "text-primary",
  maintenance: "text-orange-400",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = navByRole[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 flex flex-col transition-all duration-300 border-r border-border bg-[hsl(var(--sidebar-background))]`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          {sidebarOpen && (
            <span className="font-bold text-foreground text-lg tracking-tight">HostelHub</span>
          )}
        </div>

        {/* User info */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-sm">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className={`text-xs font-medium ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3 h-3 text-primary" />}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-[hsl(var(--background))] flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {navItems.find((i) => i.href === location.pathname)?.label || "Dashboard"}
              </h2>
              <p className="text-xs text-muted-foreground">HostelHub Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">{user.name.charAt(0)}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
