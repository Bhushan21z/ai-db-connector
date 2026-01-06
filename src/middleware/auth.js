import { verifyJwt } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header)
        return res.status(401).json({ error: "Missing Authorization header." });

    try {
        const token = header.split(" ")[1];
        req.user = verifyJwt(token);
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token." });
    }
};
