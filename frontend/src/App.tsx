import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AllocationProvider } from "@/context/AllocationContext";

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
import WardenStudentMovement from "./pages/warden/WardenStudentMovement";
import LeaveApproval from "./pages/warden/LeaveApproval";
import WardenComplaints from "./pages/warden/WardenComplaints";

// Admin pages
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import ManageStudents from "./pages/admin/students/ManageStudents";
import RegisterStudent from "./pages/admin/students/RegisterStudent";
import AllocationHub from "./pages/admin/allocation/AllocationHub";
import ManageWardens from "./pages/admin/wardens/ManageWardens";
import RegisterWarden from "./pages/admin/wardens/RegisterWarden";
import EditWarden from "./pages/admin/wardens/EditWarden";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* STUDENT */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/movement" element={<ProtectedRoute allowedRoles={["student"]}><MovementLog /></ProtectedRoute>} />
      <Route path="/student/leave" element={<ProtectedRoute allowedRoles={["student"]}><LeaveApplication /></ProtectedRoute>} />
      <Route path="/student/complaints" element={<ProtectedRoute allowedRoles={["student"]}><ComplaintSystem /></ProtectedRoute>} />
      <Route path="/student/room" element={<ProtectedRoute allowedRoles={["student"]}><RoomAllocation /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/profile/edit" element={<ProtectedRoute allowedRoles={["student"]}><EditProfile /></ProtectedRoute>} />

      {/* WARDEN */}
      <Route path="/warden" element={<ProtectedRoute allowedRoles={["warden"]}><WardenDashboard /></ProtectedRoute>} />
      <Route path="/warden/movement" element={<ProtectedRoute allowedRoles={["warden"]}><WardenStudentMovement /></ProtectedRoute>} />
      <Route path="/warden/leave" element={<ProtectedRoute allowedRoles={["warden"]}><LeaveApproval /></ProtectedRoute>} />
      <Route path="/warden/complaints" element={<ProtectedRoute allowedRoles={["warden"]}><WardenComplaints /></ProtectedRoute>} />

      {/* ADMIN */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["admin"]}><ManageStudents /></ProtectedRoute>} />
      <Route path="/admin/register-student" element={<ProtectedRoute allowedRoles={["admin"]}><RegisterStudent /></ProtectedRoute>} />
      <Route path="/admin/allocation" element={<ProtectedRoute allowedRoles={["admin"]}><AllocationHub /></ProtectedRoute>} />
      <Route path="/admin/wardens" element={<ProtectedRoute allowedRoles={["admin"]}><ManageWardens /></ProtectedRoute>} />
      <Route path="/admin/register-warden" element={<ProtectedRoute allowedRoles={["admin"]}><RegisterWarden /></ProtectedRoute>} />
      <Route path="/admin/edit-warden/:id" element={<ProtectedRoute allowedRoles={["admin"]}><EditWarden /></ProtectedRoute>} />

      {/* FALLBACK */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AllocationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AllocationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;