import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Code, Database, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface HeroSectionProps {
    isDark: boolean;
    handleDemoLogin: () => void;
}

export const HeroSection = ({ isDark, handleDemoLogin }: HeroSectionProps) => {
    return (
        <section className="container mx-auto px-4 py-24 text-center relative">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div className="inline-block">
                    <div className={`px-4 py-2 rounded-full ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-100 border-indigo-200'} border backdrop-blur-sm mb-6 inline-flex items-center gap-2`}>
                        <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
                        <span className="text-sm font-medium text-indigo-500">AI Backend Database as a Service Platform</span>
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
                    The intelligent data layer for your applications. Connect any database, generate AI-powered APIs instantly, and build faster than ever before.
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
                        className={`text-lg px-8 ${isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-400 text-white hover:bg-gray-100'} hover:scale-105 transition-all font-medium`}
                        onClick={handleDemoLogin}
                    >
                        Try Demo
                    </Button>
                </div>

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
    );
};
