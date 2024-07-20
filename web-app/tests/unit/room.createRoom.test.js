import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRoom } from "../../backend/controllers/roomController.js";
import { PrismaClient } from "@prisma/client";

// Mock the PrismaClient
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => ({
    room: {
      create: vi.fn(),
    },
    cinema: {
      findUnique: vi.fn(),
    },
    seat: {
      create: vi.fn(),
    },
  })),
}));

describe("Room Controllers", () => {
  let mockReq, mockRes, prisma;

  beforeEach(() => {
    mockReq = { body: {}, params: {} };
    mockRes = {
      status: vi.fn(() => mockRes),
      json: vi.fn(),
    };
    prisma = new PrismaClient();
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("createRoom", () => {
    it("should create a room successfully", async () => {
      mockReq.body = {
        roomNumber: "101",
        cinemaId: 1,
        roomCapacity: 100,
        roomQuality: "Standard",
      };

      prisma.cinema.findUnique.mockResolvedValue({ id: 1 });
      prisma.room.create.mockResolvedValue({ id: 1, ...mockReq.body });
      prisma.seat.create.mockResolvedValue({});

      await createRoom(mockReq, mockRes, prisma);

      expect(prisma.cinema.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.room.create).toHaveBeenCalled();
      expect(prisma.seat.create).toHaveBeenCalledTimes(100);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, ...mockReq.body })
      );
    });

    it("should return 400 if required fields are missing", async () => {
      mockReq.body = { roomNumber: "101" };

      await createRoom(mockReq, mockRes, prisma);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Please provide all required fields.",
      });
    });

    it("should return 404 if cinema does not exist", async () => {
      mockReq.body = {
        roomNumber: "101",
        cinemaId: 1,
        roomCapacity: 100,
        roomQuality: "Standard",
      };

      prisma.cinema.findUnique.mockResolvedValue(null);

      await createRoom(mockReq, mockRes, prisma);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Cinema not found.",
      });
    });

    it("should handle errors during room creation", async () => {
      mockReq.body = {
        roomNumber: "101",
        cinemaId: 1,
        roomCapacity: 100,
        roomQuality: "Standard",
      };

      prisma.cinema.findUnique.mockResolvedValue({ id: 1 });
      prisma.room.create.mockRejectedValue(new Error("Database error"));

      await createRoom(mockReq, mockRes, prisma);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Error creating room",
          error: expect.any(String),
        })
      );
    });
  });
});
