import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const prepareHeaders = (headers, { getState }) => {
  const token = getState().auth.token;
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return headers;
};

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders,
});

console.log(`API URL: ${BASE_URL}`);

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
  tagTypes: ["Incident", "Room", "Cinema"],
});

export default apiSlice;
