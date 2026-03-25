import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import API from "@/api";
import { BedDouble, FileText, MessageSquare, MoveRight, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";


API.interceptors.request.use((config) => {
  const userToken = localStorage.getItem("userToken");
  if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
  return config;
});

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, complaintRes, movementRes] = await Promise.all([
          API.get("/student/profile"),
          API.get("/student/complaints"),
          API.get("/student/movement"),
        ]);

        setProfile(profileRes.data);
        setComplaints(complaintRes.data);
        setMovements(movementRes.data);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ===== Derived Data =====

  const room = profile?.Room?.roomNumber || "Not Assigned";

  const complaintStats = [
    { name: "Open", value: complaints.filter(c => c.status === "open").length, color: "#60A5FA" },
    { name: "In Progress", value: complaints.filter(c => c.status === "in_progress").length, color: "#F97316" },
    { name: "Resolved", value: complaints.filter(c => c.status === "resolved").length, color: "#4ADE80" },
  ];

  const movementData = movements.slice(0, 7).map((m: any) => ({
    day: new Date(m.createdAt).toLocaleDateString("en-US", { weekday: "short" }),
    out: m.status === "OUT" ? 1 : 0,
    in: m.status === "IN" ? 1 : 0,
  }));

  const recentActivity = movements.slice(0, 5).map((m: any) => ({
    action: m.status === "OUT" ? "Checked OUT" : "Checked IN",
    time: new Date(m.createdAt).toLocaleTimeString(),
    date: new Date(m.createdAt).toDateString(),
    color: m.status === "OUT" ? "text-orange-400" : "text-blue-400",
  }));

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Good morning, {profile?.name} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Here's what's happening with your hostel life
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-sm font-medium">
              Room {room}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Current Room" value={room} subtitle="Your allocated room" icon={<BedDouble />} />
          <StatsCard title="Leave Applications" value="--" subtitle="Coming soon" icon={<FileText />} />
          <StatsCard title="Active Complaints" value={complaints.length.toString()} subtitle="Total complaints" icon={<MessageSquare />} />
          <StatsCard title="Movements" value={movements.length.toString()} subtitle="Total logs" icon={<MoveRight />} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Movement */}
          <div className="lg:col-span-2 card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Movement Statistics</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={movementData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="out" stroke="orange" />
                <Area type="monotone" dataKey="in" stroke="blue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Complaint */}
          <div className="card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-2">Complaint Status</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={complaintStats} dataKey="value">
                  {complaintStats.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity */}
        <div className="card-elevated rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          {recentActivity.map((a, i) => (
            <div key={i} className="flex justify-between text-sm py-2 border-b">
              <span className={a.color}>{a.action}</span>
              <span>{a.time}</span>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}