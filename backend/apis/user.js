import express from "express";
import { query } from "../lib/db.js";
import { generateJwt } from "../utils/jwt.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /user/config - Retrieve DB credentials
router.get("/config", authMiddleware, async (req, res) => {
    try {
        const { rows } = await query(
            'SELECT * FROM "database" WHERE user_id = $1',
            [req.user.id]
        );

        const config = rows[0];

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
        const { rows: existingRows } = await query(
            'SELECT id FROM "database" WHERE user_id = $1',
            [req.user.id]
        );

        const existing = existingRows[0];

        const updateData = {
            api_key: mongo?.uri,
            db_name: mongo?.dbName,
            supabase_url: sbConfig?.url,
            supabase_key: sbConfig?.password,
            provider: 'multi'
        };

        if (existing) {
            await query(
                'UPDATE "database" SET api_key = $1, db_name = $2, supabase_url = $3, supabase_key = $4, provider = $5 WHERE id = $6',
                [updateData.api_key, updateData.db_name, updateData.supabase_url, updateData.supabase_key, updateData.provider, existing.id]
            );
        } else {
            await query(
                'INSERT INTO "database" (user_id, api_key, db_name, supabase_url, supabase_key, provider) VALUES ($1, $2, $3, $4, $5, $6)',
                [req.user.id, updateData.api_key, updateData.db_name, updateData.supabase_url, updateData.supabase_key, updateData.provider]
            );
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
        await query(
            'UPDATE "database" SET api_token = $1 WHERE user_id = $2',
            [apiToken, req.user.id]
        );

        res.json({ success: true, apiToken });
    } catch (err) {
        console.error("❌ POST /user/token Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
