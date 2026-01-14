import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Database, Zap, Eye, EyeOff, RefreshCw, Check } from "lucide-react";

interface CredentialsTabProps {
    isDark: boolean;
    mongoUri: string;
    setMongoUri: (uri: string) => void;
    dbName: string;
    setDbName: (name: string) => void;
    supabaseUrl: string;
    setSupabaseUrl: (url: string) => void;
    supabasePassword: string;
    setSupabasePassword: (pw: string) => void;
    showUri: boolean;
    setShowUri: (show: boolean) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    handleSaveConfig: () => void;
    isSaving: boolean;
}

export const CredentialsTab = ({
    isDark,
    mongoUri,
    setMongoUri,
    dbName,
    setDbName,
    supabaseUrl,
    setSupabaseUrl,
    supabasePassword,
    setSupabasePassword,
    showUri,
    setShowUri,
    showPassword,
    setShowPassword,
    handleSaveConfig,
    isSaving
}: CredentialsTabProps) => {
    return (
        <Card className={`max-w-2xl mx-auto p-8 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border shadow-xl relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-indigo-500/10">
                        <ShieldCheck className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Database Credentials</h2>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Securely connect your database to the AI agent</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Database className="h-5 w-5 text-green-500" />
                            MongoDB (NoSQL)
                        </h3>
                        <div className="space-y-2">
                            <Label htmlFor="uri">Connection String (URI)</Label>
                            <div className="relative">
                                <Input
                                    id="uri"
                                    type={showUri ? "text" : "password"}
                                    value={mongoUri}
                                    onChange={(e) => setMongoUri(e.target.value)}
                                    placeholder="mongodb+srv://..."
                                    className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} pr-12 rounded-xl`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowUri(!showUri)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-500 transition-colors"
                                >
                                    {showUri ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dbName">Database Name</Label>
                            <Input
                                id="dbName"
                                value={dbName}
                                onChange={(e) => setDbName(e.target.value)}
                                placeholder="e.g., production_db"
                                className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-xl`}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-800 w-full" />

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Zap className="h-5 w-5 text-indigo-500" />
                            Supabase (SQL)
                        </h3>
                        <div className="space-y-2">
                            <Label htmlFor="sbUrl">Supabase URL</Label>
                            <Input
                                id="sbUrl"
                                value={supabaseUrl}
                                onChange={(e) => setSupabaseUrl(e.target.value)}
                                placeholder="https://your-project.supabase.co"
                                className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-xl`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sbPassword">Database Password</Label>
                            <div className="relative">
                                <Input
                                    id="sbPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={supabasePassword}
                                    onChange={(e) => setSupabasePassword(e.target.value)}
                                    placeholder="Your database password"
                                    className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} pr-12 rounded-xl`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'} flex gap-3 items-start`}>
                        <ShieldCheck className="h-5 w-5 text-indigo-500 mt-0.5" />
                        <p className="text-xs text-indigo-500/80 leading-relaxed">
                            Your credentials are encrypted at rest and never shared. We only use them to execute the queries you request through the AI agent.
                        </p>
                    </div>

                    <Button
                        onClick={handleSaveConfig}
                        disabled={isSaving}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] py-6 rounded-xl font-bold"
                    >
                        {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                        {isSaving ? "Saving..." : "Save Configuration"}
                    </Button>
                </div>
            </div>
        </Card>
    );
};
