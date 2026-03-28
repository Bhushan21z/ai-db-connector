import { jest } from "@jest/globals";

jest.unstable_mockModule("../backend/lib/db.js", () => ({
    query: jest.fn(),
}));

jest.unstable_mockModule("../backend/middleware/auth.js", () => ({
    authMiddleware: (req, res, next) => {
        req.user = { id: 123 };
        next();
    },
}));

const { query } = await import("../backend/lib/db.js");
const { default: app } = await import("../app.js");
const { default: request } = await import("supertest");

describe("Chat API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /user/chat", () => {
        test("should return chat history", async () => {
            const histories = [{ id: "h1" }];
            const messages = [{ id: "m1", message: "Hello", role: "user", created_at: new Date().toISOString() }];

            query
                .mockResolvedValueOnce({ rows: histories, error: null }) // histories
                .mockResolvedValueOnce({ rows: messages, error: null }); // messages

            const res = await request(app).get("/user/chat");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.history).toHaveLength(1);
            expect(res.body.history[0].content).toBe("Hello");
        });
    });

    describe("DELETE /user/chat", () => {
        test("should clear chat history", async () => {
            const histories = [{ id: "h1" }];

            query
                .mockResolvedValueOnce({ rows: histories, error: null }) // select
                .mockResolvedValueOnce({ rows: [], error: null }) // delete messages
                .mockResolvedValueOnce({ rows: [], error: null }); // delete history

            const res = await request(app).delete("/user/chat");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(query).toHaveBeenCalledTimes(3);
        });
    });
});
