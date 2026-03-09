import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Eye, EyeOff, ArrowRight } from "lucide-react";

const roles: { value: UserRole; label: string; desc: string }[] = [
  { value: "student", label: "Student", desc: "Resident student" },
  { value: "warden", label: "Warden", desc: "Block in-charge" },
  { value: "admin", label: "Admin", desc: "System administrator" },
  { value: "maintenance", label: "Maintenance", desc: "Staff member" },
];

const roleRoutes: Record<UserRole, string> = {
  student: "/student",
  warden: "/warden",
  admin: "/admin",
  maintenance: "/maintenance",
};

export default function LoginPage() {
  const [email, setEmail] = useState("arjun@hostel.edu");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState<UserRole>("student");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(email, password, role);
      navigate(roleRoutes[role]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-yellow-glow pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow-yellow">
              <span className="text-primary-foreground font-bold">H</span>
            </div>
            <span className="font-bold text-xl text-foreground">HostelHub</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your hostel management portal</p>
        </div>

        <div className="card-elevated rounded-2xl p-8 shadow-card">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role selector */}
            <div>
              <Label className="text-sm font-medium text-foreground mb-3 block">Select Role</Label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                      role === r.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-border/70 hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-sm font-semibold">{r.label}</span>
                    <span className="text-xs opacity-70 mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm text-foreground mb-1.5 block">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hostel.edu"
                required
                className="bg-input border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1.5">
                <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-input border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-11 shadow-glow-yellow group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground text-center font-medium mb-2">Demo credentials (any password)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className="text-left px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-primary font-medium">{r.label}:</span>
                  <span className="text-muted-foreground ml-1 truncate block">{r.value}@hostel.edu</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Back to{" "}
          <Link to="/" className="text-primary hover:underline font-medium">homepage</Link>
        </p>
      </div>
    </div>
  );
}
