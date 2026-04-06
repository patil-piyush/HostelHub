import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import API from "@/api";
import { useParams, useNavigate } from "react-router-dom";

export default function EditWarden() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    contactNumber: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) fetchWarden();
  }, [id]);

  // ================= FETCH =================
  const fetchWarden = async () => {
    try {
      const res = await API.get("/admin/wardens");

      const w = res.data.find((x: any) => x.id == id);

      if (!w) {
        alert("Warden not found");
        navigate("/admin/wardens");
        return;
      }

      setForm({
        name: w.name || "",
        email: w.email || "",
        contactNumber: w.contactNumber || ""
      });

    } catch (err) {
      console.error(err);
      alert("Failed to load warden");
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!form.name || !form.email) {
      alert("Name and Email are required");
      return;
    }

    try {
      setSaving(true);

      await API.put(`/admin/wardens/${id}`, form);

      alert("Warden updated successfully ✅");
      navigate("/admin/wardens");

    } catch (err: any) {
      alert(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <p className="text-muted-foreground">Loading warden...</p>
        </div>
      </DashboardLayout>
    );
  }

  // ================= UI =================
  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Edit Warden</h1>
          <p className="text-muted-foreground text-sm">
            Update warden details safely
          </p>
        </div>

        {/* CARD */}
        <div className="card-elevated p-6 rounded-xl space-y-4">

          {/* NAME */}
          <div>
            <label className="text-sm">Name</label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm">Email</label>
            <Input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          {/* CONTACT */}
          <div>
            <label className="text-sm">Contact Number</label>
            <Input
              value={form.contactNumber}
              onChange={(e) =>
                setForm({ ...form, contactNumber: e.target.value })
              }
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">

            <Button
              onClick={handleUpdate}
              disabled={saving}
              className="flex-1"
            >
              {saving ? "Updating..." : "Update Warden"}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/admin/wardens")}
            >
              Cancel
            </Button>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}