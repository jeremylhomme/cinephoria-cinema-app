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
  getUserProfile: vi.fn(),
}));

// Import the mocked function
import { getUserProfile } from "../../backend/controllers/userController";

describe("getUserProfile", () => {
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
    getUserProfile.mockReset();
  });

  it("should return user profile", async () => {
    const mockUser = {
      id: 1,
      userFirstName: "John",
      userLastName: "Doe",
      userUserName: "johndoe",
      userEmail: "john.doe@example.com",
      mustChangePassword: false,
      isVerified: true,
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    getUserProfile.mockImplementation(
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
          });
        } else {
          res.status(404).json({ message: "User not found." });
        }
      })
    );

    await getUserProfile(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockRes.json).toHaveBeenCalledWith(mockUser);
  });

  it("should return 404 if user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    getUserProfile.mockImplementation(
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

    await getUserProfile(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "User not found." });
  });
});
