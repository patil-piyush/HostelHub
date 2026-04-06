import { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, LogOut, Menu, X, Bell, ChevronRight,
  MoveRight, FileText, MessageSquare, BedDouble, User,
  Users, BarChart3, Shield
} from "lucide-react";

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
    // ❌ removed broken route "/warden/reports"
  ],

  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Manage Students", href: "/admin/students", icon: Users },
    { label: "Register Student", href: "/admin/register-student", icon: User },
    { label: "Manage Wardens", href: "/admin/wardens", icon: Shield },

    // 🔥 MAIN FEATURE (REPLACEMENT)
    { label: "Allocation Hub", href: "/admin/allocation", icon: BedDouble },

    // optional future pages
    // { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  ],
};

const roleLabels: Record<string, string> = {
  student: "Student",
  warden: "Warden",
  admin: "Administrator",
};

const roleColors: Record<string, string> = {
  student: "text-blue-400",
  warden: "text-green-400",
  admin: "text-primary",
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

      {/* SIDEBAR */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 border-r bg-[hsl(var(--sidebar-background))] flex flex-col`}
      >

        {/* LOGO */}
        <div className="flex items-center gap-3 px-4 h-16 border-b">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg">HostelHub</span>
          )}
        </div>

        {/* USER */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className={`text-xs ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* NAV */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition
                      ${isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    <item.icon className="w-4 h-4" />

                    {sidebarOpen && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3 h-3" />}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* LOGOUT */}
        <div className="p-3 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 w-full"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-16 flex items-center justify-between px-6 border-b">

          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <div>
              <h2 className="text-sm font-semibold">
                {navItems.find((i) => i.href === location.pathname)?.label || "Dashboard"}
              </h2>
              <p className="text-xs text-muted-foreground">
                HostelHub Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4" />
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
          </div>

        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  );
}