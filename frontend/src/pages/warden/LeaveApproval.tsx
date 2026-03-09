import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const initialRequests = [
  { id: "L001", student: "Arjun Sharma", room: "A-204", dates: "Dec 24–26", duration: "3 days", reason: "Family function at hometown", status: "Pending" },
  { id: "L002", student: "Priya Kumar", room: "B-302", dates: "Dec 25–27", duration: "3 days", reason: "Medical emergency", status: "Pending" },
  { id: "L003", student: "Rahul Mehta", room: "A-103", dates: "Dec 22–23", duration: "2 days", reason: "College event outstation", status: "Pending" },
  { id: "L004", student: "Sneha Reddy", room: "C-201", dates: "Dec 20–21", duration: "1 day", reason: "Personal work", status: "Approved" },
  { id: "L005", student: "Kiran Patel", room: "A-302", dates: "Dec 18–20", duration: "2 days", reason: "Parents visiting", status: "Rejected" },
];

const statusClass: Record<string, string> = {
  Pending: "status-badge-pending",
  Approved: "status-badge-approved",
  Rejected: "status-badge-rejected",
};

export default function LeaveApproval() {
  const [requests, setRequests] = useState(initialRequests);

  const updateStatus = (id: string, status: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const pending = requests.filter((r) => r.status === "Pending").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leave Requests</h1>
            <p className="text-muted-foreground text-sm mt-1">Review and approve student leave applications</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">{pending} Pending</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending", count: requests.filter((r) => r.status === "Pending").length, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
            { label: "Approved", count: requests.filter((r) => r.status === "Approved").length, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
            { label: "Rejected", count: requests.filter((r) => r.status === "Rejected").length, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
          ].map((s) => (
            <div key={s.label} className={`card-elevated rounded-xl p-4 ${s.border}`}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">All Leave Applications</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Student", "Room", "Dates", "Duration", "Reason", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">{r.student}</p>
                      <p className="text-xs text-muted-foreground">{r.id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{r.room}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{r.dates}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{r.duration}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{r.reason}</td>
                    <td className="px-6 py-4"><span className={statusClass[r.status]}>{r.status}</span></td>
                    <td className="px-6 py-4">
                      {r.status === "Pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(r.id, "Approved")}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-3 text-xs font-semibold"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(r.id, "Rejected")}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-7 px-3 text-xs"
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      {r.status !== "Pending" && (
                        <span className="text-xs text-muted-foreground italic">Actioned</span>
                      )}
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
