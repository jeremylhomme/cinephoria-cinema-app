import { describe, it, expect, vi, beforeEach } from "vitest";
import { getReviews } from "../../backend/controllers/reviewController.js";
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
        create: vi.fn(),
        find: vi.fn(),
        findById: vi.fn(),
        findByIdAndUpdate: vi.fn(),
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

  describe("getReviews", () => {
    it("should return all reviews", async () => {
      const mockReviews = [
        { _id: "review1", userId: "1", movieId: "1" },
        { _id: "review2", userId: "2", movieId: "2" },
      ];

      Review.default.find.mockResolvedValue(mockReviews);

      await getReviews(mockReq, mockRes);

      expect(Review.default.find).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockReviews);
    });
  });
});
