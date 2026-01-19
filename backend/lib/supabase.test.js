import { jest } from "@jest/globals";

const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: jest.fn(function (resolve) { resolve({ data: null, error: null }); }),
};

jest.unstable_mockModule("@supabase/supabase-js", () => ({
    createClient: jest.fn(() => mockSupabase),
}));

const { createClient } = await import("@supabase/supabase-js");

describe("Supabase Library", () => {
    const url = "https://test.supabase.co";
    const key = "test-key";

    beforeEach(() => {
        process.env.SUPABASE_URL = url;
        process.env.SUPABASE_KEY = key;
        jest.clearAllMocks();
    });

    test("should initialize supabase client with correct credentials", async () => {
        const { supabase } = await import("./supabase.js");
        expect(createClient).toHaveBeenCalledWith(url, key);
        expect(supabase).toBeDefined();
    });
});
