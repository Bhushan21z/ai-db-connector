import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, MessageSquare, Key, Zap, Shield, Code, Moon, Sun, Sparkles, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";

const Landing = () => {
  const [isDark, setIsDark] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleDemoLogin = async () => {
    const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
    const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;

    if (!demoEmail || !demoPassword) {
      toast({
        title: "Demo Credentials Missing",
        description: "Please set VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD in your environment.",
        variant: "destructive",
      });
      return;
    }

    try {
      const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Demo login failed", description: data.error, variant: "destructive" });
        return;
      }

      storage.setUser({ email: demoEmail, id: data.id, token: data.token });
      toast({ title: "Welcome to Demo!", description: "Logged in successfully with demo credentials." });
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Network Error",
        description: "Unable to reach server for demo login.",
        variant: "destructive",
      });
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Natural Language Queries",
      description: "Transform complex SQL into simple conversations. Just ask what you need in plain English.",
      gradient: "from-blue-500 to-cyan-500",
      stats: "10x Faster",
      highlights: ["No SQL knowledge required", "Context-aware responses", "Multi-step queries"],
      example: "Show me users who signed up last month"
    },
    {
      icon: Key,
      title: "API Access",
      description: "Integrate AI database queries into any application with our powerful REST API.",
      gradient: "from-purple-500 to-pink-500",
      stats: "99.9% Uptime",
      highlights: ["Instant token generation", "Rate limiting", "Webhook support"],
      example: "curl -X POST /api/query -H 'Bearer: token'"
    },
    {
      icon: Shield,
      title: "Secure & Encrypted",
      description: "Enterprise-grade security with AES-256 encryption and zero-trust architecture.",
      gradient: "from-green-500 to-emerald-500",
      stats: "SOC 2 Certified",
      highlights: ["End-to-end encryption", "Role-based access", "Audit logs"],
      example: "Your credentials never leave our secure vault"
    },
    {
      icon: Database,
      title: "Full CRUD Operations",
      description: "Complete database management with intelligent AI that understands relationships and constraints.",
      gradient: "from-orange-500 to-red-500",
      stats: "All Databases",
      highlights: ["PostgreSQL, MySQL, MongoDB", "Automatic joins", "Data validation"],
      example: "Update all inactive users from last year"
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Lightning-fast query execution with optimized AI processing and caching.",
      gradient: "from-yellow-500 to-orange-500",
      stats: "<500ms",
      highlights: ["Query optimization", "Smart caching", "Real-time results"],
      example: "Get insights in milliseconds, not minutes"
    },
    {
      icon: Code,
      title: "Developer Friendly",
      description: "Built by developers, for developers. Comprehensive docs and SDKs in multiple languages.",
      gradient: "from-indigo-500 to-purple-500",
      stats: "5 SDKs",
      highlights: ["Python, Node.js, Go, Ruby, PHP", "OpenAPI specs", "Code examples"],
      example: "npm install @dbai/client"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
        <div className={`absolute top-20 right-20 w-96 h-96 ${isDark ? 'bg-purple-500/10' : 'bg-purple-500/5'} rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute bottom-20 left-20 w-96 h-96 ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl ${isDark ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'} border-b transition-colors duration-500`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 group">
            <div className="relative">
              <Database className="h-7 w-7 text-indigo-500 group-hover:scale-110 transition-transform" />
              <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Database AI Agent
            </span>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-all duration-300 hover:scale-110`}
            >
              {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </button>
            <Button variant="ghost" className="hover:scale-105 transition-transform" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105" onClick={() => navigate("/signup")}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center relative">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="inline-block">
            <div className={`px-4 py-2 rounded-full ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-100 border-indigo-200'} border backdrop-blur-sm mb-6 inline-flex items-center gap-2`}>
              <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
              <span className="text-sm font-medium text-indigo-500">AI-Powered Database Management</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-black leading-tight">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              Your Database
            </span>
            <br />
            <span className={isDark ? 'text-white' : 'text-gray-900'}>Meets AI Magic</span>
          </h1>

          <p className={`text-xl md:text-2xl ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto leading-relaxed`}>
            Manage your database using natural language. No complex queries, just conversation.
            Connect any database and start chatting instantly.
          </p>

          <div className="flex gap-4 justify-center pt-6 flex-wrap">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all hover:scale-105 text-lg px-8 group"
            >
              <Link to="/signup">Get Started Free</Link>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`text-lg px-8 ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'} hover:scale-105 transition-all`}
              onClick={handleDemoLogin}
            >
              Try Demo
            </Button>
          </div>

          {/* Floating elements */}
          <div className="relative h-32 mt-16">
            <div className="absolute left-1/4 top-0 animate-float">
              <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm p-3 rounded-xl shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <Code className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
            <div className="absolute right-1/4 top-8 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm p-3 rounded-xl shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <Database className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="absolute left-1/3 top-16 animate-float" style={{ animationDelay: '1s' }}>
              <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm p-3 rounded-xl shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <Zap className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className={isDark ? 'text-white' : 'text-gray-900'}>Powerful Features</span>
          </h2>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Everything you need to manage databases with AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group cursor-pointer`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              {/* Stats badge */}
              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-800/80' : 'bg-gray-100'} backdrop-blur-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.stats}
                  </span>
                </div>
              </div>

              <div className="p-8 relative z-10">
                {/* Icon with animated background */}
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3 group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed mb-6 text-sm`}>
                  {feature.description}
                </p>

                {/* Highlights */}
                <div className="space-y-2 mb-6">
                  {feature.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Example code/text */}
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} overflow-hidden`}>
                  <div className="truncate">{feature.example}</div>
                </div>

                {/* Learn more link - appears on hover */}
                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className={`text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent flex items-center gap-1 hover:gap-2 transition-all`}>
                    Learn more
                    <ArrowRight className="h-4 w-4" style={{
                      WebkitTextFillColor: 'transparent',
                      backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                      backgroundClip: 'text'
                    }} />
                  </button>
                </div>
              </div>

              {/* Bottom gradient line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className={`p-12 md:p-16 text-center ${isDark ? 'bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200'} backdrop-blur-sm relative overflow-hidden group`}>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to transform your
              <br />
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                database workflow?
              </span>
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-lg mb-10 max-w-2xl mx-auto`}>
              Join developers who are already using AI to simplify their database operations.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all hover:scale-110 text-lg px-10 py-6 group"
            >
              Start Building Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'border-gray-800 bg-gray-950/50' : 'border-gray-200 bg-white/50'} border-t backdrop-blur-sm mt-20`}>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className={isDark ? 'text-gray-500' : 'text-gray-600'}>
            © 2025 Database AI Agent Platform. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;