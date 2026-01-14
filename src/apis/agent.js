import express from "express";
import { MongoClient } from "mongodb";
import { supabase } from "../lib/supabase.js";
import { authMiddleware } from "../middleware/auth.js";
import { createMongoAgent } from "../../agents/agent.js";
import { createSupabaseAgent } from "../../agents/supabase_agent.js";
import { run } from "@openai/agents";
import pkg from 'pg';
const { Client } = pkg;

const router = express.Router();

// POST /mongo
router.post("/mongo", authMiddleware, async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Missing prompt." });

        const { data: config, error: configError } = await supabase
            .from('database')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (configError || !config || !config.api_key) {
            return res.status(400).json({ error: "MongoDB configuration not found." });
        }

        const { api_key: uri, db_name: dbName, id: databaseId } = config;

        // Chat history logic (reused)
        const chatHistoryId = await getOrCreateHistory(req.user.id, databaseId, 'mongo');
        await saveMessage(chatHistoryId, 'user', prompt);

        const userClient = new MongoClient(uri);
        await userClient.connect();
        const db = userClient.db(dbName);

        const mongoAgent = createMongoAgent(db);
        const result = await run(mongoAgent, prompt);

        await userClient.close();

        const finalContent = parseResult(result.finalOutput);
        await saveMessage(chatHistoryId, 'assistant', JSON.stringify(finalContent));

        res.json({ success: true, prompt, finalOutput: finalContent, toolCalls: result.toolCalls });
    } catch (err) {
        console.error("❌ /mongo Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /supabase
router.post("/supabase", authMiddleware, async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Missing prompt." });

        const { data: config, error: configError } = await supabase
            .from('database')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (configError || !config || !config.supabase_url || !config.supabase_key) {
            return res.status(400).json({ error: "Supabase configuration (URL or Password) not found." });
        }

        const { supabase_url: sbUrl, supabase_key: sbPassword, id: databaseId } = config;

        // Construct connection string: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
        // sbUrl is usually https://[PROJECT_REF].supabase.co
        const projectRef = sbUrl.replace('https://', '').replace('.supabase.co', '');
        const pgUri = `postgresql://postgres:${sbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

        const chatHistoryId = await getOrCreateHistory(req.user.id, databaseId, 'supabase');
        await saveMessage(chatHistoryId, 'user', prompt);

        const pgClient = new Client({ connectionString: pgUri });
        await pgClient.connect();

        const sbAgent = createSupabaseAgent(pgClient);
        const result = await run(sbAgent, prompt);

        await pgClient.end();

        const finalContent = parseResult(result.finalOutput);
        await saveMessage(chatHistoryId, 'assistant', JSON.stringify(finalContent));

        res.json({ success: true, prompt, finalOutput: finalContent, toolCalls: result.toolCalls });
    } catch (err) {
        console.error("❌ /supabase Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Helper functions
async function getOrCreateHistory(userId, databaseId, provider) {
    const { data: existing } = await supabase
        .from('chat_history')
        .select('id')
        .eq('user_id', userId)
        .eq('database_id', databaseId)
        .eq('provider', provider)
        .single();

    if (existing) return existing.id;

    const { data: newHistory, error } = await supabase
        .from('chat_history')
        .insert([{ user_id: userId, database_id: databaseId, provider }])
        .select()
        .single();

    if (error) throw error;
    return newHistory.id;
}

async function saveMessage(chatHistoryId, role, message) {
    await supabase
        .from('chat_messages')
        .insert([{ chat_history_id: chatHistoryId, role, message }]);
}

function parseResult(output) {
    try {
        return JSON.parse(output.replace(/```json\n?|\n?```/g, "").trim());
    } catch (e) {
        return output;
    }
}

export default router;
