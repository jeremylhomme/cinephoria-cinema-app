import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBookings } from "../../backend/controllers/bookingController.js";
import Booking from "../../backend/models/bookingModel.js";

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
    find: vi.fn(),
  },
}));

describe("getBookings", () => {
  let mockReq, mockRes, mockPrisma;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockPrisma = {
      session: {
        findMany: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
      movie: {
        findMany: vi.fn(),
      },
    };
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("should get all bookings", async () => {
    const mockBookings = [
      {
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
        bookingCreatedAt: new Date("2024-07-15T06:26:54.121Z"),
      },
    ];

    Booking.find.mockResolvedValue(mockBookings);

    mockPrisma.session.findMany.mockResolvedValue([
      {
        id: 10,
        sessionPrice: 15,
        room: {
          id: 8,
          roomNumber: 2,
          cinema: { id: 2, cinemaName: "Cinéphoria Paris" },
        },
        movie: {
          id: 5,
          movieTitle: "Le Fabuleux Destin d'Amélie Poulain",
          movieImg:
            "https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Images/le-fabuleux-destin-d-amelie-poulain.webp",
        },
        timeRanges: [
          {
            id: 1,
            timeRangeStartTime: new Date("2024-12-18T10:00:00.000Z"),
            timeRangeEndTime: new Date("2024-12-18T12:00:00.000Z"),
          },
        ],
      },
    ]);

    mockPrisma.user.findMany.mockResolvedValue([
      {
        id: 1,
        userFirstName: "Jeremy",
        userLastName: "Dan",
        userEmail: "jeremy@example.com",
      },
    ]);

    mockPrisma.movie.findMany.mockResolvedValue([
      {
        id: 5,
        movieTitle: "Le Fabuleux Destin d'Amélie Poulain",
        movieImg:
          "https://cinephoriamedia.s3.us-east-2.amazonaws.com/Movie+Images/le-fabuleux-destin-d-amelie-poulain.webp",
      },
    ]);

    await getBookings(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: "6694c12e013d5d9c050aeb52",
          sessionId: "10",
          userId: "1",
          movieId: "5",
          seatsBooked: expect.arrayContaining([
            expect.objectContaining({
              seatNumber: expect.any(String),
              status: expect.any(String),
              pmrSeat: expect.any(Boolean),
            }),
          ]),
          bookingPrice: 30,
          bookingStatus: "pending",
          bookingCreatedAt: expect.any(String),
          session: expect.objectContaining({
            id: 10,
            sessionPrice: 15,
            room: expect.objectContaining({
              id: 8,
              roomNumber: 2,
              cinema: expect.objectContaining({
                id: 2,
                cinemaName: "Cinéphoria Paris",
              }),
            }),
            movie: expect.objectContaining({
              id: 5,
              movieTitle: "Le Fabuleux Destin d'Amélie Poulain",
              movieImg: expect.any(String),
            }),
            timeRanges: expect.arrayContaining([
              expect.objectContaining({
                timeRangeId: expect.any(Number),
                timeRangeStartTime: expect.any(String),
                timeRangeEndTime: expect.any(String),
              }),
            ]),
          }),
          user: expect.objectContaining({
            id: 1,
            userFirstName: "Jeremy",
            userLastName: "Dan",
            userEmail: expect.any(String),
          }),
          movie: expect.objectContaining({
            id: 5,
            movieTitle: "Le Fabuleux Destin d'Amélie Poulain",
            movieImg: expect.any(String),
          }),
        }),
      ])
    );
  });

  it("should return an empty array when no bookings are found", async () => {
    Booking.find.mockResolvedValue([]);

    await getBookings(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([]);
  });

  it("should handle errors", async () => {
    const errorMessage = "Database error";
    Booking.find.mockRejectedValue(new Error(errorMessage));

    await getBookings(mockReq, mockRes, mockPrisma);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Server error",
      error: errorMessage,
    });
  });
});
