import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, AlertCircle } from "lucide-react";

const staff = ["Raj Singh", "Mohan Das", "Suresh Kumar", "Amit Verma"];

const initialComplaints = [
  { id: "C001", student: "Arjun Sharma", room: "A-204", category: "Electrical", desc: "Light not working in room", status: "Open", assignedStaff: "" },
  { id: "C002", student: "Priya Kumar", room: "B-302", category: "Water", desc: "Tap leakage in bathroom", status: "In Progress", assignedStaff: "Raj Singh" },
  { id: "C003", student: "Rahul Mehta", room: "A-103", category: "Internet", desc: "WiFi keeps disconnecting", status: "Open", assignedStaff: "" },
  { id: "C004", student: "Sneha Reddy", room: "C-201", category: "Cleaning", desc: "Common area not cleaned", status: "In Progress", assignedStaff: "Mohan Das" },
  { id: "C005", student: "Kiran Patel", room: "A-302", category: "Electrical", desc: "Power outlet not working", status: "Resolved", assignedStaff: "Suresh Kumar" },
];

const statusClass: Record<string, string> = {
  Open: "status-badge-open",
  "In Progress": "status-badge-inprogress",
  Resolved: "status-badge-resolved",
};

const catColor: Record<string, string> = {
  Electrical: "text-yellow-400",
  Water: "text-blue-400",
  Internet: "text-purple-400",
  Cleaning: "text-green-400",
  Other: "text-muted-foreground",
};

export default function WardenComplaints() {
  const [complaints, setComplaints] = useState(initialComplaints);

  const assignStaff = (id: string, staffMember: string) => {
    setComplaints((prev) => prev.map((c) => c.id === id ? { ...c, assignedStaff: staffMember, status: "In Progress" } : c));
  };

  const updateStatus = (id: string, status: string) => {
    setComplaints((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Complaint Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Assign and track maintenance complaints</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Open", count: complaints.filter((c) => c.status === "Open").length, cls: "text-blue-400", border: "border-blue-500/20" },
            { label: "In Progress", count: complaints.filter((c) => c.status === "In Progress").length, cls: "text-orange-400", border: "border-orange-500/20" },
            { label: "Resolved", count: complaints.filter((c) => c.status === "Resolved").length, cls: "text-green-400", border: "border-green-500/20" },
          ].map((s) => (
            <div key={s.label} className={`card-elevated rounded-xl p-4 ${s.border}`}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.cls}`}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">All Complaints</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["ID", "Student", "Category", "Description", "Status", "Assign Staff", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 text-sm text-primary font-mono">{c.id}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground">{c.student}</p>
                      <p className="text-xs text-muted-foreground">Room {c.room}</p>
                    </td>
                    <td className={`px-5 py-4 text-sm font-medium ${catColor[c.category]}`}>{c.category}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground max-w-xs truncate">{c.desc}</td>
                    <td className="px-5 py-4"><span className={statusClass[c.status]}>{c.status}</span></td>
                    <td className="px-5 py-4">
                      {c.status !== "Resolved" ? (
                        <Select value={c.assignedStaff} onValueChange={(val) => assignStaff(c.id, val)}>
                          <SelectTrigger className="bg-input border-border h-8 text-xs w-36 text-foreground">
                            <SelectValue placeholder="Assign staff" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {staff.map((s) => (
                              <SelectItem key={s} value={s} className="text-foreground text-xs hover:bg-muted focus:bg-muted">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground">{c.assignedStaff}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {c.status === "In Progress" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(c.id, "Resolved")}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2 text-xs"
                          >
                            Resolve
                          </Button>
                        )}
                        {c.status === "Open" && c.assignedStaff && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(c.id, "In Progress")}
                            className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 h-7 px-2 text-xs"
                          >
                            In Progress
                          </Button>
                        )}
                      </div>
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
