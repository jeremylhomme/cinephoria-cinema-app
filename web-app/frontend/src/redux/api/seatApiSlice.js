import { apiSlice } from "./apiSlice";
import { BASE_URL } from "../constants";

const SEAT_URL = `${BASE_URL}/api/seats`;

export const seatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAvailableSeatsBySession: builder.query({
      query: (sessionId) => `${SEAT_URL}/available/session/${sessionId}`,
    }),
    getBookedSeatsBySession: builder.query({
      query: (sessionId) => `${SEAT_URL}/booked/session/${sessionId}`,
    }),
    getSeatMap: builder.query({
      query: (roomId) => `${SEAT_URL}/seatmap/${roomId}`,
    }),
    createSeat: builder.mutation({
      query: (newSeat) => ({
        url: SEAT_URL,
        method: "POST",
        body: newSeat,
      }),
    }),
    updateSeat: builder.mutation({
      query: ({ seatId, updatedSeat }) => ({
        url: `${SEAT_URL}/${seatId}`,
        method: "PUT",
        body: updatedSeat,
      }),
    }),
  }),
});

export const {
  useGetAvailableSeatsBySessionQuery,
  useGetBookedSeatsBySessionQuery,
  useGetSeatMapQuery,
  useCreateSeatMutation,
  useUpdateSeatMutation,
} = seatApiSlice;
