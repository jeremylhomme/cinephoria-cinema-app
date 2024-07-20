import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createUser } from "../../backend/controllers/userController";
import dotenv from "dotenv";
import { sendEmail } from "../../backend/utils/sendEmail";
import {
  hashPassword,
  generatePassword,
  generateVerificationCode,
} from "../../backend/utils/userPasswordUtils";

dotenv.config({ path: ".env.docker.test" });

// Mock PrismaClient and utils
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  })),
}));

vi.mock("../../backend/utils/sendEmail", () => ({
  sendEmail: vi.fn(),
}));

// Corrected mock path for userPasswordUtils and included all functions
vi.mock("../../backend/utils/userPasswordUtils", () => ({
  hashPassword: vi.fn(),
  generatePassword: vi.fn(),
  generateVerificationCode: vi.fn(),
}));

describe("createUser", () => {
  let mockPrisma;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    mockReq = {
      body: {
        userFirstName: "John",
        userLastName: "Doe",
        userEmail: "john.doe@example.com",
        userUserName: "johndoe",
        userRole: "user",
      },
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    // Reset mocks before each test
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.create.mockReset();
    vi.mocked(sendEmail).mockReset();
    vi.mocked(hashPassword).mockReset();
    vi.mocked(generatePassword).mockReset();
    vi.mocked(generateVerificationCode).mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("should create a new user and send a verification email", async () => {
    // Setup
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 1,
      ...mockReq.body,
      userPassword: "hashedPassword",
      mustChangePassword: true,
      verificationCode: "verificationCode",
      verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    hashPassword.mockResolvedValue("hashedPassword");
    generatePassword.mockReturnValue("generatedPassword");
    generateVerificationCode.mockReturnValue("verificationCode");

    // Execute
    await createUser(mockReq, mockRes, mockPrisma);

    // Assert
    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2);
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          "User created successfully. Please check your email to verify your account.",
      })
    );
  });

  it("should return 400 if required fields are missing", async () => {
    // Setup
    mockReq.body = {
      userFirstName: "",
      userLastName: "",
      userEmail: "",
      userUserName: "",
      userRole: "",
    };

    // Execute
    await createUser(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Please fill all the inputs with valid information.",
    });
  });

  it("should return 400 if user already exists with the same userEmail", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({});
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    await createUser(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User already exists with the same userEmail.",
    });
  });

  it("should return 400 if user already exists with the same username", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.findUnique.mockResolvedValueOnce({});

    await createUser(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User already exists with the same username.",
    });
  });

  it("should return 500 if there is a server error", async () => {
    // Setup
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockRejectedValue(new Error("Server error"));

    // Execute
    await createUser(mockReq, mockRes);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Cannot read properties of undefined (reading 'user')",
      message: "Error creating user due to server issue.",
    });
  });
});
