import express from "express";
import {
  getCinemas,
  getCinema,
  createCinema,
  updateCinema,
  deleteCinema,
} from "../controllers/cinemaController.js";

import {
  authenticatedUser,
  authorizedAdminOrSuperAdmin,
} from "../middlewares/authMiddleware.js";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router
  .route("/")
  .post(authenticatedUser, authorizedAdminOrSuperAdmin, (req, res) =>
    createCinema(req, res, prisma)
  );

router.get("/", (req, res) => getCinemas(req, res, prisma));

router
  .route("/:id")
  .get((req, res) => getCinema(req, res, prisma))
  .put(authenticatedUser, authorizedAdminOrSuperAdmin, (req, res) =>
    updateCinema(req, res, prisma)
  )
  .delete(authenticatedUser, authorizedAdminOrSuperAdmin, (req, res) =>
    deleteCinema(req, res, prisma)
  );

export default router;
