import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";
import API from "@/api";

const statusColor: Record<string, string> = {
  Returned: "status-badge-approved",
  Outside: "status-badge-inprogress",
};

export default function MovementLog() {
  const [status, setStatus] = useState<"in" | "out">("in");
  const [movementHistory, setMovementHistory] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await API.get("/student/movement");

      const formatted = res.data.map((m: any) => ({
        date: new Date(m.createdAt).toLocaleDateString(),
        timeOut: m.outTime ? new Date(m.outTime).toLocaleTimeString() : "—",
        timeIn: m.inTime ? new Date(m.inTime).toLocaleTimeString() : "—",
        status: m.status === "OUT" ? "Outside" : "Returned"
      }));

      setMovementHistory(formatted);

      if (res.data.length > 0) {
        setStatus(res.data[0].status === "OUT" ? "out" : "in");
      }

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckout = async () => {
    try {
      await API.post("/student/movement/out", { reason: "Going out" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckin = async () => {
    try {
      await API.post("/student/movement/in");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Movement Log</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your hostel entry and exit</p>
        </div>

        {/* Action card */}
        <div className="card-elevated rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${status === "in" ? "bg-green-500/15" : "bg-orange-500/15"}`}>
                {status === "in" ? (
                  <ArrowDownCircle className="w-7 h-7 text-green-400" />
                ) : (
                  <ArrowUpCircle className="w-7 h-7 text-orange-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <p className={`text-xl font-bold ${status === "in" ? "text-green-400" : "text-orange-400"}`}>
                  {status === "in" ? "Inside Hostel" : "Outside Hostel"}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> Last updated: Today 09:00 AM
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCheckout}
                disabled={status === "out"}
                variant="outline"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500 disabled:opacity-30"
              >
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Check OUT
              </Button>
              <Button
                onClick={handleCheckin}
                disabled={status === "in"}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
              >
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                Check IN
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Movement History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Date", "Time Out", "Time In", "Status"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movementHistory.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground">{row.date}</td>
                    <td className="px-6 py-4 text-sm text-orange-400 font-medium">{row.timeOut}</td>
                    <td className="px-6 py-4 text-sm text-green-400 font-medium">{row.timeIn}</td>
                    <td className="px-6 py-4">
                      <span className={statusColor[row.status]}>{row.status}</span>
                    </td>
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
