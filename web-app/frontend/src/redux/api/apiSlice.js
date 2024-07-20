import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";

const prepareHeaders = (headers, { getState }) => {
  const token = getState().auth.token;
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return headers;
};

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL || "http://localhost:5000",
  credentials: "include",
  prepareHeaders,
});

const baseQueryWithRejection = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error) {
    console.error("Error from server:", result.error);
    if (result.error.status === 401) {
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRejection,
  endpoints: (builder) => ({}),
  tagTypes: [
    "User",
    "Movie",
    "Bookings",
    "UserBookings",
    "Session",
    "Cinema",
    "Category",
    "MovieReviews",
  ],
});

export default apiSlice;
