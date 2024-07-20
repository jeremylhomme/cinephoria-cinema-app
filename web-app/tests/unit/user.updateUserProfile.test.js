import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateUserProfile } from "../../backend/controllers/userController.js";
import * as prismaModule from "../../backend/config/prismaClient.js";
import { hashPassword } from "../../backend/utils/userPasswordUtils.js";
import * as bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.docker.test" });

// Mock asyncHandler
vi.mock("../../backend/middlewares/asyncHandler.js", () => ({
  asyncHandler: (fn) => fn,
}));

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  compare: vi.fn(),
}));

// Mock hashPassword
vi.mock("../../backend/utils/userPasswordUtils.js", () => ({
  hashPassword: vi.fn(),
}));

// Mock PrismaClient
vi.mock("../../backend/config/prismaClient.js", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("updateUserProfile Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      params: { id: "1" },
      body: {
        userFirstName: "Jane",
        userLastName: "Doe",
        userUserName: "janedoe",
        userEmail: "jane.doe@example.com",
        userPassword: "oldpassword",
        newPassword: "newpassword123",
        confirmUserPassword: "newpassword123",
      },
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    // Reset mocks before each test
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("should return 400 for invalid user ID format", async () => {
    mockReq.params.id = "invalid_id";
    await updateUserProfile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid user ID format.",
    });
  });

  it("should return 404 if user is not found", async () => {
    prismaModule.default.user.findUnique.mockResolvedValue(null);
    await updateUserProfile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "User not found." });
  });

  it("should return 400 if new password and confirm password do not match", async () => {
    const existingUser = {
      id: 1,
      userFirstName: "John",
      userLastName: "Doe",
      userUserName: "johndoe",
      userEmail: "john.doe@example.com",
      userPassword: "hashedOldPassword",
    };
    prismaModule.default.user.findUnique.mockResolvedValue(existingUser);
    mockReq.body.confirmUserPassword = "mismatchedPassword";
    await updateUserProfile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "New password and confirm password do not match.",
    });
  });

  it("should handle server errors", async () => {
    prismaModule.default.user.findUnique.mockRejectedValue(
      new Error("Database error")
    );
    await updateUserProfile(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Failed to update user profile",
        error: expect.any(String),
      })
    );
  });
});
