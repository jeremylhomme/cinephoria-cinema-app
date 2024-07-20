import { apiSlice } from "./apiSlice";
import { BASE_URL } from "../constants";

const SESSION_URL = `${BASE_URL}/api/sessions`;

export const sessionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSession: builder.mutation({
      query: (newSession) => ({
        url: SESSION_URL,
        method: "POST",
        body: newSession,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Session"],
    }),

    updateSession: builder.mutation({
      query: (data) => ({
        url: `${SESSION_URL}/${data.id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Session"],
    }),

    deleteSession: builder.mutation({
      query: (sessionId) => ({
        url: `${SESSION_URL}/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Session"],
    }),

    getSessions: builder.query({
      query: () => `${SESSION_URL}`,
    }),

    getSessionDetails: builder.query({
      query: (sessionId) => ({
        url: `${SESSION_URL}/${sessionId}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      providesTags: ["Session"],
      keepUnusedDataFor: 5,
    }),

    getBookedTimeRanges: builder.query({
      query: ({ cinemaId, roomId, date, movieId }) => ({
        url: `${SESSION_URL}/booked-time-ranges?cinemaId=${cinemaId}&roomId=${roomId}&date=${date}&movieId=${movieId}`,
        method: "GET",
      }),
      providesTags: ["Session"],
    }),

    getAvailableTimeRanges: builder.query({
      query: ({ cinemaId, roomId, date, movieId }) => ({
        url: `${SESSION_URL}/available-time-ranges?cinemaId=${cinemaId}&roomId=${roomId}&date=${date}&movieId=${movieId}`,
        method: "GET",
      }),
      providesTags: ["Session"],
    }),

    createAvailableTimeRanges: builder.mutation({
      query: (data) => ({
        url: `${SESSION_URL}/available-time-ranges`,
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Session"],
    }),
  }),
});

export const {
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useGetSessionsQuery,
  useGetSessionDetailsQuery,
  useGetBookedTimeRangesQuery,
  useGetAvailableTimeRangesQuery,
  useCreateAvailableTimeRangesMutation,
} = sessionApiSlice;
