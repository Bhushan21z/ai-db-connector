import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Key, Check, Copy, Zap, Terminal } from "lucide-react";

interface ApiAccessTabProps {
    isDark: boolean;
    apiToken: string;
    isGeneratingToken: boolean;
    handleGenerateToken: () => void;
    copyToClipboard: (text: string) => void;
    copied: boolean;
}

export const ApiAccessTab = ({
    isDark,
    apiToken,
    isGeneratingToken,
    handleGenerateToken,
    copyToClipboard,
    copied
}: ApiAccessTabProps) => {
    return (
        <Card className={`max-w-2xl mx-auto p-8 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border shadow-xl relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                        <Key className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">API Access</h2>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Integrate the AI agent into your own applications</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-dashed border-gray-700 flex flex-col items-center justify-center text-center space-y-4">
                        {apiToken ? (
                            <div className="w-full space-y-4">
                                <Label>Your API Token</Label>
                                <div className={`flex gap-2 p-3 rounded-xl border ${isDark ? 'bg-black/40 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                                    <code className="flex-1 text-sm font-mono truncate pt-1">{apiToken}</code>
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(apiToken)} className="h-8 w-8">
                                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-red-500 font-medium">Warning: Copy this token now. It won't be shown again.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-3 rounded-full bg-purple-500/10">
                                    <Zap className="h-8 w-8 text-purple-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Generate a new token</h4>
                                    <p className="text-sm opacity-60">This will invalidate any existing tokens.</p>
                                </div>
                            </>
                        )}

                        {!apiToken && (
                            <Button
                                onClick={handleGenerateToken}
                                disabled={isGeneratingToken}
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8"
                            >
                                {isGeneratingToken ? "Generating..." : "Generate Token"}
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold flex items-center gap-2">
                            <Terminal className="h-4 w-4 text-indigo-500" />
                            Usage Example
                        </h4>
                        <pre className={`p-4 rounded-xl text-xs font-mono overflow-x-auto ${isDark ? 'bg-black/60 border-gray-800' : 'bg-gray-900 text-gray-100'} border`}>
                            {`curl -X POST http://localhost:5000/agent/mongo \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "List all collections"}'`}
                        </pre>
                    </div>
                </div>
            </div>
        </Card>
    );
};
