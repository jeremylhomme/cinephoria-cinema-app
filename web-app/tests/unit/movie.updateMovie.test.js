import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { updateMovie } from "../../backend/controllers/movieController.js";
import { asyncHandler } from "../../backend/middlewares/asyncHandler.js";
import moment from "moment";
import { join } from "path";

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    movie: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  })),
}));

vi.mock("moment", () => ({
  default: vi.fn(() => ({
    toISOString: vi.fn(),
  })),
}));

vi.mock("path", () => ({
  join: vi.fn(),
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

describe("updateMovie", () => {
  let mockPrisma;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    mockReq = {
      params: { id: "1" },
      body: {},
      headers: { host: "localhost:3000" },
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  it("should update a movie successfully", async () => {
    mockPrisma.movie.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.movie.update.mockResolvedValue({
      id: 1,
      movieTitle: "Updated Movie",
      movieImg: "images/updated-movie.jpg",
    });

    mockReq.body = {
      movieTitle: "Updated Movie",
      movieDescription: "Updated description",
    };

    await updateMovie(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.movie.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockPrisma.movie.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({
        movieTitle: "Updated Movie",
        movieDescription: "Updated description",
        movieUpdatedAt: expect.any(Date),
      }),
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      id: 1,
      movieTitle: "Updated Movie",
      movieImg: "http://localhost:3000/images/updated-movie.jpg",
    });
  });

  it("should return 404 if movie is not found", async () => {
    mockPrisma.movie.findUnique.mockResolvedValue(null);

    await updateMovie(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Movie not found" });
  });

  it("should handle invalid date formats", async () => {
    mockPrisma.movie.findUnique.mockResolvedValue({ id: 1 });
    mockReq.body = {
      movieScheduleDate: "invalid-date",
    };

    await updateMovie(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid schedule date format",
    });
  });

  // Add more tests for other scenarios (e.g., invalid minimum age, category IDs, etc.)
});
