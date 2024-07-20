import { apiSlice } from "./apiSlice";
import { BASE_URL } from "../constants";

const BOOKING_URL = `${BASE_URL}/api/bookings`;

export const bookingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create or update a booking
    createOrUpdateBooking: builder.mutation({
      query: (bookingData) => ({
        url: `${BOOKING_URL}`,
        method: bookingData.bookingId ? "PUT" : "POST",
        body: bookingData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    // Delete a booking
    deleteBooking: builder.mutation({
      query: (bookingId) => ({
        url: `${BOOKING_URL}/${bookingId}`,
        method: "DELETE",
      }),
    }),

    // Soft delete a booking
    softDeleteBooking: builder.mutation({
      query: (bookingId) => ({
        url: `${BOOKING_URL}/${bookingId}/soft-delete`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      // Invalidate the user's bookings cache to trigger a refetch
      invalidatesTags: ["UserBookings"],
    }),

    // Get all bookings
    getBookings: builder.query({
      query: () => BOOKING_URL,
    }),

    // Get booking details by ID
    getBookingDetails: builder.query({
      query: (id) => ({
        url: `${BOOKING_URL}/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useCreateOrUpdateBookingMutation,
  useDeleteBookingMutation,
  useSoftDeleteBookingMutation,
  useGetBookingsQuery,
  useGetBookingDetailsQuery,
} = bookingApiSlice;
