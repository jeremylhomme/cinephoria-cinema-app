import express from "express";
import {
  getAvailableSeats,
  getBookedSeats,
  updateSeat,
  createSeat,
  getSeatMap,
} from "../controllers/seatController.js";
import {
  authenticatedUser,
  authorizedAdmin,
  authorizedEmployee,
} from "../middlewares/authMiddleware.js";

import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Create a new seat
router.post("/", authenticatedUser, authorizedAdmin, (req, res) =>
  createSeat(req, res, prisma)
);

// Get available seats for a session
router.get("/available/:sessionId", (req, res) =>
  getAvailableSeats(req, res, prisma)
);

// Get seat map for a session
router.get("/map/:roomId", (req, res) => getSeatMap(req, res, prisma));

// Get booked seats for a session
router.get("/booked/:sessionId", (req, res) =>
  getBookedSeats(req, res, prisma)
);

// Update seat status (for setting PMR)
router.put("/:seatId", authenticatedUser, authorizedEmployee, (req, res) =>
  updateSeat(req, res, prisma)
);
export default router;
