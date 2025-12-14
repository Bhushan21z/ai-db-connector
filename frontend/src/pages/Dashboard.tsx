import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Database, Eye, EyeOff, LogOut, Copy, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { storage, ChatMessage } from "@/lib/storage";
import { api } from "@/lib/api";

const Dashboard = () => {
  const [provider, setProvider] = useState("mongodb");
  const [mongoUri, setMongoUri] = useState("");
  const [dbName, setDbName] = useState("");
  const [showUri, setShowUri] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [apiToken, setApiToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // --------------------------------------
  // AUTH CHECK + LOAD LOCAL DATA
  // --------------------------------------
  useEffect(() => {
    const user = storage.getUser();
    if (!user) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      const config = await api.getDBConfig();
      if (config) {
        setProvider(config.provider);
        setMongoUri(config.uri);
        setDbName(config.dbName);
      }

      const history = await api.getChatHistory();
      setChatHistory(history);
    };

    loadData();
  }, [navigate]);

  // --------------------------------------
  // LOGOUT
  // --------------------------------------
  const handleLogout = () => {
    storage.clearAll();
    navigate("/");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  // --------------------------------------
  // SAVE DB CREDENTIALS (Backend)
  // --------------------------------------
  const handleSaveCredentials = async () => {
    if (!mongoUri || !dbName) {
      toast({
        title: "Missing fields",
        description: "Please fill URI & database name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.saveDBConfig({ provider, uri: mongoUri, dbName });
      toast({
        title: "Saved!",
        description: "Database credentials saved successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // --------------------------------------
  // GENERATE API TOKEN
  // --------------------------------------
  const handleGenerateToken = async () => {
    setIsLoading(true);
    try {
      const token = await api.generateApiToken();
      setApiToken(token);
      toast({
        title: "Token Generated",
        description: "Your API token is ready.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------
  // CHAT SEND MESSAGE → BACKEND /mongo
  // --------------------------------------
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    // Local push user message (optimistic UI)
    const userMsg: ChatMessage = {
      role: "user",
      content: chatMessage,
      timestamp: Date.now(),
    };
    const newChat = [...chatHistory, userMsg];
    setChatHistory(newChat);

    const currentMessage = chatMessage;
    setChatMessage("");
    setIsLoading(true);

    try {
      const data = await api.sendChatMessage(currentMessage);

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.finalOutput || "No response",
        timestamp: Date.now(),
      };

      setChatHistory([...newChat, assistantMsg]);
    } catch (error) {
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
      // Revert chat history on error if needed, or just show error
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.clearChatHistory();
      setChatHistory([]);
      toast({ title: "Chat cleared" });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Database AI Agent
            </span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs defaultValue="credentials" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-auto p-1 bg-muted/50 backdrop-blur">
              <TabsTrigger value="credentials" className="py-2">Credentials</TabsTrigger>
              <TabsTrigger value="chat" className="py-2">AI Chat</TabsTrigger>
              <TabsTrigger value="api" className="py-2">API Access</TabsTrigger>
            </TabsList>
          </div>

          {/* CREDENTIALS TAB */}
          <TabsContent value="credentials" className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Connect Your Database</h2>
              <p className="text-muted-foreground">
                Securely connect your database to start interacting with it using AI.
              </p>
            </div>

            <Card className="p-8 max-w-2xl mx-auto border-primary/20 shadow-lg">
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-500">Security</p>
                    <p className="text-xs text-muted-foreground">
                      Your credentials are encrypted using AES-256 before being stored. We never log your raw connection strings or passwords.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Database Provider</Label>
                    <select
                      id="provider"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                    >
                      <option value="mongodb">MongoDB</option>
                      <option value="firestore" disabled>Firestore (Coming soon)</option>
                      <option value="mysql" disabled>MySQL (Coming soon)</option>
                      <option value="postgres" disabled>PostgreSQL (Coming soon)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mongoUri">Connection String (URI)</Label>
                    <div className="relative">
                      <Input
                        id="mongoUri"
                        type={showUri ? "text" : "password"}
                        value={mongoUri}
                        onChange={(e) => setMongoUri(e.target.value)}
                        placeholder="mongodb+srv://user:pass@cluster.mongodb.net/..."
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowUri(!showUri)}
                      >
                        {showUri ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dbName">Database Name</Label>
                    <Input
                      id="dbName"
                      value={dbName}
                      onChange={(e) => setDbName(e.target.value)}
                      placeholder="e.g., production_db"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveCredentials} className="w-full" size="lg">
                  Save & Connect
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* CHAT TAB */}
          <TabsContent value="chat">
            <Card className="p-6 space-y-4">
              <div className="h-96 overflow-y-auto border p-4 rounded bg-muted/10 space-y-3">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Start a conversation with your database...
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg ${msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                          }`}
                      >
                        {typeof msg.content === 'string' ? (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        ) : (
                          <div className="text-sm space-y-2">
                            <div className="font-semibold border-b pb-1 mb-1 border-primary/20">
                              {msg.content.operation || "Operation"}
                            </div>
                            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                              <span className="opacity-70">Collection:</span>
                              <span>{msg.content.collection || "N/A"}</span>

                              <span className="opacity-70">Status:</span>
                              <span className={msg.content.status?.toLowerCase().includes("error") ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
                                {msg.content.status}
                              </span>

                              <span className="opacity-70">Affected:</span>
                              <span>{msg.content.affected}</span>
                            </div>
                            {msg.content.data && (
                              <div className="mt-2 bg-background/50 p-2 rounded overflow-x-auto">
                                <pre className="text-xs">{JSON.stringify(msg.content.data, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground px-3 py-2 rounded-lg">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  className="min-h-[60px] flex-1"
                  placeholder="Ask your database... (e.g., 'List all collections', 'Count documents in users collection')"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !chatMessage.trim()}>
                  Send
                </Button>
              </div>

              <Button variant="outline" onClick={handleClearChat}>
                Clear Chat
              </Button>
            </Card>
          </TabsContent>

          {/* API TOKEN TAB */}
          <TabsContent value="api">
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">External API Access</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a long-lived bearer token to access your database via our API from external applications.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <Label>API Endpoint</Label>
                <div className="flex gap-2 items-center font-mono text-sm bg-background p-2 rounded border">
                  <span className="flex-1 truncate">{`${BACKEND}/mongo`}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      navigator.clipboard.writeText(`${BACKEND}/mongo`);
                      toast({ title: "Copied endpoint!" });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {apiToken ? (
                <div className="space-y-2">
                  <Label>Your API Token</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={apiToken} className="font-mono" />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(apiToken);
                        toast({ title: "Copied token!" });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-red-500">
                    Keep this token secret. It gives full access to your database agent.
                  </p>
                </div>
              ) : (
                <Button onClick={handleGenerateToken} disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate API Token"}
                </Button>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
