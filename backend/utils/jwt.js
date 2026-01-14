import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateJwt = (payload, expires = "7d") =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expires });

export const verifyJwt = (token) =>
    jwt.verify(token, process.env.JWT_SECRET);
