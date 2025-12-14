import { createContext, useContext, useEffect, useState } from "react";
import { storage, User } from "@/lib/storage";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = storage.getUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate login - check if user exists in localStorage users list
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (existingUser) {
      const user = { id: existingUser.id, email: existingUser.email };
      storage.setUser(user);
      setUser(user);
      return {};
    }
    
    return { error: "Invalid email or password" };
  };

  const signup = async (email: string, password: string) => {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find((u: any) => u.email === email);
    
    if (existingUser) {
      return { error: "User already exists" };
    }
    
    // Create new user
    const newUser = {
      id: Math.random().toString(36).substring(7),
      email,
      password, // In real app, never store plain password
    };
    
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    
    const user = { id: newUser.id, email: newUser.email };
    storage.setUser(user);
    setUser(user);
    
    return {};
  };

  const logout = () => {
    storage.removeUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
