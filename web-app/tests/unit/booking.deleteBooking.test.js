import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteBooking } from "../../backend/controllers/bookingController.js";
import * as Booking from "../../backend/models/bookingModel.js";
import prisma from "../../backend/config/prismaClient.js";

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

// Mock Booking model
vi.mock("../../backend/models/bookingModel.js", () => ({
  default: {
    findById: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

// Mock Prisma
vi.mock("../../backend/config/prismaClient.js", () => ({
  default: {
    seatStatus: {
      updateMany: vi.fn(),
    },
  },
}));

describe("deleteBooking", () => {
  let mockReq, mockRes, mockMongoose;

  beforeEach(() => {
    mockReq = {
      params: { id: "507f1f77bcf86cd799439011" }, // Valid MongoDB ObjectId
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockMongoose = require("mongoose");
    vi.clearAllMocks();
  });

  it("should delete a booking", async () => {
    const mockBooking = {
      _id: "507f1f77bcf86cd799439011",
      timeRange: { timeRangeId: 1 },
      seatsBooked: [
        { seatId: 1, seatNumber: "A1", status: "booked", pmrSeat: false },
      ],
    };

    Booking.default.findById.mockResolvedValue(mockBooking);
    prisma.seatStatus.updateMany.mockResolvedValue({});
    Booking.default.findByIdAndDelete.mockResolvedValue(mockBooking);

    await deleteBooking(mockReq, mockRes, prisma);

    expect(Booking.default.findById).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011"
    );
    expect(prisma.seatStatus.updateMany).toHaveBeenCalled();
    expect(Booking.default.findByIdAndDelete).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011"
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Booking successfully removed",
    });
  });

  it("should return 404 if booking is not found", async () => {
    Booking.default.findById.mockResolvedValue(null);

    await deleteBooking(mockReq, mockRes, prisma);

    expect(Booking.default.findById).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011"
    );
    expect(prisma.seatStatus.updateMany).not.toHaveBeenCalled();
    expect(Booking.default.findByIdAndDelete).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Booking not found" });
  });
});
