import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import API from "@/api";

export default function EditProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contactNumber: "",
    branch: "",
    year: "",
    CGPA: "",
    permanentAddress: "",
    currentAddress: "",
    parentName: "",
    parentEmail: "",
    parentContactNumber: "",
    guardianName: "",
    guardianEmail: "",
    guardianContactNumber: "",
    guardianAddress: ""
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch profile (CLEAN MAPPING)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/student/profile");
        const data = res.data;

        setForm({
          name: data.name || "",
          email: data.email || "",
          contactNumber: data.contactNumber || "",
          branch: data.branch || "",
          year: data.year || "",
          CGPA: data.CGPA || "",
          permanentAddress: data.permanentAddress || "",
          currentAddress: data.currentAddress || "",
          parentName: data.parentName || "",
          parentEmail: data.parentEmail || "",
          parentContactNumber: data.parentContactNumber || "",
          guardianName: data.guardianName || "",
          guardianEmail: data.guardianEmail || "",
          guardianContactNumber: data.guardianContactNumber || "",
          guardianAddress: data.guardianAddress || ""
        });

      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Handle change
  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Submit (ONLY SEND REQUIRED FIELDS)
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      // ✅ CLEAN DATA BEFORE SENDING
      const cleanedData: any = {};

      Object.keys(form).forEach((key) => {
        const value = form[key];

        if (value !== "" && value !== null) {
          // Convert CGPA to number
          if (key === "CGPA") {
            cleanedData[key] = Number(value);
          } else {
            cleanedData[key] = value;
          }
        }
      });

      console.log("SENDING DATA:", cleanedData); // 🔥 DEBUG

      await API.put("/student/profile", cleanedData);

      alert("Profile updated successfully");
      navigate("/student/profile");

    } catch (err: any) {
      console.error("UPDATE ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">

        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update your profile information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-elevated rounded-xl p-8 space-y-5">

          {/* ✅ UI SAME — just structured properly */}

          <div>
            <Label>Full Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} />
          </div>

          <div>
            <Label>Email</Label>
            <Input name="email" value={form.email} onChange={handleChange} />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input name="contactNumber" value={form.contactNumber} onChange={handleChange} />
          </div>

          <div>
            <Label>Branch</Label>
            <Input name="branch" value={form.branch} onChange={handleChange} />
          </div>

          <div>
            <Label>Year</Label>
            <Input name="year" value={form.year} onChange={handleChange} />
          </div>

          <div>
            <Label>CGPA</Label>
            <Input name="CGPA" value={form.CGPA} onChange={handleChange} />
          </div>

          <div>
            <Label>Permanent Address</Label>
            <Input name="permanentAddress" value={form.permanentAddress} onChange={handleChange} />
          </div>

          <div>
            <Label>Current Address</Label>
            <Input name="currentAddress" value={form.currentAddress} onChange={handleChange} />
          </div>

          <div>
            <Label>Parent Name</Label>
            <Input name="parentName" value={form.parentName} onChange={handleChange} />
          </div>

          <div>
            <Label>Parent Email</Label>
            <Input name="parentEmail" value={form.parentEmail} onChange={handleChange} />
          </div>

          <div>
            <Label>Parent Contact</Label>
            <Input name="parentContactNumber" value={form.parentContactNumber} onChange={handleChange} />
          </div>

          <div>
            <Label>Guardian Name</Label>
            <Input name="guardianName" value={form.guardianName} onChange={handleChange} />
          </div>

          <div>
            <Label>Guardian Email</Label>
            <Input name="guardianEmail" value={form.guardianEmail} onChange={handleChange} />
          </div>

          <div>
            <Label>Guardian Contact</Label>
            <Input name="guardianContactNumber" value={form.guardianContactNumber} onChange={handleChange} />
          </div>

          <div>
            <Label>Guardian Address</Label>
            <Input name="guardianAddress" value={form.guardianAddress} onChange={handleChange} />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Save Changes</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/student/profile")}
            >
              Cancel
            </Button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}