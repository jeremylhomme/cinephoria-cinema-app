import { describe, it, expect, vi, beforeEach } from "vitest";
import { getReview } from "../../backend/controllers/reviewController.js";
import * as Review from "../../backend/models/reviewModel.js";

describe("Review Controllers", () => {
  let mockReq, mockRes, mockMongoose;

  beforeEach(() => {
    vi.resetModules();
    // Mock mongoose
    vi.mock("mongoose", () => ({
      default: {
        Types: {
          ObjectId: {
            isValid: vi.fn().mockReturnValue(true),
          },
        },
      },
    }));

    // Mock Review model
    vi.mock("../../backend/models/reviewModel.js", () => ({
      default: {
        findById: vi.fn(),
      },
    }));

    // Mock Prisma
    vi.mock("../../backend/config/prismaClient.js", () => ({
      default: {
        movie: { findUnique: vi.fn() },
        user: { findUnique: vi.fn() },
        session: { findUnique: vi.fn() },
      },
    }));

    vi.mock("../../backend/models/bookingModel.js", () => ({
      default: {
        findById: vi.fn(),
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
    mockMongoose = require("mongoose");
    vi.clearAllMocks();
  });

  describe("getReview", () => {
    it("should return a specific review", async () => {
      mockReq.params.id = "review1";

      const mockReview = { _id: "review1", userId: "1", movieId: "1" };

      Review.default.findById.mockResolvedValue(mockReview);

      await getReview(mockReq, mockRes);

      expect(Review.default.findById).toHaveBeenCalledWith("review1");
      expect(mockRes.json).toHaveBeenCalledWith(mockReview);
    });

    it("should return 404 if review is not found", async () => {
      mockReq.params.id = "nonexistent";

      Review.default.findById.mockResolvedValue(null);

      await getReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Review not found",
      });
    });
  });
});
