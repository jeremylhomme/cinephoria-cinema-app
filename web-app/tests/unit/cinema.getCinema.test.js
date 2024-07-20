import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCinema } from "../../backend/controllers/cinemaController.js";

// Mock Prisma
const mockPrisma = {
  cinema: {
    findUnique: vi.fn(),
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

  describe("getCinema", () => {
    it("should return a specific cinema", async () => {
      mockReq.params.id = "1";
      const mockCinema = {
        id: 1,
        cinemaName: "Cinema 1",
        rooms: [],
        sessions: [],
      };
      mockPrisma.cinema.findUnique.mockResolvedValue(mockCinema);

      await getCinema(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, cinemaName: "Cinema 1" })
      );
    });

    it("should return 404 if cinema not found", async () => {
      mockReq.params.id = "999";
      mockPrisma.cinema.findUnique.mockResolvedValue(null);

      await getCinema(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Cinema not found",
      });
    });

    it("should return 400 if cinema ID is missing", async () => {
      await getCinema(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Missing cinema ID",
      });
    });

    it("should handle errors", async () => {
      mockReq.params.id = "1";
      mockPrisma.cinema.findUnique.mockRejectedValue(
        new Error("Database error")
      );

      await getCinema(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Server error",
        error: "Database error",
      });
    });
  });
});
