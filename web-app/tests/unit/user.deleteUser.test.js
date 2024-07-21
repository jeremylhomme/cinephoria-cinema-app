import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteUser } from "../../backend/controllers/userController";
import * as prismaModule from "../../backend/config/prismaClient";
import dotenv from "dotenv";

dotenv.config({ path: ".env.docker.test" });

// Mock asyncHandler
vi.mock("../../backend/middlewares/asyncHandler.js", () => ({
  asyncHandler: (fn) => fn,
}));

// Mock PrismaClient
vi.mock("../../backend/config/prismaClient", () => ({
  default: {
    user: {
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe("deleteUser Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      params: { id: "1" },
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

  it("should delete a user successfully", async () => {
    prismaModule.default.user.findUnique.mockResolvedValue({
      userRole: "customer",
    });
    prismaModule.default.user.delete.mockResolvedValue();

    await deleteUser(mockReq, mockRes);

    expect(prismaModule.default.user.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User deleted successfully.",
    });
  });

  it("should return 400 for invalid user ID", async () => {
    mockReq.params.id = "invalid_id";

    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid user ID",
    });
  });

  it("should return 403 when trying to delete a superadmin", async () => {
    prismaModule.default.user.findUnique.mockResolvedValue({
      userRole: "superadmin",
    });

    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Superadmin cannot be deleted",
    });
    expect(prismaModule.default.user.delete).not.toHaveBeenCalled();
  });

  it("should return 404 if user not found", async () => {
    prismaModule.default.user.findUnique.mockResolvedValue(null);

    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User not found",
    });
    expect(prismaModule.default.user.delete).not.toHaveBeenCalled();
  });

  it("should return 500 for server errors", async () => {
    prismaModule.default.user.findUnique.mockResolvedValue({
      userRole: "customer",
    });
    prismaModule.default.user.delete.mockRejectedValue(
      new Error("Server error")
    );

    await deleteUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error deleting user. Please try again later.",
    });
  });
});
