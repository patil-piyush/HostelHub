import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const initialComplaints = [
  { id: "C001", room: "A-204", category: "Electrical", desc: "Light not working in room", priority: "High", status: "Assigned" },
  { id: "C002", room: "B-302", category: "Water", desc: "Tap leakage in bathroom needs immediate fix", priority: "Critical", status: "In Progress" },
  { id: "C003", room: "A-103", category: "Internet", desc: "WiFi access point needs reset", priority: "Medium", status: "Assigned" },
  { id: "C004", room: "C-201", category: "Cleaning", desc: "Common corridor not cleaned for 2 days", priority: "Low", status: "In Progress" },
  { id: "C005", room: "A-302", category: "Electrical", desc: "Power outlet short circuit", priority: "Critical", status: "Assigned" },
];

const priorityClass: Record<string, string> = {
  Critical: "bg-red-500/15 text-red-400 border border-red-500/30 text-xs px-2 py-0.5 rounded-full",
  High: "bg-orange-500/15 text-orange-400 border border-orange-500/30 text-xs px-2 py-0.5 rounded-full",
  Medium: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-xs px-2 py-0.5 rounded-full",
  Low: "bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full",
};

const catColor: Record<string, string> = {
  Electrical: "text-yellow-400",
  Water: "text-blue-400",
  Internet: "text-purple-400",
  Cleaning: "text-green-400",
  Other: "text-muted-foreground",
};

export default function MaintenanceDashboard() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [search, setSearch] = useState("");

  const updateStatus = (id: string, status: string) => {
    setComplaints((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  };

  const filtered = complaints.filter((c) =>
    c.room.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const inProgress = complaints.filter((c) => c.status === "In Progress").length;
  const assigned = complaints.filter((c) => c.status === "Assigned").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assigned Complaints</h1>
          <p className="text-muted-foreground text-sm mt-1">View and update the status of your assigned complaints</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card-elevated rounded-xl p-4 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Assigned</p>
            </div>
            <p className="text-3xl font-bold text-primary">{assigned}</p>
          </div>
          <div className="card-elevated rounded-xl p-4 border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">In Progress</p>
            </div>
            <p className="text-3xl font-bold text-orange-400">{inProgress}</p>
          </div>
          <div className="card-elevated rounded-xl p-4 border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Resolved</p>
            </div>
            <p className="text-3xl font-bold text-green-400">{resolved}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints by ID, room or category..."
            className="bg-card border-border pl-11 text-foreground placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        {/* Complaint cards */}
        <div className="space-y-4">
          {filtered.map((c) => (
            <div key={c.id} className={`card-elevated rounded-xl p-6 transition-all hover:border-primary/20 ${c.status === "Resolved" ? "opacity-60" : ""}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className={`text-sm font-bold ${catColor[c.category]}`}>{c.category.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-primary">{c.id}</span>
                      <span className={`text-sm font-medium ${catColor[c.category]}`}>{c.category}</span>
                      <span className={priorityClass[c.priority]}>{c.priority}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{c.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">Room: {c.room}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-2">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <span className={
                      c.status === "Resolved" ? "status-badge-resolved" :
                      c.status === "In Progress" ? "status-badge-inprogress" :
                      "status-badge-open"
                    }>{c.status}</span>
                  </div>
                  {c.status === "Assigned" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(c.id, "In Progress")}
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 whitespace-nowrap"
                    >
                      Start Work
                    </Button>
                  )}
                  {c.status === "In Progress" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(c.id, "Resolved")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap shadow-glow-yellow"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1.5" /> Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-3">🔍</p>
              <p>No complaints found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
