import express from "express";
import {
  createOrUpdateBooking,
  getBooking,
  deleteBooking,
  getBookings,
  resetBookingCounts,
  softDeleteBooking,
} from "../controllers/bookingController.js";
import {
  authenticatedUser,
  authorizedAdmin,
} from "../middlewares/authMiddleware.js";
import prisma from "../config/prismaClient.js";
const router = express.Router();

// Create or update a booking
router
  .route("/")
  .post(authenticatedUser, (req, res) =>
    createOrUpdateBooking(req, res, prisma)
  );
router
  .route("/")
  .put(authenticatedUser, (req, res) =>
    createOrUpdateBooking(req, res, prisma)
  );

// Reset booking counts
router
  .route("/reset-counts")
  .put(authenticatedUser, authorizedAdminOrSuperAdmin, (req, res) =>
    resetBookingCounts(req, res, prisma)
  );

// Get a single booking by ID
router
  .route("/:id")
  .get(authenticatedUser, (req, res) => getBooking(req, res, prisma));

// Soft delete a booking (for customers)
router
  .route("/:id/soft-delete")
  .patch(authenticatedUser, (req, res) => softDeleteBooking(req, res, prisma));

// Delete a booking (for admins)
router
  .route("/:id")
  .delete(authenticatedUser, authorizedAdminOrSuperAdmin, (req, res) =>
    deleteBooking(req, res, prisma)
  );

// Get all bookings
router.get("/", authenticatedUser, (req, res) => getBookings(req, res, prisma));

export default router;
