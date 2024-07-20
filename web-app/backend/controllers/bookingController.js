import { asyncHandler } from "../middlewares/asyncHandler.js";
import mongoose from "mongoose";
import prisma from "../config/prismaClient.js";
import Booking from "../models/bookingModel.js";

// Create or update a booking
const createOrUpdateBooking = asyncHandler(async (req, res, prisma) => {
  const {
    bookingId,
    sessionId,
    userId,
    movieId,
    cinemaId,
    roomId,
    seatsBooked,
    bookingPrice,
    bookingStatus = "pending",
    timeRange,
  } = req.body;

  try {
    const ids = { sessionId, userId, movieId, roomId, cinemaId };
    const parsedIds = Object.entries(ids).reduce((acc, [key, value]) => {
      const parsed = parseInt(value);
      if (isNaN(parsed)) {
        throw new Error(`Invalid ${key} format provided.`);
      }
      acc[key] = parsed;
      return acc;
    }, {});

    const timeRangeIDInt = parseInt(timeRange.timeRangeId);
    if (isNaN(timeRangeIDInt)) {
      throw new Error("Invalid timeRangeId format provided.");
    }

    const [movie, user, session, room, cinema] = await Promise.all([
      prisma.movie.findUnique({ where: { id: parsedIds.movieId } }),
      prisma.user.findUnique({ where: { id: parsedIds.userId } }),
      prisma.session.findUnique({
        where: { id: parsedIds.sessionId },
        include: { timeRanges: true, room: true },
      }),
      prisma.room.findUnique({ where: { id: parsedIds.roomId } }),
      prisma.cinema.findUnique({ where: { id: parsedIds.cinemaId } }),
    ]);

    if (!movie || !user || !session || !room || !cinema) {
      return res.status(404).json({ message: "Referenced entity not found." });
    }

    if (!bookingPrice) {
      return res.status(400).json({ message: "Booking price is required." });
    }

    if (!Array.isArray(seatsBooked)) {
      return res
        .status(400)
        .json({ message: "Seats booked must be an array." });
    }

    const existingBookings = await prisma.seatStatus.findMany({
      where: {
        timeRangeId: timeRangeIDInt,
        status: "booked",
      },
      include: {
        seat: true,
      },
    });

    const bookedSeats = existingBookings.map(
      (status) => status.seat.seatNumber
    );

    const validSeats = await Promise.all(
      seatsBooked.map(async (seat) => {
        const seatEntity = await prisma.seat.findFirst({
          where: {
            seatNumber: String(seat.seatNumber),
            roomId: parsedIds.roomId,
          },
        });

        if (!seatEntity) {
          throw new Error(`Seat not found: ${seat.seatNumber}`);
        }

        if (bookedSeats.includes(seat.seatNumber)) {
          throw new Error(
            `Seat ${seat.seatNumber} is already booked for this time range.`
          );
        }

        await prisma.seatStatus.updateMany({
          where: {
            seatId: seatEntity.id,
            timeRangeId: timeRangeIDInt,
          },
          data: {
            status: seat.status,
          },
        });

        return {
          seatId: seatEntity.id,
          seatNumber: seatEntity.seatNumber,
          status: seat.status,
          pmrSeat: seat.pmrSeat,
        };
      })
    );

    const bookingData = {
      sessionId: parsedIds.sessionId,
      userId: parsedIds.userId,
      movieId: parsedIds.movieId,
      cinemaId: parsedIds.cinemaId,
      roomId: parsedIds.roomId,
      seatsBooked: validSeats,
      bookingPrice,
      bookingStatus,
      timeRange: {
        ...timeRange,
        timeRangeStartTime: new Date(
          timeRange.timeRangeStartTime
        ).toUTCString(),
        timeRangeEndTime: new Date(timeRange.timeRangeEndTime).toUTCString(),
      },
    };

    let booking;
    if (bookingId) {
      booking = await Booking.findByIdAndUpdate(bookingId, bookingData, {
        new: true,
      });
      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }
    } else {
      booking = await Booking.create(bookingData);
    }

    res.status(201).json({
      message: bookingId
        ? "Booking updated successfully!"
        : "Booking created successfully!",
      booking: {
        ...booking.toObject(),
        timeRange: booking.timeRange
          ? {
              ...booking.timeRange,
              timeRangeStartTime: new Date(
                booking.timeRange.timeRangeStartTime
              ).toISOString(),
              timeRangeEndTime: new Date(
                booking.timeRange.timeRangeEndTime
              ).toISOString(),
            }
          : booking.toObject().timeRange,
      },
    });
  } catch (error) {
    console.error("Error creating/updating booking:", error);
    res.status(error.message.includes("already booked") ? 400 : 500).json({
      message: "Error creating/updating booking.",
      error: error.message,
    });
  }
});

const getBooking = asyncHandler(async (req, res, prisma) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const [movie, session] = await Promise.all([
      prisma.movie.findUnique({
        where: { id: parseInt(booking.movieId, 10) },
        select: {
          movieTitle: true,
          movieImg: true,
        },
      }),
      prisma.session.findUnique({
        where: { id: parseInt(booking.sessionId, 10) },
        include: {
          room: true,
          cinema: true,
          timeRanges: true,
        },
      }),
    ]);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const formattedBooking = {
      _id: booking._id.toString(),
      sessionId: booking.sessionId,
      userId: booking.userId,
      movieId: booking.movieId,
      seatsBooked: booking.seatsBooked,
      bookingPrice: booking.bookingPrice,
      bookingStatus: booking.bookingStatus,
      timeRange: booking.timeRange,
      bookingCreatedAt: booking.bookingCreatedAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      movie: movie
        ? {
            movieTitle: movie.movieTitle,
            movieImg: movie.movieImg,
          }
        : null,
      session: session
        ? {
            sessionDate: session.sessionDate,
            sessionStatus: session.sessionStatus,
            sessionPrice: session.sessionPrice,
            timeRanges: session.timeRanges.map((tr) => ({
              id: tr.id,
              timeRangeStartTime: tr.timeRangeStartTime,
              timeRangeEndTime: tr.timeRangeEndTime,
            })),
            room: {
              id: session.room.id,
              roomNumber: session.room.roomNumber,
            },
            cinema: {
              id: session.cinema.id,
              cinemaName: session.cinema.cinemaName,
              cinemaAddress: session.cinema.cinemaAddress,
            },
          }
        : null,
      review: null,
    };

    return res.status(200).json(formattedBooking);
  } catch (error) {
    console.error("Error retrieving booking:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

// Reset booking counts
const resetBookingCounts = asyncHandler(async (req, res) => {
  await Booking.deleteMany({});

  res.status(200).json({ message: "Booking counts reset successfully" });
});

// Delete a booking
const deleteBooking = asyncHandler(async (req, res, prisma) => {
  const bookingId = req.params.id;

  if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ message: "Invalid booking ID" });
  }

  try {
    // Find the booking to get the seatsBooked
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update the seat statuses to available in MySQL
    const updateSeats = booking.seatsBooked.map((seat) =>
      prisma.seatStatus.updateMany({
        where: {
          seatId: seat.seatId,
          timeRangeId: booking.timeRange.timeRangeId,
        },
        data: {
          status: "available",
        },
      })
    );

    await Promise.all(updateSeats);

    // Delete the booking from MongoDB
    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({ message: "Booking successfully removed" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      message: "Error removing booking",
      error: error.message,
    });
  }
});

const softDeleteBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update the seat statuses to available in MySQL
    const updateSeats = booking.seatsBooked.map((seat) =>
      prisma.seatStatus.updateMany({
        where: {
          seatId: seat.seatId,
          timeRangeId: parseInt(booking.timeRange.timeRangeId),
        },
        data: {
          status: "available",
        },
      })
    );
    await Promise.all(updateSeats);

    // Soft delete the booking in MongoDB
    booking.isDeleted = true;
    booking.bookingStatus = "cancelled";
    await booking.save();

    res
      .status(200)
      .json({ message: "Booking successfully cancelled", booking });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      message: "Error cancelling booking",
      error: error.message,
    });
  }
});

// Get all bookings
const getBookings = asyncHandler(async (req, res, prisma) => {
  try {
    const bookings = await Booking.find({}); // Fetch bookings using Mongoose

    // If no bookings found, return an empty array immediately
    if (!bookings.length) {
      return res.status(200).json([]);
    }

    // Fetch all related data in bulk
    const sessionIds = [
      ...new Set(bookings.map((b) => parseInt(b.sessionId, 10))),
    ];
    const userIds = [...new Set(bookings.map((b) => parseInt(b.userId, 10)))];
    const movieIds = [...new Set(bookings.map((b) => parseInt(b.movieId, 10)))];

    const [sessions, users, movies] = await Promise.all([
      prisma.session.findMany({
        where: { id: { in: sessionIds } },
        include: {
          room: {
            include: {
              cinema: true,
            },
          },
          movie: true,
          timeRanges: true,
        },
      }),
      prisma.user.findMany({
        where: { id: { in: userIds } },
      }),
      prisma.movie.findMany({
        where: { id: { in: movieIds } },
      }),
    ]);

    // Create lookup objects for quick access
    const sessionsMap = Object.fromEntries(sessions.map((s) => [s.id, s]));
    const usersMap = Object.fromEntries(users.map((u) => [u.id, u]));
    const moviesMap = Object.fromEntries(movies.map((m) => [m.id, m]));

    // Format bookings
    const formattedBookings = bookings.map((booking) => {
      const session = sessionsMap[parseInt(booking.sessionId, 10)];
      const user = usersMap[parseInt(booking.userId, 10)];
      const movie = moviesMap[parseInt(booking.movieId, 10)];

      const formattedSession = session
        ? {
            id: session.id,
            sessionPrice: session.sessionPrice,
            room: {
              id: session.room.id,
              roomNumber: session.room.roomNumber,
              cinema: {
                id: session.room.cinema.id,
                cinemaName: session.room.cinema.cinemaName,
              },
            },
            movie: {
              id: session.movie.id,
              movieTitle: session.movie.movieTitle,
              movieImg: session.movie.movieImg,
            },
            timeRanges: session.timeRanges.map((timeRange) => ({
              timeRangeId: timeRange.id,
              timeRangeStartTime: timeRange.timeRangeStartTime.toISOString(),
              timeRangeEndTime: timeRange.timeRangeEndTime.toISOString(),
            })),
          }
        : "Session not found";

      return {
        id: booking._id.toString(),
        sessionId: booking.sessionId,
        userId: booking.userId,
        movieId: booking.movieId,
        seatsBooked: booking.seatsBooked.map((seat) => ({
          seatNumber: seat.seatNumber,
          status: seat.status,
          pmrSeat: seat.pmrSeat,
        })),
        bookingPrice: booking.bookingPrice,
        bookingStatus: booking.bookingStatus,
        bookingCreatedAt: booking.bookingCreatedAt.toISOString(),
        session: formattedSession,
        user: user
          ? {
              id: user.id,
              userFirstName: user.userFirstName,
              userLastName: user.userLastName,
              userEmail: user.userEmail,
            }
          : "User not found",
        movie: movie
          ? {
              id: movie.id,
              movieTitle: movie.movieTitle,
              movieImg: movie.movieImg,
            }
          : "Movie not found",
      };
    });

    res.status(200).json(formattedBookings);
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export {
  createOrUpdateBooking,
  getBooking,
  softDeleteBooking,
  deleteBooking,
  getBookings,
  resetBookingCounts,
};
