"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/config/api";

interface User {
  email: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
  mfaRequired?: boolean;
  mfaSetupRequired?: boolean;
  mfaToken?: string;
  message?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  verifyMfa: (mfaToken: string, otp: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("adminAuth") === "true";
    }
    return false;
  });
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = sessionStorage.getItem("adminUser");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  const router = useRouter();

  useEffect(() => {
    const storedAuth = sessionStorage.getItem("adminAuth");
    if (storedAuth !== "true") {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.mfaRequired || data.mfaSetupRequired) {
          return {
            success: true,
            mfaRequired: data.mfaRequired,
            mfaSetupRequired: data.mfaSetupRequired,
            mfaToken: data.mfaToken,
            message: data.message
          };
        }
        
        setIsAuthenticated(true);
        setUser(data.user);
        sessionStorage.setItem("adminAuth", "true");
        sessionStorage.setItem("adminUser", JSON.stringify(data.user));
        sessionStorage.setItem("adminToken", data.token);
        return { success: true };
      } else {
        const errorMsg = data.details ? `${data.message}: ${data.details}` : (data.message || "Invalid credentials");
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Unable to connect to authentication server." };
    }
  };

  const verifyMfa = async (mfaToken: string, otp: string): Promise<AuthResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-mfa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mfaToken, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setUser(data.user);
        sessionStorage.setItem("adminAuth", "true");
        sessionStorage.setItem("adminUser", JSON.stringify(data.user));
        sessionStorage.setItem("adminToken", data.token);
        return { success: true };
      } else {
        return { success: false, error: data.message || "Invalid MFA code" };
      }
    } catch (error) {
      console.error("MFA Verify error:", error);
      return { success: false, error: "Unable to connect to authentication server." };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem("adminAuth");
    sessionStorage.removeItem("adminUser");
    sessionStorage.removeItem("adminToken");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, verifyMfa, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
