import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Users, FileText, MessageSquare, CheckCircle, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const weekData = [
  { day: "Mon", students: 12 },
  { day: "Tue", students: 8 },
  { day: "Wed", students: 15 },
  { day: "Thu", students: 20 },
  { day: "Fri", students: 25 },
  { day: "Sat", students: 18 },
  { day: "Sun", students: 10 },
];

const recentLeaves = [
  { name: "Priya K.", room: "A-201", status: "Pending", dates: "Dec 24–26" },
  { name: "Rahul M.", room: "B-302", status: "Pending", dates: "Dec 25–27" },
  { name: "Sneha R.", room: "A-104", status: "Approved", dates: "Dec 22–24" },
  { name: "Arjun S.", room: "A-204", status: "Approved", dates: "Dec 20–22" },
];

const statusClass: Record<string, string> = {
  Pending: "status-badge-pending",
  Approved: "status-badge-approved",
  Rejected: "status-badge-rejected",
};

export default function WardenDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Warden Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor all hostel activities and student movement</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Students Outside" value="24" subtitle="Of 280 total" icon={<Users className="w-5 h-5" />} accentColor="orange" trend={{ value: 8, label: "vs yesterday" }} />
          <StatsCard title="Pending Leaves" value="12" subtitle="Awaiting approval" icon={<FileText className="w-5 h-5" />} accentColor="primary" />
          <StatsCard title="Active Complaints" value="8" subtitle="3 critical" icon={<MessageSquare className="w-5 h-5" />} accentColor="red" />
          <StatsCard title="Resolved Today" value="5" subtitle="Complaints & leaves" icon={<CheckCircle className="w-5 h-5" />} accentColor="green" trend={{ value: 25, label: "vs yesterday" }} />
        </div>

        {/* Chart + Recent leaves */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-elevated rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground">Students Outside This Week</h3>
                <p className="text-xs text-muted-foreground">Daily count</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData}>
                <XAxis dataKey="day" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,18%)", borderRadius: "8px", color: "hsl(0,0%,95%)" }} />
                <Bar dataKey="students" fill="hsl(48,96%,53%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-elevated rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Recent Leave Requests</h3>
              <button className="text-xs text-primary hover:underline flex items-center gap-1">All <ArrowUpRight className="w-3 h-3" /></button>
            </div>
            <div className="space-y-3">
              {recentLeaves.map((l, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.name}</p>
                    <p className="text-xs text-muted-foreground">Room {l.room} · {l.dates}</p>
                  </div>
                  <span className={statusClass[l.status]}>{l.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student movement table */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Currently Outside</h3>
            <span className="px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-medium border border-orange-500/30">24 students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Student", "Room", "Checked Out", "Expected Return", "Status"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Arjun Sharma", room: "A-204", out: "09:00 AM", ret: "08:00 PM", status: "On Leave" },
                  { name: "Rahul Mehta", room: "B-302", out: "11:30 AM", ret: "10:00 PM", status: "Day Out" },
                  { name: "Kavya Patel", room: "A-103", out: "08:00 AM", ret: "06:00 PM", status: "Day Out" },
                  { name: "Aditya Kumar", room: "C-201", out: "02:00 PM", ret: "11:00 PM", status: "Day Out" },
                ].map((s, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{s.room}</td>
                    <td className="px-6 py-4 text-sm text-orange-400">{s.out}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{s.ret}</td>
                    <td className="px-6 py-4"><span className="status-badge-inprogress">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
