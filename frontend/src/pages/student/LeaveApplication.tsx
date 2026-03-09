import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Calendar, Send } from "lucide-react";

const leaveHistory = [
  { id: "L001", date: "Dec 15–18, 2024", duration: "3 days", reason: "Family function", status: "Approved" },
  { id: "L002", date: "Nov 22–23, 2024", duration: "1 day", reason: "Medical checkup", status: "Approved" },
  { id: "L003", date: "Nov 10–11, 2024", duration: "2 days", reason: "Personal work", status: "Rejected" },
  { id: "L004", date: "Jan 3–5, 2025", duration: "3 days", reason: "New Year holiday", status: "Pending" },
];

const statusClass: Record<string, string> = {
  Approved: "status-badge-approved",
  Rejected: "status-badge-rejected",
  Pending: "status-badge-pending",
};

export default function LeaveApplication() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFrom(""); setTo(""); setReason("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leave Application</h1>
          <p className="text-muted-foreground text-sm mt-1">Apply for hostel leave and track approvals</p>
        </div>

        {submitted && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
            <span className="text-lg">✓</span>
            <span className="text-sm font-medium">Leave application submitted successfully!</span>
          </div>
        )}

        {/* Form */}
        <div className="card-elevated rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">New Leave Request</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="from" className="text-sm text-foreground mb-1.5 block">Leave From Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} required
                    className="bg-input border-border focus:border-primary pl-10 text-foreground"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="to" className="text-sm text-foreground mb-1.5 block">Leave To Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} required
                    className="bg-input border-border focus:border-primary pl-10 text-foreground"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="reason" className="text-sm text-foreground mb-1.5 block">Reason for Leave</Label>
              <Textarea
                id="reason" value={reason} onChange={(e) => setReason(e.target.value)} required
                placeholder="Please describe the reason for your leave application..."
                rows={4}
                className="bg-input border-border focus:border-primary text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow-yellow">
              <Send className="w-4 h-4 mr-2" /> Submit Application
            </Button>
          </form>
        </div>

        {/* History */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Leave History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["ID", "Date", "Duration", "Reason", "Status"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaveHistory.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-primary font-mono">{row.id}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{row.date}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{row.duration}</td>
                    <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">{row.reason}</td>
                    <td className="px-6 py-4"><span className={statusClass[row.status]}>{row.status}</span></td>
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
