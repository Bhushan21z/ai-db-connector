import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Key,
  Settings,
  Database,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { api } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { Header } from "@/components/layout/Header";
import { ChatTab } from "@/components/dashboard/ChatTab";
import { CredentialsTab } from "@/components/dashboard/CredentialsTab";
import { ApiAccessTab } from "@/components/dashboard/ApiAccessTab";

interface ChatMessage {
  role: "user" | "assistant";
  content: string | any;
  timestamp?: string | number;
}

const Dashboard = () => {
  const [mongoUri, setMongoUri] = useState("");
  const [dbName, setDbName] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabasePassword, setSupabasePassword] = useState("");
  const [showUri, setShowUri] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeAgent, setActiveAgent] = useState<"mongo" | "supabase">("mongo");

  const [hasSelectedProvider, setHasSelectedProvider] = useState(false);

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
          setSupabasePassword(config.supabase?.password || "");
        }
        if (hasSelectedProvider) {
          const history = await api.getChatHistory(activeAgent);
          setChatHistory(history);
        }
      } catch (err) {
        // Silent fail or handle via UI if needed
      }
    };
    loadData();
  }, [navigate, hasSelectedProvider, activeAgent]);

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
        supabase: { url: supabaseUrl, password: supabasePassword }
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
      await api.clearChatHistory(activeAgent);
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
      setApiToken(res);
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

  const selectProvider = (provider: "mongo" | "supabase") => {
    setActiveAgent(provider);
    setHasSelectedProvider(true);
  };

  if (!hasSelectedProvider) {
    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header
          isDark={isDark}
          toggleTheme={toggleTheme}
          platformName="Querio"
          isDashboard={true}
          handleLogout={handleLogout}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Choose Your Database
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a provider to start managing your data with AI
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <button
                onClick={() => selectProvider("mongo")}
                className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 hover:scale-[1.02] ${isDark ? 'bg-gray-900/50 border-gray-800 hover:border-green-500/50' : 'bg-white border-gray-200 hover:border-green-500/50'} overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-2xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
                    <Database className="h-12 w-12" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">MongoDB</h3>
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Flexible NoSQL database for modern applications
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => selectProvider("supabase")}
                className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 hover:scale-[1.02] ${isDark ? 'bg-gray-900/50 border-gray-800 hover:border-indigo-500/50' : 'bg-white border-gray-200 hover:border-indigo-500/50'} overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform">
                    <Zap className="h-12 w-12" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Supabase</h3>
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Powerful SQL database with real-time capabilities
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header
        isDark={isDark}
        toggleTheme={toggleTheme}
        platformName="Querio"
        isDashboard={true}
        activeAgent={activeAgent}
        setActiveAgent={setActiveAgent}
        handleLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="chat" className="space-y-8">
          <div className="flex justify-center items-center gap-4">
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

          <TabsContent value="chat" className="animate-fade-in">
            <ChatTab
              isDark={isDark}
              chatHistory={chatHistory}
              chatMessage={chatMessage}
              setChatMessage={setChatMessage}
              handleSendMessage={handleSendMessage}
              handleClearChat={handleClearChat}
              isLoading={isLoading}
              chatEndRef={chatEndRef}
            />
          </TabsContent>

          <TabsContent value="credentials" className="animate-fade-in">
            <CredentialsTab
              isDark={isDark}
              activeAgent={activeAgent}
              mongoUri={mongoUri}
              setMongoUri={setMongoUri}
              dbName={dbName}
              setDbName={setDbName}
              supabaseUrl={supabaseUrl}
              setSupabaseUrl={setSupabaseUrl}
              supabasePassword={supabasePassword}
              setSupabasePassword={setSupabasePassword}
              showUri={showUri}
              setShowUri={setShowUri}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handleSaveConfig={handleSaveConfig}
              isSaving={isSaving}
            />
          </TabsContent>

          <TabsContent value="api" className="animate-fade-in">
            <ApiAccessTab
              isDark={isDark}
              activeAgent={activeAgent}
              apiToken={apiToken}
              isGeneratingToken={isGeneratingToken}
              handleGenerateToken={handleGenerateToken}
              copyToClipboard={copyToClipboard}
              copied={copied}
            />
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
