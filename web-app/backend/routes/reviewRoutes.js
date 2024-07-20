import express from "express";
import {
  createReview,
  getReviews,
  getReview,
  deleteReview,
  getMovieReviews,
  getPendingReviews,
  validateReview,
} from "../controllers/reviewController.js";
import {
  authenticatedUser,
  authorizedEmployee,
} from "../middlewares/authMiddleware.js";
import prisma from "../config/prismaClient.js";

const router = express.Router();

// Public routes
router.get("/movie-sessions/:movieSessionPairs", (req, res) => {
  getMovieReviews(req, res, prisma);
});

// Routes for employees
router.get("/pending", authenticatedUser, authorizedEmployee, (req, res) => {
  getPendingReviews(req, res, prisma);
});

// Routes for authenticated users
router.post("/:movieId/:sessionId", authenticatedUser, (req, res) => {
  createReview(req, res, prisma);
});

// Routes for admins
router.delete("/:id", authenticatedUser, authorizedEmployee, (req, res) => {
  deleteReview(req, res, prisma);
});

// Routes for employees (validation)
router.patch(
  "/:id/validate",
  authenticatedUser,
  authorizedEmployee,
  (req, res) => {
    validateReview(req, res, prisma);
  }
);

// Generic routes (should be at the end)
router.get("/", (req, res) => {
  getReviews(req, res, prisma);
});
router.get("/:id", (req, res) => {
  getReview(req, res, prisma);
});

export default router;
