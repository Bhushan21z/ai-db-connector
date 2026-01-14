import { Database, Sparkles, Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
    isDark: boolean;
    toggleTheme: () => void;
    platformName: string;
    showNav?: boolean;
    activeAgent?: "mongo" | "supabase";
    setActiveAgent?: (agent: "mongo" | "supabase") => void;
    handleLogout?: () => void;
    isDashboard?: boolean;
}

export const Header = ({
    isDark,
    toggleTheme,
    platformName,
    showNav = true,
    activeAgent,
    setActiveAgent,
    handleLogout,
    isDashboard = false
}: HeaderProps) => {
    const navigate = useNavigate();

    return (
        <header className={`sticky top-0 z-50 backdrop-blur-xl ${isDark ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'} border-b transition-colors duration-500`}>
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
                    <div className="relative">
                        <Database className="h-7 w-7 text-indigo-500 group-hover:scale-110 transition-transform" />
                        <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        {platformName}
                    </span>
                </div>

                <div className="flex gap-3 items-center">
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-all duration-300 hover:scale-110`}
                    >
                        {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
                    </button>

                    {showNav && !isDashboard && (
                        <>
                            <Button variant="ghost" className="hover:scale-105 transition-transform" onClick={() => navigate("/login")}>
                                Login
                            </Button>
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105" onClick={() => navigate("/signup")}>
                                Sign Up
                            </Button>
                        </>
                    )}

                    {isDashboard && handleLogout && (
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};
