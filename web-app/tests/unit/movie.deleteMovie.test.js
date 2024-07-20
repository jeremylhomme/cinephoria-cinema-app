import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { deleteMovie } from "../../backend/controllers/movieController.js";
import { asyncHandler } from "../../backend/middlewares/asyncHandler.js";

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    movie: {
      delete: vi.fn(),
    },
  })),
}));

vi.mock("../../backend/middlewares/asyncHandler.js", () => ({
  asyncHandler: (fn) => async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
}));

describe("deleteMovie", () => {
  let mockPrisma;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    mockReq = {
      params: { id: "1" },
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  it("should delete a movie successfully", async () => {
    mockPrisma.movie.delete.mockResolvedValue({ id: 1 });

    await deleteMovie(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.movie.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Movie deleted successfully",
    });
  });

  it("should handle errors when deleting a movie", async () => {
    const error = new Error("Database error");
    mockPrisma.movie.delete.mockRejectedValue(error);

    await deleteMovie(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.movie.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Database error" });
  });
});
