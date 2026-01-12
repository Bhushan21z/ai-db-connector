import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  Zap,
  MessageSquare,
  Key,
  Settings,
  LogOut,
  Send,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Sun,
  Moon,
  Terminal,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { api } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";

interface ChatMessage {
  role: "user" | "assistant";
  content: string | any;
  timestamp?: string | number;
}

const Dashboard = () => {
  const [mongoUri, setMongoUri] = useState("");
  const [dbName, setDbName] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [showUri, setShowUri] = useState(false);
  const [showSbKey, setShowSbKey] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeAgent, setActiveAgent] = useState<"mongo" | "supabase">("mongo");

  const { toast } = useToast();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = storage.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const config = await api.getDBConfig();
        if (config) {
          setMongoUri(config.mongo?.uri || "");
          setDbName(config.mongo?.dbName || "");
          setSupabaseUrl(config.supabase?.url || "");
          setSupabaseKey(config.supabase?.key || "");
        }
        const history = await api.getChatHistory();
        setChatHistory(history);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    loadData();
  }, [navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleLogout = () => {
    storage.removeUser();
    navigate("/login");
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await api.saveDBConfig({
        mongo: { uri: mongoUri, dbName },
        supabase: { url: supabaseUrl, key: supabaseKey }
      });
      toast({ title: "Configuration Saved", description: "Your database credentials have been updated." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save configuration.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: chatMessage, timestamp: new Date().toISOString() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage("");
    setIsLoading(true);

    try {
      const res = activeAgent === "mongo"
        ? await api.sendMongoMessage(chatMessage)
        : await api.sendSupabaseMessage(chatMessage);

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: res.finalOutput,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (err) {
      toast({ title: "Error", description: `Failed to get response from ${activeAgent} agent.`, variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleClearChat = async () => {
    try {
      await api.clearChatHistory();
      setChatHistory([]);
      toast({ title: "Chat Cleared", description: "Conversation history has been deleted." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to clear chat history.", variant: "destructive" });
    }
  };

  const handleGenerateToken = async () => {
    setIsGeneratingToken(true);
    try {
      const res = await api.generateApiToken();
      setApiToken(res.token);
      toast({ title: "Token Generated", description: "Your new API token is ready." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to generate API token.", variant: "destructive" });
    }
    setIsGeneratingToken(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (content: any) => {
    if (typeof content === 'string') return content;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono opacity-70">
          <Terminal className="h-3 w-3" />
          <span>{content.operation} on {content.table || content.collection}</span>
        </div>
        <pre className={`p-3 rounded-lg text-xs overflow-x-auto ${isDark ? 'bg-black/40' : 'bg-gray-100/50'} border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          {JSON.stringify(content.data || content, null, 2)}
        </pre>
        {content.status && (
          <div className={`text-xs font-medium ${content.status === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
            Status: {content.status}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl ${isDark ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'} border-b transition-colors duration-500`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="relative">
              <Database className="h-7 w-7 text-indigo-500 group-hover:scale-110 transition-transform" />
              <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Database AI Agent
            </span>
          </div>

          <div className={`flex p-1 rounded-xl ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200'} border`}>
            <button
              onClick={() => setActiveAgent("mongo")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeAgent === "mongo"
                ? 'bg-indigo-500 text-white shadow-lg'
                : 'text-gray-500 hover:text-indigo-500'
                }`}
            >
              MongoDB
            </button>
            <button
              onClick={() => setActiveAgent("supabase")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeAgent === "supabase"
                ? 'bg-indigo-500 text-white shadow-lg'
                : 'text-gray-500 hover:text-indigo-500'
                }`}
            >
              Supabase
            </button>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-all duration-300 hover:scale-110`}
            >
              {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="chat" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className={`p-1 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-200/50 border-gray-200'} border backdrop-blur-sm rounded-xl`}>
              <TabsTrigger value="chat" className="rounded-lg data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all px-6">
                <MessageSquare className="h-4 w-4 mr-2" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="credentials" className="rounded-lg data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all px-6">
                <Key className="h-4 w-4 mr-2" />
                Credentials
              </TabsTrigger>
              <TabsTrigger value="api" className="rounded-lg data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all px-6">
                <Settings className="h-4 w-4 mr-2" />
                API Access
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="animate-fade-in">
            <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
              {/* Chat History Sidebar (Optional/Desktop) */}
              <Card className={`hidden lg:flex flex-col p-4 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border overflow-hidden`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-500" />
                    Conversation
                  </h3>
                  <Button variant="ghost" size="icon" onClick={handleClearChat} className="text-gray-500 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-10 opacity-50 text-sm">No messages yet</div>
                  ) : (
                    chatHistory.filter(m => m.role === 'user').map((m, i) => (
                      <div key={i} className={`p-3 rounded-xl text-sm truncate ${isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-100 hover:bg-gray-200'} cursor-pointer transition-colors`}>
                        {m.content}
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Main Chat Area */}
              <Card className={`lg:col-span-3 flex flex-col ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border overflow-hidden relative`}>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                      <div className="p-4 rounded-full bg-indigo-500/10">
                        <Sparkles className="h-10 w-10 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">How can I help with your data?</h3>
                        <p className="text-sm">Try: "List all tables" or "Find users older than 20"</p>
                      </div>
                    </div>
                  ) : (
                    chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                          : `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border rounded-tl-none`
                          }`}>
                          <div className="text-sm leading-relaxed">
                            {renderContent(msg.content)}
                          </div>
                          {msg.timestamp && (
                            <div className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start animate-pulse">
                      <div className={`p-4 rounded-2xl rounded-tl-none ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border`}>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className={`p-4 border-t ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'} relative z-10`}>
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Ask your database anything..."
                      className={`flex-1 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} focus:ring-2 focus:ring-indigo-500 transition-all rounded-xl`}
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !chatMessage.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="animate-fade-in">
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
                      <Label htmlFor="sbKey">Supabase API Key</Label>
                      <div className="relative">
                        <Input
                          id="sbKey"
                          type={showSbKey ? "text" : "password"}
                          value={supabaseKey}
                          onChange={(e) => setSupabaseKey(e.target.value)}
                          placeholder="your-anon-key"
                          className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} pr-12 rounded-xl`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSbKey(!showSbKey)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-500 transition-colors"
                        >
                          {showSbKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="animate-fade-in">
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
                      {`curl -X POST http://localhost:5000/mongo \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "List all collections"}'`}
                    </pre>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? '#374151' : '#e5e7eb'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
