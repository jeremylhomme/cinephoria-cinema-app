import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import mongoose from "mongoose";
import http from "http";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

import bookingRoutes from "./routes/bookingRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cinemaRoutes from "./routes/cinemaRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import seatRoutes from "./routes/seatRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

import { sendContactForm } from "./controllers/userController.js";

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
console.log(`Stripe Initialized ✅`);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mysqlConnection;
let mysqlPool;

// Function to connect to MySQL
const connectMySQL = async () => {
  try {
    const host = process.env.MYSQL_HOST;
    const user = process.env.MYSQL_USER;
    const password = process.env.MYSQL_PASSWORD;
    const port = process.env.MYSQL_PORT || 3306;

    mysqlPool = mysql.createPool({
      host,
      user,
      password,
      port,
      connectTimeout: 60000,
    });

    mysqlConnection = await mysqlPool.getConnection();
    console.log(`MySQL Connected: ${host} ✅`);

    return {
      connection: mysqlConnection,
      pool: mysqlPool,
      host,
      user,
      port,
      password,
    };
  } catch (error) {
    console.error(`Error from MySQL: ${error.message}`);
    console.error(`Stack Trace: ${error.stack}`);
    throw error;
  }
};

// Function to connect to MongoDB using Mongoose
const connectMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(`MongoDB Connected ✅`);
  } catch (error) {
    console.error(`Error from MongoDB: ${error.message}`);
    console.error(`Stack Trace: ${error.stack}`);
    throw error;
  }
};

const app = express();
const port = process.env.PORT;

const corsOptions = {
  origin: [
    process.env.WEB_APP_FRONTEND_URL,
    "https://cinephoria-frontend.onrender.com",
    "http://localhost:8081",
    "http://localhost:5173",
    "http://localhost:5174",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cinemas", cinemaRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/verify-email", verificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/seats", seatRoutes);
app.post("/api/contact", sendContactForm);

// Add Stripe payment route
app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Server is running 🚀");
});

app.use((err, req, res, next) => {
  console.error("Detailed error:", err);
  res.status(500).json({
    message: "Server error",
    error: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
});

const startServer = async () => {
  try {
    await connectMySQL();
    await connectMongoDB();

    const server = http.createServer(app);
    server.listen(port, () => console.log(`Server running on port ${port} ✅`));
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Port ${port} is already in use`);
      } else {
        throw err;
      }
    });

    process.on("SIGINT", async () => {
      console.log("\nGracefully shutting down...");
      try {
        if (mysqlConnection) await mysqlConnection.release();
        if (mysqlPool) await mysqlPool.end();
        if (mongoose.connection) await mongoose.connection.close();
        console.log("Connections closed successfully. Exiting...");
        process.exit(0);
      } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Failed to initialize the server:", error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export { app, connectMySQL, connectMongoDB, port };
