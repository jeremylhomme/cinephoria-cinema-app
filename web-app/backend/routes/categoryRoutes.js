import express from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import {
  authenticatedUser,
  authorizedEmployee,
} from "../middlewares/authMiddleware.js";

import prisma from "../config/prismaClient.js";

const router = express.Router();

router
  .route("/")
  .post(authenticatedUser, authorizedEmployee, (req, res) =>
    createCategory(req, res, prisma)
  );

router.get("/", (req, res) => getCategories(req, res, prisma));

router
  .route("/:id")
  .get((req, res) => getCategory(req, res, prisma))
  .put(authenticatedUser, authorizedEmployee, (req, res) =>
    updateCategory(req, res, prisma)
  )
  .delete(authenticatedUser, authorizedEmployee, (req, res) =>
    deleteCategory(req, res, prisma)
  );

export default router;
