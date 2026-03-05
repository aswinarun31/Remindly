import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "@/services/api";

export type UserRole = "admin" | "student";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => void;
  setTokenAndUser: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "remindly_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Attach token to every axios request
  const setAxiosToken = (token: string | null) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  };

  // Fetch the current user from /api/auth/me
  const fetchMe = async (): Promise<AuthUser | null> => {
    try {
      const res = await api.get("/auth/me");
      return res.data as AuthUser;
    } catch {
      return null;
    }
  };

  // On mount: restore session from localStorage
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        setAxiosToken(token);
        const me = await fetchMe();
        if (me) {
          setUser(me);
        } else {
          // Token expired / invalid
          localStorage.removeItem(TOKEN_KEY);
          setAxiosToken(null);
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const saveToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setAxiosToken(token);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user: userData } = res.data;
    saveToken(token);
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post("/auth/register", { name, email, password });
    const { token, user: userData } = res.data;
    saveToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAxiosToken(null);
    setUser(null);
  };

  // Redirect browser to backend Google OAuth endpoint
  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/google`;
  };

  // Called by the OAuth callback page after receiving the JWT token from URL
  const setTokenAndUser = async (token: string) => {
    saveToken(token);
    const me = await fetchMe();
    if (me) setUser(me);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isStudent: user?.role === "student",
        isLoading,
        login,
        register,
        logout,
        loginWithGoogle,
        setTokenAndUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
