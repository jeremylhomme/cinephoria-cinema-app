import { apiSlice } from "./apiSlice";
import { BASE_URL } from "../constants";

const USER_URL = `${BASE_URL}/api/users`;
const PROFILE_URL = `${BASE_URL}/api/users/profile`;

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (userData) => ({
        url: `${USER_URL}`,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    getUsers: builder.query({
      query: () => ({
        url: USER_URL,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),

    getUserProfile: builder.query({
      query: (userId) => ({
        url: `${PROFILE_URL}/${userId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 5,
    }),

    getUserDetails: builder.query({
      query: (userId) => ({
        url: `${USER_URL}/user-details/${userId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 5,
    }),

    getUserBookings: builder.query({
      query: (userId) => `${USER_URL}/${userId}/bookings`,
      transformResponse: (response) =>
        response.filter((booking) => booking.bookingStatus !== "cancelled"),
      providesTags: ["UserBookings"],
    }),

    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/${data.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    updateUserProfile: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${PROFILE_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    updateUserResetPassword: builder.mutation({
      query: (data) => ({
        url: "/api/users/reset-password-confirm",
        method: "POST",
        body: data,
      }),
    }),

    updateUserPassword: builder.mutation({
      query: ({ id, newPassword }) => ({
        url: `${USER_URL}/${id}/update-password`,
        method: "PUT",
        body: { newPassword },
      }),
      invalidatesTags: ["User"],
    }),

    updateFirstLoginPassword: builder.mutation({
      query: ({ id, newPassword }) => ({
        url: `${USER_URL}/${id}/update-first-login-password`,
        method: "PUT",
        body: { newPassword },
      }),
      invalidatesTags: ["User"],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USER_URL}/${userId}`,
        method: "DELETE",
      }),
    }),

    register: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/register`,
        method: "POST",
        body: data,
      }),
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

    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/reset-password`,
        method: "POST",
        body: data,
      }),
    }),

    resetPasswordConfirm: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: `${USER_URL}/reset-password-confirm`,
        method: "POST",
        body: { token, newPassword },
      }),
    }),

    verifyResetToken: builder.query({
      query: (token) => ({
        url: `${USER_URL}/verify-reset-token/${token}`,
        method: "GET",
      }),
    }),

    verifyEmail: builder.mutation({
      query: (code) => ({
        url: `/api/verify-email/${code}`,
        method: "GET",
      }),
    }),
    sendContactForm: builder.mutation({
      query: (data) => ({
        url: "/api/contact",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserProfileQuery,
  useGetUserDetailsQuery,
  useGetUserBookingsQuery,
  useUpdateUserMutation,
  useUpdateUserProfileMutation,
  useUpdateUserPasswordMutation,
  useUpdateFirstLoginPasswordMutation,
  useDeleteUserMutation,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useUpdateUserResetPasswordMutation,
  useResetPasswordConfirmMutation,
  useVerifyResetTokenQuery,
  useSendContactFormMutation,
} = userApiSlice;
