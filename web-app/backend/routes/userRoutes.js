import express from "express";
import {
  createUser,
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
  getUserProfile,
  deleteUser,
  updateUser,
  updateUserProfile,
  updateUserPassword,
  updateFirstLoginPassword,
  getUserBookings,
  resetPassword,
  verifyEmail,
  verifyResetToken,
  resetPasswordConfirm,
  sendContactForm,
  getUserDetails,
} from "../controllers/userController.js";
import {
  authenticatedUser,
  authorizedAdminOrSuperAdmin,
} from "../middlewares/authMiddleware.js";
import prisma from "../config/prismaClient.js";

const router = express.Router();

// Routes for visitors
router.post("/register", (req, res) => registerUser(req, res, prisma));
router.post("/login", (req, res) => loginUser(req, res, prisma));
router.get("/verify-email/:code", (req, res) => verifyEmail(req, res, prisma));
router.post("/reset-password", (req, res) => resetPassword(req, res, prisma));
router.get("/verify-reset-token/:token", (req, res) =>
  verifyResetToken(req, res, prisma)
);
router.post("/reset-password-confirm", (req, res) =>
  resetPasswordConfirm(req, res, prisma)
);
router.post("/contact", (req, res) => sendContactForm(req, res, prisma));

// Routes for logged-in users
router.post("/logout", authenticatedUser, (req, res) =>
  logoutUser(req, res, prisma)
);
router
  .route("/profile/:id")
  .get(authenticatedUser, (req, res) => getUserProfile(req, res, prisma))
  .put(authenticatedUser, (req, res) => updateUserProfile(req, res, prisma));

router
  .route("/:id/update-password")
  .put(authenticatedUser, (req, res) => updateUserPassword(req, res, prisma));
router
  .route("/:id/update-first-login-password")
  .put(authenticatedUser, (req, res) =>
    updateFirstLoginPassword(req, res, prisma)
  );
router
  .route("/:userId/bookings")
  .get(authenticatedUser, (req, res) => getUserBookings(req, res, prisma));

// Routes for admins
router
  .route("/")
  .post(authenticatedUser, authorizedAdminOrSuperAdmin, (req, res) =>
    createUser(req, res, prisma)
  )
  .get(authenticatedUser, authorizedAdminOrSuperAdmin, (req, res) =>
    getUsers(req, res, prisma)
  );
router
  .route("/:id")
  .put(authenticatedUser, authorizedAdminOrSuperAdmin, (req, res) =>
    updateUser(req, res, prisma)
  )
  .delete(authenticatedUser, authorizedAdminOrSuperAdmin, (req, res) =>
    deleteUser(req, res, prisma)
  );

router
  .route("/user-details/:id")
  .get(authenticatedUser, authorizedAdminOrSuperAdmin, (req, res) =>
    getUserDetails(req, res, prisma)
  );

export default router;
