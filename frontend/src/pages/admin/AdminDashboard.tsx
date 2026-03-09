import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Users, BedDouble, Upload, BarChart3, Settings, ArrowUpRight, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const occupancyData = [
  { block: "Block A", total: 80, occupied: 72 },
  { block: "Block B", total: 80, occupied: 68 },
  { block: "Block C", total: 60, occupied: 55 },
  { block: "Block D", total: 60, occupied: 48 },
];

const cgpaData = [
  { range: "9–10", count: 42 },
  { range: "8–9", count: 89 },
  { range: "7–8", count: 110 },
  { range: "6–7", count: 65 },
  { range: "<6", count: 22 },
];

const recentActions = [
  { action: "CGPA data uploaded", by: "Admin Kumar", time: "2 hours ago", icon: "📊" },
  { action: "Allocation cycle started", by: "Admin Kumar", time: "5 hours ago", icon: "🏠" },
  { action: "New room added: D-401", by: "Admin Kumar", time: "Yesterday", icon: "➕" },
  { action: "User account created", by: "Admin Kumar", time: "2 days ago", icon: "👤" },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Full control of hostel management system</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">System Operational</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Students" value="328" subtitle="Across all blocks" icon={<Users className="w-5 h-5" />} accentColor="blue" trend={{ value: 5, label: "this semester" }} />
          <StatsCard title="Total Rooms" value="140" subtitle="Across 4 blocks" icon={<BedDouble className="w-5 h-5" />} accentColor="primary" />
          <StatsCard title="Occupancy Rate" value="87%" subtitle="243 occupied" icon={<BarChart3 className="w-5 h-5" />} accentColor="green" trend={{ value: 3, label: "vs last month" }} />
          <StatsCard title="Staff Members" value="12" subtitle="4 maintenance, 8 wardens" icon={<Settings className="w-5 h-5" />} accentColor="purple" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-1">Block Occupancy</h3>
            <p className="text-xs text-muted-foreground mb-4">Rooms occupied per block</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={occupancyData} layout="vertical">
                <XAxis type="number" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="block" type="category" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,18%)", borderRadius: "8px", color: "hsl(0,0%,95%)" }} />
                <Bar dataKey="total" fill="hsl(0,0%,20%)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="occupied" fill="hsl(48,96%,53%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-1">CGPA Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">Student CGPA across ranges</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cgpaData}>
                <XAxis dataKey="range" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,18%)", borderRadius: "8px", color: "hsl(0,0%,95%)" }} />
                <Bar dataKey="count" fill="hsl(48,96%,53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions + Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: <Upload className="w-4 h-4" />, label: "Upload CGPA CSV", href: "/admin/cgpa", color: "primary" },
                { icon: <BedDouble className="w-4 h-4" />, label: "Start Allocation", href: "/admin/rooms", color: "blue" },
                { icon: <Users className="w-4 h-4" />, label: "Manage Students", href: "/admin/students", color: "green" },
                { icon: <Settings className="w-4 h-4" />, label: "User Management", href: "/admin/users", color: "purple" },
              ].map((a) => (
                <a
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20">
                    {a.icon}
                  </div>
                  <span className="text-sm text-foreground font-medium">{a.label}</span>
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground ml-auto" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActions.map((a, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                  <span className="text-xl">{a.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{a.action}</p>
                    <p className="text-xs text-muted-foreground">by {a.by}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
