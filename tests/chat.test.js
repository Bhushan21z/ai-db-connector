import { jest } from "@jest/globals";

jest.unstable_mockModule("../backend/lib/supabase.js", () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        // For the query builder pattern in chat.js
        then: jest.fn(function (resolve) { resolve({ data: [], error: null }); }),
    },
}));

jest.unstable_mockModule("../backend/middleware/auth.js", () => ({
    authMiddleware: (req, res, next) => {
        req.user = { id: "123" };
        next();
    },
}));

const { supabase } = await import("../backend/lib/supabase.js");
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

            // Mock the query builder for histories
            supabase.from.mockReturnThis();
            supabase.select.mockReturnThis();
            supabase.eq.mockReturnThis();
            supabase.then.mockImplementationOnce((callback) => callback({ data: histories, error: null }));

            // Mock messages
            supabase.in.mockReturnThis();
            supabase.order.mockReturnThis();
            supabase.then.mockImplementationOnce((callback) => callback({ data: messages, error: null }));

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

            supabase.then.mockImplementationOnce((callback) => callback({ data: histories, error: null }));
            supabase.delete.mockReturnThis();

            const res = await request(app).delete("/user/chat");

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(supabase.delete).toHaveBeenCalledTimes(2); // messages and history
        });
    });
});
