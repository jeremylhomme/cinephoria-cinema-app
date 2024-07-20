import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCinemas } from "../../backend/controllers/cinemaController.js";

// Mock Prisma
const mockPrisma = {
  cinema: {
    findMany: vi.fn(),
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

  describe("getCinemas", () => {
    it("should return all cinemas", async () => {
      const mockCinemas = [
        { id: 1, cinemaName: "Cinema 1", sessions: [] },
        { id: 2, cinemaName: "Cinema 2", sessions: [] },
      ];
      mockPrisma.cinema.findMany.mockResolvedValue(mockCinemas);

      await getCinemas(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, cinemaName: "Cinema 1" }),
          expect.objectContaining({ id: 2, cinemaName: "Cinema 2" }),
        ])
      );
    });

    it("should filter cinemas by ID if provided", async () => {
      mockReq.query.cinemaId = "1";
      const mockCinema = { id: 1, cinemaName: "Cinema 1", sessions: [] };
      mockPrisma.cinema.findMany.mockResolvedValue([mockCinema]);

      await getCinemas(mockReq, mockRes, mockPrisma);

      expect(mockPrisma.cinema.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([
        expect.objectContaining({ id: 1, cinemaName: "Cinema 1" }),
      ]);
    });

    it("should handle errors", async () => {
      mockPrisma.cinema.findMany.mockRejectedValue(new Error("Database error"));

      await getCinemas(mockReq, mockRes, mockPrisma);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Error retrieving cinemas",
        error: "Database error",
      });
    });
  });
});
