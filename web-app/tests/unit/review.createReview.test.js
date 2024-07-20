import { describe, it, expect, vi, beforeEach } from "vitest";
import { createReview } from "../../backend/controllers/reviewController.js";
import * as Review from "../../backend/models/reviewModel.js";
import * as Booking from "../../backend/models/bookingModel.js";
import prisma from "../../backend/config/prismaClient.js";

describe("Review Controllers - Create Review", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    // Mock Review model
    vi.mock("../../backend/models/reviewModel.js", () => ({
      default: {
        create: vi.fn(),
        findOne: vi.fn(),
      },
    }));

    // Mock Booking model
    vi.mock("../../backend/models/bookingModel.js", () => ({
      default: {
        findOne: vi.fn(),
      },
    }));

    // Mock Prisma
    vi.mock("../../backend/config/prismaClient.js", () => ({
      default: {
        movie: { findUnique: vi.fn() },
        session: { findUnique: vi.fn() },
      },
    }));

    mockReq = {
      body: {},
      params: {},
      user: {
        id: "1",
        userFirstName: "John",
        userLastName: "Doe",
        userEmail: "john@example.com",
      },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it("should create a new review successfully", async () => {
    mockReq.params = { movieId: "1", sessionId: "1" };
    mockReq.body = {
      bookingId: "booking1",
      rating: 5,
      comment: "Great movie!",
    };

    prisma.movie.findUnique.mockResolvedValue({
      id: 1,
      movieTitle: "Test Movie",
    });
    prisma.session.findUnique.mockResolvedValue({ id: 1 });

    Booking.default.findOne.mockResolvedValue({
      _id: "booking1",
      userId: "1",
      movieId: "1",
      sessionId: "1",
    });

    Review.default.findOne.mockResolvedValue(null);

    const mockCreatedReview = {
      _id: "reviewId1",
      userId: "1",
      movieId: "1",
      sessionId: "1",
      rating: 5,
      comment: "Great movie!",
      userFirstName: "John",
      userLastName: "Doe",
      userEmail: "john@example.com",
      movieTitle: "Test Movie",
      status: "pending",
    };
    Review.default.create.mockResolvedValue(mockCreatedReview);

    await createReview(mockReq, mockRes, prisma);

    expect(prisma.movie.findUnique).toHaveBeenCalled();
    expect(prisma.session.findUnique).toHaveBeenCalled();
    expect(Booking.default.findOne).toHaveBeenCalled();
    expect(Review.default.findOne).toHaveBeenCalled();
    expect(Review.default.create).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockCreatedReview);
  });

  it("should return 400 if required fields are missing", async () => {
    mockReq.params = { movieId: "1", sessionId: "1" };
    mockReq.body = { bookingId: "booking1" }; // Missing rating

    await createReview(mockReq, mockRes, prisma);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Missing required fields",
    });
  });
});
