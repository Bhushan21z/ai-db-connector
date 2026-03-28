import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../lib/db.js";
import { generateJwt } from "../utils/jwt.js";

const router = express.Router();

// POST /auth/register
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "email and password are required." });

    try {
        // Check if user exists
        const { rows: existingRows } = await query(
            'SELECT id FROM "user" WHERE email = $1',
            [email]
        );

        if (existingRows.length > 0) {
            return res.status(409).json({ error: "User already exists." });
        }

        const hashedPw = await bcrypt.hash(password, 10);

        const { rows: newUserRows } = await query(
            'INSERT INTO "user" (email, password) VALUES ($1, $2) RETURNING *',
            [email, hashedPw]
        );

        const newUser = newUserRows[0];

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
        const { rows: userRows } = await query(
            'SELECT * FROM "user" WHERE email = $1',
            [email]
        );

        const user = userRows[0];

        if (!user) {
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
