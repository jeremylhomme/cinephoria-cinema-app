import { apiSlice } from "./apiSlice";
import { BASE_URL } from "../constants";

const CATEGORY_URL = `${BASE_URL}/api/categories`;

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (newCategory) => ({
        url: `${CATEGORY_URL}`,
        method: "POST",
        body: newCategory,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      // Invalidate the general 'Categories' tag to refresh list data
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation({
      query: ({ categoryId, updatedCategory }) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: "PUT",
        body: updatedCategory,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      // Invalidate specific category by ID to ensure details are refreshed
      invalidatesTags: [
        { type: "Category", id: "LIST" },
        { type: "Category", id: (args) => args.categoryId },
      ],
    }),

    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: "DELETE",
      }),
      // Invalidate specific category by ID to remove it from details views and lists
      invalidatesTags: [{ type: "Category", id: (args) => args }],
    }),

    getCategories: builder.query({
      query: () => `${CATEGORY_URL}`,
      // Provide tags for all categories fetched, plus a general 'LIST' tag
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Category", id })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} = categoryApiSlice;
