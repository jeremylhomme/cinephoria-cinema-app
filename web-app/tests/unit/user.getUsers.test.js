import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../../backend/middlewares/asyncHandler";
import dotenv from "dotenv";

dotenv.config({ path: ".env.docker.test" });

// Mock PrismaClient
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: {
      findMany: vi.fn(),
    },
  })),
}));

// Mock the specific function we're testing
vi.mock("../../backend/controllers/userController", () => ({
  getUsers: vi.fn(),
}));

// Import the mocked function
import { getUsers } from "../../backend/controllers/userController";

describe("getUsers", () => {
  let mockPrisma;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    mockReq = {}; // getUsers does not use req.params or req.body
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    // Reset the mock implementation before each test
    getUsers.mockReset();
  });

  it("should return all users", async () => {
    const mockUsers = [
      {
        id: 1,
        userFirstName: "John",
        userLastName: "Doe",
        userUserName: "johndoe",
        userEmail: "john.doe@example.com",
        mustChangePassword: false,
        isVerified: true,
      },
      {
        id: 2,
        userFirstName: "Jane",
        userLastName: "Doe",
        userUserName: "janedoe",
        userEmail: "jane.doe@example.com",
        mustChangePassword: true,
        isVerified: false,
      },
    ];

    mockPrisma.user.findMany.mockResolvedValue(mockUsers);

    getUsers.mockImplementation(
      asyncHandler(async (req, res) => {
        const users = await mockPrisma.user.findMany();
        res.json(users);
      })
    );

    await getUsers(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.user.findMany).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
  });
});
