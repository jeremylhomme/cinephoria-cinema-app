import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMovie } from "../../backend/controllers/movieController";
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.docker.test" });

// Mock PrismaClient
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    movie: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  })),
}));

describe("createMovie", () => {
  let mockPrisma;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    mockReq = {
      body: {
        movieTitle: "Test Movie",
        movieDescription: "This is a test movie",
        movieReleaseDate: "2024-01-01",
        movieTrailerUrl: "http://example.com/trailer",
        movieLength: "120",
        moviePublishingState: "Published",
        movieFavorite: false,
        movieMinimumAge: "13",
        categoryIds: [1, 2],
      },
      file: {
        path: "uploads/images/test.jpg",
      },
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    vi.clearAllMocks();
  });

  it("should create a movie successfully", async () => {
    mockPrisma.movie.findUnique.mockResolvedValue(null);
    mockPrisma.category.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockPrisma.movie.create.mockResolvedValue({
      id: 1,
      movieTitle: "Test Movie",
      movieDescription: "This is a test movie",
      movieReleaseDate: "2024-01-01T00:00:00.000Z",
      movieTrailerUrl: "http://example.com/trailer",
      movieLength: 120,
      moviePublishingState: "Published",
      movieFavorite: false,
      movieMinimumAge: 13,
      movieImg: path.join(process.cwd(), "uploads/images/test.jpg"),
      categories: [{ id: 1 }, { id: 2 }],
    });

    await createMovie(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.movie.findUnique).toHaveBeenCalledWith({
      where: { movieTitle: "Test Movie" },
    });
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2] } },
    });
    expect(mockPrisma.movie.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        movieTitle: "Test Movie",
        movieDescription: "This is a test movie",
        movieReleaseDate: "2024-01-01T00:00:00.000Z",
        movieLength: 120,
        movieTrailerUrl: "http://example.com/trailer",
        moviePublishingState: "Published",
        movieFavorite: false,
        movieMinimumAge: 13,
        movieImg: path.join(process.cwd(), "uploads/images/test.jpg"),
        categories: {
          connect: [{ id: 1 }, { id: 2 }],
        },
      }),
    });
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        movieTitle: "Test Movie",
      })
    );
  });

  it("should return 400 if required fields are missing", async () => {
    mockReq.body.movieTitle = "";

    await createMovie(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Please provide all required fields.",
    });
  });

  it("should return 400 if movie already exists", async () => {
    mockPrisma.movie.findUnique.mockResolvedValue({ id: 1 });

    await createMovie(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.movie.findUnique).toHaveBeenCalledWith({
      where: { movieTitle: "Test Movie" },
    });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Movie already exists",
    });
  });

  it("should return 400 if category IDs are invalid", async () => {
    mockPrisma.movie.findUnique.mockResolvedValue(null);
    mockPrisma.category.findMany.mockResolvedValue([{ id: 1 }]);

    await createMovie(mockReq, mockRes, mockPrisma);

    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2] } },
    });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "One or more Category IDs do not exist: 2",
    });
  });
});
