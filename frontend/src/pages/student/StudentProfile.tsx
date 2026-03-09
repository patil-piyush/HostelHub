import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, BedDouble, GraduationCap, Phone, MapPin, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentProfile() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage your profile information</p>
        </div>

        {/* Profile card */}
        <div className="card-elevated rounded-xl p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 shadow-glow-yellow">
              <span className="text-primary font-bold text-3xl">{user?.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  Student
                </span>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                  Room A-204
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="ml-auto border-border hover:border-primary/50">
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: <User className="w-4 h-4" />, label: "Full Name", value: user?.name || "—" },
              { icon: <Mail className="w-4 h-4" />, label: "Email", value: user?.email || "—" },
              { icon: <BedDouble className="w-4 h-4" />, label: "Room Number", value: "A-204, Block A" },
              { icon: <GraduationCap className="w-4 h-4" />, label: "CGPA", value: "8.7 / 10.0" },
              { icon: <Phone className="w-4 h-4" />, label: "Phone", value: "+91 98765 43210" },
              { icon: <MapPin className="w-4 h-4" />, label: "Hometown", value: "Bangalore, Karnataka" },
            ].map((field) => (
              <div key={field.label} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
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

        {/* Academic info */}
        <div className="card-elevated rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Academic Information</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Branch", value: "Computer Science" },
              { label: "Year", value: "3rd Year" },
              { label: "Roll No.", value: "2021CS001" },
              { label: "Semester", value: "5th Semester" },
              { label: "Enrollment", value: "2021–2025" },
              { label: "Hostel Block", value: "Block A" },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 rounded-xl bg-muted/20 border border-border">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
