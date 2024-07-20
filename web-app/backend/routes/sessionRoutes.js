import express from "express";
import {
  createSession,
  getSessions,
  getSessionsForCinema,
  getSession,
  updateSession,
  deleteSession,
  createAvailableTimeRanges,
  getBookedTimeRanges,
  getAvailableTimeRanges,
} from "../controllers/sessionController.js";
import {
  authenticatedUser,
  authorizedEmployee,
} from "../middlewares/authMiddleware.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", authenticatedUser, authorizedEmployee, (req, res) =>
  createSession(req, res, prisma)
);

router.get("/", (req, res) => getSessions(req, res, prisma));

router.get("/cinema/:cinemaId", (req, res) =>
  getSessionsForCinema(req, res, prisma)
);

router.get("/booked-time-ranges", (req, res) =>
  getBookedTimeRanges(req, res, prisma)
);
router.get("/available-time-ranges", (req, res) =>
  getAvailableTimeRanges(req, res, prisma)
);

router
  .route("/:id")
  .get((req, res) => getSession(req, res, prisma))
  .put(authenticatedUser, authorizedEmployee, (req, res) =>
    updateSession(req, res, prisma)
  )
  .delete(authenticatedUser, authorizedEmployee, (req, res) =>
    deleteSession(req, res, prisma)
  );

router
  .route("/available-time-ranges")
  .post(authenticatedUser, authorizedEmployee, (req, res) =>
    createAvailableTimeRanges(req, res, prisma)
  );

export default router;
