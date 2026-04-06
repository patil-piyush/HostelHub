import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import API from "@/api";
import { useNavigate } from "react-router-dom";

export default function RegisterWarden() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    contactNumber: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= HANDLE SUBMIT =================
  const handleSubmit = async () => {

    // ✅ VALIDATION
    if (!form.name || !form.email || !form.password) {
      setError("Name, Email and Password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await API.post("/admin/wardens", form);

      alert("Warden created successfully ✅");
      navigate("/admin/wardens");

    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create warden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Register Warden</h1>
          <p className="text-muted-foreground text-sm">
            Add a new hostel warden to the system
          </p>
        </div>

        {/* CARD */}
        <div className="card-elevated p-6 rounded-xl space-y-4">

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded">
              {error}
            </div>
          )}

          {/* NAME */}
          <div>
            <label className="text-sm">Full Name</label>
            <Input
              placeholder="Enter name"
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
              placeholder="Enter email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm">Password</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          {/* CONTACT */}
          <div>
            <label className="text-sm">Contact Number</label>
            <Input
              placeholder="Enter contact number"
              value={form.contactNumber}
              onChange={(e) =>
                setForm({ ...form, contactNumber: e.target.value })
              }
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Warden"}
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