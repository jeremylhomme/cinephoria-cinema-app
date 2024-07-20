import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    movieId: {
      type: String,
      required: true,
    },
    seatsBooked: [
      {
        seatId: {
          type: Number,
          required: true,
        },
        seatNumber: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          required: true,
        },
        pmrSeat: {
          type: Boolean,
          required: true,
        },
      },
    ],
    bookingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    bookingStatus: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "cancelled", "no session"],
      default: "pending",
    },
    bookingCreatedAt: {
      type: Date,
      default: Date.now,
    },
    timeRange: {
      timeRangeId: {
        type: Number,
        required: true,
      },
      timeRangeStartTime: {
        type: Date,
        required: true,
      },
      timeRangeEndTime: {
        type: Date,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
