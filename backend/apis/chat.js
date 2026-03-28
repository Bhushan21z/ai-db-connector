import express from "express";
import { query } from "../lib/db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /user/chat - Retrieve chat history
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { provider } = req.query;

        let sql = 'SELECT id FROM chat_history WHERE user_id = $1';
        let params = [req.user.id];

        if (provider) {
            sql += ' AND provider = $2';
            params.push(provider);
        }

        const { rows: histories } = await query(sql, params);

        if (!histories || histories.length === 0) {
            return res.json({ success: true, history: [] });
        }

        const historyIds = histories.map(h => h.id);

        const { rows: messages } = await query(
            'SELECT * FROM chat_messages WHERE chat_history_id = ANY($1) ORDER BY id ASC',
            [historyIds]
        );

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

        let sql = 'SELECT id FROM chat_history WHERE user_id = $1';
        let params = [req.user.id];

        if (provider) {
            sql += ' AND provider = $2';
            params.push(provider);
        }

        const { rows: histories } = await query(sql, params);

        if (histories && histories.length > 0) {
            const ids = histories.map(h => h.id);

            await query(
                'DELETE FROM chat_messages WHERE chat_history_id = ANY($1)',
                [ids]
            );

            await query(
                'DELETE FROM chat_history WHERE id = ANY($1)',
                [ids]
            );
        }

        res.json({ success: true, message: "Chat history cleared." });
    } catch (err) {
        console.error("❌ DELETE /user/chat Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
