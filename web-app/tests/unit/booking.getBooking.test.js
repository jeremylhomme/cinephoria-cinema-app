import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBooking } from "../../backend/controllers/bookingController.js";
import Booking from "../../backend/models/bookingModel.js";
import mongoose from "mongoose";

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
  },
}));

describe("getBooking", () => {
  let mockReq, mockRes, mockPrisma;

  beforeEach(() => {
    mockReq = {
      params: { id: "6694c12e013d5d9c050aeb52" },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockPrisma = {
      movie: {
        findUnique: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
      session: {
        findUnique: vi.fn(),
      },
      cinema: {
        findUnique: vi.fn(),
      },
      room: {
        findUnique: vi.fn(),
      },
    };
    vi.clearAllMocks();
  });

  it("should get a booking by id", async () => {
    const mockBooking = {
      _id: "6694c12e013d5d9c050aeb52",
      sessionId: "10",
      userId: "1",
      movieId: "5",
      seatsBooked: [
        { seatNumber: "4", status: "pending", pmrSeat: false },
        { seatNumber: "5", status: "pending", pmrSeat: false },
      ],
      bookingPrice: 30,
      bookingStatus: "pending",
      timeRange: {
        timeRangeId: 19,
        timeRangeStartTime: "2024-12-18T10:00:00.000Z",
        timeRangeEndTime: "2024-12-18T12:02:00.000Z",
      },
      bookingCreatedAt: "2024-07-15T06:26:54.121Z",
      createdAt: "2024-07-15T06:26:54.125Z",
      updatedAt: "2024-07-15T06:26:54.125Z",
    };

    Booking.findById.mockResolvedValue(mockBooking);

    mockPrisma.movie.findUnique.mockResolvedValue({
      movieTitle: "Le Fabuleux Destin d'Amélie Poulain",
      movieImg:
        "https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Images/le-fabuleux-destin-d-amelie-poulain.webp",
    });

    mockPrisma.session.findUnique.mockResolvedValue({
      sessionDate: "2024-12-18T00:00:00.000Z",
      sessionStatus: "active",
      timeRanges: [
        {
          id: 19,
          timeRangeStartTime: new Date("2024-12-18T10:00:00.000Z"),
          timeRangeEndTime: new Date("2024-12-18T12:02:00.000Z"),
        },
        // Add more timeRanges if needed
      ],
      room: { id: 8, roomNumber: 2 },
      cinema: {
        id: 2,
        cinemaName: "Cinéphoria Paris",
        cinemaAddress: "2 Avenue des Champs-Élysées",
      },
    });

    try {
      await getBooking(mockReq, mockRes, mockPrisma);
    } catch (error) {
      console.error("Error in getBooking:", error);
    }

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "6694c12e013d5d9c050aeb52",
        sessionId: "10",
        userId: "1",
        movieId: "5",
        seatsBooked: expect.arrayContaining([
          expect.objectContaining({
            seatNumber: expect.any(String),
            status: "pending",
            pmrSeat: false,
          }),
        ]),
        bookingPrice: 30,
        bookingStatus: "pending",
        timeRange: expect.objectContaining({
          timeRangeId: 19,
          timeRangeStartTime: expect.any(String),
          timeRangeEndTime: expect.any(String),
        }),
        bookingCreatedAt: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        movie: expect.objectContaining({
          movieTitle: "Le Fabuleux Destin d'Amélie Poulain",
          movieImg: expect.any(String),
        }),
        session: expect.objectContaining({
          sessionDate: expect.any(String),
          sessionStatus: "active",
          timeRanges: expect.any(Array),
          room: expect.objectContaining({
            id: 8,
            roomNumber: 2,
          }),
          cinema: expect.objectContaining({
            id: 2,
            cinemaName: "Cinéphoria Paris",
            cinemaAddress: expect.any(String),
          }),
        }),
        review: null,
      })
    );
  });
});
