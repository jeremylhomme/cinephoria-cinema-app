import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { registerUser } from "../../backend/controllers/userController";
import dotenv from "dotenv";
import { sendEmail } from "../../backend/utils/sendEmail";
import {
  hashPassword,
  generatePassword,
  generateVerificationCode,
  isStrongPassword,
} from "../../backend/utils/userPasswordUtils";

dotenv.config({ path: ".env.docker.test" });

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  })),
}));

vi.mock("../../backend/utils/sendEmail", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("../../backend/utils/userPasswordUtils", () => ({
  hashPassword: vi.fn(),
  generatePassword: vi.fn(),
  generateVerificationCode: vi.fn(),
  isStrongPassword: vi.fn(),
}));

describe("registerUser", () => {
  let mockPrisma;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    mockReq = {
      body: {
        userFirstName: "Jane",
        userLastName: "Doe",
        userEmail: "jane.doe@example.com",
        userUserName: "janedoe",
        userPassword: "StrongPassword123!",
      },
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.findFirst.mockReset();
    mockPrisma.user.create.mockReset();
    vi.mocked(sendEmail).mockReset();
    vi.mocked(hashPassword).mockReset();
    vi.mocked(generatePassword).mockReset();
    vi.mocked(generateVerificationCode).mockReset();
    vi.mocked(isStrongPassword).mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("should register a new user and send a verification email", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.findFirst.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 1,
      ...mockReq.body,
      userPassword: "hashedPassword",
      userRole: "customer",
      verificationCode: "verificationCode",
      verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isVerified: false,
    });
    hashPassword.mockResolvedValue("hashedPassword");
    generateVerificationCode.mockReturnValue("verificationCode");
    isStrongPassword.mockReturnValue(true);

    await registerUser(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          "User registered successfully. Please check your email to verify your account.",
      })
    );
  });

  it("should return 400 if required fields are missing", async () => {
    mockReq.body = {
      userFirstName: "",
      userLastName: "",
      userEmail: "",
      userUserName: "",
      userPassword: "",
    };

    await registerUser(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "All fields are required.",
    });
  });

  it("should return 400 if password is not strong", async () => {
    isStrongPassword.mockReturnValue(false);

    await registerUser(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Password does not meet the requirements.",
    });
  });

  it("should return 400 if user already exists with the same userEmail", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({});
    isStrongPassword.mockReturnValue(true);

    await registerUser(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User already exists with this email.",
    });
  });

  it("should return 400 if user already exists with the same username", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.findFirst.mockResolvedValueOnce({});
    isStrongPassword.mockReturnValue(true);

    await registerUser(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User already exists with this username.",
    });
  });

  it("should return 500 if there is a server error", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.findFirst.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockRejectedValue(new Error("Server error"));
    isStrongPassword.mockReturnValue(true);

    await registerUser(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error registering user.",
      error: "Server error",
      stack: expect.any(String),
    });
  });
});
