import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteReview } from "../../backend/controllers/reviewController.js";
import Review from "../../backend/models/reviewModel.js";

describe("Review Controllers", () => {
  let mockReq, mockRes;

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

    vi.mock("../../backend/models/bookingModel.js", () => ({
      default: {
        findById: vi.fn(),
      },
    }));
    mockReq = {
      params: { id: "review1" },
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
    vi.clearAllMocks();
  });

  describe("deleteReview", () => {
    it("should mark a review as deleted", async () => {
      const mockReview = {
        _id: "review1",
        status: "approved",
        save: vi.fn().mockResolvedValue({
          _id: "review1",
          status: "rejected",
          deletedAt: new Date(),
        }),
      };
      Review.findById.mockResolvedValue(mockReview);

      await deleteReview(mockReq, mockRes);

      expect(Review.findById).toHaveBeenCalledWith("review1");
      expect(mockReview.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Review status updated to deleted",
        review: expect.objectContaining({
          _id: "review1",
          status: "rejected",
          deletedAt: expect.any(Date),
        }),
      });
    });

    it("should return 404 if review to delete is not found", async () => {
      Review.findById.mockResolvedValue(null);

      await deleteReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Review not found",
      });
    });

    it("should return 500 if review status update fails", async () => {
      const mockReview = {
        _id: "review1",
        status: "approved",
        save: vi.fn().mockRejectedValue(new Error("Save failed")),
      };
      Review.findById.mockResolvedValue(mockReview);

      await deleteReview(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Save failed",
      });
    });
  });
});
