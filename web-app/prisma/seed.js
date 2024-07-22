import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  generatePassword,
  generateVerificationCode,
} from "../backend/utils/userPasswordUtils.js";
import { sendEmail } from "../backend/utils/sendEmail.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

// Update the path to the data files
const dataPath = path.resolve(__dirname, "../frontend/src/assets/data");

async function createAdminUser() {
  const userFirstName = process.env.ADMIN_FIRST_NAME;
  const userLastName = process.env.ADMIN_LAST_NAME;
  const userEmail = process.env.ADMIN_EMAIL;
  const userUserName = process.env.ADMIN_USERNAME;
  const userRole = "superadmin";

  try {
    const adminExists = await prisma.user.findFirst({
      where: {
        userRole: "admin" || "superadmin",
      },
    });

    if (adminExists) {
      console.log("An admin user already exists.");
      return;
    }

    const userPassword = generatePassword();
    const hashedPassword = await hashPassword(userPassword);
    if (!hashedPassword) {
      console.log("Failed to process userPassword, please try again.");
      return;
    }

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
        isVerified: true,
        agreedPolicy: true,
        agreedCgvCgu: true,
        verificationCode,
        verificationCodeExpires,
      },
    });

    const verificationLink = `${process.env.WEB_APP_FRONTEND_URL}verify-email?code=${verificationCode}`;
    await sendEmail({
      from: `Cinéphoria <bonjour@${process.env.MAILGUN_DOMAIN}>`,
      to: userEmail,
      subject: "Votre compte administrateur Cinéphoria",
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

    console.log("Admin user created successfully.");
    console.log("Admin Details:", {
      id: newUser.id,
      userFirstName: newUser.userFirstName,
      userLastName: newUser.userLastName,
      userUserName: newUser.userUserName,
      userEmail: newUser.userEmail,
      userRole: newUser.userRole,
    });
    console.log("An email has been sent to the admin with login details.");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

async function createCategories() {
  const categoriesData = JSON.parse(
    await fs.readFile(path.join(dataPath, "categoryData.json"), "utf8")
  );

  for (const category of categoriesData) {
    const existingCategory = await prisma.category.findUnique({
      where: { categoryName: category.categoryName },
    });

    if (!existingCategory) {
      await prisma.category.create({ data: category });
      console.log(`Created category: ${category.categoryName}`);
    } else {
      console.log(`Category already exists: ${category.categoryName}`);
    }
  }
}

async function createMovies() {
  const moviesData = JSON.parse(
    await fs.readFile(path.join(dataPath, "movieData.json"), "utf8")
  );

  for (const movie of moviesData) {
    const existingMovie = await prisma.movie.findUnique({
      where: { movieTitle: movie.movieTitle },
    });

    if (!existingMovie) {
      const { categoryIds, ...movieData } = movie;
      const createdMovie = await prisma.movie.create({
        data: {
          ...movieData,
          movieReleaseDate: new Date(movie.movieReleaseDate),
          movieScheduleDate: movie.movieScheduleDate
            ? new Date(movie.movieScheduleDate)
            : undefined,
          moviePremiereDate: movie.moviePremiereDate
            ? new Date(movie.moviePremiereDate)
            : undefined,
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
        },
      });
      console.log(`Created movie: ${createdMovie.movieTitle}`);
    } else {
      console.log(`Movie already exists: ${movie.movieTitle}`);
    }
  }
}

async function createCinemas() {
  const cinemasData = JSON.parse(
    await fs.readFile(path.join(dataPath, "cinemaData.json"), "utf8")
  );

  for (const cinema of cinemasData) {
    const existingCinema = await prisma.cinema.findFirst({
      where: {
        OR: [
          { cinemaName: cinema.cinemaName },
          { cinemaEmail: cinema.cinemaEmail },
        ],
      },
    });

    if (!existingCinema) {
      const createdCinema = await prisma.cinema.create({
        data: cinema,
      });
      console.log(`Created cinema: ${createdCinema.cinemaName}`);
    } else {
      console.log(`Cinema already exists: ${cinema.cinemaName}`);
    }
  }
}

async function createRooms() {
  const roomsData = JSON.parse(
    await fs.readFile(path.join(dataPath, "roomData.json"), "utf8")
  );

  for (const room of roomsData) {
    const existingRoom = await prisma.room.findFirst({
      where: {
        cinemaId: room.cinemaId,
        roomNumber: room.roomNumber,
      },
    });

    if (!existingRoom) {
      const createdRoom = await prisma.room.create({
        data: room,
      });
      console.log(
        `Created room number ${createdRoom.roomNumber} in cinema ID ${createdRoom.cinemaId}`
      );
    } else {
      console.log(
        `Room number ${room.roomNumber} in cinema ID ${room.cinemaId} already exists`
      );
    }
  }
}

async function createSessions() {
  const sessionData = JSON.parse(
    await fs.readFile(path.join(dataPath, "sessionData.json"), "utf8")
  );

  for (const session of sessionData) {
    const sessionDateObj = new Date(session.sessionDate);
    const sessionDateUTC = new Date(
      Date.UTC(
        sessionDateObj.getUTCFullYear(),
        sessionDateObj.getUTCMonth(),
        sessionDateObj.getUTCDate()
      )
    );

    const existingSession = await prisma.session.findFirst({
      where: {
        cinemaId: Number(session.cinemaId),
        movieId: Number(session.movieId),
        roomId: Number(session.roomId),
        sessionDate: sessionDateUTC,
      },
    });

    if (!existingSession) {
      const createdSession = await prisma.session.create({
        data: {
          movie: { connect: { id: Number(session.movieId) } },
          cinema: { connect: { id: Number(session.cinemaId) } },
          room: { connect: { id: Number(session.roomId) } },
          sessionDate: sessionDateUTC,
          sessionPrice: session.sessionPrice,
          sessionStatus: session.sessionStatus,
          timeRanges: {
            create: session.timeRanges.map((timeRange) => ({
              timeRangeStartTime: new Date(timeRange.timeRangeStartTime),
              timeRangeEndTime: new Date(timeRange.timeRangeEndTime),
              timeRangeStatus: timeRange.timeRangeStatus || "available",
            })),
          },
        },
        include: {
          movie: true,
          cinema: true,
          room: {
            include: {
              seats: true,
            },
          },
          timeRanges: true,
        },
      });

      const seatStatusPromises = createdSession.timeRanges.map((timeRange) =>
        createdSession.room.seats.map((seat) =>
          prisma.seatStatus.create({
            data: {
              seat: { connect: { id: seat.id } },
              timeRange: { connect: { id: timeRange.id } },
              status: "available",
            },
          })
        )
      );

      await Promise.all(seatStatusPromises.flat());

      console.log(`Created session with ID: ${createdSession.id}`);
    } else {
      console.log(
        `Session already exists for cinema ID ${session.cinemaId}, movie ID ${session.movieId}, room ID ${session.roomId}, and date ${session.sessionDate}`
      );
    }
  }
}

async function main() {
  try {
    await createAdminUser();
    await createCategories();
    await createMovies();
    await createCinemas();
    await createRooms();
    await createSessions();
    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
