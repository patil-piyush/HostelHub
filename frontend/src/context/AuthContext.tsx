import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

export type UserRole = "student" | "warden" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  room?: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Axios instance
const API = axios.create({
  baseURL: process.env.VITE_BACKEND_URL || "http://localhost:5000/api",
});

// ✅ Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 🔥 IMPORTANT

  // ✅ Restore session
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false); // 🔥 VERY IMPORTANT
  }, []);

  const login = async (identifier: string, password: string, role: UserRole) => {
    try {
      let endpoint = "";

      if (role === "student") endpoint = "/auth/login";
      else if (role === "warden") endpoint = "/auth/warden/login";
      else endpoint = "/auth/admin/login";

      const cleanIdentifier = identifier.trim();
      const body: any = { password };

      if (role === "student") {
        if (cleanIdentifier.includes("@")) body.email = cleanIdentifier;
        else body.PRN = cleanIdentifier;
      } else {
        body.email = cleanIdentifier;
      }

      const res = await API.post(endpoint, body);
      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {loading ? null : children} {/* 🔥 BLOCK RENDER */}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}