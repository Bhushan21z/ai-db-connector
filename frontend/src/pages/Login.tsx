import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, Sparkles, ArrowRight, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { useTheme } from "@/context/ThemeContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (storage.getUser()) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Login failed", description: data.error, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      storage.setUser({ email, id: data.id, token: data.token });
      storage.setAuthToken(data.token);

      toast({ title: "Welcome back!", description: "Logged in successfully." });
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Network Error",
        description: "Unable to reach server.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 flex items-center justify-center p-4 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Animated background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.2)'} 0%, transparent 70%)`,
            left: `${mousePosition.x - 250}px`,
            top: `${mousePosition.y - 250}px`,
          }}
        />
      </div>

      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-all duration-300 hover:scale-110`}
        >
          {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
        </button>
      </div>

      <Card className={`w-full max-w-md p-8 space-y-8 animate-fade-in backdrop-blur-xl ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/80 border-gray-200'} border shadow-2xl relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="relative group-hover:scale-110 transition-transform duration-300">
              <Database className="h-12 w-12 text-indigo-500" />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Enter your credentials to access your agent</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-indigo-500 transition-all`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-indigo-500 transition-all`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] py-6 text-lg font-bold group"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        <div className="text-center text-sm relative z-10">
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Don't have an account?</span>{" "}
          <Link to="/signup" className="text-indigo-500 hover:text-indigo-400 font-bold hover:underline transition-colors">Create account</Link>
        </div>
      </Card>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
      `}</style>
    </div>
  );
};

export default Login;
