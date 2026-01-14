import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Key, Check, Copy, Zap, Terminal, RefreshCw } from "lucide-react";

interface ApiAccessTabProps {
    isDark: boolean;
    activeAgent: "mongo" | "supabase";
    apiToken: string;
    isGeneratingToken: boolean;
    handleGenerateToken: () => void;
    copyToClipboard: (text: string) => void;
    copied: boolean;
}

export const ApiAccessTab = ({
    isDark,
    activeAgent,
    apiToken,
    isGeneratingToken,
    handleGenerateToken,
    copyToClipboard,
    copied
}: ApiAccessTabProps) => {
    return (
        <Card className={`max-w-2xl mx-auto p-8 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border shadow-xl relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

            <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-purple-500/10">
                        <Key className="h-8 w-8 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black">API Access</h2>
                        <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Integrate the AI agent into your own applications</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className={`p-8 rounded-3xl border-2 border-dashed ${isDark ? 'border-gray-800 bg-black/20' : 'border-gray-200 bg-gray-50/50'} flex flex-col items-center justify-center text-center space-y-6 transition-all hover:border-purple-500/30`}>
                        {apiToken ? (
                            <div className="w-full space-y-6">
                                <Label className="text-sm font-bold uppercase tracking-wider opacity-70">Your API Token</Label>
                                <div className={`flex gap-3 p-4 rounded-2xl border ${isDark ? 'bg-black/40 border-gray-700' : 'bg-white border-gray-200'} shadow-inner`}>
                                    <code className="flex-1 text-sm font-mono truncate pt-1.5">{apiToken}</code>
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(apiToken)} className="h-10 w-10 hover:bg-purple-500/10 transition-colors">
                                        {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                                    </Button>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-red-500">
                                    <Zap className="h-4 w-4" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Warning: Copy this token now. It won't be shown again.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-5 rounded-full bg-purple-500/10 shadow-inner">
                                    <Zap className="h-10 w-10 text-purple-500 animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold">Generate a new token</h4>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>This will invalidate any existing tokens for your account.</p>
                                </div>
                            </>
                        )}

                        {!apiToken && (
                            <Button
                                onClick={handleGenerateToken}
                                disabled={isGeneratingToken}
                                className="h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-10 font-bold shadow-xl shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
                            >
                                {isGeneratingToken ? <RefreshCw className="h-5 w-5 mr-3 animate-spin" /> : <Zap className="h-5 w-5 mr-3" />}
                                {isGeneratingToken ? "Generating..." : "Generate Token"}
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold flex items-center gap-2 text-lg">
                            <Terminal className="h-5 w-5 text-indigo-500" />
                            Usage Example ({activeAgent === 'mongo' ? 'MongoDB' : 'Supabase'})
                        </h4>
                        <div className="relative group">
                            <pre className={`p-6 rounded-2xl text-sm font-mono overflow-x-auto ${isDark ? 'bg-black/60 border-gray-800' : 'bg-gray-900 text-gray-100'} border shadow-2xl custom-scrollbar`}>
                                {`curl -X POST http://localhost:5000/agent/${activeAgent} \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "${activeAgent === 'mongo' ? 'List all collections' : 'List all tables'}"}'`}
                            </pre>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-4 right-4 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(`curl -X POST http://localhost:5000/agent/${activeAgent} -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"prompt": "${activeAgent === 'mongo' ? 'List all collections' : 'List all tables'}"}'`)}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
