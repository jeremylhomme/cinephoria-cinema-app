import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { getMovie } from "../../backend/controllers/movieController.js";

// Mock PrismaClient
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    movie: {
      findUnique: vi.fn(),
    },
  })),
}));

// Mock asyncHandler
vi.mock("../../backend/middlewares/asyncHandler.js", () => ({
  asyncHandler: (fn) => async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
}));

describe("getMovie", () => {
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

  it("should fetch a movie by id successfully", async () => {
    const mockMovie = {
      id: 1,
      movieTitle: "Test Movie",
      movieDescription: "This is a test movie",
      movieLength: 120,
      movieImg: "test.jpg",
      movieFavorite: false,
      moviePublishingState: "Published",
      movieReleaseDate: new Date("2024-01-01"),
      movieMinimumAge: 13,
      movieScheduleDate: new Date("2024-01-01"),
      moviePremiereDate: new Date("2024-01-01"),
      movieTrailerUrl: "http://example.com/trailer",
      movieCreatedAt: new Date(),
      movieUpdatedAt: new Date(),
      categories: [
        {
          id: 1,
          categoryName: "Action",
        },
      ],
      sessions: [
        {
          id: 1,
          timeRanges: "10:00-12:00",
          sessionDate: new Date("2024-01-01"),
          sessionPrice: 10,
          cinema: {
            id: 1,
            cinemaName: "Cinema 1",
          },
          room: {
            id: 1,
            roomCapacity: 100,
            roomQuality: "Standard",
          },
        },
      ],
    };

    mockPrisma.movie.findUnique.mockResolvedValue(mockMovie);

    await getMovie(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.movie.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: expect.any(Object),
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockMovie);
  });

  it("should return 404 if movie is not found", async () => {
    mockPrisma.movie.findUnique.mockResolvedValue(null);

    await getMovie(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.movie.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: expect.any(Object),
    });
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Movie not found" });
  });

  it("should handle errors and return 500", async () => {
    const error = new Error("Database error");
    mockPrisma.movie.findUnique.mockRejectedValue(error);

    await getMovie(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.movie.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: expect.any(Object),
    });
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Database error" });
  });
});
