import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSession } from "../../backend/controllers/sessionController.js";
import { PrismaClient } from "@prisma/client";

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => ({
    session: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    seatStatus: {
      create: vi.fn(),
    },
  })),
}));

describe("createSession", () => {
  let mockReq, mockRes, prisma;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      status: vi.fn(() => mockRes),
      json: vi.fn(),
    };
    prisma = new PrismaClient();
    vi.clearAllMocks();
  });

  it("should create a new session successfully", async () => {
    mockReq.body = {
      movieId: "9",
      roomId: "19",
      cinemaId: "4",
      sessionDate: "2024-09-20",
      sessionPrice: 9,
      timeRanges: [
        {
          timeRangeStartTime: "2024-09-20T09:00:00.000Z",
          timeRangeEndTime: "2024-09-20T10:45:00.000Z",
          timeRangeStatus: "available",
        },
      ],
    };

    const mockSession = {
      id: 12,
      movieId: 9,
      cinemaId: 4,
      roomId: 19,
      sessionDate: "2024-09-20T00:00:00.000Z",
      sessionPrice: 9,
      sessionStatus: "active",
      deletedAt: null,
      movie: { id: 9 },
      cinema: { id: 4, cinemaName: "Cinéphoria Lille" },
      room: { id: 19, cinemaId: 4, roomNumber: 1, seats: [] },
      timeRanges: [
        {
          id: 24,
          timeRangeStartTime: "2024-09-20T09:00:00.000Z",
          timeRangeEndTime: "2024-09-20T10:45:00.000Z",
        },
      ],
    };

    prisma.session.findFirst.mockResolvedValue(null);
    prisma.session.findMany.mockResolvedValue([]);
    prisma.session.create.mockResolvedValue(mockSession);
    prisma.seatStatus.create.mockResolvedValue({});

    await createSession(mockReq, mockRes, prisma);

    if (mockRes.status.mock.calls[0][0] === 500) {
      console.error("Error response:", mockRes.json.mock.calls[0][0]);
    }

    expect(prisma.session.findFirst).toHaveBeenCalled();
    expect(prisma.session.findMany).toHaveBeenCalled();
    expect(prisma.session.create).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining(mockSession)
    );
  });

  it("should return 400 if required fields are missing", async () => {
    mockReq.body = {};
    await createSession(mockReq, mockRes, prisma);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "All fields, including at least one time range, are required.",
    });
  });

  it("should return 400 if a session already exists", async () => {
    mockReq.body = {
      movieId: "1",
      roomId: "1",
      cinemaId: "1",
      sessionDate: "2023-05-20",
      sessionPrice: 10,
      timeRanges: [{ timeRangeStartTime: "10:00", timeRangeEndTime: "12:00" }],
    };
    prisma.session.findFirst.mockResolvedValue({ id: 1 });
    await createSession(mockReq, mockRes, prisma);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          "A session with the same cinema, movie, room, and date already exists"
        ),
      })
    );
  });

  it("should return 400 if time ranges overlap", async () => {
    mockReq.body = {
      movieId: "1",
      roomId: "1",
      cinemaId: "1",
      sessionDate: "2023-05-20",
      sessionPrice: 10,
      timeRanges: [
        {
          timeRangeStartTime: "2023-05-20T10:00:00.000Z",
          timeRangeEndTime: "2023-05-20T12:00:00.000Z",
        },
      ],
    };
    prisma.session.findFirst.mockResolvedValue(null);
    prisma.session.findMany.mockResolvedValue([
      {
        timeRanges: [
          {
            timeRangeStartTime: new Date("2023-05-20T09:00:00Z"),
            timeRangeEndTime: new Date("2023-05-20T11:00:00Z"),
          },
        ],
      },
    ]);

    await createSession(mockReq, mockRes, prisma);

    if (mockRes.status.mock.calls[0][0] === 500) {
      console.error("Error response:", mockRes.json.mock.calls[0][0]);
    }

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Time ranges overlap with existing sessions.",
    });
  });
});
