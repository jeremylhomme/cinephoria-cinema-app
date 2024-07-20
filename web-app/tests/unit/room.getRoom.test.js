import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRoom } from "../../backend/controllers/roomController.js";
import { PrismaClient } from "@prisma/client";

// Mock the asyncHandler
vi.mock("../../backend/middlewares/asyncHandler.js", () => ({
  asyncHandler: (fn) => fn,
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => ({
    room: {
      findUnique: vi.fn(),
    },
  })),
}));

describe("Room Controllers", () => {
  let mockReq, mockRes, prisma;

  beforeEach(() => {
    mockReq = { params: {} };
    mockRes = {
      status: vi.fn(() => mockRes),
      json: vi.fn(),
    };
    prisma = new PrismaClient();
    vi.clearAllMocks();
  });

  describe("getRoom", () => {
    it("should return a specific room", async () => {
      const mockRoom = {
        id: 1,
        roomNumber: "101",
        cinema: { id: 1, name: "Cinema 1" },
        sessions: [{ id: 1, date: "2023-05-20" }],
      };
      mockReq.params.id = "1";
      prisma.room.findUnique.mockResolvedValue(mockRoom);

      await getRoom(mockReq, mockRes, prisma);

      expect(prisma.room.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          cinema: true,
          sessions: true,
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith(mockRoom);
    });

    it("should return 404 if room not found", async () => {
      mockReq.params.id = "999";
      prisma.room.findUnique.mockResolvedValue(null);

      await getRoom(mockReq, mockRes, prisma);

      expect(prisma.room.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: {
          cinema: true,
          sessions: true,
        },
      });
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Room not found" });
    });
  });
});
