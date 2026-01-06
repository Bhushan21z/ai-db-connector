import express from "express";
import { MongoClient } from "mongodb";
import { supabase } from "../lib/supabase.js";
import { authMiddleware } from "../middleware/auth.js";
import { createMongoAgent } from "../../agents/agent.js";
import { run } from "@openai/agents";

const router = express.Router();

// POST /mongo
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt)
            return res.status(400).json({
                error: "Missing prompt. Provide { prompt: \"...\" }",
            });

        const { data: config, error: configError } = await supabase
            .from('database')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (configError || !config) {
            return res.status(400).json({
                error: "Database configuration not found. Please save credentials first.",
            });
        }

        const { api_key: uri, db_name: dbName, id: databaseId } = config;

        console.log("📩 Mongo Prompt:", prompt);
        console.log("🔗 Using MongoDB:", uri);

        let chatHistoryId;
        const { data: existingHistory } = await supabase
            .from('chat_history')
            .select('id')
            .eq('user_id', req.user.id)
            .eq('database_id', databaseId)
            .single();

        if (existingHistory) {
            chatHistoryId = existingHistory.id;
        } else {
            const { data: newHistory, error: createHistoryError } = await supabase
                .from('chat_history')
                .insert([{ user_id: req.user.id, database_id: databaseId }])
                .select()
                .single();

            if (createHistoryError) throw createHistoryError;
            chatHistoryId = newHistory.id;
        }

        await supabase
            .from('chat_messages')
            .insert([{ chat_history_id: chatHistoryId, role: 'user', message: prompt }]);

        try {
            const userClient = new MongoClient(uri);
            await userClient.connect();
            const db = userClient.db(dbName);

            const mongoAgent = createMongoAgent(db);
            const result = await run(mongoAgent, prompt);

            await userClient.close();
            console.log("Mongo Agent Result:", result.finalOutput);

            let finalContent = result.finalOutput;
            try {
                const cleanOutput = result.finalOutput.replace(/```json\n?|\n?```/g, "").trim();
                finalContent = JSON.parse(cleanOutput);
            } catch (e) { }

            const messageToStore = typeof finalContent === 'string' ? finalContent : JSON.stringify(finalContent);

            await supabase
                .from('chat_messages')
                .insert([{ chat_history_id: chatHistoryId, role: 'assistant', message: messageToStore }]);

            res.json({
                success: true,
                prompt,
                finalOutput: finalContent,
                toolCalls: result.toolCalls
            });

        } catch (dbError) {
            console.error("❌ Database Error:", dbError);
            res.status(500).json({
                success: false,
                error: `Database connection failed: ${dbError.message}`
            });
        }

    } catch (err) {
        console.error("❌ /mongo Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
