import { apiSlice } from "./apiSlice";
import { BASE_URL } from "../constants";

const MOVIE_URL = `${BASE_URL}/api/movies`;

export const movieApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMovie: builder.mutation({
      query: (newMovie) => ({
        url: MOVIE_URL,
        method: "POST",
        body: newMovie,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Movie"],
    }),

    updateMovie: builder.mutation({
      query: (data) => ({
        url: `${MOVIE_URL}/${data.id}`,
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Movie"],
    }),

    deleteMovie: builder.mutation({
      query: (movieId) => ({
        url: `${MOVIE_URL}/${movieId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Movie"],
    }),

    getMovies: builder.query({
      query: ({ state = "all", categories = "all", cinemaId, date } = {}) => {
        const categoryQuery =
          categories !== "all" ? `categories=${categories}` : "";
        const cinemaQuery = cinemaId ? `&cinemaId=${cinemaId}` : "";
        const stateQuery = state !== "all" ? `&state=${state}` : "";
        const dateQuery = date ? `&date=${date}` : "";
        return {
          url: `${MOVIE_URL}?${categoryQuery}${cinemaQuery}${stateQuery}${dateQuery}`,
          method: "GET",
        };
      },
      providesTags: ["Movie"],
    }),

    getMovieDetails: builder.query({
      query: (movieId) => ({
        url: `${MOVIE_URL}/${movieId}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      providesTags: ["Movie"],
      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
  useGetMoviesQuery,
  useGetMovieDetailsQuery,
} = movieApiSlice;
