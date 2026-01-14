import { Terminal } from "lucide-react";

export const renderContent = (content: any, isDark: boolean) => {
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
