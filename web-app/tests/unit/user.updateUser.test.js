import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateUser } from "../../backend/controllers/userController";
import dotenv from "dotenv";

dotenv.config({ path: ".env.docker.test" });

vi.mock("../../backend/middlewares/asyncHandler.js", () => ({
  asyncHandler: (fn) => fn,
}));

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe("updateUser Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {
      params: { id: "1" },
      body: {
        userFirstName: "Jane",
        userLastName: "Doe",
        userUserName: "janedoe",
        userEmail: "jane.doe@example.com",
        userRole: "customer",
        userPassword: "newpassword123",
      },
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    // Reset mocks before each test (if needed)
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.update.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("should update a user successfully", async () => {
    // Setup
    const existingUser = {
      id: 1,
      userFirstName: "John",
      userLastName: "Doe",
      userUserName: "johndoe",
      userEmail: "john.doe@example.com",
      userRole: "user",
    };

    mockPrisma.user.findUnique.mockResolvedValue(existingUser);
    mockPrisma.user.update.mockResolvedValue({
      ...existingUser,
      userFirstName: mockReq.body.userFirstName,
      userLastName: mockReq.body.userLastName,
      userUserName: mockReq.body.userUserName,
      userEmail: mockReq.body.userEmail,
      userRole: mockReq.body.userRole,
      userPassword: "hashedPassword", // Ensure this matches your hashing mock
    });

    // Execute
    await updateUser(mockReq, mockRes, mockPrisma);

    // Assert
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        userFirstName: mockReq.body.userFirstName,
        userLastName: mockReq.body.userLastName,
        userUserName: mockReq.body.userUserName,
        userEmail: mockReq.body.userEmail,
        userRole: mockReq.body.userRole,
        userPassword: expect.any(String),
      }),
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: existingUser.id,
        userFirstName: mockReq.body.userFirstName,
        userLastName: mockReq.body.userLastName,
        userUserName: mockReq.body.userUserName,
        userEmail: mockReq.body.userEmail,
        userRole: mockReq.body.userRole,
        message: "User updated successfully.",
      })
    );
  });

  it("should return 400 for invalid user ID format", async () => {
    mockReq.params.id = "invalid_id";

    await updateUser(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid user ID format.",
    });
  });

  it("should return 404 if user is not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await updateUser(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "User not found." });
  });

  it("should return 500 for server errors", async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error("Server error"));

    await updateUser(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Server error",
      message: "Failed to update user profile",
    });
  });
});
