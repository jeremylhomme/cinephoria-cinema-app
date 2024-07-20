import express from "express";
import { verifyEmail } from "../controllers/userController.js";

const router = express.Router();

router.get("/:token", verifyEmail);

export default router;
