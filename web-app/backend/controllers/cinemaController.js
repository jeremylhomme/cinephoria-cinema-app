import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const prisma = new PrismaClient();

const createCinema = asyncHandler(async (req, res, prisma) => {
  const {
    cinemaName,
    cinemaEmail,
    cinemaAddress,
    cinemaPostalCode,
    cinemaCity,
    cinemaCountry,
    cinemaTelNumber,
    cinemaStartTimeOpening,
    cinemaEndTimeOpening,
  } = req.body;

  // Check for required fields
  if (
    !cinemaName ||
    !cinemaEmail ||
    !cinemaAddress ||
    !cinemaPostalCode ||
    !cinemaCity ||
    !cinemaCountry ||
    !cinemaTelNumber ||
    !cinemaStartTimeOpening ||
    !cinemaEndTimeOpening
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  // Check if the cinema with the same cinemaName or cinemaEmail already exists
  const existingCinema = await prisma.cinema.findFirst({
    where: {
      OR: [{ cinemaName }, { cinemaEmail }],
    },
  });

  if (existingCinema) {
    if (existingCinema.cinemaName === cinemaName) {
      return res
        .status(400)
        .json({ message: "Cinema with this name already exists." });
    }
    if (existingCinema.cinemaEmail === cinemaEmail) {
      return res
        .status(400)
        .json({ message: "Cinema with this email already exists." });
    }
  }

  // Create the cinema with the data provided
  try {
    const cinema = await prisma.cinema.create({
      data: {
        cinemaName,
        cinemaEmail,
        cinemaAddress,
        cinemaPostalCode,
        cinemaCity,
        cinemaCountry,
        cinemaTelNumber,
        cinemaStartTimeOpening,
        cinemaEndTimeOpening,
      },
    });
    return res.status(201).json(cinema);
  } catch (error) {
    console.error("Error creating cinema:", error);
    return res
      .status(500)
      .json({ message: "Error creating cinema", error: error.message });
  }
});

const getCinemas = asyncHandler(async (req, res, prisma) => {
  const { cinemaId } = req.query;
  let cinemaFilter = {};
  if (cinemaId) {
    cinemaFilter = { id: parseInt(cinemaId) };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const cinemas = await prisma.cinema.findMany({
      where: cinemaFilter,
      select: {
        id: true,
        cinemaName: true,
        cinemaEmail: true,
        cinemaAddress: true,
        cinemaPostalCode: true,
        cinemaCity: true,
        cinemaCountry: true,
        cinemaTelNumber: true,
        cinemaStartTimeOpening: true,
        cinemaEndTimeOpening: true,

        sessions: {
          where: {
            sessionDate: {
              gte: today,
            },
          },
          select: {
            id: true,
            sessionDate: true,
            timeRanges: {
              select: {
                timeRangeStartTime: true,
                timeRangeEndTime: true,
              },
            },
            room: {
              select: {
                id: true,
                roomNumber: true,
                roomCapacity: true,
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
                movieScheduleDate: true,
                moviePremiereDate: true,
                movieCreatedAt: true,
                movieFavorite: true,
                categories: {
                  select: {
                    categoryName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Restructure the data to group movies by cinema
    const cinemasWithMovies = cinemas.map((cinema) => ({
      ...cinema,
      movies: [...new Set(cinema.sessions.map((session) => session.movie))],
    }));

    res.status(200).json(cinemasWithMovies);
  } catch (error) {
    console.error("Error fetching cinemas:", error);
    res
      .status(500)
      .json({ message: "Error retrieving cinemas", error: error.message });
  }
});

const getCinema = asyncHandler(async (req, res, prisma) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing cinema ID" });
    }

    const cinema = await prisma.cinema.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        cinemaName: true,
        cinemaEmail: true,
        cinemaAddress: true,
        cinemaPostalCode: true,
        cinemaCity: true,
        cinemaCountry: true,
        cinemaTelNumber: true,
        cinemaStartTimeOpening: true,
        cinemaEndTimeOpening: true,
        rooms: {
          select: {
            id: true,
            roomNumber: true,
            roomCapacity: true,
            roomQuality: true,
          },
        },
        sessions: {
          select: {
            id: true,
            sessionDate: true,
            room: {
              select: {
                roomNumber: true,
              },
            },
            movie: {
              select: {
                movieTitle: true,
              },
            },
          },
        },
      },
    });

    if (!cinema) {
      return res.status(404).json({ message: "Cinema not found" });
    }

    res.status(200).json(cinema);
  } catch (error) {
    console.error("Error fetching cinema:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const updateCinema = asyncHandler(async (req, res, prisma) => {
  const { id } = req.params;
  const {
    cinemaName,
    cinemaEmail,
    cinemaAddress,
    cinemaPostalCode,
    cinemaCity,
    cinemaCountry,
    cinemaTelNumber,
    cinemaStartTimeOpening,
    cinemaEndTimeOpening,
  } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Cinema ID is required" });
  }

  const cinema = await prisma.cinema.findUnique({
    where: { id: parseInt(id) },
  });
  if (!cinema) {
    return res.status(404).json({ message: "Cinema not found" });
  }

  // Checking for duplicate cinemaName or cinemaEmail
  const existingCinema = await prisma.cinema.findFirst({
    where: {
      OR: [
        { cinemaName: cinemaName, NOT: { id: parseInt(id) } },
        { cinemaEmail: cinemaEmail, NOT: { id: parseInt(id) } },
      ],
    },
  });
  if (existingCinema) {
    if (existingCinema.cinemaName === cinemaName) {
      return res.status(400).json({
        message: "Another cinema with the same cinemaName already exists.",
      });
    }
    if (existingCinema.cinemaEmail === cinemaEmail) {
      return res.status(400).json({
        message: "Another cinema with the same cinemaEmail already exists.",
      });
    }
  }

  // Updating cinema with new data
  try {
    const updatedCinema = await prisma.cinema.update({
      where: { id: parseInt(id) },
      data: {
        cinemaName: cinemaName || cinema.cinemaName,
        cinemaEmail: cinemaEmail || cinema.cinemaEmail,
        cinemaAddress: cinemaAddress || cinema.cinemaAddress,
        cinemaPostalCode: cinemaPostalCode || cinema.cinemaPostalCode,
        cinemaCity: cinemaCity || cinema.cinemaCity,
        cinemaCountry: cinemaCountry || cinema.cinemaCountry,
        cinemaTelNumber: cinemaTelNumber || cinema.cinemaTelNumber,
        cinemaStartTimeOpening:
          cinemaStartTimeOpening || cinema.cinemaStartTimeOpening,
        cinemaEndTimeOpening:
          cinemaEndTimeOpening || cinema.cinemaEndTimeOpening,
      },
    });
    res.status(200).json(updatedCinema);
  } catch (error) {
    console.error("Error updating cinema:", error);
    res
      .status(500)
      .json({ message: "Error updating cinema", error: error.message });
  }
});

const deleteCinema = asyncHandler(async (req, res, prisma) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Cinema ID is required" });
  }

  try {
    const cinema = await prisma.cinema.findUnique({
      where: { id: Number(id) },
    });
    if (!cinema) {
      return res.status(404).json({ message: "Cinema not found" });
    }

    await prisma.cinema.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: "Cinema deleted successfully" });
  } catch (error) {
    console.error("Error deleting cinema:", error);

    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export { createCinema, getCinemas, getCinema, updateCinema, deleteCinema };
