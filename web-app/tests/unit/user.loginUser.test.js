import { describe, it, expect, vi } from "vitest";
import bcrypt from "bcryptjs";
import * as createTokenModule from "../../backend/utils/createToken.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.docker.test" });

// Mock external dependencies
vi.mock("bcryptjs");
vi.mock("../../backend/utils/createToken", () => ({
  __esModule: true,
  default: vi.fn(),
}));
// Mocking Prisma Client
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
};

// Mocking Express req and res
const mockReq = {
  body: {
    userEmail: "test@example.com",
    userPassword: "password123",
  },
};

const mockRes = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
};

const createTokenSpy = vi.spyOn(createTokenModule, "default");

const loginUser = async (req, res, prisma) => {
  const { userEmail, userPassword } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { userEmail } });
  if (!existingUser) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  const isPasswordValid = await bcrypt.compare(
    userPassword,
    existingUser.userPassword
  );
  if (isPasswordValid) {
    createTokenModule.default(res, existingUser.id);
    return res.status(200).json({
      id: existingUser.id,
      userFirstName: existingUser.userFirstName,
      userLastName: existingUser.userLastName,
      userUserName: existingUser.userUserName,
      userEmail: existingUser.userEmail,
      userRole: existingUser.userRole,
      userCreatedAt: existingUser.userCreatedAt,
      mustChangePassword: existingUser.mustChangePassword,
    });
  }
  return res.status(401).json({ message: "Invalid email or password." });
};

describe("loginUser Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user does not exist", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await loginUser(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid email or password.",
    });
  });

  it("should return 401 if password is invalid", async () => {
    const existingUser = {
      id: 1,
      userFirstName: "John",
      userLastName: "Doe",
      userEmail: "test@example.com",
      userPassword: "hashedpassword",
      userRole: "user",
      userCreatedAt: new Date(),
      mustChangePassword: false,
    };
    mockPrisma.user.findUnique.mockResolvedValue(existingUser);
    bcrypt.compare.mockResolvedValue(false);

    await loginUser(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid email or password.",
    });
  });

  it("should return 200 and user data if password is valid", async () => {
    const existingUser = {
      id: 1,
      userFirstName: "John",
      userLastName: "Doe",
      userUserName: "johndoe",
      userEmail: "test@example.com",
      userPassword: "hashedpassword",
      userRole: "user",
      userCreatedAt: new Date(),
      mustChangePassword: false,
    };
    mockPrisma.user.findUnique.mockResolvedValue(existingUser);
    bcrypt.compare.mockResolvedValue(true);

    await loginUser(mockReq, mockRes, mockPrisma);

    expect(createTokenSpy).toHaveBeenCalledWith(mockRes, existingUser.id);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      id: existingUser.id,
      userFirstName: existingUser.userFirstName,
      userLastName: existingUser.userLastName,
      userUserName: existingUser.userUserName,
      userEmail: existingUser.userEmail,
      userRole: existingUser.userRole,
      userCreatedAt: existingUser.userCreatedAt,
      mustChangePassword: existingUser.mustChangePassword,
    });
  });
});
