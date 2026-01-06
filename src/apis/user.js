import express from "express";
import { supabase } from "../lib/supabase.js";
import { generateJwt } from "../utils/jwt.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /user/config - Retrieve DB credentials
router.get("/config", authMiddleware, async (req, res) => {
    try {
        const { data: config, error } = await supabase
            .from('database')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        res.json({
            success: true,
            config: config ? {
                provider: config.provider,
                uri: config.api_key,
                dbName: config.db_name
            } : null
        });
    } catch (err) {
        console.error("❌ GET /user/config Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /user/config - Save DB credentials
router.post("/config", authMiddleware, async (req, res) => {
    const { provider, uri, dbName } = req.body;

    if (!provider || !uri || !dbName) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        const { data: existing } = await supabase
            .from('database')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        if (existing) {
            const { error } = await supabase
                .from('database')
                .update({ provider, api_key: uri, db_name: dbName })
                .eq('id', existing.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('database')
                .insert([{ user_id: req.user.id, provider, api_key: uri, db_name: dbName }]);
            if (error) throw error;
        }

        res.json({ success: true, message: "Configuration saved." });
    } catch (err) {
        console.error("❌ POST /user/config Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /user/token - Generate long-lived API Token
router.post("/token", authMiddleware, async (req, res) => {
    try {
        const apiToken = generateJwt(
            {
                email: req.user.email,
                id: req.user.id,
                type: "api_token"
            },
            "365d"
        );

        res.json({ success: true, apiToken });
    } catch (err) {
        console.error("❌ POST /user/token Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
