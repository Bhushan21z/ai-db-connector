import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { CTASection } from "@/components/landing/CTASection";
import { features } from "@/constants/landingFeatures";

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

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
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

      <Header
        isDark={isDark}
        toggleTheme={() => setIsDark(!isDark)}
        platformName="Querio"
      />

      <HeroSection isDark={isDark} handleDemoLogin={handleDemoLogin} />

      <section className="container mx-auto px-4 py-20 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            <span className={isDark ? 'text-white' : 'text-gray-900'}>Powerful Features</span>
          </h2>
          <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
            Everything you need to manage databases with AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} isDark={isDark} />
          ))}
        </div>
      </section>

      <CTASection isDark={isDark} />

      <Footer isDark={isDark} platformName="Querio" />

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