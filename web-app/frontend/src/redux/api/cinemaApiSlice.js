import { apiSlice } from "./apiSlice";
import { BASE_URL } from "../constants";

const CINEMA_URL = `${BASE_URL}/api/cinemas`;

export const cinemaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCinema: builder.mutation({
      query: (newCinema) => ({
        url: CINEMA_URL,
        method: "POST",
        body: newCinema,
      }),
      invalidatesTags: [{ type: "Cinema", id: "LIST" }],
    }),

    updateCinema: builder.mutation({
      query: (data) => ({
        url: `${CINEMA_URL}/${data.id}`,
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Cinema"],
    }),

    deleteCinema: builder.mutation({
      query: (cinemaId) => ({
        url: `${CINEMA_URL}/${cinemaId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cinema"],
    }),

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

    getCinemaDetails: builder.query({
      query: (cinemaId) => ({
        url: `${CINEMA_URL}/${cinemaId}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      keepUnusedDataFor: 5,
      providesTags: (result, error, cinemaId) => [
        { type: "Cinema", id: cinemaId },
      ],
    }),
  }),
});

export const {
  useCreateCinemaMutation,
  useUpdateCinemaMutation,
  useDeleteCinemaMutation,
  useGetCinemasQuery,
  useGetCinemaDetailsQuery,
} = cinemaApiSlice;
