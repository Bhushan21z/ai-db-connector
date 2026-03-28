import express from "express";
import { MongoClient } from "mongodb";
import { query } from "../lib/db.js";
import { authMiddleware } from "../middleware/auth.js";
import { createMongoAgent } from "../../agents/mongo_agent.js";
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

        const { rows } = await query(
            'SELECT * FROM "database" WHERE user_id = $1',
            [req.user.id]
        );

        const config = rows[0];

        if (!config || !config.api_key) {
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

        const { rows } = await query(
            'SELECT * FROM "database" WHERE user_id = $1',
            [req.user.id]
        );

        const config = rows[0];

        if (!config || !config.supabase_url || !config.supabase_key) {
            return res.status(400).json({ error: "Supabase configuration (URL or Password) not found." });
        }

        const { supabase_url: sbUrl, supabase_key: sbPassword, id: databaseId } = config;

        // Extract project reference and host
        const projectRef = sbUrl.replace('https://', '').replace('.supabase.co', '').split('/')[0];
        const host = `db.${projectRef}.supabase.co`;

        const chatHistoryId = await getOrCreateHistory(req.user.id, databaseId, 'supabase');
        await saveMessage(chatHistoryId, 'user', prompt);

        // Use object-based configuration for better reliability with special characters
        const pgClient = new Client({
            host: host,
            port: 5432,
            database: 'postgres',
            user: 'postgres',
            password: sbPassword,
            ssl: {
                rejectUnauthorized: false
            }
        });
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
    const { rows: existingRows } = await query(
        'SELECT id FROM chat_history WHERE user_id = $1 AND database_id = $2 AND provider = $3',
        [userId, databaseId, provider]
    );

    if (existingRows.length > 0) return existingRows[0].id;

    const { rows: newHistoryRows } = await query(
        'INSERT INTO chat_history (user_id, database_id, provider) VALUES ($1, $2, $3) RETURNING id',
        [userId, databaseId, provider]
    );

    return newHistoryRows[0].id;
}

async function saveMessage(chatHistoryId, role, message) {
    await query(
        'INSERT INTO chat_messages (chat_history_id, role, message) VALUES ($1, $2, $3)',
        [chatHistoryId, role, message]
    );
}

function parseResult(output) {
    try {
        return JSON.parse(output.replace(/```json\n?|\n?```/g, "").trim());
    } catch (e) {
        return output;
    }
}

export default router;
