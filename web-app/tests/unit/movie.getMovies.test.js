import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { getMovies } from "../../backend/controllers/movieController.js";
import Review from "../../backend/models/reviewModel.js";
import { asyncHandler } from "../../backend/middlewares/asyncHandler.js";

dotenv.config({ path: ".env.docker.test" });

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    movie: {
      findMany: vi.fn(),
    },
    cinema: {
      findUnique: vi.fn(),
    },
  })),
}));

vi.mock("../../backend/models/reviewModel.js", () => ({
  default: {
    find: vi.fn(),
  },
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

describe("getMovies", () => {
  let mockPrisma;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    mockReq = {
      query: {
        state: "all",
        categories: "all",
        cinemaId: "all",
        date: null,
      },
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("should fetch all movies without filters", async () => {
    const mockMovies = [
      {
        id: 1,
        movieTitle: "Test Movie",
        movieDescription: "This is a test movie",
        movieLength: 120,
        movieImg: "test.jpg",
        moviePublishingState: "Published",
        movieReleaseDate: new Date("2024-01-01"),
        movieMinimumAge: 13,
        movieScheduleDate: new Date("2024-01-01"),
        moviePremiereDate: new Date("2024-01-01"),
        movieTrailerUrl: "http://example.com/trailer",
        movieFavorite: false,
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
            cinema: {
              id: 1,
              cinemaName: "Cinema 1",
            },
            room: {
              id: 1,
              roomCapacity: 100,
            },
          },
        ],
      },
    ];

    mockPrisma.movie.findMany.mockResolvedValue(mockMovies);

    // Mock the Mongoose Review.find method
    Review.find.mockResolvedValue([{ movieId: "1", rating: 5 }]);

    await asyncHandler(getMovies)(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.movie.findMany).toHaveBeenCalledWith({
      where: {},
      select: expect.any(Object),
    });
    expect(Review.find).toHaveBeenCalledWith({ movieId: "1" });
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      movies: [
        {
          ...mockMovies[0],
          reviews: 1,
          averageRating: 5.0,
        },
      ],
    });
  });

  it("should return 500 if there is a server error", async () => {
    const error = new Error("Database error");
    mockPrisma.movie.findMany.mockRejectedValue(error);

    await asyncHandler(getMovies)(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error fetching movies",
      error: error.message,
    });
  });
});
