import { verifyJwt } from "../utils/jwt.js";
import { supabase } from "../lib/supabase.js";

export const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header)
        return res.status(401).json({ error: "Missing Authorization header." });

    try {
        let token = header;
        if (header.startsWith("Bearer ")) {
            token = header.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ error: "Invalid Authorization header format." });
        }

        const decoded = verifyJwt(token);

        // If it's an API token, verify it exists in the database
        if (decoded.type === 'api_token') {
            const { data, error } = await supabase
                .from('database')
                .select('user_id')
                .eq('api_token', token)
                .single();

            if (error || !data || data.user_id !== decoded.id) {
                return res.status(401).json({ error: "Invalid or revoked API token." });
            }
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token." });
    }
};
