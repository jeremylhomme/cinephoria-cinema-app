import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const prisma = new PrismaClient();

const createSeat = asyncHandler(async (req, res, prisma) => {
  const { sessionId, seatId, pmrSeat } = req.body;

  try {
    const newSeat = await prisma.seat.create({
      data: {
        id: seatId,
        sessionId: parseInt(sessionId),
        pmrSeat: pmrSeat,
        status: "available",
      },
    });
    res.status(201).json(newSeat);
  } catch (error) {
    console.error("Error creating seat:", error);
    res.status(500).json({ message: "Error creating seat" });
  }
});

const getSeatMap = asyncHandler(async (req, res, prisma) => {
  const { roomId } = req.params;

  try {
    const seats = await prisma.seat.findMany({
      where: {
        roomId: parseInt(roomId),
      },
    });

    if (!seats) {
      return res.status(404).json({ message: "No seats found for this room" });
    }

    res.status(200).json(seats);
  } catch (error) {
    console.error("Error fetching seat map:", error);
    res.status(500).json({ message: "Error fetching seat map" });
  }
});

const getAvailableSeats = asyncHandler(async (req, res, prisma) => {
  const { sessionId } = req.params;

  try {
    const seats = await prisma.seat.findMany({
      where: {
        sessionId: parseInt(sessionId),
        status: "available",
      },
    });
    res.status(200).json(seats);
  } catch (error) {
    console.error("Error fetching available seats:", error);
    res.status(500).json({ message: "Error fetching available seats" });
  }
});

const getBookedSeats = asyncHandler(async (req, res, prisma) => {
  const { sessionId } = req.params;

  try {
    const seats = await prisma.seat.findMany({
      where: {
        sessionId: parseInt(sessionId),
        status: "booked",
      },
    });
    res.status(200).json(seats);
  } catch (error) {
    console.error("Error fetching booked seats:", error);
    res.status(500).json({ message: "Error fetching booked seats" });
  }
});

const updateSeat = asyncHandler(async (req, res, prisma) => {
  const { seatId } = req.params;
  const { pmrSeat } = req.body;

  try {
    const updatedSeat = await prisma.seat.update({
      where: { id: parseInt(seatId) },
      data: { pmrSeat: pmrSeat },
    });
    res.status(200).json(updatedSeat);
  } catch (error) {
    console.error(`Error updating seat ${seatId}:`, error);
    res.status(500).json({ message: "Error updating seat" });
  }
});

export {
  createSeat,
  getSeatMap,
  getAvailableSeats,
  getBookedSeats,
  updateSeat,
};
