import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateCinema } from "../../backend/controllers/cinemaController.js";

// Mock Prisma
const mockPrisma = {
  cinema: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

describe("Cinema Controllers", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { params: {}, query: {}, body: {} };
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

  describe("updateCinema", () => {
    it("should update a cinema", async () => {
      mockReq.params.id = "1";
      mockReq.body = { cinemaName: "Updated Cinema" };
      const mockCinema = { id: 1, cinemaName: "Old Cinema" };
      mockPrisma.cinema.findUnique.mockResolvedValue(mockCinema);
      mockPrisma.cinema.findFirst.mockResolvedValue(null);
      mockPrisma.cinema.update.mockResolvedValue({
        ...mockCinema,
        ...mockReq.body,
      });

      await updateCinema(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, cinemaName: "Updated Cinema" })
      );
    });

    it("should return 404 if cinema not found", async () => {
      mockReq.params.id = "999";
      mockPrisma.cinema.findUnique.mockResolvedValue(null);

      await updateCinema(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Cinema not found",
      });
    });

    it("should return 400 if cinema name already exists", async () => {
      mockReq.params.id = "1";
      mockReq.body = { cinemaName: "Existing Cinema" };
      mockPrisma.cinema.findUnique.mockResolvedValue({
        id: 1,
        cinemaName: "Old Cinema",
      });
      mockPrisma.cinema.findFirst.mockResolvedValue({
        id: 2,
        cinemaName: "Existing Cinema",
      });

      await updateCinema(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Another cinema with the same cinemaName already exists.",
      });
    });

    it("should handle errors", async () => {
      mockReq.params.id = "1";
      mockReq.body = { cinemaName: "Updated Cinema" };
      mockPrisma.cinema.findUnique.mockResolvedValue({
        id: 1,
        cinemaName: "Old Cinema",
      });
      mockPrisma.cinema.findFirst.mockResolvedValue(null);
      mockPrisma.cinema.update.mockRejectedValue(new Error("Database error"));

      await updateCinema(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Error updating cinema",
        error: "Database error",
      });
    });
  });
});
