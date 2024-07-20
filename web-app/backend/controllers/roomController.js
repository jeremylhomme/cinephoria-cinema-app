import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const createRoom = asyncHandler(async (req, res, prisma) => {
  const { roomNumber, cinemaId, roomCapacity, roomQuality } = req.body;

  // Check for required fields
  if (!roomNumber || !cinemaId || !roomCapacity || !roomQuality) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  // Check if the cinema exists
  const cinemaExists = await prisma.cinema.findUnique({
    where: { id: cinemaId },
  });
  if (!cinemaExists) {
    return res.status(404).json({ message: "Cinema not found." });
  }

  try {
    // Generate a unique seatMapId
    const seatMapId = uuidv4();

    // Create the room
    const room = await prisma.room.create({
      data: {
        roomNumber,
        cinemaId,
        roomCapacity,
        roomQuality,
        seatMapId,
      },
    });

    // Create the seats without initial statuses
    const seatPromises = [];
    for (let i = 1; i <= roomCapacity; i++) {
      seatPromises.push(
        prisma.seat.create({
          data: {
            seatNumber: `${i}`,
            pmrSeat: false,
            roomId: room.id,
          },
        })
      );
    }
    await Promise.all(seatPromises);

    res.status(201).json(room);
  } catch (error) {
    console.error("Error creating room:", error);
    res
      .status(500)
      .json({ message: "Error creating room", error: error.message });
  }
});

const getRooms = async (req, res, prisma) => {
  try {
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        roomNumber: true,
        roomQuality: true,
        roomCapacity: true,
        seatMapId: true,
        cinema: {
          select: {
            id: true,
            cinemaName: true,
            cinemaCity: true,
            cinemaPostalCode: true,
            cinemaCountry: true,
          },
        },
        sessions: {
          select: {
            id: true,
            sessionDate: true,
            sessionPrice: true,
            movie: {
              select: {
                id: true,
                movieTitle: true,
                movieDescription: true,
                movieImg: true,
                categories: {
                  select: {
                    id: true,
                    categoryName: true,
                  },
                },
              },
            },
          },
        },
        seats: {
          select: {
            id: true,
            seatNumber: true,
            pmrSeat: true,
            seatStatuses: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res
      .status(500)
      .json({ error: "Error fetching rooms", details: error.message });
  }
};

const getRoom = asyncHandler(async (req, res, prisma) => {
  const room = await prisma.room.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      cinema: true,
      sessions: true,
    },
  });

  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ message: "Room not found" });
  }
});

const updateRoom = async (req, res, prisma) => {
  try {
    const room = await prisma.room.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      select: {
        id: true,
        roomNumber: true,
        roomQuality: true,
        roomCapacity: true,
      },
    });

    res.json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(404).json({
      message: "Room not found or invalid data",
      error: error.message,
    });
  }
};

const deleteRoom = asyncHandler(async (req, res, prisma) => {
  const { id } = req.params;
  const roomIdNumber = Number(id);

  try {
    // Check if there are any sessions associated with the room
    const sessions = await prisma.session.findMany({
      where: { roomId: roomIdNumber },
    });

    if (sessions.length > 0) {
      // Prevent deletion if there are associated sessions
      return res.status(400).json({
        message:
          "Cannot delete room because there are associated sessions. Please delete the sessions first.",
      });
    }

    // Delete all seats associated with the room
    await prisma.seat.deleteMany({
      where: { roomId: roomIdNumber },
    });

    // Proceed to delete the room
    const room = await prisma.room.delete({
      where: { id: roomIdNumber },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room and associated seats deleted successfully." });
  } catch (error) {
    console.error(`Error deleting room with ID ${id}:`, error);
    res.status(500).json({
      message: "An error occurred while deleting the room.",
      error: error.message,
    });
  }
});

export { createRoom, getRooms, getRoom, updateRoom, deleteRoom };
