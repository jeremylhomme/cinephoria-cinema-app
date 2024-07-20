import { apiSlice } from "./apiSlice";
import { BASE_URL } from "../constants";

const REVIEW_URL = `${BASE_URL}/api/reviews`;

export const reviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new review
    createReview: builder.mutation({
      query: ({ movieId, sessionId, ...reviewData }) => ({
        url: `${REVIEW_URL}/${movieId}/${sessionId}`,
        method: "POST",
        body: reviewData,
      }),
      transformResponse: (response) => {
        if (typeof response === "string") {
          try {
            return JSON.parse(response);
          } catch (error) {
            console.error("Error parsing response:", error);
            return { error: "Invalid server response" };
          }
        }
        return response;
      },
      invalidatesTags: (result, error, { movieId, sessionId }) => [
        "Review",
        { type: "MovieReviews", id: movieId },
        { type: "UserReviews", id: "LIST" },
      ],
    }),
    // Delete a review
    deleteReview: builder.mutation({
      query: (reviewId) => ({
        url: `${REVIEW_URL}/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, reviewId) => [
        "Review",
        { type: "Review", id: reviewId },
      ],
    }),
    // Get all reviews
    getReviews: builder.query({
      query: () => REVIEW_URL,
      providesTags: ["Review"],
    }),
    // Get review details by ID
    getReviewDetails: builder.query({
      query: (id) => `${REVIEW_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: "Review", id }],
    }),
    // Get reviews for a specific movie
    getMovieReviews: builder.query({
      query: (movieSessionPairs) =>
        `${REVIEW_URL}/movie-sessions/${movieSessionPairs}`,
      providesTags: (result, error, movieSessionPairs) =>
        movieSessionPairs
          .split(",")
          .map((pair) => ({ type: "MovieSessionReviews", id: pair })),
    }),
    // Get pending reviews
    getPendingReviews: builder.query({
      query: () => `${REVIEW_URL}/pending`,
      providesTags: ["PendingReview"],
    }),
    // Validate a review
    validateReview: builder.mutation({
      query: ({ reviewId, status, reviewedBy }) => ({
        url: `${REVIEW_URL}/${reviewId}/validate`,
        method: "PATCH",
        body: { status, reviewedBy },
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        "Review",
        "PendingReview",
        { type: "Review", id: reviewId },
      ],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetReviewsQuery,
  useGetReviewDetailsQuery,
  useGetMovieReviewsQuery,
  useGetPendingReviewsQuery,
  useValidateReviewMutation,
} = reviewApiSlice;
