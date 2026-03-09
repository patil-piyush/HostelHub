import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "student" | "warden" | "admin" | "maintenance";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  room?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mockUsers: Record<UserRole, User> = {
  student: { id: "1", name: "Arjun Sharma", email: "arjun@hostel.edu", role: "student", room: "A-204" },
  warden: { id: "2", name: "Dr. Priya Mehta", email: "warden@hostel.edu", role: "warden" },
  admin: { id: "3", name: "Admin Kumar", email: "admin@hostel.edu", role: "admin" },
  maintenance: { id: "4", name: "Raj Singh", email: "maint@hostel.edu", role: "maintenance" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (_email: string, _password: string, role: UserRole) => {
    setUser(mockUsers[role]);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
