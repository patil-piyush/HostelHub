import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, MoreHorizontal } from "lucide-react";

const students = [
  { id: "2021CS001", name: "Arjun Sharma", email: "arjun@hostel.edu", room: "A-204", cgpa: 8.7, status: "Active" },
  { id: "2021CS002", name: "Priya Kumar", email: "priya@hostel.edu", room: "B-302", cgpa: 9.1, status: "Active" },
  { id: "2021CS003", name: "Rahul Mehta", email: "rahul@hostel.edu", room: "A-103", cgpa: 7.2, status: "Active" },
  { id: "2021CS004", name: "Sneha Reddy", email: "sneha@hostel.edu", room: "C-201", cgpa: 8.0, status: "On Leave" },
  { id: "2021CS005", name: "Kiran Patel", email: "kiran@hostel.edu", room: "A-302", cgpa: 6.8, status: "Active" },
  { id: "2021CS006", name: "Aditya Kumar", email: "aditya@hostel.edu", room: "B-101", cgpa: 9.5, status: "Active" },
];

export default function ManageStudents() {
  const [search, setSearch] = useState("");

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.room.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Students</h1>
            <p className="text-muted-foreground text-sm mt-1">View and manage all hostel students</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow-yellow">
            <UserPlus className="w-4 h-4 mr-2" /> Add Student
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll number, or room..."
            className="bg-card border-border pl-11 text-foreground placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        {/* Table */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">All Students</h3>
            <span className="text-xs text-muted-foreground">{filtered.length} students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Roll No.", "Name", "Room", "CGPA", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{s.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs font-semibold">{s.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{s.room}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${s.cgpa >= 8 ? "text-primary" : s.cgpa >= 7.5 ? "text-green-400" : "text-muted-foreground"}`}>
                        {s.cgpa}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={s.status === "Active" ? "status-badge-approved" : "status-badge-pending"}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
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
