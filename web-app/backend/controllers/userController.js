import { sendEmail } from "../utils/sendEmail.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";
import prisma from "../config/prismaClient.js";
import {
  hashPassword,
  generatePassword,
  generateVerificationCode,
  isStrongPassword,
} from "../utils/userPasswordUtils.js";
import Booking from "../models/bookingModel.js";
import Review from "../models/reviewModel.js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const createUser = asyncHandler(async (req, res, prisma) => {
  const { userFirstName, userLastName, userEmail, userUserName, userRole } =
    req.body;

  if (
    !userFirstName ||
    !userLastName ||
    !userEmail ||
    !userRole ||
    !userUserName
  ) {
    return res
      .status(400)
      .json({ message: "Please fill all the inputs with valid information." });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { userEmail } });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with the same userEmail." });
    }

    const usernameExists = await prisma.user.findUnique({
      where: { userUserName },
    });
    if (usernameExists) {
      return res
        .status(400)
        .json({ message: "User already exists with the same username." });
    }

    const userPassword = generatePassword();
    const hashedPassword = await hashPassword(userPassword);

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const newUser = await prisma.user.create({
      data: {
        userFirstName,
        userLastName,
        userUserName,
        userEmail,
        userPassword: hashedPassword,
        userRole,
        mustChangePassword: true,
        verificationCode,
        verificationCodeExpires,
      },
    });

    const verificationLink = `${process.env.WEB_APP_FRONTEND_URL}verify-email?code=${verificationCode}`;
    await sendEmail({
      from: `Cinéphoria <bonjour@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
      subject: "Confirmez votre compte Cinéphoria",
      template: "create_new_user",
      variables: {
        verificationLink,
        userPassword,
        userFirstName,
        userLastName,
        userUserName,
        userEmail,
      },
    });

    res.status(201).json({
      id: newUser.id,
      userFirstName: newUser.userFirstName,
      userLastName: newUser.userLastName,
      userUserName: newUser.userUserName,
      userEmail: newUser.userEmail,
      userRole: newUser.userRole,
      message:
        "User created successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Error creating user due to server issue.",
      error: error.message,
    });
  }
});

const registerUser = asyncHandler(async (req, res, prisma) => {
  const { userFirstName, userLastName, userEmail, userPassword, userUserName } =
    req.body;
  // Validate input
  if (
    !userFirstName ||
    !userLastName ||
    !userUserName ||
    !userEmail ||
    !userPassword?.trim()
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!isStrongPassword(userPassword)) {
    return res
      .status(400)
      .json({ message: "Password does not meet the requirements." });
  }

  try {
    // Check if user already exists
    const userExists = await prisma.user.findUnique({ where: { userEmail } });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }
    // Check if username already exists
    const usernameExists = await prisma.user.findFirst({
      where: { userUserName },
    });
    if (usernameExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this username." });
    }
    // Hash password
    const hashedPassword = await hashPassword(userPassword);
    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        userFirstName,
        userLastName,
        userUserName,
        userEmail,
        userPassword: hashedPassword,
        userRole: "customer",
        verificationCode,
        verificationCodeExpires,
        isVerified: false,
      },
    });
    // Send verification email
    const verificationLink = `${process.env.WEB_APP_FRONTEND_URL}verify-email?code=${verificationCode}`;
    await sendEmail({
      from: `Cinéphoria <bonjour@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
      subject: "Confirmez votre compte Cinéphoria",
      template: "register_new_user",
      variables: {
        verificationLink,
        userFirstName,
        userUserName,
        userEmail,
      },
    });
    // Send response
    res.status(201).json({
      id: newUser.id,
      userFirstName: newUser.userFirstName,
      userLastName: newUser.userLastName,
      userUserName: newUser.userUserName,
      userEmail: newUser.userEmail,
      userRole: newUser.userRole,
      message:
        "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Detailed error in registerUser:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error registering user.",
      error: error.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
    });
  }
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      userFirstName: true,
      userLastName: true,
      userUserName: true,
      userEmail: true,
      userRole: true,
      userCreatedAt: true,
      userUpdatedAt: true,
      mustChangePassword: true,
      isVerified: true,
      agreedPolicy: true,
      agreedCgvCgu: true,
    },
  });
  res.json(users);
});

const getUserProfile = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await prisma.user.findUnique({ where: { id: id } });
  if (user) {
    res.json({
      id: user.id,
      userFirstName: user.userFirstName,
      userLastName: user.userLastName,
      userUserName: user.userUserName,
      userEmail: user.userEmail,
      mustChangePassword: user.mustChangePassword,
      isVerified: user.isVerified,
    });
  } else {
    res.status(404).json({ message: "User not found." });
  }
});

const getUserDetails = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await prisma.user.findUnique({ where: { id: id } });
  if (user) {
    res.json({
      id: user.id,
      userFirstName: user.userFirstName,
      userLastName: user.userLastName,
      userUserName: user.userUserName,
      userEmail: user.userEmail,
      mustChangePassword: user.mustChangePassword,
      isVerified: user.isVerified,
      userRole: user.userRole,
      userCreatedAt: user.userCreatedAt,
      userUpdatedAt: user.userUpdatedAt,
      agreedPolicy: user.agreedPolicy,
      agreedCgvCgu: user.agreedCgvCgu,
    });
  } else {
    res.status(404).json({ message: "User not found." });
  }
});

const loginUser = async (req, res, prisma) => {
  const { userEmail, userPassword } = req.body;
  const existingUser = await prisma.user.findUnique({ where: { userEmail } });
  if (!existingUser) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  const isPasswordValid = await bcrypt.compare(
    userPassword,
    existingUser.userPassword
  );
  if (isPasswordValid) {
    createToken(res, existingUser.id);
    return res.status(200).json({
      id: existingUser.id,
      userFirstName: existingUser.userFirstName,
      userLastName: existingUser.userLastName,
      userUserName: existingUser.userUserName,
      userEmail: existingUser.userEmail,
      userRole: existingUser.userRole,
      userCreatedAt: existingUser.userCreatedAt,
      mustChangePassword: existingUser.mustChangePassword,
    });
  }
  return res.status(401).json({ message: "Invalid email or password." });
};

const updateUser = asyncHandler(async (req, res, prisma) => {
  const { id } = req.params;
  const {
    userFirstName,
    userUserName,
    userLastName,
    userEmail,
    userRole,
    userPassword,
  } = req.body;

  const userId = parseInt(id);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  try {
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const updateData = {
      userFirstName,
      userLastName,
      userUserName,
      userEmail,
      userRole,
    };

    if (userPassword) {
      updateData.userPassword = await bcrypt.hash(userPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.status(200).json({
      id: updatedUser.id,
      userFirstName: updatedUser.userFirstName,
      userLastName: updatedUser.userLastName,
      userUserName: updatedUser.userUserName,
      userEmail: updatedUser.userEmail,
      userRole: updatedUser.userRole,
      message: "User updated successfully.",
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: "Failed to update user profile",
      error: error.message,
    });
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    userFirstName,
    userLastName,
    userUserName,
    userEmail,
    userPassword,
    newPassword,
    confirmUserPassword,
  } = req.body;

  const userId = parseInt(id);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  try {
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if new password and confirm password match
    if (newPassword && newPassword !== confirmUserPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match.",
      });
    }

    // Check if current password is correct
    if (userPassword) {
      const isMatch = await bcrypt.compare(
        userPassword,
        currentUser.userPassword
      );
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect." });
      }
    }

    const updateData = {
      userFirstName: userFirstName || currentUser.userFirstName,
      userLastName: userLastName || currentUser.userLastName,
      userUserName: userUserName || currentUser.userUserName,
      userEmail: userEmail || currentUser.userEmail,
    };

    if (newPassword) {
      updateData.userPassword = await hashPassword(newPassword);
    }

    const hasChanges =
      updateData.userFirstName !== currentUser.userFirstName ||
      updateData.userLastName !== currentUser.userLastName ||
      updateData.userUserName !== currentUser.userUserName ||
      updateData.userEmail !== currentUser.userEmail ||
      newPassword;

    if (!hasChanges) {
      return res.json({
        id: currentUser.id,
        userFirstName: currentUser.userFirstName,
        userLastName: currentUser.userLastName,
        userUserName: currentUser.userUserName,
        userEmail: currentUser.userEmail,
        userRole: currentUser.userRole,
        message: "No changes were made to the user profile.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({
      id: updatedUser.id,
      userFirstName: updatedUser.userFirstName,
      userLastName: updatedUser.userLastName,
      userUserName: updatedUser.userUserName,
      userEmail: updatedUser.userEmail,
      message: "User profile updated successfully.",
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: "Failed to update user profile",
      error: error.message,
    });
  }
});

const updateUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Generate a new password
  const newPassword = generatePassword();

  const hashedPassword = await hashPassword(newPassword);

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(id, 10) },
    data: {
      userPassword: hashedPassword,
      mustChangePassword: true,
    },
  });

  // Send confirmation email
  const loginPageUrl = `${process.env.WEB_APP_FRONTEND_URL}login`;
  await sendEmail({
    from: `Cinéphoria <bonjour@${process.env.MAILGUN_DOMAIN}>`,
    to: updatedUser.userEmail,
    subject: "Nouveau mot de passe généré",
    template: "generate_new_password",
    variables: {
      userFirstName: updatedUser.userFirstName,
      userEmail: updatedUser.userEmail,
      userPassword: newPassword,
      loginPageUrl,
    },
  });

  // Return updated user information
  res.status(200).json({
    id: updatedUser.id,
    userFirstName: updatedUser.userFirstName,
    userLastName: updatedUser.userLastName,
    userUserName: updatedUser.userUserName,
    userEmail: updatedUser.userEmail,
    userRole: updatedUser.userRole,
    userCreatedAt: updatedUser.userCreatedAt,
    mustChangePassword: updatedUser.mustChangePassword,
    message: "New password generated and sent to user's email.",
  });
});

const updateFirstLoginPassword = asyncHandler(async (req, res, prisma) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (req.user.id !== parseInt(id, 10)) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only update your own password" });
    }

    const hashedPassword = await hashPassword(newPassword);
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: {
        userPassword: hashedPassword,
        mustChangePassword: false,
      },
    });

    // Send confirmation email
    await sendEmail({
      from: `Cinéphoria <bonjour@${process.env.MAILGUN_DOMAIN}>`,
      to: updatedUser.userEmail,
      subject: "Confirmation de changement de mot de passe",
      template: "confirm_change_password",
      variables: {
        userFirstName: updatedUser.userFirstName,
      },
    });

    // Return updated user information
    res.status(200).json({
      id: updatedUser.id,
      userFirstName: updatedUser.userFirstName,
      userLastName: updatedUser.userLastName,
      userUserName: updatedUser.userUserName,
      userEmail: updatedUser.userEmail,
      userRole: updatedUser.userRole,
      userCreatedAt: updatedUser.userCreatedAt,
      mustChangePassword: updatedUser.mustChangePassword,
    });
  } catch (error) {
    console.error("Error updating first login password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.userRole === "superadmin") {
      return res.status(403).json({ message: "Superadmin cannot be deleted" });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting user. Please try again later." });
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logout successful." });
});

const getUserBookings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userIdString = userId.toString();
    const bookings = await Booking.find({ userId: userIdString }).sort({
      createdAt: -1,
    });
    if (bookings.length === 0) {
      return res.json([]); // Return an empty array if no bookings found
    }

    // Fetch all reviews for this user
    const reviews = await Review.find({ userId: userIdString });

    // Create a map of reviews keyed by movieId and sessionId
    const reviewMap = reviews.reduce((acc, review) => {
      const key = `${review.movieId}-${review.sessionId}`;
      acc[key] = review;
      return acc;
    }, {});

    const detailedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const movie = await prisma.movie.findUnique({
          where: { id: parseInt(booking.movieId, 10) },
          select: {
            movieTitle: true,
            movieImg: true,
          },
        });
        const session = await prisma.session.findUnique({
          where: { id: parseInt(booking.sessionId, 10) },
          select: {
            sessionDate: true,
            sessionStatus: true,
            timeRanges: {
              select: {
                timeRangeStartTime: true,
                timeRangeEndTime: true,
              },
            },
            room: {
              select: {
                id: true,
                roomNumber: true,
                cinema: {
                  select: {
                    id: true,
                    cinemaName: true,
                    cinemaAddress: true,
                    cinemaCity: true,
                    cinemaPostalCode: true,
                    cinemaCountry: true,
                  },
                },
              },
            },
          },
        });

        // Find the review for this booking
        const reviewKey = `${booking.movieId}-${booking.sessionId}`;
        const review = reviewMap[reviewKey] || null;

        return {
          ...booking.toObject(),
          movie,
          session: {
            ...session,
            room: {
              id: session.room.id,
              roomNumber: session.room.roomNumber,
            },
            cinema: {
              id: session.room.cinema.id,
              cinemaName: session.room.cinema.cinemaName,
              cinemaAddress: session.room.cinema.cinemaAddress,
              cinemaCity: session.room.cinema.cinemaCity,
              cinemaPostalCode: session.room.cinema.cinemaPostalCode,
              cinemaCountry: session.room.cinema.cinemaCountry,
            },
          },
          review,
        };
      })
    );
    res.json(detailedBookings);
  } catch (error) {
    console.error("Error retrieving user bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { userEmail } = req.body;

  try {
    console.log("Attempting to reset password for:", userEmail);
    const existingUser = await prisma.user.findUnique({ where: { userEmail } });

    if (existingUser) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          resetToken,
          resetTokenExpires,
        },
      });

      const resetLink = `${process.env.WEB_APP_FRONTEND_URL}reset-password/${resetToken}`;

      await sendEmail({
        from: `Cinéphoria <bonjour@${process.env.MAILGUN_DOMAIN}>`,
        to: userEmail,
        subject: "Réinitialisation de votre mot de passe",
        template: "gen_lost_password",
        variables: {
          userFirstName: existingUser.userFirstName,
          verificationLink: resetLink,
        },
      });

      res.status(200).json({
        message: "Instructions de réinitialisation du mot de passe envoyées.",
      });
      console.log("Reset token generated for user:", existingUser.id);
    } else {
      console.log("User not found for email:", userEmail);
      res.status(404).json({ message: "Utilisateur non trouvé." });
    }
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.params;
  console.log("Received verification code:", code);

  const user = await prisma.user.findFirst({
    where: {
      verificationCode: code,
      verificationCodeExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Invalid or expired verification code." });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
    },
  });

  res.status(200).json({ message: "Email verified successfully." });
});

const verifyResetToken = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset token." });
  }

  res.status(200).json({ userId: user.id, message: "Reset token is valid." });
});

const resetPasswordConfirm = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset token." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      userPassword: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  res.status(200).json({ message: "Password has been reset successfully." });
});

const sendContactForm = asyncHandler(async (req, res) => {
  const {
    contactFormSenderEmail: email,
    contactFormSenderUserName: userName,
    contactFormSubject: subject,
    contactFormMessage: message,
  } = req.body;

  if (!email || !subject || !message) {
    return res
      .status(400)
      .json({ message: "Email, subject, and message are required." });
  }

  await sendEmail({
    from: email,
    to: `Cinéphoria <bonjour@${process.env.MAILGUN_DOMAIN}>`,
    replyTo: email,
    subject: "Nouveau message formulaire contact",
    template: "contact_form",
    variables: {
      contactFormSenderEmail: email,
      contactFormSenderUserName: userName || "Non spécifié",
      contactFormSubject: subject,
      contactFormMessage: message,
    },
  });

  res.status(200).json({ message: "Message sent successfully." });
});

export {
  createUser,
  registerUser,
  getUserDetails,
  getUsers,
  getUserBookings,
  getUserProfile,
  loginUser,
  updateUserProfile,
  updateUser,
  updateUserPassword,
  updateFirstLoginPassword,
  deleteUser,
  logoutUser,
  resetPassword,
  verifyEmail,
  verifyResetToken,
  resetPasswordConfirm,
  sendContactForm,
};
