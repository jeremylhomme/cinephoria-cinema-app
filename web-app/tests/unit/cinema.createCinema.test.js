import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCinema } from "../../backend/controllers/cinemaController.js";

// Mock Prisma
const mockPrisma = {
  cinema: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

describe("createCinema", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {
        cinemaName: "Test Cinema",
        cinemaEmail: "test@cinema.com",
        cinemaAddress: "123 Test St",
        cinemaPostalCode: "12345",
        cinemaCity: "Test City",
        cinemaCountry: "Test Country",
        cinemaTelNumber: "1234567890",
        cinemaStartTimeOpening: "09:00",
        cinemaEndTimeOpening: "23:00",
      },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("should create a new cinema", async () => {
    mockPrisma.cinema.findFirst.mockResolvedValue(null);
    mockPrisma.cinema.create.mockResolvedValue({ id: 1, ...mockReq.body });

    await createCinema(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.cinema.findFirst).toHaveBeenCalled();
    expect(mockPrisma.cinema.create).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, ...mockReq.body })
    );
  });

  it("should return 400 if required fields are missing", async () => {
    mockReq.body = {};

    await createCinema(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Please provide all required fields.",
    });
  });

  it("should return 400 if cinema with same name already exists", async () => {
    mockPrisma.cinema.findFirst.mockResolvedValue({
      cinemaName: mockReq.body.cinemaName,
    });

    await createCinema(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Cinema with this name already exists.",
    });
  });

  it("should return 400 if cinema with same email already exists", async () => {
    mockPrisma.cinema.findFirst.mockResolvedValue({
      cinemaEmail: mockReq.body.cinemaEmail,
    });

    await createCinema(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Cinema with this email already exists.",
    });
  });

  it("should return 500 if there's an error creating the cinema", async () => {
    mockPrisma.cinema.findFirst.mockResolvedValue(null);
    mockPrisma.cinema.create.mockRejectedValue(new Error("Database error"));

    await createCinema(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error creating cinema",
      error: "Database error",
    });
  });
});
