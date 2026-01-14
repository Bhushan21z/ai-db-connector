import express from "express";
import { supabase } from "../lib/supabase.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /user/chat - Retrieve chat history
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { provider } = req.query;
        const query = supabase
            .from('chat_history')
            .select('id')
            .eq('user_id', req.user.id);

        if (provider) {
            query.eq('provider', provider);
        }

        const { data: histories, error: historyError } = await query;

        if (historyError) throw historyError;

        if (!histories || histories.length === 0) {
            return res.json({ success: true, history: [] });
        }

        const historyIds = histories.map(h => h.id);

        const { data: messages, error: msgError } = await supabase
            .from('chat_messages')
            .select('*')
            .in('chat_history_id', historyIds)
            .order('id', { ascending: true });

        if (msgError) throw msgError;

        const formattedHistory = messages.map(m => {
            let content = m.message;
            try {
                if (typeof content === 'string' && (content.trim().startsWith('{') || content.trim().startsWith('['))) {
                    content = JSON.parse(content);
                }
            } catch (e) { }

            return {
                role: m.role,
                content: content,
                timestamp: m.created_at ? new Date(m.created_at).getTime() : Date.now()
            };
        });

        res.json({
            success: true,
            history: formattedHistory
        });
    } catch (err) {
        console.error("❌ GET /user/chat Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /user/chat - Clear chat history
router.delete("/", authMiddleware, async (req, res) => {
    try {
        const { provider } = req.query;
        const query = supabase
            .from('chat_history')
            .select('id')
            .eq('user_id', req.user.id);

        if (provider) {
            query.eq('provider', provider);
        }

        const { data: histories } = await query;

        if (histories && histories.length > 0) {
            const ids = histories.map(h => h.id);

            await supabase
                .from('chat_messages')
                .delete()
                .in('chat_history_id', ids);

            await supabase
                .from('chat_history')
                .delete()
                .in('id', ids);
        }

        res.json({ success: true, message: "Chat history cleared." });
    } catch (err) {
        console.error("❌ DELETE /user/chat Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
