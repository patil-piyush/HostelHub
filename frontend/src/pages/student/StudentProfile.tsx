import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, BedDouble, GraduationCap, Phone, MapPin, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";

export default function StudentProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/student/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  const name = profile?.name || user?.name || "—";
  const email = profile?.email || user?.email || "—";
  const room = profile?.Room?.roomNumber || "Not Assigned";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">

        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and manage your profile information
          </p>
        </div>

        <div className="card-elevated rounded-xl p-8">
          <div className="flex items-center gap-6 mb-8">

            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 shadow-glow-yellow">
              <span className="text-primary font-bold text-3xl">
                {name.charAt(0)}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">{name}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>

              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  Student
                </span>

                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                  Room {room}
                </span>
              </div>
            </div>

            <Button
              onClick={() => navigate("/student/profile/edit")}
              variant="outline"
              size="sm"
              className="ml-auto border-border hover:border-primary/50"
            >
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>

          {/* ✅ FIXED FIELDS */}
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: <User className="w-4 h-4" />, label: "Full Name", value: name },
              { icon: <Mail className="w-4 h-4" />, label: "Email", value: email },
              { icon: <BedDouble className="w-4 h-4" />, label: "Room Number", value: room },
              { icon: <GraduationCap className="w-4 h-4" />, label: "CGPA", value: profile?.CGPA || "—" },
              { icon: <Phone className="w-4 h-4" />, label: "Phone", value: profile?.contactNumber || "—" },
              { icon: <MapPin className="w-4 h-4" />, label: "Address", value: profile?.currentAddress || "—" },
            ].map((field) => (
              <div key={field.label} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {field.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="text-sm font-medium text-foreground">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic */}
        <div className="card-elevated rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Academic Information</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Branch", value: profile?.branch || "—" },
              { label: "Year", value: profile?.year || "—" },
              { label: "PRN", value: profile?.PRN || "—" },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 rounded-xl bg-muted/20 border border-border">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}