import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Trash2, Sparkles, Send } from "lucide-react";
import { renderContent } from "@/utils/contentRenderer";

interface ChatMessage {
    role: "user" | "assistant";
    content: string | any;
    timestamp?: string | number;
}

interface ChatTabProps {
    isDark: boolean;
    chatHistory: ChatMessage[];
    chatMessage: string;
    setChatMessage: (msg: string) => void;
    handleSendMessage: (e: React.FormEvent) => void;
    handleClearChat: () => void;
    isLoading: boolean;
    chatEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatTab = ({
    isDark,
    chatHistory,
    chatMessage,
    setChatMessage,
    handleSendMessage,
    handleClearChat,
    isLoading,
    chatEndRef
}: ChatTabProps) => {
    return (
        <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-250px)]">
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

            <Card className={`lg:col-span-4 flex flex-col ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} backdrop-blur-xl rounded-3xl border overflow-hidden relative shadow-2xl`}>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10">
                    {chatHistory.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
                            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-inner">
                                <Sparkles className="h-16 w-16 text-indigo-500 animate-pulse" />
                            </div>
                            <div className="max-w-md space-y-2">
                                <h3 className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                    AI Database Assistant
                                </h3>
                                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Ask anything about your data. I can query, update, and analyze your database in real-time.
                                </p>
                                <div className="flex flex-wrap justify-center gap-2 mt-6">
                                    {["List all tables", "Find recent users", "Count orders by city"].map((hint) => (
                                        <button
                                            key={hint}
                                            onClick={() => setChatMessage(hint)}
                                            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${isDark ? 'bg-gray-800/50 border-gray-700 hover:border-indigo-500/50' : 'bg-gray-50 border-gray-200 hover:border-indigo-500/50'}`}
                                        >
                                            {hint}
                                        </button>
                                    ))}
                                </div>
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
                                        {renderContent(msg.content, isDark)}
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
    );
};
