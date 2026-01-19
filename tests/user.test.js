import { jest } from "@jest/globals";

jest.unstable_mockModule("../backend/lib/supabase.js", () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        update: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        then: jest.fn(function (resolve) { resolve({ data: null, error: null }); }),
    },
}));

jest.unstable_mockModule("../backend/utils/jwt.js", () => ({
    generateJwt: jest.fn(),
    verifyJwt: jest.fn(),
}));

jest.unstable_mockModule("../backend/middleware/auth.js", () => ({
    authMiddleware: (req, res, next) => {
        req.user = { id: "123", email: "test@example.com" };
        next();
    },
}));

const { supabase } = await import("../backend/lib/supabase.js");
const { generateJwt } = await import("../backend/utils/jwt.js");
const { default: app } = await import("../app.js");
const { default: request } = await import("supertest");

describe("User API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /user/config", () => {
        test("should return user config", async () => {
            const config = {
                api_key: "mongo-uri",
                db_name: "test-db",
                supabase_url: "sb-url",
                supabase_key: "sb-key",
            };
            supabase.single.mockResolvedValue({ data: config, error: null });

            const res = await request(app).get("/user/config");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.config.mongo.uri).toBe("mongo-uri");
        });

        test("should return null if no config exists", async () => {
            supabase.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

            const res = await request(app).get("/user/config");

            expect(res.status).toBe(200);
            expect(res.body.config).toBeNull();
        });
    });

    describe("POST /user/config", () => {
        test("should update existing config", async () => {
            // First call to single()
            supabase.single.mockResolvedValueOnce({ data: { id: "config-id" }, error: null });
            // Second call is update(), which returns this, then is awaited (calls then)
            supabase.then.mockImplementationOnce((resolve) => resolve({ data: null, error: null }));

            const res = await request(app)
                .post("/user/config")
                .send({ mongo: { uri: "new-uri" } });

            expect(res.status).toBe(200);
            expect(supabase.update).toHaveBeenCalled();
        });

        test("should insert new config if none exists", async () => {
            supabase.single.mockResolvedValueOnce({ data: null, error: null });
            supabase.then.mockImplementationOnce((resolve) => resolve({ data: null, error: null }));

            const res = await request(app)
                .post("/user/config")
                .send({ mongo: { uri: "new-uri" } });

            expect(res.status).toBe(200);
            expect(supabase.insert).toHaveBeenCalled();
        });
    });

    describe("POST /user/token", () => {
        test("should generate and save API token", async () => {
            generateJwt.mockReturnValue("new-api-token");
            supabase.then.mockImplementationOnce((resolve) => resolve({ data: null, error: null }));

            const res = await request(app).post("/user/token");

            expect(res.status).toBe(200);
            expect(res.body.apiToken).toBe("new-api-token");
            expect(supabase.update).toHaveBeenCalledWith({ api_token: "new-api-token" });
        });
    });
});
