import jwt from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler.js";
import prisma from "../config/prismaClient.js";

const getTokenFromRequest = (req) => {
  const bearerToken = req.headers.authorization;
  const token = bearerToken && bearerToken.split(" ")[1];
  return token || req.cookies.jwt;
};

const authenticatedUser = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res
      .status(401)
      .json({ error: "Not authorized, no token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        userFirstName: true,
        userLastName: true,
        userEmail: true,
        userRole: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Not authorized, token failed." });
  }
});

const authorizedAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user.userRole === "admin" || req.user.userRole === "superadmin")
  ) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as an admin");
  }
};

const authorizedEmployee = (req, res, next) => {
  if (["employee", "admin", "superadmin"].includes(req.user.userRole)) {
    next();
  } else {
    return res.status(403).json({
      error: "Access denied. Employee, Admin, or Superadmin role required.",
    });
  }
};

const authorizedSuperAdmin = (req, res, next) => {
  if (req.user && req.user.userRole === "superadmin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as a superadmin");
  }
};

export {
  authenticatedUser,
  authorizedAdmin,
  authorizedEmployee,
  authorizedSuperAdmin,
};
