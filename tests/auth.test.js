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

jest.unstable_mockModule("bcryptjs", () => ({
    default: {
        hash: jest.fn(),
        compare: jest.fn(),
    }
}));

jest.unstable_mockModule("../backend/utils/jwt.js", () => ({
    generateJwt: jest.fn(),
    verifyJwt: jest.fn(),
}));

const { supabase } = await import("../backend/lib/supabase.js");
const { default: bcrypt } = await import("bcryptjs");
const { generateJwt } = await import("../backend/utils/jwt.js");
const { default: app } = await import("../app.js");
const { default: request } = await import("supertest");

describe("Auth API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /auth/register", () => {
        test("should register a new user", async () => {
            const userData = { email: "test@example.com", password: "password123" };
            supabase.single
                .mockResolvedValueOnce({ data: null, error: null }) // Check existing
                .mockResolvedValueOnce({ data: { id: "123" }, error: null }); // Insert new

            bcrypt.hash.mockResolvedValue("hashed-password");

            const res = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.id).toBe("123");
        });

        test("should return 409 if user already exists", async () => {
            const userData = { email: "test@example.com", password: "password123" };
            supabase.single.mockResolvedValue({ data: { id: "123" }, error: null });

            const res = await request(app)
                .post("/auth/register")
                .send(userData);

            expect(res.status).toBe(409);
            expect(res.body.error).toBe("User already exists.");
        });
    });

    describe("POST /auth/login", () => {
        test("should login successfully", async () => {
            const credentials = { email: "test@example.com", password: "password123" };
            const user = { id: "123", email: "test@example.com", password: "hashed-password" };

            supabase.single.mockResolvedValue({ data: user, error: null });
            bcrypt.compare.mockResolvedValue(true);
            generateJwt.mockReturnValue("mock-token");

            const res = await request(app)
                .post("/auth/login")
                .send(credentials);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBe("mock-token");
        });

        test("should return 401 for invalid credentials", async () => {
            const credentials = { email: "test@example.com", password: "wrong-password" };
            const user = { id: "123", email: "test@example.com", password: "hashed-password" };

            supabase.single.mockResolvedValue({ data: user, error: null });
            bcrypt.compare.mockResolvedValue(false);

            const res = await request(app)
                .post("/auth/login")
                .send(credentials);

            expect(res.status).toBe(401);
            expect(res.body.error).toBe("Invalid credentials.");
        });
    });
});
