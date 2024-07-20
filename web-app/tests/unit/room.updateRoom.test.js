import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateRoom } from "../../backend/controllers/roomController.js";
import { PrismaClient } from "@prisma/client";

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => ({
    room: {
      update: vi.fn(),
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

  describe("updateRoom", () => {
    it("should update a room successfully", async () => {
      mockReq.params.id = "1";
      mockReq.body = { roomNumber: "102" };
      const updatedRoom = {
        id: 1,
        roomNumber: "102",
        roomQuality: "Standard",
        roomCapacity: 100,
      };
      prisma.room.update.mockResolvedValue(updatedRoom);

      await updateRoom(mockReq, mockRes, prisma);

      expect(prisma.room.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: mockReq.body,
        select: {
          id: true,
          roomNumber: true,
          roomQuality: true,
          roomCapacity: true,
        },
      });
      expect(mockRes.json).toHaveBeenCalledWith(updatedRoom);
    });

    it("should handle errors", async () => {
      mockReq.params.id = "999";
      prisma.room.update.mockRejectedValue(new Error("Room not found"));

      await updateRoom(mockReq, mockRes, prisma);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Room not found or invalid data",
          error: "Room not found",
        })
      );
    });
  });
});
