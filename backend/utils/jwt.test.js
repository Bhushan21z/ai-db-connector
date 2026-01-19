import { jest } from "@jest/globals";

jest.unstable_mockModule("jsonwebtoken", () => ({
    default: {
        sign: jest.fn(),
        verify: jest.fn(),
    }
}));

const { default: jwt } = await import("jsonwebtoken");
const { generateJwt, verifyJwt } = await import("./jwt.js");

describe("JWT Utility", () => {
    const payload = { userId: "123" };
    const secret = "test-secret";
    const token = "mock-token";

    beforeEach(() => {
        process.env.JWT_SECRET = secret;
        jest.clearAllMocks();
    });

    test("generateJwt should sign a token", () => {
        jwt.sign.mockReturnValue(token);
        const result = generateJwt(payload);
        expect(jwt.sign).toHaveBeenCalledWith(payload, secret, { expiresIn: "7d" });
        expect(result).toBe(token);
    });

    test("verifyJwt should verify a token", () => {
        jwt.verify.mockReturnValue(payload);
        const result = verifyJwt(token);
        expect(jwt.verify).toHaveBeenCalledWith(token, secret);
        expect(result).toBe(payload);
    });
});
