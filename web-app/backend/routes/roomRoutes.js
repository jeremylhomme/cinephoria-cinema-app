import express from "express";
import {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";
import {
  authenticatedUser,
  authorizedEmployee,
} from "../middlewares/authMiddleware.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", authenticatedUser, authorizedEmployee, (req, res) =>
  createRoom(req, res, prisma)
);

router.get("/", (req, res) => getRooms(req, res, prisma));

router.get("/:id", (req, res) => getRoom(req, res, prisma));

router
  .route("/:id")
  .put(authenticatedUser, authorizedEmployee, (req, res) =>
    updateRoom(req, res, prisma)
  )
  .delete(authenticatedUser, authorizedEmployee, (req, res) =>
    deleteRoom(req, res, prisma)
  );

export default router;
