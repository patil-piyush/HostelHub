import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, MoreHorizontal } from "lucide-react";
import API from "@/api";
import { useNavigate } from "react-router-dom";

export default function ManageStudents() {

  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ FETCH
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/admin/students/${id}`);
      setMessage("Student deleted successfully ✅");
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ AUTO CLEAR MESSAGE
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const mappedStudents = students.map((s) => ({
    id: s.id,
    roll: s.PRN || "",
    name: s.name || "",
    email: s.email || "",
    room: s.Room ? `Room ${s.Room.roomNumber}` : "-",
    cgpa: s.CGPA || 0,
    status: "Active"
  }));

  // ✅ FILTER SAFE
  const filtered = mappedStudents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll.toLowerCase().includes(search.toLowerCase()) ||
    s.room.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Students</h1>
            <p className="text-muted-foreground text-sm mt-1">
              View and manage all hostel students
            </p>
          </div>

          <Button
            onClick={() => navigate("/admin/register-student")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow-yellow"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add Student
          </Button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="p-3 rounded-lg bg-green-500/10 text-green-400 text-sm">
            {message}
          </div>
        )}

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll number, or room..."
            className="bg-card border-border pl-11"
          />
        </div>

        {/* TABLE */}
        <div className="card-elevated rounded-xl overflow-hidden">

          <div className="px-6 py-4 border-b border-border flex justify-between">
            <h3 className="font-semibold text-foreground">All Students</h3>
            <span className="text-xs text-muted-foreground">
              {filtered.length} students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">

              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Roll No.", "Name", "Room", "CGPA", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs">{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>

                {/* 🔥 LOADING */}
                {loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-muted-foreground">
                      Loading students...
                    </td>
                  </tr>
                )}

                {/* 🔥 EMPTY STATE */}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-muted-foreground">
                      No students found
                    </td>
                  </tr>
                )}

                {/* DATA */}
                {!loading && filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border hover:bg-muted/20">

                    <td className="px-6 py-4 font-mono">{s.roll}</td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">{s.room}</td>

                    <td className="px-6 py-4">
                      <span className={`font-bold ${
                        s.cgpa >= 8 ? "text-primary" :
                        s.cgpa >= 7.5 ? "text-green-400" :
                        "text-muted-foreground"
                      }`}>
                        {s.cgpa}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="status-badge-approved">{s.status}</span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg hover:bg-muted"
                      >
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