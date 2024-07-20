import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRooms } from "../../backend/controllers/roomController.js";
import { PrismaClient } from "@prisma/client";

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => ({
    room: {
      findMany: vi.fn(),
    },
    session: {
      findMany: vi.fn(),
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
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("getRooms", () => {
    it("should return all rooms", async () => {
      const mockRooms = [
        { id: 1, roomNumber: "101" },
        { id: 2, roomNumber: "102" },
      ];
      prisma.room.findMany.mockResolvedValue(mockRooms);

      await getRooms(mockReq, mockRes, prisma);

      expect(prisma.room.findMany).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockRooms);
    });

    it("should handle errors", async () => {
      prisma.room.findMany.mockRejectedValue(new Error("Database error"));

      await getRooms(mockReq, mockRes, prisma);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Error fetching rooms",
          details: "Database error",
        })
      );
    });
  });
});
