import express from "express";
import {
  authenticatedUser,
  authorizedEmployee,
} from "../middlewares/authMiddleware.js";
import {
  getMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movieController.js";
import prisma from "../config/prismaClient.js";

const router = express.Router();

router
  .route("/")
  .post(authenticatedUser, authorizedEmployee, (req, res) =>
    createMovie(req, res, prisma)
  );

router.get("/", (req, res) => getMovies(req, res, prisma));

router
  .route("/:id")
  .get((req, res) => getMovie(req, res, prisma))
  .put(authenticatedUser, authorizedEmployee, (req, res) =>
    updateMovie(req, res, prisma)
  )
  .delete(authenticatedUser, authorizedEmployee, (req, res) =>
    deleteMovie(req, res, prisma)
  );

export default router;
