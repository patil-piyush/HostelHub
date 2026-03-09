// Update this page (the content is just a fallback if you fail to update the page)
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-glow-yellow">
          <span className="text-primary-foreground font-bold text-2xl">H</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground">HostelHub</h1>
        <p className="text-muted-foreground">Smart Digital Hostel Management System</p>
        <Button onClick={() => navigate("/")} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-glow-yellow">
          <Home className="w-4 h-4 mr-2" /> Go to Home
        </Button>
      </div>
    </div>
  );
};

export default Index;
