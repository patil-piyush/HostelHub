import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Public pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import MovementLog from "./pages/student/MovementLog";
import LeaveApplication from "./pages/student/LeaveApplication";
import ComplaintSystem from "./pages/student/ComplaintSystem";
import RoomAllocation from "./pages/student/RoomAllocation";
import StudentProfile from "./pages/student/StudentProfile";
import EditProfile from "./pages/student/EditProfile";

// Warden pages
import WardenDashboard from "./pages/warden/WardenDashboard";
import LeaveApproval from "./pages/warden/LeaveApproval";
import WardenComplaints from "./pages/warden/WardenComplaints";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import UploadCGPA from "./pages/admin/UploadCGPA";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/movement" element={<ProtectedRoute allowedRoles={["student"]}><MovementLog /></ProtectedRoute>} />
      <Route path="/student/leave" element={<ProtectedRoute allowedRoles={["student"]}><LeaveApplication /></ProtectedRoute>} />
      <Route path="/student/complaints" element={<ProtectedRoute allowedRoles={["student"]}><ComplaintSystem /></ProtectedRoute>} />
      <Route path="/student/room" element={<ProtectedRoute allowedRoles={["student"]}><RoomAllocation /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/profile/edit" element={<ProtectedRoute allowedRoles={["student"]}><EditProfile /></ProtectedRoute>} />
      {/* Warden */}
      <Route path="/warden" element={<ProtectedRoute allowedRoles={["warden"]}><WardenDashboard /></ProtectedRoute>} />
      <Route path="/warden/movement" element={<ProtectedRoute allowedRoles={["warden"]}><WardenDashboard /></ProtectedRoute>} />
      <Route path="/warden/leave" element={<ProtectedRoute allowedRoles={["warden"]}><LeaveApproval /></ProtectedRoute>} />
      <Route path="/warden/complaints" element={<ProtectedRoute allowedRoles={["warden"]}><WardenComplaints /></ProtectedRoute>} />
      <Route path="/warden/reports" element={<ProtectedRoute allowedRoles={["warden"]}><WardenDashboard /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["admin"]}><ManageStudents /></ProtectedRoute>} />
      <Route path="/admin/cgpa" element={<ProtectedRoute allowedRoles={["admin"]}><UploadCGPA /></ProtectedRoute>} />
      <Route path="/admin/rooms" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><ManageStudents /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
