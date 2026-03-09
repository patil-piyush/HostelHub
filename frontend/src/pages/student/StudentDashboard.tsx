import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { BedDouble, FileText, MessageSquare, MoveRight, TrendingUp, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const movementData = [
  { day: "Mon", out: 12, in: 10 },
  { day: "Tue", out: 8, in: 7 },
  { day: "Wed", out: 15, in: 14 },
  { day: "Thu", out: 20, in: 18 },
  { day: "Fri", out: 25, in: 22 },
  { day: "Sat", out: 18, in: 16 },
  { day: "Sun", out: 10, in: 9 },
];

const complaintData = [
  { name: "Open", value: 3, color: "#60A5FA" },
  { name: "In Progress", value: 2, color: "#F97316" },
  { name: "Resolved", value: 8, color: "#4ADE80" },
];

const recentActivity = [
  { action: "Checked OUT", time: "10:30 AM", date: "Today", color: "text-orange-400" },
  { action: "Leave Approved", time: "09:15 AM", date: "Yesterday", color: "text-green-400" },
  { action: "Complaint Resolved", time: "03:45 PM", date: "Mon", color: "text-primary" },
  { action: "Checked IN", time: "08:00 PM", date: "Mon", color: "text-blue-400" },
];

export default function StudentDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Good morning, Arjun 👋</h1>
            <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your hostel life</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-sm font-medium">Room A-204 · Block A</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Current Room" value="A-204" subtitle="Block A, Floor 2" icon={<BedDouble className="w-5 h-5" />} accentColor="blue" />
          <StatsCard title="Leave Status" value="Active" subtitle="Returns Dec 28" icon={<FileText className="w-5 h-5" />} accentColor="green" />
          <StatsCard title="Active Complaints" value="2" subtitle="1 In Progress" icon={<MessageSquare className="w-5 h-5" />} accentColor="orange" trend={{ value: -1, label: "vs last week" }} />
          <StatsCard title="Movements" value="14" subtitle="This month" icon={<MoveRight className="w-5 h-5" />} accentColor="primary" trend={{ value: 12, label: "vs last month" }} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Movement Chart */}
          <div className="lg:col-span-2 card-elevated rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-foreground">Movement Statistics</h3>
                <p className="text-xs text-muted-foreground mt-0.5">This week's hostel movement</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Out</span>
                <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" />In</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={movementData}>
                <defs>
                  <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(48,96%,53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(48,96%,53%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,18%)", borderRadius: "8px", color: "hsl(0,0%,95%)" }} />
                <Area type="monotone" dataKey="out" stroke="hsl(48,96%,53%)" strokeWidth={2} fill="url(#gradOut)" />
                <Area type="monotone" dataKey="in" stroke="#60A5FA" strokeWidth={2} fill="url(#gradIn)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Complaint Pie */}
          <div className="card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-1">Complaint Status</h3>
            <p className="text-xs text-muted-foreground mb-4">Total: 13 complaints</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={complaintData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {complaintData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(0,0%,10%)", border: "1px solid hsl(0,0%,18%)", borderRadius: "8px", color: "hsl(0,0%,95%)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {complaintData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </span>
                  <span className="font-medium text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-elevated rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <button className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-current" style={{ color: a.color === "text-primary" ? "hsl(48,96%,53%)" : undefined }} />
                  <span className={`text-sm font-medium ${a.color}`}>{a.action}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{a.date}</p>
                  <p className="text-xs text-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
