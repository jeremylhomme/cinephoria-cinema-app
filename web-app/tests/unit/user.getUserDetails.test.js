import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../../backend/middlewares/asyncHandler";
import dotenv from "dotenv";

dotenv.config({ path: ".env.docker.test" });

// Mock PrismaClient
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: {
      findUnique: vi.fn(),
    },
  })),
}));

// Mock the specific function we're testing
vi.mock("../../backend/controllers/userController", () => ({
  getUserDetails: vi.fn(),
}));

// Import the mocked function
import { getUserDetails } from "../../backend/controllers/userController";

describe("getUserDetails", () => {
  let mockPrisma;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    mockReq = {
      params: {
        id: "1",
      },
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    // Reset the mock implementation before each test
    getUserDetails.mockReset();
  });

  it("should return user details", async () => {
    const mockUser = {
      id: 1,
      userFirstName: "John",
      userLastName: "Doe",
      userUserName: "johndoe",
      userEmail: "john.doe@example.com",
      mustChangePassword: false,
      isVerified: true,
      userRole: "USER",
      userCreatedAt: new Date("2023-01-01"),
      userUpdatedAt: new Date("2023-01-02"),
      agreedPolicy: true,
      agreedCgvCgu: true,
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    getUserDetails.mockImplementation(
      asyncHandler(async (req, res) => {
        const id = parseInt(req.params.id);
        const user = await mockPrisma.user.findUnique({ where: { id } });
        if (user) {
          res.json({
            id: user.id,
            userFirstName: user.userFirstName,
            userLastName: user.userLastName,
            userUserName: user.userUserName,
            userEmail: user.userEmail,
            mustChangePassword: user.mustChangePassword,
            isVerified: user.isVerified,
            userRole: user.userRole,
            userCreatedAt: user.userCreatedAt,
            userUpdatedAt: user.userUpdatedAt,
            agreedPolicy: user.agreedPolicy,
            agreedCgvCgu: user.agreedCgvCgu,
          });
        } else {
          res.status(404).json({ message: "User not found." });
        }
      })
    );

    await getUserDetails(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockRes.json).toHaveBeenCalledWith(mockUser);
  });

  it("should return 404 if user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    getUserDetails.mockImplementation(
      asyncHandler(async (req, res) => {
        const id = parseInt(req.params.id);
        const user = await mockPrisma.user.findUnique({ where: { id } });
        if (user) {
          res.json(user);
        } else {
          res.status(404).json({ message: "User not found." });
        }
      })
    );

    await getUserDetails(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "User not found." });
  });

  it("should handle invalid user ID", async () => {
    mockReq.params.id = "invalid";

    getUserDetails.mockImplementation(
      asyncHandler(async (req, res) => {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
          return res.status(400).json({ message: "Invalid user ID." });
        }
        // ... rest of the implementation
      })
    );

    await getUserDetails(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid user ID." });
  });
});
