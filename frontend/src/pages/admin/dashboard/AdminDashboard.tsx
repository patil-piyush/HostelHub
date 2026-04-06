import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Users, BedDouble, Upload, BarChart3, Settings, ArrowUpRight, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import API from "@/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({});
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [cgpaData, setCgpaData] = useState<any[]>([]);
  const [recentActions, setRecentActions] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/admin/dashboard");

      setStats(res.data.stats);
      setOccupancyData(res.data.occupancyData);
      setCgpaData(res.data.cgpaData);
      setRecentActions(res.data.recentActions);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Full control of hostel management system
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">System Operational</span>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents || 0}
            subtitle="Across all blocks"
            icon={<Users className="w-5 h-5" />}
            accentColor="blue"
          />

          <StatsCard
            title="Total Rooms"
            value={stats.totalRooms || 0}
            subtitle="Across 4 blocks"
            icon={<BedDouble className="w-5 h-5" />}
            accentColor="primary"
          />

          <StatsCard
            title="Occupancy Rate"
            value={`${stats.occupancyRate || 0}%`}
            subtitle={`${stats.occupiedBeds || 0} occupied`}
            icon={<BarChart3 className="w-5 h-5" />}
            accentColor="green"
          />

          <StatsCard
            title="Staff Members"
            value={stats.totalWardens || 0}
            subtitle="Wardens"
            icon={<Settings className="w-5 h-5" />}
            accentColor="purple"
          />
        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Block Occupancy */}
          <div className="card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-1">Block Occupancy</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Rooms occupied per block
            </p>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={occupancyData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="block" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
                <Tooltip />

                {/* total - dark gray */}
                <Bar dataKey="total" fill="#374151" radius={[0, 4, 4, 0]} />

                {/* occupied - strong yellow */}
                <Bar dataKey="occupied" fill="#facc15" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CGPA Distribution */}
          <div className="card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-1">CGPA Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Student CGPA across ranges
            </p>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cgpaData}>
                <XAxis dataKey="range" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />

                <Bar dataKey="count" fill="#facc15" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* QUICK ACTIONS + ACTIVITY */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Quick Actions */}
          <div className="card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: <Upload className="w-4 h-4" />, label: "Upload CGPA CSV", href: "/admin/cgpa" },
                { icon: <BedDouble className="w-4 h-4" />, label: "Start Allocation", href: "/admin/rooms" },
                { icon: <Users className="w-4 h-5" />, label: "Manage Students", href: "/admin/students" },
                { icon: <Settings className="w-4 h-4" />, label: "User Management", href: "/admin/users" },
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

          {/* Recent Activity */}
          <div className="lg:col-span-2 card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>

            <div className="space-y-3">
              {recentActions.map((a: any, i) => (
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