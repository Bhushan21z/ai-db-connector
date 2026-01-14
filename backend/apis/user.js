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
                mongo: {
                    uri: config.api_key,
                    dbName: config.db_name
                },
                supabase: {
                    url: config.supabase_url,
                    password: config.supabase_key
                }
            } : null
        });
    } catch (err) {
        console.error("❌ GET /user/config Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /user/config - Save DB credentials
router.post("/config", authMiddleware, async (req, res) => {
    const { mongo, supabase: sbConfig } = req.body;

    try {
        const { data: existing } = await supabase
            .from('database')
            .select('id')
            .eq('user_id', req.user.id)
            .single();

        const updateData = {
            api_key: mongo?.uri,
            db_name: mongo?.dbName,
            supabase_url: sbConfig?.url,
            supabase_key: sbConfig?.password,
            provider: 'multi'
        };

        if (existing) {
            const { error } = await supabase
                .from('database')
                .update(updateData)
                .eq('id', existing.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('database')
                .insert([{ user_id: req.user.id, ...updateData }]);
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

        // Save to database table
        const { error } = await supabase
            .from('database')
            .update({ api_token: apiToken })
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.json({ success: true, apiToken });
    } catch (err) {
        console.error("❌ POST /user/token Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
