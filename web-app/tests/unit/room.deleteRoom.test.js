import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteRoom } from "../../backend/controllers/roomController.js";
import { PrismaClient } from "@prisma/client";

// Mock the asyncHandler
vi.mock("../../backend/middlewares/asyncHandler.js", () => ({
  asyncHandler: (fn) => fn,
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => ({
    room: {
      delete: vi.fn(),
    },
    seat: {
      deleteMany: vi.fn(),
    },
    session: {
      findMany: vi.fn(),
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
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("deleteRoom", () => {
    it("should delete a room and associated seats", async () => {
      mockReq.params.id = "1";
      prisma.session.findMany.mockResolvedValue([]);
      prisma.seat.deleteMany.mockResolvedValue({});
      prisma.room.delete.mockResolvedValue({ id: 1 });

      await deleteRoom(mockReq, mockRes, prisma);

      expect(prisma.session.findMany).toHaveBeenCalledWith({
        where: { roomId: 1 },
      });
      expect(prisma.seat.deleteMany).toHaveBeenCalledWith({
        where: { roomId: 1 },
      });
      expect(prisma.room.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Room and associated seats deleted successfully.",
      });
    });

    it("should not delete a room with associated sessions", async () => {
      mockReq.params.id = "1";
      prisma.session.findMany.mockResolvedValue([{ id: 1 }]);

      await deleteRoom(mockReq, mockRes, prisma);

      expect(prisma.session.findMany).toHaveBeenCalledWith({
        where: { roomId: 1 },
      });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message:
          "Cannot delete room because there are associated sessions. Please delete the sessions first.",
      });
    });

    it("should handle room not found", async () => {
      mockReq.params.id = "999";
      prisma.session.findMany.mockResolvedValue([]);
      prisma.seat.deleteMany.mockResolvedValue({});
      prisma.room.delete.mockResolvedValue(null);

      await deleteRoom(mockReq, mockRes, prisma);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Room not found" });
    });

    it("should handle errors during deletion", async () => {
      mockReq.params.id = "1";
      prisma.session.findMany.mockResolvedValue([]);
      prisma.seat.deleteMany.mockRejectedValue(new Error("Database error"));

      await deleteRoom(mockReq, mockRes, prisma);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "An error occurred while deleting the room.",
        error: "Database error",
      });
    });
  });
});
