import express from "express";
import {
  createIncident,
  getIncidents,
  getIncident,
  /* updateIncident,*/
  deleteIncident,
} from "../controllers/incidentController.js";
import {
  authenticatedUser,
  authorizedEmployee,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticatedUser, authorizedEmployee, createIncident);

router.get("/", authenticatedUser, getIncidents);

router.get("/:id", authenticatedUser, getIncident);

/* router.put("/:id", authenticatedUser, authorizedAdmin, updateIncident); */
router.delete("/:id", authenticatedUser, authorizedEmployee, deleteIncident);

export default router;
