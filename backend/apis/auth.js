import express from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../lib/supabase.js";
import { generateJwt } from "../utils/jwt.js";

const router = express.Router();

// POST /auth/register
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "email and password are required." });

    try {
        // Check if user exists
        const { data: existing } = await supabase
            .from('user')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return res.status(409).json({ error: "User already exists." });
        }

        const hashedPw = await bcrypt.hash(password, 10);

        const { data: newUser, error: insertError } = await supabase
            .from('user')
            .insert([{ email, password: hashedPw }])
            .select()
            .single();

        if (insertError) throw insertError;

        res.json({
            success: true,
            message: "User registered successfully.",
            id: newUser.id
        });
    } catch (err) {
        console.error("❌ Registration Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST /auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: user, error } = await supabase
            .from('user')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: "User not found." });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: "Invalid credentials." });

        const token = generateJwt({ email: user.email, id: user.id });

        res.json({
            success: true,
            token,
            email: user.email,
            id: user.id
        });
    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
