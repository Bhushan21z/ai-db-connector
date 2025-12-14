import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

      toast({ title: "Welcome!", description: "Logged in successfully." });
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <Database className="mx-auto h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold mt-4">Sign In</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">Create account</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
