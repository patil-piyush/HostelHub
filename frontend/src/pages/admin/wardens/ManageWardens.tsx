import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Pencil, Trash2 } from "lucide-react";
import API from "@/api";
import { useNavigate } from "react-router-dom";

export default function ManageWardens() {

  const [wardens, setWardens] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchWardens();
  }, []);

  const fetchWardens = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/wardens");
      setWardens(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this warden?")) return;

    await API.delete(`/admin/wardens/${id}`);
    setMessage("Warden deleted successfully");
    fetchWardens();
  };

  const filtered = wardens.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Wardens</h1>
            <p className="text-muted-foreground text-sm">
              Manage all hostel wardens
            </p>
          </div>

          <Button onClick={() => navigate("/admin/register-warden")}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Warden
          </Button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="bg-green-500/10 text-green-400 p-3 rounded">
            {message}
          </div>
        )}

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <Input
            placeholder="Search wardens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

          {loading && <p>Loading...</p>}

          {!loading && filtered.map((w) => (
            <div key={w.id} className="card-elevated p-4 rounded-xl">

              <h3 className="font-semibold text-lg">{w.name}</h3>

              <p className="text-sm text-muted-foreground">{w.email}</p>
              <p className="text-sm">{w.contactNumber}</p>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-4">

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/admin/edit-warden/${w.id}`)}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(w.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>

              </div>

            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <p className="text-muted-foreground">No wardens found</p>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
}