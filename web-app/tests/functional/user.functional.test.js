// tests/backend/functional/user.functional.test.js
import {
  describe,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  expect,
  vi,
} from "vitest";
import request from "supertest";
import app from "../setup";
import prisma from "../../backend/config/prismaClient";
import { sendEmail } from "../../backend/utils/sendEmail";
import { hashPassword } from "../../backend/utils/userPasswordUtils";

// Mock the sendEmail utility
vi.mock("../../backend/utils/sendEmail", () => ({
  sendEmail: vi.fn(),
}));

// Mock the authentication middleware
vi.mock("../../backend/middlewares/authMiddleware", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    authenticatedUser: (req, res, next) => {
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        const token = req.headers.authorization.split(" ")[1];
        req.user = {
          id: 1,
          userFirstName: "Test",
          userLastName: "User",
          userEmail: "test@example.com",
          userRole:
            token === "ADMIN_TOKEN"
              ? "admin"
              : token === "SUPERADMIN_TOKEN"
              ? "superadmin"
              : token === "EMPLOYEE_TOKEN"
              ? "employee"
              : "customer",
        };
        next();
      } else if (req.cookies.jwt) {
        req.user = {
          id: 1,
          userFirstName: "Test",
          userLastName: "User",
          userEmail: "test@example.com",
          userRole: "customer",
        };
        next();
      } else {
        res.status(401).json({ error: "Not authorized, no token provided." });
      }
    },
    authorizedAdmin: (req, res, next) => {
      if (
        req.user &&
        (req.user.userRole === "admin" || req.user.userRole === "superadmin")
      ) {
        next();
      } else {
        res.status(403).json({ error: "Not authorized as an admin" });
      }
    },
    authorizedEmployee: (req, res, next) => {
      if (["employee", "admin", "superadmin"].includes(req.user.userRole)) {
        next();
      } else {
        res.status(403).json({
          error: "Access denied. Employee, Admin, or Superadmin role required.",
        });
      }
    },
    authorizedSuperAdmin: (req, res, next) => {
      if (req.user && req.user.userRole === "superadmin") {
        next();
      } else {
        res.status(403).json({ error: "Not authorized as a superadmin" });
      }
    },
  };
});

describe("User Controller", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    vi.clearAllMocks();
  });

  describe("POST /api/users", () => {
    it("should create a new user when admin token is provided", async () => {
      const response = await request(app)
        .post("/api/users")
        .set("Authorization", "Bearer ADMIN_TOKEN")
        .send({
          userFirstName: "John",
          userLastName: "Doe",
          userEmail: "john.doe@example.com",
          userUserName: "johndoe",
          userRole: "customer",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty(
        "message",
        "User created successfully. Please check your email to verify your account."
      );

      // Check that the user was created in the database
      const user = await prisma.user.findUnique({
        where: { userEmail: "john.doe@example.com" },
      });
      expect(user).not.toBeNull();
    });

    it("should return 400 if user already exists", async () => {
      await prisma.user.create({
        data: {
          userFirstName: "Jane",
          userLastName: "Doe",
          userEmail: "jane.doe@example.com",
          userUserName: "janedoe",
          userPassword: "hashedPassword",
          userRole: "customer",
        },
      });

      const response = await request(app)
        .post("/api/users")
        .set("Authorization", "Bearer ADMIN_TOKEN")
        .send({
          userFirstName: "Jane",
          userLastName: "Doe",
          userEmail: "jane.doe@example.com",
          userUserName: "janedoe",
          userRole: "customer",
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "User already exists with the same userEmail."
      );
    });

    it("should return 403 if non-admin user tries to create a new user", async () => {
      const response = await request(app)
        .post("/api/users")
        .set("Authorization", "Bearer CUSTOMER_TOKEN")
        .send({
          userFirstName: "John",
          userLastName: "Doe",
          userEmail: "john.doe@example.com",
          userUserName: "johndoe",
          userRole: "customer",
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        "error",
        "Not authorized as an admin"
      );
    });

    it("should return 401 if no token is provided", async () => {
      const response = await request(app).post("/api/users").send({
        userFirstName: "John",
        userLastName: "Doe",
        userEmail: "john.doe@example.com",
        userUserName: "johndoe",
        userRole: "customer",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "error",
        "Not authorized, no token provided."
      );
    });
  });

  describe("Role-based Access Control", () => {
    it("should allow superadmin to access admin routes", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", "Bearer SUPERADMIN_TOKEN");

      expect(response.status).toBe(200);
    });

    it("should allow admin to access admin routes", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", "Bearer ADMIN_TOKEN");

      expect(response.status).toBe(200);
    });

    it("should not allow employee to access admin routes", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", "Bearer EMPLOYEE_TOKEN");

      expect(response.status).toBe(403);
    });

    it("should allow superadmin to access employee routes", async () => {
      const response = await request(app)
        .get("/api/employee-route")
        .set("Authorization", "Bearer SUPERADMIN_TOKEN");

      expect(response.status).toBe(200);
    });

    it("should allow admin to access employee routes", async () => {
      const response = await request(app)
        .get("/api/employee-route")
        .set("Authorization", "Bearer ADMIN_TOKEN");

      expect(response.status).toBe(200);
    });

    it("should allow employee to access employee routes", async () => {
      const response = await request(app)
        .get("/api/employee-route")
        .set("Authorization", "Bearer EMPLOYEE_TOKEN");

      expect(response.status).toBe(200);
    });

    it("should not allow customer to access admin routes", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", "Bearer CUSTOMER_TOKEN");

      expect(response.status).toBe(403);
    });

    it("should allow only superadmin to access superadmin routes", async () => {
      const superadminResponse = await request(app)
        .get("/api/superadmin-route")
        .set("Authorization", "Bearer SUPERADMIN_TOKEN");

      expect(superadminResponse.status).toBe(200);

      const adminResponse = await request(app)
        .get("/api/superadmin-route")
        .set("Authorization", "Bearer ADMIN_TOKEN");

      expect(adminResponse.status).toBe(403);

      const employeeResponse = await request(app)
        .get("/api/superadmin-route")
        .set("Authorization", "Bearer EMPLOYEE_TOKEN");

      expect(employeeResponse.status).toBe(403);
    });
  });

  describe("POST /api/users/register", () => {
    it("should register a new user and send a verification email", async () => {
      const response = await request(app).post("/api/users/register").send({
        userFirstName: "Alice",
        userLastName: "Smith",
        userEmail: "alice.smith@example.com",
        userPassword: "Password123!",
        userUserName: "alicesmith",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty(
        "message",
        "User registered successfully. Please check your email to verify your account."
      );

      // Check that the user was created in the database
      const user = await prisma.user.findUnique({
        where: { userEmail: "alice.smith@example.com" },
      });
      expect(user).not.toBeNull();
      expect(user.userRole).toBe("customer");

      // Check that a verification email was sent
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "alice.smith@example.com",
          subject: "Confirmez votre compte Cinéphoria",
        })
      );
    });

    it("should return 400 if user already exists", async () => {
      await prisma.user.create({
        data: {
          userFirstName: "Bob",
          userLastName: "Smith",
          userEmail: "bob.smith@example.com",
          userUserName: "bobsmith",
          userPassword: "hashedPassword",
          userRole: "customer",
        },
      });

      const response = await request(app).post("/api/users/register").send({
        userFirstName: "Bob",
        userLastName: "Smith",
        userEmail: "bob.smith@example.com",
        userPassword: "Password123!",
        userUserName: "bobsmith",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "User already exists with this email."
      );
    });

    it("should return 400 for invalid input", async () => {
      const response = await request(app).post("/api/users/register").send({
        userFirstName: "Alice",
        userLastName: "",
        userEmail: "alice.smith@example.com",
        userPassword: "Password123!",
        userUserName: "alicesmith",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "All fields are required."
      );
    });

    it("should return 400 for weak password", async () => {
      const response = await request(app).post("/api/users/register").send({
        userFirstName: "Alice",
        userLastName: "Smith",
        userEmail: "alice.smith@example.com",
        userPassword: "weakpassword",
        userUserName: "alicesmith",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Password does not meet the requirements."
      );
    });

    it("should always set user role to customer", async () => {
      const response = await request(app).post("/api/users/register").send({
        userFirstName: "Alice",
        userLastName: "Smith",
        userEmail: "alice.smith@example.com",
        userPassword: "Password123!",
        userUserName: "alicesmith",
        userRole: "admin", // Attempting to set role to admin
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty(
        "message",
        "User registered successfully. Please check your email to verify your account."
      );

      // Check that the user was created in the database
      const user = await prisma.user.findUnique({
        where: { userEmail: "alice.smith@example.com" },
      });
      expect(user).not.toBeNull();
      expect(user.userRole).toBe("customer"); // Ensure the role is set to customer regardless of input
    });
  });
  describe("POST /api/users/login", () => {
    it("should login a user with valid credentials", async () => {
      const password = "ValidPassword123!";
      const hashedPassword = await hashPassword(password);
      await prisma.user.create({
        data: {
          userFirstName: "John",
          userLastName: "Doe",
          userEmail: "john.doe@example.com",
          userUserName: "johndoe",
          userPassword: hashedPassword,
          userRole: "customer",
        },
      });

      const response = await request(app).post("/api/users/login").send({
        userEmail: "john.doe@example.com",
        userPassword: password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("userEmail", "john.doe@example.com");
      expect(response.headers["set-cookie"]).toBeDefined(); // Check if JWT cookie is set
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app).post("/api/users/login").send({
        userEmail: "john.doe@example.com",
        userPassword: "WrongPassword123!",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Invalid email or password."
      );
    });
  });

  describe("Password Reset", () => {
    it("should initiate password reset process", async () => {
      await prisma.user.create({
        data: {
          userFirstName: "Jane",
          userLastName: "Doe",
          userEmail: "jane.doe@example.com",
          userUserName: "janedoe",
          userPassword: "hashedPassword",
          userRole: "customer",
        },
      });

      const response = await request(app)
        .post("/api/users/reset-password")
        .send({
          userEmail: "jane.doe@example.com",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Instructions de réinitialisation du mot de passe envoyées."
      );
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it("should confirm password reset with valid token", async () => {
      const user = await prisma.user.create({
        data: {
          userFirstName: "Bob",
          userLastName: "Smith",
          userEmail: "bob.smith@example.com",
          userUserName: "bobsmith",
          userPassword: "hashedPassword",
          userRole: "customer",
          resetToken: "validtoken",
          resetTokenExpires: new Date(Date.now() + 3600000), // 1 hour from now
        },
      });

      const response = await request(app)
        .post("/api/users/reset-password-confirm")
        .send({
          token: "validtoken",
          newPassword: "NewPassword123!",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Password has been reset successfully."
      );

      // Verify that the password was actually changed
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser.resetToken).toBeNull();
      expect(updatedUser.resetTokenExpires).toBeNull();
    });
  });

  describe("Protected Routes", () => {
    let authToken;
    let testUser;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          userFirstName: "Auth",
          userLastName: "User",
          userEmail: "auth.user@example.com",
          userUserName: "authuser",
          userPassword: await hashPassword("AuthPassword123!"),
          userRole: "customer",
        },
      });

      const loginResponse = await request(app).post("/api/users/login").send({
        userEmail: "auth.user@example.com",
        userPassword: "AuthPassword123!",
      });

      authToken = loginResponse.headers["set-cookie"][0].split(";")[0];
    });

    it("should allow access to protected route with valid token", async () => {
      const response = await request(app)
        .get(`/api/users/profile/${testUser.id}`)
        .set("Cookie", [authToken]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "userEmail",
        "auth.user@example.com"
      );
    });

    it("should deny access to protected route without token", async () => {
      const response = await request(app).get(
        `/api/users/profile/${testUser.id}`
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "error",
        "Not authorized, no token provided."
      );
    });

    it("should deny access to admin route for non-admin user", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Cookie", [authToken]);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        "error",
        "Not authorized as an admin"
      );
    });

    it("should allow access to admin route for admin user", async () => {
      const response = await request(app)
        .get("/api/users")
        .set("Authorization", "Bearer ADMIN_TOKEN");

      expect(response.status).toBe(200);
    });
  });
});
