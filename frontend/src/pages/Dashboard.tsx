import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Key,
  Settings
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
        const history = await api.getChatHistory();
        setChatHistory(history);
      } catch (err) {
        // Silent fail or handle via UI if needed
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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="chat" className="space-y-8">
          <div className="flex justify-center">
            {setActiveAgent && (
              <div className={`flex p-1 mr-10 rounded-xl ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200'} border`}>
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
            )}
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
