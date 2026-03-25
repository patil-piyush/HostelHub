import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send } from "lucide-react";
import API from "@/api";
import { useEffect } from "react";
const categories = ["Electrical", "Water", "Internet", "Cleaning", "Other"];


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

export default function ComplaintSystem() {
  const [category, setCategory] = useState("");
  const [room, setRoom] = useState("A-204");
  const [desc, setDesc] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [complaints, setComplaints] = useState<any[]>([]);

  // ONLY LOGIC CHANGES

  useEffect(() => {
    API.get("/student/complaints")
      .then(res => setComplaints(res.data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await API.post("/student/complaints", {
        title: category,
        category,
        description: desc
      });

      setSubmitted(true);
      setCategory("");
      setDesc("");

      const res = await API.get("/student/complaints");
      setComplaints(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Complaint System</h1>
          <p className="text-muted-foreground text-sm mt-1">Raise and track hostel maintenance complaints</p>
        </div>

        {submitted && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
            <span className="text-lg">✓</span>
            <span className="text-sm font-medium">Complaint registered successfully! ID: C00{Math.floor(Math.random() * 9) + 4}</span>
          </div>
        )}

        {/* Form */}
        <div className="card-elevated rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">New Complaint</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label className="text-sm text-foreground mb-1.5 block">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-input border-border focus:border-primary text-foreground">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((c) => (
                      <SelectItem key={c} value={c} className="text-foreground hover:bg-muted focus:bg-muted">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="room" className="text-sm text-foreground mb-1.5 block">Room Number</Label>
                <Input
                  id="room" value={room} onChange={(e) => setRoom(e.target.value)} required
                  className="bg-input border-border focus:border-primary text-foreground"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="desc" className="text-sm text-foreground mb-1.5 block">Description</Label>
              <Textarea
                id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} required
                placeholder="Describe the issue in detail..."
                rows={4}
                className="bg-input border-border focus:border-primary text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow-yellow">
              <Send className="w-4 h-4 mr-2" /> Submit Complaint
            </Button>
          </form>
        </div>

        {/* Complaints Table */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">My Complaints</h3>
            <span className="text-xs text-muted-foreground">{complaints.length} complaints</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["ID", "Category", "Description", "Status", "Assigned Staff"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-primary font-mono">{c.id}</td>
                    <td className={`px-6 py-4 text-sm font-medium ${catColor[c.category]}`}>{c.category}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">{c.description}</td>
                    <td className="px-6 py-4"><span className={statusClass[c.status]}>{c.status}</span></td>
                    <td className="px-6 py-4 text-sm text-foreground">{c.staff}</td>
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
