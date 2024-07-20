import { describe, it, expect } from "vitest";
import createToken from "../../backend/utils/createToken.js";
import jwt from "jsonwebtoken";
import { createResponse } from "node-mocks-http";
import dotenv from "dotenv";

dotenv.config({ path: ".env.docker.test" });

describe("createToken", () => {
  it("should create a valid token and set the correct cookie options", () => {
    const res = createResponse();
    const userId = "testUserId";
    const token = createToken(res, userId);

    // Check if a token is returned
    expect(token).toBeTruthy();

    // Check if the token is valid and has correct payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(userId);

    // Check token expiration (30 days, with 5 seconds tolerance)
    const expectedExp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
    expect(decoded.exp).toBeGreaterThan(expectedExp - 5);
    expect(decoded.exp).toBeLessThan(expectedExp + 5);

    // Check if a cookie is set
    const cookies = res.cookies;
    expect(cookies.jwt).toBeTruthy();

    // Check if the cookie options are set correctly
    const cookieOptions = cookies.jwt.options;
    expect(cookieOptions.httpOnly).toBe(true);
    expect(cookieOptions.secure).toBe(process.env.NODE_ENV === "production");
    expect(cookieOptions.sameSite).toBe(
      process.env.NODE_ENV === "production" ? "None" : "Lax"
    );
    expect(cookieOptions.maxAge).toBe(30 * 24 * 60 * 60 * 1000);
  });
});
