import { test, describe, beforeEach, vi, expect } from "vitest";
import { logoutUser } from "../../backend/controllers/userController.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.docker.test" });

describe("logoutUser", () => {
  let req, res;

  beforeEach(() => {
    req = {};

    res = {
      cookie: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  test("should clear the JWT cookie and return a success message", async () => {
    await logoutUser(req, res);

    expect(res.cookie).toHaveBeenCalledWith("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Logout successful." });
  });
});
