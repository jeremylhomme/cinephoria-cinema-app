import { apiSlice } from "./apiSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ROOM_URL = `${BASE_URL}/api/rooms`;

export const roomApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query({
      query: () => ROOM_URL,
    }),

    getRoom: builder.query({
      query: (roomId) => `${ROOM_URL}/${roomId}`,
    }),

    getRoomsForCinema: builder.query({
      query: (cinemaId) => `${ROOM_URL}/cinema/${cinemaId}`,
    }),
  }),
});

export const { useGetRoomsQuery, useGetRoomQuery, useGetRoomsForCinemaQuery } =
  roomApiSlice;
