import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import moment from "moment";
import { join } from "path";
import Review from "../models/reviewModel.js";

const prisma = new PrismaClient();

const createMovie = asyncHandler(async (req, res, prisma) => {
  const {
    movieTitle,
    movieDescription,
    movieReleaseDate,
    movieTrailerUrl,
    movieLength,
    moviePublishingState,
    movieFavorite = false,
    movieMinimumAge,
    categoryIds,
    moviePremiereDate,
    movieScheduleDate,
  } = req.body;

  const movieImg =
    req.body.movieImg ||
    (req.file?.path.includes("images")
      ? join(process.cwd(), req.file.path)
      : undefined);

  if (
    !movieTitle ||
    !movieDescription ||
    !movieReleaseDate ||
    isNaN(parseInt(movieLength)) ||
    !moviePublishingState ||
    isNaN(parseInt(movieMinimumAge)) ||
    !categoryIds ||
    !Array.isArray(categoryIds)
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  // Check if the movie already exists
  const existingMovie = await prisma.movie.findUnique({
    where: { movieTitle },
  });
  if (existingMovie) {
    return res.status(400).json({ message: "Movie already exists" });
  }

  // Validate category IDs
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });
  if (categories.length !== categoryIds.length) {
    const missingIds = categoryIds.filter(
      (id) => !categories.some((cat) => cat.id === id)
    );
    return res.status(400).json({
      message:
        "One or more Category IDs do not exist: " + missingIds.join(", "),
    });
  }

  try {
    const movieData = {
      movieTitle,
      movieDescription,
      movieReleaseDate: new Date(movieReleaseDate).toISOString(),
      movieLength: parseInt(movieLength, 10),
      movieTrailerUrl,
      movieFavorite,
      moviePublishingState,
      movieMinimumAge: parseInt(movieMinimumAge, 10),
      movieImg,
      categories: {
        connect: categoryIds.map((id) => ({ id })),
      },
    };

    if (moviePremiereDate) {
      movieData.moviePremiereDate = new Date(moviePremiereDate).toISOString();
    }

    if (movieScheduleDate) {
      movieData.movieScheduleDate = new Date(movieScheduleDate).toISOString();
    }

    const movie = await prisma.movie.create({
      data: movieData,
    });

    res.status(201).json(movie);
  } catch (error) {
    console.error("Error creating movie:", error);
    res
      .status(500)
      .json({ message: "Error creating movie", error: error.message });
  }
});

const getMovies = asyncHandler(async (req, res, prisma) => {
  const { state, categories, cinemaId, date } = req.query;

  let filters = {};

  // State filter
  if (state && state !== "all") {
    filters.moviePublishingState = state;
  }

  // Category filter
  if (categories && categories !== "all") {
    const categoryArray = categories.split(",");
    filters.categories = {
      some: {
        categoryName: { in: categoryArray },
      },
    };
  }

  // Cinema filter
  if (cinemaId && cinemaId !== "all") {
    filters.sessions = {
      some: {
        cinemaId: parseInt(cinemaId),
      },
    };
  }

  if (date) {
    filters.sessions = {
      some: {
        sessionDate: {
          gte: new Date(date),
          lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
        },
      },
    };
  }

  try {
    const movies = await prisma.movie.findMany({
      where: filters,
      select: {
        id: true,
        movieTitle: true,
        movieDescription: true,
        movieLength: true,
        movieImg: true,
        moviePublishingState: true,
        movieReleaseDate: true,
        movieMinimumAge: true,
        movieScheduleDate: true,
        moviePremiereDate: true,
        movieTrailerUrl: true,
        movieFavorite: true,
        movieCreatedAt: true,
        movieUpdatedAt: true,
        categories: {
          select: {
            id: true,
            categoryName: true,
          },
        },
        sessions: {
          select: {
            id: true,
            timeRanges: true,
            sessionDate: true,
            cinema: {
              select: {
                id: true,
                cinemaName: true,
              },
            },
            room: {
              select: {
                id: true,
                roomCapacity: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    const moviesWithReviews = await Promise.all(
      movies.map(async (movie) => {
        const reviews = await Review.find({ movieId: movie.id.toString() });
        const averageRating =
          reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            : 0;
        return {
          ...movie,
          reviews: reviews.length,
          averageRating: parseFloat(averageRating.toFixed(1)),
        };
      })
    );

    if (cinemaId && cinemaId !== "all") {
      const cinema = await prisma.cinema.findUnique({
        where: { id: parseInt(cinemaId) },
        select: {
          cinemaName: true,
        },
      });
      if (!cinema) {
        return res.status(404).json({ message: "Cinema not found" });
      }
      return res
        .status(200)
        .json({ cinemaName: cinema.cinemaName, movies: moviesWithReviews });
    }

    res.status(200).json({ movies: moviesWithReviews });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res
      .status(500)
      .json({ message: "Error fetching movies", error: error.message });
  }
});

const getMovie = asyncHandler(async (req, res, prisma) => {
  const { id } = req.params;

  const movie = await prisma.movie.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      movieTitle: true,
      movieDescription: true,
      movieLength: true,
      movieImg: true,
      movieFavorite: true,
      moviePublishingState: true,
      movieReleaseDate: true,
      movieMinimumAge: true,
      movieScheduleDate: true,
      moviePremiereDate: true,
      movieTrailerUrl: true,
      movieCreatedAt: true,
      movieUpdatedAt: true,
      categories: {
        select: {
          id: true,
          categoryName: true,
        },
      },
      sessions: {
        select: {
          id: true,
          timeRanges: true,
          sessionDate: true,
          sessionPrice: true,
          cinema: {
            select: {
              id: true,
              cinemaName: true,
            },
          },
          room: {
            select: {
              id: true,
              roomCapacity: true,
              roomQuality: true,
            },
          },
        },
      },
    },
  });

  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }

  res.status(200).json(movie);
});

const updateMovie = asyncHandler(async (req, res, prisma) => {
  const { id } = req.params;
  const {
    movieTitle,
    movieDescription,
    movieTrailerUrl,
    movieMinimumAge,
    movieFavorite,
    categoryIds,
    movieReleaseDate,
    movieLength,
    moviePublishingState,
    movieCreatedAt,
    movieScheduleDate,
    moviePremiereDate,
  } = req.body;

  const movie = await prisma.movie.findUnique({
    where: { id: parseInt(id) },
  });

  if (!movie) {
    return res.status(404).json({ message: "Movie not found" });
  }

  // Prepare update data
  const updateData = {};

  // Only add fields to updateData if they are provided in the request
  if (movieTitle !== undefined) updateData.movieTitle = movieTitle;
  if (movieDescription !== undefined)
    updateData.movieDescription = movieDescription;
  if (movieTrailerUrl !== undefined)
    updateData.movieTrailerUrl = movieTrailerUrl;
  if (movieFavorite !== undefined) updateData.movieFavorite = movieFavorite;
  if (movieLength !== undefined) updateData.movieLength = movieLength;
  if (moviePublishingState !== undefined)
    updateData.moviePublishingState = moviePublishingState;

  if (movieScheduleDate !== undefined) {
    const parsedDate = new Date(movieScheduleDate);
    if (!isNaN(parsedDate.getTime())) {
      // Set the time to midnight UTC
      parsedDate.setUTCHours(0, 0, 0, 0);
      updateData.movieScheduleDate = parsedDate;
    } else {
      return res.status(400).json({ message: "Invalid schedule date format" });
    }
  }

  if (moviePremiereDate !== undefined) {
    const parsedDate = new Date(moviePremiereDate);
    if (!isNaN(parsedDate.getTime())) {
      // Set the time to midnight UTC
      parsedDate.setUTCHours(0, 0, 0, 0);
      updateData.moviePremiereDate = parsedDate;
    } else {
      return res.status(400).json({ message: "Invalid premiere date format" });
    }
  }

  if (movieMinimumAge !== undefined) {
    const parsedMinimumAge = parseInt(movieMinimumAge, 10);
    if (isNaN(parsedMinimumAge)) {
      return res.status(400).json({ message: "Invalid minimum age provided" });
    }
    updateData.movieMinimumAge = parsedMinimumAge;
  }

  if (movieReleaseDate !== undefined) {
    updateData.movieReleaseDate = moment(movieReleaseDate).toISOString();
  }

  if (req.file) {
    updateData.movieImg = req.file.path.includes("images")
      ? join(process.cwd(), req.file.path)
      : undefined;
  } else if (req.body.movieImg !== undefined) {
    updateData.movieImg = req.body.movieImg;
  }

  if (categoryIds !== undefined) {
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds.map((id) => parseInt(id)) } },
    });
    if (categories.length !== categoryIds.length) {
      return res
        .status(400)
        .json({ message: "One or more Category IDs do not exist" });
    }
    updateData.categories = {
      set: categoryIds.map((id) => ({ id: parseInt(id) })),
    };
  }

  if (movieCreatedAt !== undefined) {
    const parsedCreatedAt = new Date(movieCreatedAt);
    if (isNaN(parsedCreatedAt.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid movieCreatedAt date format" });
    }
    updateData.movieCreatedAt = parsedCreatedAt;
  }

  // Always update the movieUpdatedAt field
  updateData.movieUpdatedAt = new Date();

  // Updating movie with new data
  const updatedMovie = await prisma.movie.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  res.status(200).json({
    ...updatedMovie,
    movieImg: updatedMovie.movieImg
      ? `http://${req.headers.host}/${updatedMovie.movieImg}`
      : null,
  });
});

const deleteMovie = asyncHandler(async (req, res, prisma) => {
  const { id } = req.params;
  const movie = await prisma.movie.delete({ where: { id: Number(id) } });
  res.status(200).json({ message: "Movie deleted successfully" });
});

export { createMovie, getMovies, getMovie, updateMovie, deleteMovie };
