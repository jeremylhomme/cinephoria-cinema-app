import { describe, it, expect, vi, beforeEach } from "vitest";
import { createOrUpdateBooking } from "../../backend/controllers/bookingController.js";
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
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findById: vi.fn(),
  },
}));

// Mock Prisma
vi.mock("../../backend/config/prismaClient.js", () => ({
  default: {
    movie: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    session: { findUnique: vi.fn() },
    room: { findUnique: vi.fn() },
    cinema: { findUnique: vi.fn() },
    seat: { findFirst: vi.fn() },
    seatStatus: { updateMany: vi.fn(), findMany: vi.fn() },
  },
}));

describe("createOrUpdateBooking", () => {
  let mockReq, mockRes, mockMongoose;

  beforeEach(() => {
    const now = new Date();
    mockReq = {
      body: {
        sessionId: "1",
        userId: "1",
        movieId: "1",
        cinemaId: "1",
        roomId: "1",
        seatsBooked: [
          { seatId: 1, seatNumber: "A1", status: "pending", pmrSeat: false },
        ],
        bookingPrice: 10,
        bookingStatus: "pending",
        timeRange: {
          timeRangeId: 1,
          timeRangeStartTime: now.toISOString(),
          timeRangeEndTime: new Date(
            now.getTime() + 2 * 60 * 60 * 1000
          ).toISOString(),
        },
      },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockMongoose = require("mongoose");
    vi.clearAllMocks();
  });

  it("should create a new booking", async () => {
    prisma.movie.findUnique.mockResolvedValue({ id: 1 });
    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    prisma.session.findUnique.mockResolvedValue({
      id: 1,
      timeRanges: [
        {
          id: 1,
          timeRangeStartTime: new Date(
            mockReq.body.timeRange.timeRangeStartTime
          ),
          timeRangeEndTime: new Date(mockReq.body.timeRange.timeRangeEndTime),
        },
      ],
    });
    prisma.room.findUnique.mockResolvedValue({ id: 1 });
    prisma.cinema.findUnique.mockResolvedValue({ id: 1 });
    prisma.seat.findFirst.mockResolvedValue({ id: 1, seatNumber: "A1" });
    prisma.seatStatus.updateMany.mockResolvedValue({});
    prisma.seatStatus.findMany.mockResolvedValue([]);

    const mockCreatedBooking = {
      _id: "123",
      toObject: () => ({
        id: "123",
        sessionId: mockReq.body.sessionId,
        userId: mockReq.body.userId,
        movieId: mockReq.body.movieId,
        cinemaId: mockReq.body.cinemaId,
        roomId: mockReq.body.roomId,
        seatsBooked: mockReq.body.seatsBooked,
        bookingPrice: mockReq.body.bookingPrice,
        bookingStatus: mockReq.body.bookingStatus,
        timeRange: mockReq.body.timeRange,
      }),
    };
    Booking.default.create.mockResolvedValue(mockCreatedBooking);

    try {
      await createOrUpdateBooking(mockReq, mockRes, prisma);
    } catch (error) {
      console.error("Error in createOrUpdateBooking:", error);
    }

    expect(Booking.default.create).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Booking created successfully!",
        booking: expect.objectContaining({
          sessionId: "1",
          userId: "1",
          movieId: "1",
          seatsBooked: expect.arrayContaining([
            expect.objectContaining({
              seatId: expect.any(Number),
              seatNumber: "A1",
              status: "pending",
              pmrSeat: false,
            }),
          ]),
          bookingPrice: 10,
          bookingStatus: "pending",
          timeRange: expect.objectContaining({
            timeRangeId: 1,
            timeRangeStartTime: expect.any(String),
            timeRangeEndTime: expect.any(String),
          }),
        }),
      })
    );
  });

  it("should update an existing booking", async () => {
    mockReq.body.bookingId = "existingId";

    prisma.movie.findUnique.mockResolvedValue({ id: 1 });
    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    prisma.session.findUnique.mockResolvedValue({
      id: 1,
      timeRanges: [
        {
          id: 1,
          timeRangeStartTime: new Date(
            mockReq.body.timeRange.timeRangeStartTime
          ),
          timeRangeEndTime: new Date(mockReq.body.timeRange.timeRangeEndTime),
        },
      ],
    });
    prisma.room.findUnique.mockResolvedValue({ id: 1 });
    prisma.cinema.findUnique.mockResolvedValue({ id: 1 });
    prisma.seat.findFirst.mockResolvedValue({ id: 1, seatNumber: "A1" });
    prisma.seatStatus.updateMany.mockResolvedValue({});
    prisma.seatStatus.findMany.mockResolvedValue([]);

    const mockUpdatedBooking = {
      _id: "existingId",
      toObject: () => ({
        id: "existingId",
        sessionId: mockReq.body.sessionId,
        userId: mockReq.body.userId,
        movieId: mockReq.body.movieId,
        cinemaId: mockReq.body.cinemaId,
        roomId: mockReq.body.roomId,
        seatsBooked: mockReq.body.seatsBooked,
        bookingPrice: mockReq.body.bookingPrice,
        bookingStatus: mockReq.body.bookingStatus,
        timeRange: {
          timeRangeId: mockReq.body.timeRange.timeRangeId,
          timeRangeStartTime: mockReq.body.timeRange.timeRangeStartTime,
          timeRangeEndTime: mockReq.body.timeRange.timeRangeEndTime,
        },
      }),
    };
    Booking.default.findByIdAndUpdate.mockResolvedValue(mockUpdatedBooking);

    try {
      await createOrUpdateBooking(mockReq, mockRes, prisma);
    } catch (error) {
      console.error("Error in createOrUpdateBooking:", error);
    }

    expect(Booking.default.findByIdAndUpdate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Booking updated successfully!",
        booking: expect.any(Object),
      })
    );
  });
});
