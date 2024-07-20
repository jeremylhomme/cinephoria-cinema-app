import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_URL;
const USER_URL = `${BASE_URL}/api/users`;

export const userApiSlice = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: `${USER_URL}/login`,
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USER_URL}/logout`,
        method: "POST",
      }),
    }),
    getUserProfile: builder.query({
      query: () => `${USER_URL}/profile`,
      providesTags: ["User"],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetUserProfileQuery } =
  userApiSlice;
