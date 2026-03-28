import { jest } from "@jest/globals";

jest.unstable_mockModule("../backend/lib/db.js", () => ({
    query: jest.fn(),
}));

jest.unstable_mockModule("../backend/utils/jwt.js", () => ({
    generateJwt: jest.fn(),
    verifyJwt: jest.fn(),
}));

jest.unstable_mockModule("../backend/middleware/auth.js", () => ({
    authMiddleware: (req, res, next) => {
        req.user = { id: 123, email: "test@example.com" };
        next();
    },
}));

const { query } = await import("../backend/lib/db.js");
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
            query.mockResolvedValue({ rows: [config], error: null });

            const res = await request(app).get("/user/config");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.config.mongo.uri).toBe("mongo-uri");
        });

        test("should return null if no config exists", async () => {
            query.mockResolvedValue({ rows: [], error: null });

            const res = await request(app).get("/user/config");

            expect(res.status).toBe(200);
            expect(res.body.config).toBeNull();
        });
    });

    describe("POST /user/config", () => {
        test("should update existing config", async () => {
            query
                .mockResolvedValueOnce({ rows: [{ id: "config-id" }], error: null }) // select
                .mockResolvedValueOnce({ rows: [], error: null }); // update

            const res = await request(app)
                .post("/user/config")
                .send({ mongo: { uri: "new-uri" } });

            expect(res.status).toBe(200);
            expect(query).toHaveBeenCalledTimes(2);
        });

        test("should insert new config if none exists", async () => {
            query
                .mockResolvedValueOnce({ rows: [], error: null }) // select
                .mockResolvedValueOnce({ rows: [], error: null }); // insert

            const res = await request(app)
                .post("/user/config")
                .send({ mongo: { uri: "new-uri" } });

            expect(res.status).toBe(200);
            expect(query).toHaveBeenCalledTimes(2);
        });
    });

    describe("POST /user/token", () => {
        test("should generate and save API token", async () => {
            generateJwt.mockReturnValue("new-api-token");
            query.mockResolvedValue({ rows: [], error: null });

            const res = await request(app).post("/user/token");

            expect(res.status).toBe(200);
            expect(res.body.apiToken).toBe("new-api-token");
            expect(query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE "database" SET api_token = $1'),
                ["new-api-token", 123]
            );
        });
    });
});
