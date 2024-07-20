import { apiSlice } from "./apiSlice";
import { BASE_URL } from "../constants";

const ROOM_URL = `${BASE_URL}/api/rooms`;

export const roomApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createRoom: builder.mutation({
      query: (newRoom) => ({
        url: ROOM_URL,
        method: "POST",
        body: newRoom,
      }),
    }),

    updateRoom: builder.mutation({
      query: (data) => ({
        url: `${ROOM_URL}/${data.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Room"],
    }),

    deleteRoom: builder.mutation({
      query: (roomId) => ({
        url: `${ROOM_URL}/${roomId}`,
        method: "DELETE",
      }),
    }),

    getRooms: builder.query({
      query: () => ROOM_URL,
    }),

    getRoom: builder.query({
      query: (roomId) => `${ROOM_URL}/${roomId}`,
    }),
  }),
});

export const {
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomsQuery,
  useGetRoomQuery,
} = roomApiSlice;
