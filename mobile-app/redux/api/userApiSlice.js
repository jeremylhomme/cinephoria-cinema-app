import { apiSlice } from "./apiSlice";
import { NATIVE_API_URL } from "@env";

const USER_URL = `${NATIVE_API_URL}/api/users`;

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserBookings: builder.query({
      query: (userId) => ({
        url: `${USER_URL}/${userId}/bookings`,
        method: "GET",
      }),
      providesTags: ["Bookings"],
    }),
    login: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/login`,
        method: "POST",
        body: data,
      }),
      onError: (error, { dispatch }) => {
        dispatch(displayErrorNotification({ message: error.message }));
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USER_URL}/logout`,
        method: "POST",
      }),
    }),
  }),
});

export const { useLoginMutation, useGetUserBookingsQuery, useLogoutMutation } =
  userApiSlice;
