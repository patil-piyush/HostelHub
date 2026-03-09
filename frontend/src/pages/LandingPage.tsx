import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Building2, ArrowRight, CheckCircle, Star, ChevronRight, Users, BedDouble, FileText, MessageSquare, BarChart3, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import dashboardPreview from "@/assets/dashboard-preview.png";

const features = [
  { icon: <ArrowRight className="w-5 h-5" />, title: "Movement Tracking", desc: "Real-time student entry and exit logging with automated timestamps." },
  { icon: <FileText className="w-5 h-5" />, title: "Leave Approval System", desc: "Streamlined digital leave requests with instant warden notifications." },
  { icon: <MessageSquare className="w-5 h-5" />, title: "Complaint Management", desc: "Track and resolve hostel complaints with maintenance assignment." },
  { icon: <BedDouble className="w-5 h-5" />, title: "Room Allocation System", desc: "CGPA-based automated room allocation with real-time availability." },
  { icon: <Users className="w-5 h-5" />, title: "Role-Based Dashboards", desc: "Tailored views for Students, Wardens, Admins, and Maintenance staff." },
  { icon: <BarChart3 className="w-5 h-5" />, title: "Real-Time Monitoring", desc: "Live dashboards with analytics and occupancy reports." },
];

const steps = [
  { num: "01", title: "Register / Login", desc: "Create your account and select your role — Student, Warden, Admin, or Maintenance Staff." },
  { num: "02", title: "Manage Hostel Activities", desc: "Log movements, submit leave requests, raise complaints, and manage room allocations." },
  { num: "03", title: "Monitor Requests", desc: "Wardens approve leaves, admins oversee operations, staff resolves complaints in real time." },
];

const testimonials = [
  { name: "Ananya Reddy", role: "Student, Block A", text: "HostelHub transformed how I manage my hostel life. Leave applications are now instant!", rating: 5 },
  { name: "Dr. Vikram Nair", role: "Warden, Boys Hostel", text: "Managing 200+ students was a nightmare before. Now everything is streamlined and transparent.", rating: 5 },
  { name: "Sneha Kulkarni", role: "Student, Block C", text: "The room allocation system is brilliant. My CGPA got me the best room this semester!", rating: 5 },
];

const universities = ["MIT Manipal", "VIT Vellore", "BITS Pilani", "NIT Trichy", "IIIT Hyderabad", "SRM Chennai"];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">HostelHub</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "About", "Contact"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {item}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-muted-foreground hover:text-foreground">
            Login
          </Button>
          <Button size="sm" onClick={() => navigate("/login")} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow-yellow">
            Get Started
          </Button>
        </div>
        <button className="md:hidden p-2 text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-16 bg-background flex flex-col items-center gap-6 p-8">
          {["Features", "How It Works", "About", "Contact"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="text-lg text-foreground" onClick={() => setMobileOpen(false)}>
              {item}
            </a>
          ))}
          <Button size="lg" onClick={() => navigate("/login")} className="bg-primary text-primary-foreground w-full font-semibold">
            Get Started
          </Button>
        </div>
      )}

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-yellow-glow pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center py-20">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Smart Hostel Management Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              <span className="text-foreground">Hostel</span>
              <span className="gradient-text">Hub</span>
              <br />
              <span className="text-foreground text-3xl md:text-4xl font-semibold">Smart Digital Hostel</span>
              <br />
              <span className="text-foreground text-3xl md:text-4xl font-semibold">Management System</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              Manage hostel operations, student movement, leave approvals, complaints, and room allocation through one centralized platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => navigate("/login")} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 shadow-glow-yellow group">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="border-border hover:border-primary/50 hover:bg-muted text-foreground">
                Login
              </Button>
            </div>
            <div className="flex items-center gap-6">
              {[["500+", "Students"], ["50+", "Hostels"], ["99%", "Uptime"]].map(([val, label]) => (
                <div key={label}>
                  <p className="text-xl font-bold text-primary">{val}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="animate-float">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-2xl" />
                <img
                  src={dashboardPreview}
                  alt="HostelHub Dashboard Preview"
                  className="relative rounded-2xl border border-border shadow-glow-yellow w-full object-cover"
                />
              </div>
            </div>
            {/* Floating stats */}
            <div className="absolute -bottom-6 -left-6 glass-card rounded-xl p-4 shadow-card animate-float" style={{ animationDelay: "1s" }}>
              <p className="text-xs text-muted-foreground">Students Outside</p>
              <p className="text-2xl font-bold text-primary">24</p>
            </div>
            <div className="absolute -top-4 -right-4 glass-card rounded-xl p-4 shadow-card animate-float" style={{ animationDelay: "2s" }}>
              <p className="text-xs text-muted-foreground">Pending Leaves</p>
              <p className="text-2xl font-bold text-foreground">8</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-12 border-y border-border bg-secondary/30">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-widest font-medium">Trusted by leading institutions</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {universities.map((uni) => (
              <span key={uni} className="text-muted-foreground/60 font-semibold text-sm hover:text-muted-foreground transition-colors">{uni}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features for</h2>
            <p className="text-3xl font-bold gradient-text">Smart Hostel Management</p>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">Everything you need to run a modern hostel efficiently and transparently.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card-elevated rounded-xl p-6 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground">How It <span className="gradient-text">Works</span></h2>
            <p className="text-muted-foreground mt-4">Get started in minutes with our simple 3-step process</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="card-elevated rounded-xl p-8 hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="text-5xl font-black gradient-text mb-4">{s.num}</div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                    <ChevronRight className="w-8 h-8 text-primary/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground">What They <span className="gradient-text">Say</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card-elevated rounded-xl p-6 hover:border-primary/20 transition-all duration-300">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-yellow-glow pointer-events-none" />
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to <span className="gradient-text">Transform</span> Your Hostel?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join hundreds of institutions already using HostelHub for smarter management.
          </p>
          <Button size="lg" onClick={() => navigate("/login")} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-12 shadow-glow-yellow-lg">
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-secondary/20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">H</span>
                </div>
                <span className="font-bold text-foreground">HostelHub</span>
              </div>
              <p className="text-sm text-muted-foreground">Smart digital hostel management for modern institutions.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "How It Works", "Pricing"] },
              { title: "Company", links: ["About", "Blog", "Careers"] },
              { title: "Legal", links: ["Privacy Policy", "Terms", "Contact"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-foreground mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2024 HostelHub. All rights reserved.</p>
            <div className="flex gap-6">
              {["Home", "Features", "About", "Contact", "Privacy Policy"].map((link) => (
                <a key={link} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
