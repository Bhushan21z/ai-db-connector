import { jest } from "@jest/globals";

jest.unstable_mockModule("../utils/jwt.js", () => ({
    verifyJwt: jest.fn(),
}));

jest.unstable_mockModule("../lib/supabase.js", () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
    },
}));

const { verifyJwt } = await import("../utils/jwt.js");
const { supabase } = await import("../lib/supabase.js");
const { authMiddleware } = await import("./auth.js");

describe("Auth Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    test("should return 401 if Authorization header is missing", async () => {
        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Missing Authorization header." });
    });

    test("should return 401 if token is invalid", async () => {
        req.headers.authorization = "Bearer invalid-token";
        verifyJwt.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token." });
    });

    test("should call next() if token is valid (user type)", async () => {
        const decoded = { id: "123", type: "user" };
        req.headers.authorization = "Bearer valid-token";
        verifyJwt.mockReturnValue(decoded);

        await authMiddleware(req, res, next);
        expect(req.user).toBe(decoded);
        expect(next).toHaveBeenCalled();
    });

    test("should verify API token against database", async () => {
        const decoded = { id: "123", type: "api_token" };
        const token = "valid-api-token";
        req.headers.authorization = `Bearer ${token}`;
        verifyJwt.mockReturnValue(decoded);

        supabase.single.mockResolvedValue({ data: { user_id: "123" }, error: null });

        await authMiddleware(req, res, next);
        expect(supabase.from).toHaveBeenCalledWith("database");
        expect(supabase.eq).toHaveBeenCalledWith("api_token", token);
        expect(req.user).toBe(decoded);
        expect(next).toHaveBeenCalled();
    });

    test("should return 401 if API token is invalid in database", async () => {
        const decoded = { id: "123", type: "api_token" };
        const token = "invalid-api-token";
        req.headers.authorization = `Bearer ${token}`;
        verifyJwt.mockReturnValue(decoded);

        supabase.single.mockResolvedValue({ data: null, error: new Error("Not found") });

        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid or revoked API token." });
    });
});
