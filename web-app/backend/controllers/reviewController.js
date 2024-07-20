import { asyncHandler } from "../middlewares/asyncHandler.js";
import Review from "../models/reviewModel.js";
import prisma from "../config/prismaClient.js";
import Booking from "../models/bookingModel.js";

const createReview = asyncHandler(async (req, res, prisma) => {
  const { movieId, sessionId } = req.params;
  const { bookingId, rating, comment } = req.body;
  const user = req.user;

  if (
    !movieId ||
    !sessionId ||
    !bookingId ||
    rating === undefined ||
    !comment
  ) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const parsedMovieId = parseInt(movieId);
  const parsedSessionId = parseInt(sessionId);

  if (isNaN(parsedMovieId) || isNaN(parsedSessionId)) {
    res.status(400);
    throw new Error("Invalid Movie ID or Session ID");
  }

  try {
    const movie = await prisma.movie.findUnique({
      where: { id: parsedMovieId },
      select: { movieTitle: true },
    });

    if (!movie) {
      res.status(404);
      throw new Error("Movie not found");
    }

    // Check if the session exists
    const session = await prisma.session.findUnique({
      where: { id: parsedSessionId },
    });

    if (!session) {
      res.status(404);
      throw new Error("Session not found");
    }

    // Check if the booking exists and belongs to the user
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: user.id.toString(),
      movieId: parsedMovieId.toString(),
      sessionId: parsedSessionId.toString(),
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found or does not belong to the user");
    }

    // Check if a review already exists for this user, movie, and session
    const existingReview = await Review.findOne({
      userId: user.id.toString(),
      movieId: parsedMovieId.toString(),
      sessionId: parsedSessionId.toString(),
    });

    if (existingReview) {
      res.status(400);
      throw new Error(
        "You have already submitted a review for this movie session"
      );
    }
    const review = await Review.create({
      userId: user.id.toString(),
      movieId: parsedMovieId.toString(),
      sessionId: parsedSessionId.toString(),
      bookingId: bookingId,
      rating,
      comment,
      userFirstName: user.userFirstName,
      userLastName: user.userLastName,
      userEmail: user.userEmail,
      movieTitle: movie.movieTitle,
      status: "pending",
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error in createReview:", error);
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({});
  res.json(reviews);
});

const getReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    res.json(review);
  } else {
    res.status(404);
    throw new Error("Review not found");
  }
});

const getMovieReviews = asyncHandler(async (req, res) => {
  const movieSessionPairs = req.params.movieSessionPairs.split(",");
  const reviews = await Review.find({
    $or: movieSessionPairs.map((pair) => {
      const [movieId, sessionId] = pair.split("-");
      return { movieId, sessionId };
    }),
  });
  res.json(reviews);
});

const getUserReviews = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const reviews = await Review.find({ userId });
  res.json(reviews);
});

const getReviewStats = asyncHandler(async (req, res) => {
  const stats = await Review.aggregate([
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        fiveStarReviews: {
          $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
        },
      },
    },
  ]);

  if (stats.length > 0) {
    res.json(stats[0]);
  } else {
    res.json({ totalReviews: 0, averageRating: 0, fiveStarReviews: 0 });
  }
});

const getPendingReviews = asyncHandler(async (req, res) => {
  const pendingReviews = await Review.find({ status: "pending" })
    .select(
      "movieId movieTitle userFirstName userLastName userEmail rating comment createdAt"
    )
    .sort("-createdAt");

  res.json(pendingReviews);
});

const validateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Must be either "approved" or "rejected"');
  }

  const review = await Review.findById(id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (review.status !== "pending") {
    res.status(400);
    throw new Error("This review has already been validated");
  }

  review.status = status;
  review.reviewedBy = req.user.id;
  review.reviewedAt = new Date();

  const updatedReview = await review.save();

  res.json(updatedReview);
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    review.status = "rejected";
    review.deletedAt = new Date();

    const updatedReview = await review.save();

    if (updatedReview) {
      res.json({
        message: "Review status updated to deleted",
        review: updatedReview,
      });
    } else {
      res.status(500);
      throw new Error("Failed to update review status");
    }
  } else {
    res.status(404);
    throw new Error("Review not found");
  }
});

export {
  createReview,
  getReviews,
  getReview,
  deleteReview,
  getMovieReviews,
  getUserReviews,
  getReviewStats,
  getPendingReviews,
  validateReview,
};
