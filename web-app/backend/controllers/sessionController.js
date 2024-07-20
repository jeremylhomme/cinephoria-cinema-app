import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import Booking from "../models/bookingModel.js";

const prisma = new PrismaClient();

const createSession = asyncHandler(async (req, res, prisma) => {
  const { movieId, roomId, cinemaId, sessionDate, sessionPrice, timeRanges } =
    req.body;

  if (
    !movieId ||
    !roomId ||
    !cinemaId ||
    !sessionDate ||
    sessionPrice === undefined ||
    !Array.isArray(timeRanges) ||
    timeRanges.length === 0
  ) {
    return res.status(400).json({
      message: "All fields, including at least one time range, are required.",
    });
  }

  try {
    const sessionDateObj = new Date(sessionDate);
    const sessionDateUTC = new Date(
      Date.UTC(
        sessionDateObj.getUTCFullYear(),
        sessionDateObj.getUTCMonth(),
        sessionDateObj.getUTCDate()
      )
    );

    const existingSession = await prisma.session.findFirst({
      where: {
        cinemaId: Number(cinemaId),
        movieId: Number(movieId),
        roomId: Number(roomId),
        sessionDate: sessionDateUTC,
      },
    });

    if (existingSession) {
      return res.status(400).json({
        message: `A session with the same cinema, movie, room, and date already exists. Please update the existing session.`,
        updateLink: `/admin/sessions/sessionupdate/${existingSession.id}`,
      });
    }

    const existingSessions = await prisma.session.findMany({
      where: {
        cinemaId: Number(cinemaId),
        roomId: Number(roomId),
        sessionDate: sessionDateUTC,
      },
      include: {
        timeRanges: true,
      },
    });

    const hasOverlap = timeRanges.some((newRange) => {
      const newStartTime = new Date(newRange.timeRangeStartTime).getTime();
      const newEndTime = new Date(newRange.timeRangeEndTime).getTime();

      return existingSessions.some((session) =>
        session.timeRanges.some((existingRange) => {
          const existingStartTime = new Date(
            existingRange.timeRangeStartTime
          ).getTime();
          const existingEndTime = new Date(
            existingRange.timeRangeEndTime
          ).getTime();

          const isOverlap =
            (newStartTime >= existingStartTime &&
              newStartTime < existingEndTime) ||
            (newEndTime > existingStartTime && newEndTime <= existingEndTime) ||
            (existingStartTime >= newStartTime &&
              existingStartTime < newEndTime);

          return isOverlap;
        })
      );
    });

    if (hasOverlap) {
      return res
        .status(400)
        .json({ message: "Time ranges overlap with existing sessions." });
    }

    const session = await prisma.session.create({
      data: {
        movie: { connect: { id: Number(movieId) } },
        cinema: { connect: { id: Number(cinemaId) } },
        room: { connect: { id: Number(roomId) } },
        sessionDate: sessionDateUTC,
        sessionPrice,
        sessionStatus: "active",
        timeRanges: {
          create: timeRanges.map((timeRange) => ({
            timeRangeStartTime: new Date(timeRange.timeRangeStartTime),
            timeRangeEndTime: new Date(timeRange.timeRangeEndTime),
            timeRangeStatus: timeRange.timeRangeStatus || "available",
          })),
        },
      },
      include: {
        movie: true,
        cinema: true,
        room: {
          include: {
            seats: true,
          },
        },
        timeRanges: true,
      },
    });

    // Create seat statuses for each time range
    const seatStatusPromises = session.timeRanges.map((timeRange) =>
      session.room.seats.map((seat) =>
        prisma.seatStatus.create({
          data: {
            seat: { connect: { id: seat.id } },
            timeRange: { connect: { id: timeRange.id } },
            status: "available",
          },
        })
      )
    );

    await Promise.all(seatStatusPromises.flat());

    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating session with time ranges:", error);
    res.status(500).json({
      message: "Error creating session with time ranges",
      error: error.message,
    });
  }
});

const getSessions = asyncHandler(async (req, res, prisma) => {
  const { movieId } = req.query;

  let movieFilter = {};
  if (movieId) {
    movieFilter = { movieId: parseInt(movieId) };
  }

  try {
    const sessions = await prisma.session.findMany({
      where: movieFilter,
      select: {
        id: true,
        sessionDate: true,
        sessionStatus: true,
        sessionPrice: true,
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomCapacity: true,
            roomQuality: true,
            seats: {
              select: {
                id: true,
                seatNumber: true,
                pmrSeat: true,
                seatStatuses: {
                  select: {
                    timeRangeId: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
        cinema: {
          select: {
            id: true,
            cinemaName: true,
          },
        },
        movie: {
          select: {
            id: true,
            movieTitle: true,
            movieDescription: true,
            movieLength: true,
            movieImg: true,
            moviePublishingState: true,
            movieReleaseDate: true,
            categories: {
              select: {
                categoryName: true,
              },
            },
          },
        },
        timeRanges: {
          select: {
            id: true,
            timeRangeStartTime: true,
            timeRangeEndTime: true,
            timeRangeStatus: true,
          },
        },
      },
    });

    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      sessionDate: session.sessionDate,
      sessionStatus: session.sessionStatus,
      sessionPrice: session.sessionPrice,
      cinema: session.cinema,
      movie: session.movie,
      timeRanges: session.timeRanges,
      room: {
        id: session.room.id,
        roomNumber: session.room.roomNumber,
        roomCapacity: session.room.roomCapacity,
        roomQuality: session.room.roomQuality,
        seats: session.room.seats.map((seat) => ({
          id: seat.id,
          seatNumber: seat.seatNumber,
          pmrSeat: seat.pmrSeat,
          statuses: session.timeRanges.map((timeRange) => {
            const seatStatus = seat.seatStatuses.find(
              (status) => status.timeRangeId === timeRange.id
            );
            return {
              timeRangeId: timeRange.id,
              status: seatStatus ? seatStatus.status : "available",
            };
          }),
        })),
      },
    }));

    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

const getSessionsForCinema = asyncHandler(async (req, res, prisma) => {
  const { cinemaId } = req.params;

  try {
    const sessions = await prisma.session.findMany({
      where: { cinemaId: Number(cinemaId) },
      include: {
        movie: true,
        room: {
          include: {
            cinema: true,
          },
        },
      },
    });

    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      movieTitle: session.movie.movieTitle,
      sessionDate: session.sessionDate,
      sessionPrice: session.sessionPrice,
      roomNumber: session.room.roomNumber,
      cinemaName: session.room.cinema.cinemaName,
      sessionStatus: session.sessionStatus,
    }));

    res.json(formattedSessions);
  } catch (error) {
    console.error("Error fetching sessions for cinema:", error);
    res.status(500).json({ message: "Error fetching sessions for cinema" });
  }
});

const getSession = asyncHandler(async (req, res, prisma) => {
  const { id: sessionId } = req.params;
  const { movieId, cinemaId, roomId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ message: "Missing session ID" });
  }

  const sessionIdInt = parseInt(sessionId, 10);
  const movieIdInt = movieId ? parseInt(movieId, 10) : null;
  const cinemaIdInt = cinemaId ? parseInt(cinemaId, 10) : null;
  const roomIdInt = roomId ? parseInt(roomId, 10) : null;

  if (
    isNaN(sessionIdInt) ||
    (movieId && isNaN(movieIdInt)) ||
    (cinemaId && isNaN(cinemaIdInt)) ||
    (roomId && isNaN(roomIdInt))
  ) {
    return res.status(400).json({ message: "Invalid session ID or movie ID" });
  }

  try {
    const session = await prisma.session.findUnique({
      where: {
        id: sessionIdInt,
      },
      select: {
        id: true,
        sessionDate: true,
        sessionPrice: true,
        sessionStatus: true,
        movie: {
          select: {
            id: true,
            movieTitle: true,
            movieDescription: true,
            movieTrailerUrl: true,
            movieReleaseDate: true,
            movieLength: true,
            movieImg: true,
            categories: {
              select: {
                categoryName: true,
              },
            },
          },
        },
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomQuality: true,
            roomCapacity: true,
            seatMapId: true,
            seats: {
              select: {
                id: true,
                seatNumber: true,
                pmrSeat: true,
                seatStatuses: {
                  select: {
                    timeRangeId: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
        cinema: {
          select: {
            id: true,
            cinemaName: true,
            cinemaAddress: true,
            cinemaPostalCode: true,
            cinemaCity: true,
            cinemaCountry: true,
            cinemaStartTimeOpening: true,
            cinemaEndTimeOpening: true,
          },
        },
        timeRanges: {
          select: {
            id: true,
            timeRangeStartTime: true,
            timeRangeEndTime: true,
            timeRangeStatus: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Ensure seats have their statuses populated for the specific time range
    const seatsWithStatuses = session.room.seats.map((seat) => {
      const statuses = session.timeRanges.map((timeRange) => {
        const status = seat.seatStatuses.find(
          (seatStatus) => seatStatus.timeRangeId === timeRange.id
        );
        return {
          timeRangeId: timeRange.id,
          status: status ? status.status : "available",
        };
      });
      return { ...seat, statuses, seatStatuses: undefined }; // Remove seatStatuses field
    });

    res.status(200).json({
      ...session,
      room: {
        ...session.room,
        seats: seatsWithStatuses,
      },
    });
  } catch (error) {
    console.error("Error fetching session details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const getBookedTimeRanges = asyncHandler(async (req, res, prisma) => {
  const { cinemaId, roomId, date } = req.query;

  if (!cinemaId || !roomId || !date) {
    return res
      .status(400)
      .json({ message: "Missing required query parameters" });
  }

  try {
    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime()))
      return res.status(400).json({ message: "Invalid date provided." });

    const bookedTimeRanges = await prisma.timeRange.findMany({
      where: {
        session: {
          cinemaId: Number(cinemaId),
          roomId: Number(roomId),
          sessionDate,
        },
      },
    });

    res.status(200).json({ bookedTimeRanges });
  } catch (error) {
    console.error("Error fetching booked time ranges:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const getAvailableTimeRanges = asyncHandler(async (req, res, prisma) => {
  const { cinemaId, roomId, date, movieId } = req.query;

  if (!cinemaId || !roomId || !date || !movieId) {
    return res
      .status(400)
      .json({ message: "Missing required query parameters" });
  }

  try {
    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime()))
      return res.status(400).json({ message: "Invalid date provided." });

    const cinema = await prisma.cinema.findUnique({
      where: { id: Number(cinemaId) },
    });
    const movie = await prisma.movie.findUnique({
      where: { id: Number(movieId) },
    });

    if (!cinema) return res.status(404).json({ message: "Cinema not found." });
    if (!movie)
      return res.status(400).json({ message: "Invalid movie ID provided." });

    const availableTimeRanges = await getAvailableTimeRangesUtil({
      cinema,
      roomId: Number(roomId),
      date: sessionDate,
      movie,
    });

    res.status(200).json({ availableTimeRanges });
  } catch (error) {
    console.error("Error fetching available time ranges:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

async function getAvailableTimeRangesUtil({ cinema, roomId, date, movie }) {
  const sessionDate = new Date(date);

  const cinemaOpenTime = new Date(sessionDate);
  cinemaOpenTime.setUTCHours(
    Number(cinema.cinemaStartTimeOpening.split(":")[0]),
    Number(cinema.cinemaStartTimeOpening.split(":")[1]),
    0,
    0
  );

  const cinemaCloseTime = new Date(sessionDate);
  cinemaCloseTime.setUTCHours(
    Number(cinema.cinemaEndTimeOpening.split(":")[0]),
    Number(cinema.cinemaEndTimeOpening.split(":")[1]),
    0,
    0
  );

  const movieLengthInMinutes = Number(movie.movieLength);

  const existingSessions = await prisma.session.findMany({
    where: {
      cinemaId: cinema.id,
      roomId: roomId,
      sessionDate,
    },
    include: { timeRanges: true },
  });

  const availableTimeRanges = [];
  let currentStartTime = new Date(cinemaOpenTime.getTime());

  while (currentStartTime.getTime() < cinemaCloseTime.getTime()) {
    const currentEndTime = new Date(
      currentStartTime.getTime() + movieLengthInMinutes * 60000
    );

    if (currentEndTime.getTime() > cinemaCloseTime.getTime()) break;

    const overlap = existingSessions.some((session) =>
      session.timeRanges.some((range) => {
        const rangeStartTime = new Date(range.timeRangeStartTime).getTime();
        const rangeEndTime = new Date(range.timeRangeEndTime).getTime();

        return (
          (currentStartTime.getTime() >= rangeStartTime &&
            currentStartTime.getTime() < rangeEndTime) ||
          (currentEndTime.getTime() > rangeStartTime &&
            currentEndTime.getTime() <= rangeEndTime)
        );
      })
    );

    if (!overlap) {
      availableTimeRanges.push({
        timeRangeStartTime: new Date(currentStartTime.getTime()),
        timeRangeEndTime: new Date(currentEndTime.getTime()),
      });
    }

    currentStartTime.setTime(currentEndTime.getTime());
  }

  return availableTimeRanges;
}

const createAvailableTimeRanges = asyncHandler(async (req, res, prisma) => {
  const { cinemaId, roomId, date, movieId } = req.body;

  try {
    const cinema = await prisma.cinema.findUnique({
      where: { id: Number(cinemaId) },
    });

    if (!cinema) {
      return res.status(404).json({ message: "Cinema not found." });
    }

    const movie = await prisma.movie.findUnique({
      where: { id: Number(movieId) },
    });

    if (!movie) {
      return res.status(400).json({ message: "Invalid movie ID provided." });
    }

    const sessionDate = new Date(date);

    if (isNaN(sessionDate.getTime())) {
      return res.status(400).json({ message: "Invalid date provided." });
    }

    const cinemaOpenTime = new Date(sessionDate);
    cinemaOpenTime.setUTCHours(
      Number(cinema.cinemaStartTimeOpening.split(":")[0]),
      Number(cinema.cinemaStartTimeOpening.split(":")[1]),
      0,
      0
    );

    const cinemaCloseTime = new Date(sessionDate);
    cinemaCloseTime.setUTCHours(
      Number(cinema.cinemaEndTimeOpening.split(":")[0]),
      Number(cinema.cinemaEndTimeOpening.split(":")[1]),
      0,
      0
    );

    const movieLengthInMinutes = Number(movie.movieLength);

    const existingSessions = await prisma.session.findMany({
      where: {
        cinemaId: Number(cinemaId),
        roomId: Number(roomId),
        sessionDate,
      },
      include: {
        timeRanges: true,
      },
    });

    const availableTimeRanges = [];
    let currentStartTime = new Date(cinemaOpenTime.getTime());

    while (currentStartTime.getTime() < cinemaCloseTime.getTime()) {
      const currentEndTime = new Date(
        currentStartTime.getTime() + movieLengthInMinutes * 60000
      );

      if (currentEndTime.getTime() > cinemaCloseTime.getTime()) break;

      const overlap = existingSessions.some((session) =>
        session.timeRanges.some((range) => {
          const rangeStartTime = new Date(range.timeRangeStartTime).getTime();
          const rangeEndTime = new Date(range.timeRangeEndTime).getTime();

          return (
            (currentStartTime.getTime() >= rangeStartTime &&
              currentStartTime.getTime() < rangeEndTime) ||
            (currentEndTime.getTime() > rangeStartTime &&
              currentEndTime.getTime() <= rangeEndTime)
          );
        })
      );

      if (!overlap) {
        availableTimeRanges.push({
          timeRangeStartTime: new Date(currentStartTime.getTime()),
          timeRangeEndTime: new Date(currentEndTime.getTime()),
          cinemaId: Number(cinemaId),
          roomId: Number(roomId),
        });
      }

      currentStartTime.setTime(currentEndTime.getTime());
    }

    const existingTimeRanges = await prisma.availableTimeRange.findMany({
      where: {
        cinemaId: Number(cinemaId),
        roomId: Number(roomId),
        timeRangeStartTime: {
          in: availableTimeRanges.map((range) => range.timeRangeStartTime),
        },
        timeRangeEndTime: {
          in: availableTimeRanges.map((range) => range.timeRangeEndTime),
        },
      },
    });

    const newTimeRanges = availableTimeRanges.filter(
      (range) =>
        !existingTimeRanges.some(
          (existingRange) =>
            existingRange.timeRangeStartTime.getTime() ===
              range.timeRangeStartTime.getTime() &&
            existingRange.timeRangeEndTime.getTime() ===
              range.timeRangeEndTime.getTime()
        )
    );

    if (newTimeRanges.length > 0) {
      await prisma.availableTimeRange.createMany({
        data: newTimeRanges,
      });
    }

    const allTimeRanges = await prisma.availableTimeRange.findMany({
      where: {
        cinemaId: Number(cinemaId),
        roomId: Number(roomId),
        timeRangeStartTime: {
          in: availableTimeRanges.map((range) => range.timeRangeStartTime),
        },
        timeRangeEndTime: {
          in: availableTimeRanges.map((range) => range.timeRangeEndTime),
        },
      },
    });

    res.status(201).json({ availableTimeRanges: allTimeRanges });
  } catch (error) {
    console.error("Error creating available time ranges:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const updateSession = asyncHandler(async (req, res, prisma) => {
  console.log("Request body:", req.body);
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing session ID" });
    }

    let {
      sessionDate,
      timeRanges,
      bookedTimeRanges,
      movieId,
      cinemaId,
      roomId,
      sessionPrice,
      ...updateData
    } = req.body;

    // Convert IDs and price to the correct types
    movieId = parseInt(movieId, 10);
    cinemaId = parseInt(cinemaId, 10);
    roomId = parseInt(roomId, 10);
    sessionPrice = parseFloat(sessionPrice);

    if (sessionDate) {
      sessionDate += "T00:00:00.000Z";
      updateData.sessionDate = sessionDate;
    }

    // Validate and prepare timeRanges data for creation
    const timeRangesData = timeRanges.map((timeRange) => {
      if (
        !timeRange.availableTimeRangeId ||
        isNaN(Number(timeRange.availableTimeRangeId))
      ) {
        throw new Error("Invalid availableTimeRangeId");
      }
      return {
        timeRangeStartTime: new Date(timeRange.timeRangeStartTime),
        timeRangeEndTime: new Date(timeRange.timeRangeEndTime),
        availableTimeRangeId: Number(timeRange.availableTimeRangeId),
      };
    });

    // Validate and prepare bookedTimeRanges data for creation
    const bookedTimeRangesData = bookedTimeRanges.map((timeRange) => {
      if (
        !timeRange.availableTimeRangeId ||
        isNaN(Number(timeRange.availableTimeRangeId))
      ) {
        throw new Error("Invalid availableTimeRangeId");
      }
      return {
        timeRangeStartTime: new Date(timeRange.timeRangeStartTime),
        timeRangeEndTime: new Date(timeRange.timeRangeEndTime),
        availableTimeRangeId: Number(timeRange.availableTimeRangeId),
      };
    });

    const session = await prisma.session.update({
      where: { id: parseInt(id) },
      data: {
        movie: { connect: { id: movieId } },
        cinema: { connect: { id: cinemaId } },
        room: { connect: { id: roomId } },
        sessionDate: new Date(updateData.sessionDate),
        sessionPrice,
        timeRanges: {
          deleteMany: {},
          create: timeRangesData,
        },
      },
      include: {
        movie: true,
        cinema: true,
        room: true,
        timeRanges: true,
      },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

const deleteSession = asyncHandler(async (req, res, prisma) => {
  const { id } = req.params;
  const sessionIdNumber = Number(id);

  try {
    const bookings = await Booking.find({ sessionId: id });

    if (bookings.length > 0) {
      // Soft delete: Update bookings and mark session and time ranges as deleted
      const updatePromises = bookings.map((booking) =>
        Booking.findByIdAndUpdate(booking._id, {
          bookingStatus: "no session",
        }).exec()
      );

      await Promise.all(updatePromises);

      await prisma.session.update({
        where: { id: sessionIdNumber },
        data: { deletedAt: new Date(), sessionStatus: "deleted" },
      });

      // Update the status of related time ranges
      await prisma.timeRange.updateMany({
        where: { sessionId: sessionIdNumber },
        data: { timeRangeStatus: "deleted" },
      });

      res.json({ message: "Session deleted successfully (soft delete)." });
    } else {
      // Hard delete: Delete related time ranges and the session
      await prisma.timeRange.deleteMany({
        where: { sessionId: sessionIdNumber },
      });

      await prisma.session.delete({
        where: { id: sessionIdNumber },
      });

      res.json({ message: "Session deleted successfully (hard delete)." });
    }
  } catch (error) {
    console.error(`Error deleting session with ID ${id}:`, error);
    res.status(500).json({
      message: "An error occurred while deleting the session.",
      error: error.message,
    });
  }
});

export {
  createSession,
  getSessions,
  getSessionsForCinema,
  getSession,
  getBookedTimeRanges,
  getAvailableTimeRanges,
  createAvailableTimeRanges,
  updateSession,
  deleteSession,
};
