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

      //  REAL DATA FOR GRAPH (based on movement)
      const daysMap: any = {
        Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
      };

      movementRes.data.forEach((m: any) => {
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

  //  BETTER STATUS STYLING
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Approved":
        return "px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20";
      case "Rejected":
        return "px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20";
      case "Pending":
        return "px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      default:
        return "px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Warden Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor all hostel activities and student movement
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Students Outside" value={movement.length} icon={<Users />} accentColor="orange" />
          <StatsCard title="Pending Leaves" value={stats.pendingLeaves || 0} icon={<FileText />} accentColor="primary" />
          <StatsCard title="Active Complaints" value={stats.openComplaints || 0} icon={<MessageSquare />} accentColor="red" />
          <StatsCard title="Resolved Today" value={stats.resolvedComplaints || 0} icon={<CheckCircle />} accentColor="green" />
        </div>

        {/* Chart + Recent Leaves */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Chart */}
          <div className="lg:col-span-2 card-elevated rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Students Outside This Week
            </h3>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                {/*  COLOR FIX */}
                <Bar dataKey="students" fill="#facc15" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Leaves */}
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
                  <span className={getStatusClass(l.status)}>
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
            <span className="status-badge-inprogress">
              {movement.length} students
            </span>
          </div>

          <table className="w-full">
            <thead>
              <tr>
                {["Student", "Start", "End", "Status"].map(h => (
                  <th key={h} className="px-6 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {movement.map((m: any, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">{m.Student?.name || "Unknown"}</td>

                  {/*  DATE FIX */}
                  <td className="px-6 py-4">{formatDate(m.outTime)}</td>
                  <td className="px-6 py-4">{m.inTime ? formatDate(m.inTime) : "Not Returned"}</td>

                  {/*  BETTER STATUS */}
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {m.status === "OUT" ? "On Leave" : "Returned"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}