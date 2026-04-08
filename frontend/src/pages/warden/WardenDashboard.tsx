import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Users, FileText, MessageSquare, CheckCircle, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import API from "@/api";

export default function WardenDashboard() {
  const [stats, setStats] = useState<any>({});
  const [leaves, setLeaves] = useState([]);
  const [movement, setMovement] = useState([]);
  const [weekData, setWeekData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const fetchData = async () => {
    try {
      const [statsRes, leavesRes, movementRes] = await Promise.all([
        API.get("/warden/dashboard"),
        API.get("/warden/leave"),
        API.get("/warden/movement"),
      ]);

      setStats(statsRes.data);
      setLeaves(leavesRes.data.slice(0, 4));
      setMovement(movementRes.data);

      // 📊 Weekly OUT movement only
      const daysMap: any = {
        Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
      };

      movementRes.data
        .filter((m: any) => m.status === "OUT")
        .forEach((m: any) => {
          const day = new Date(m.outTime).toLocaleDateString("en-US", { weekday: "short" });
          daysMap[day] += 1;
        });

      const chartData = Object.keys(daysMap).map((day) => ({
        day,
        students: daysMap[day],
      }));

      setWeekData(chartData);

    } catch (err) {
      console.error(err);
    }
  };

  // 🎨 Leave status styling
  const getLeaveStatusClass = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  // 🔥 Only OUT students
  const outsideStudents = movement.filter((m: any) => m.status === "OUT");

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Warden Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor real-time hostel movement and activities
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Students Outside" value={outsideStudents.length} icon={<Users />} accentColor="orange" />
          <StatsCard title="Pending Leaves" value={stats.pendingLeaves || 0} icon={<FileText />} accentColor="primary" />
          <StatsCard title="Active Complaints" value={stats.openComplaints || 0} icon={<MessageSquare />} accentColor="red" />
          <StatsCard title="Resolved Today" value={stats.resolvedComplaints || 0} icon={<CheckCircle />} accentColor="green" />
        </div>

        {/* Chart + Leaves */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Chart */}
          <div className="lg:col-span-2 card-elevated rounded-xl p-6">
            <h3 className="font-semibold mb-4">Students Outside This Week</h3>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#f97316" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Leaves */}
          <div className="card-elevated rounded-xl p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Recent Leave Requests</h3>
              <span className="text-xs text-primary flex items-center gap-1">
                All <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>

            <div className="space-y-3">
              {leaves.map((l: any, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{l.Student?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(l.startDate)} → {formatDate(l.endDate)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full border ${getLeaveStatusClass(l.status)}`}>
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Movement Table */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between">
            <h3 className="font-semibold">Currently Outside</h3>
            <span className="px-3 py-1 text-xs bg-orange-500/10 text-orange-400 rounded-full">
              {outsideStudents.length} students
            </span>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 border-b">
                {["Student","Out Time","Status"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs uppercase text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {outsideStudents.length > 0 ? (
                outsideStudents.map((m: any, i) => (
                  <tr key={i} className="border-b hover:bg-muted/20 transition">
                    <td className="px-6 py-4 font-medium">
                      {m.Student?.name || "Unknown"}
                    </td>

                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(m.outTime)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs border bg-orange-500/10 text-orange-400 border-orange-500/20">
                        Outside
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-muted-foreground">
                    No students currently outside 🚫
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}