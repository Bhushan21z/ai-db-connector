import { jest } from "@jest/globals";

jest.unstable_mockModule("../backend/lib/supabase.js", () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        insert: jest.fn().mockReturnThis(),
    },
}));

jest.unstable_mockModule("../backend/middleware/auth.js", () => ({
    authMiddleware: (req, res, next) => {
        req.user = { id: "123" };
        next();
    },
}));

jest.unstable_mockModule("../agents/mongo_agent.js", () => ({
    createMongoAgent: jest.fn(),
}));

jest.unstable_mockModule("../agents/supabase_agent.js", () => ({
    createSupabaseAgent: jest.fn(),
}));

jest.unstable_mockModule("@openai/agents", () => ({
    run: jest.fn(),
}));

jest.unstable_mockModule("mongodb", () => ({
    MongoClient: jest.fn(),
}));

jest.unstable_mockModule("pg", () => ({
    default: {
        Client: jest.fn().mockImplementation(() => ({
            connect: jest.fn(),
            end: jest.fn(),
        })),
    }
}));

const { supabase } = await import("../backend/lib/supabase.js");
const { default: app } = await import("../app.js");
const { MongoClient } = await import("mongodb");
const { run } = await import("@openai/agents");
const { default: request } = await import("supertest");

describe("Agent API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /agent/mongo", () => {
        test("should run mongo agent successfully", async () => {
            const config = { api_key: "mongodb://uri", db_name: "test-db", id: "db1" };
            supabase.single
                .mockResolvedValueOnce({ data: config, error: null }) // config
                .mockResolvedValueOnce({ data: { id: "h1" }, error: null }); // getOrCreateHistory

            const mockDb = {};
            const mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue(mockDb),
                close: jest.fn(),
            };
            MongoClient.mockImplementation(() => mockClient);
            run.mockResolvedValue({ finalOutput: '{"result": "success"}', toolCalls: [] });

            const res = await request(app)
                .post("/agent/mongo")
                .send({ prompt: "find users" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(run).toHaveBeenCalled();
        });

        test("should return 400 if prompt is missing", async () => {
            const res = await request(app).post("/agent/mongo").send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Missing prompt.");
        });
    });

    describe("POST /agent/supabase", () => {
        test("should run supabase agent successfully", async () => {
            const config = { supabase_url: "https://ref.supabase.co", supabase_key: "pass", id: "db1" };
            supabase.single
                .mockResolvedValueOnce({ data: config, error: null }) // config
                .mockResolvedValueOnce({ data: { id: "h1" }, error: null }); // getOrCreateHistory

            run.mockResolvedValue({ finalOutput: '{"result": "success"}', toolCalls: [] });

            const res = await request(app)
                .post("/agent/supabase")
                .send({ prompt: "select users" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(run).toHaveBeenCalled();
        });
    });
});
