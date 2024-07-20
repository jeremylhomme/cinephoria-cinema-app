import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { NATIVE_API_URL } from "@env";

const prepareHeaders = (headers, { getState }) => {
  const token = getState().auth.token;
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return headers;
};

const baseQuery = fetchBaseQuery({
  baseUrl: NATIVE_API_URL,
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
  tagTypes: ["User", "Bookings"],
});

export default apiSlice;
