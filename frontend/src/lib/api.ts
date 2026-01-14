import { storage, DBConfig, ChatMessage } from "./storage";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const getHeaders = () => {
    const token = storage.getAuthToken();
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
    };
};

export const api = {
    // --------------------------------------
    // DB CONFIG
    // --------------------------------------
    getDBConfig: async (): Promise<DBConfig | null> => {
        try {
            const res = await fetch(`${BACKEND}/user/config`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.config;
        } catch (error) {
            return null;
        }
    },

    saveDBConfig: async (config: DBConfig) => {
        const res = await fetch(`${BACKEND}/user/config`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(config),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        return data;
    },

    // --------------------------------------
    // CHAT HISTORY
    // --------------------------------------
    getChatHistory: async (): Promise<ChatMessage[]> => {
        try {
            const res = await fetch(`${BACKEND}/user/chat`, {
                headers: getHeaders(),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.history;
        } catch (error) {
            return [];
        }
    },

    clearChatHistory: async () => {
        const res = await fetch(`${BACKEND}/user/chat`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        return data;
    },

    // --------------------------------------
    // SEND MESSAGE (AGENTS)
    // --------------------------------------
    sendMongoMessage: async (prompt: string) => {
        const res = await fetch(`${BACKEND}/agent/mongo`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        return data;
    },

    sendSupabaseMessage: async (prompt: string) => {
        const res = await fetch(`${BACKEND}/agent/supabase`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        return data;
    },

    // --------------------------------------
    // API TOKEN
    // --------------------------------------
    generateApiToken: async () => {
        const res = await fetch(`${BACKEND}/user/token`, {
            method: "POST",
            headers: getHeaders(),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        return data.apiToken;
    },
};
