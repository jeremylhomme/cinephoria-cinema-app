import { apiSlice } from "./apiSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CINEMA_URL = `${BASE_URL}/api/cinemas`;

export const cinemaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCinemas: builder.query({
      query: ({ cinemaId } = {}) => {
        const cinemaQuery = cinemaId ? `?cinemaId=${cinemaId}` : "";
        return {
          url: `${CINEMA_URL}${cinemaQuery}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
      providesTags: [{ type: "Cinema", id: "LIST" }],
    }),
  }),
});

export const { useGetCinemasQuery } = cinemaApiSlice;
