import React, { useEffect } from "react";
import {
  useGetPendingReviewsQuery,
  useValidateReviewMutation,
} from "../../redux/api/reviewApiSlice";
import { toast } from "react-toastify";

const ReviewValidation = () => {
  const { data: pendingReviews, refetch } = useGetPendingReviewsQuery();
  const [validateReview] = useValidateReviewMutation();

  const handleValidate = async (reviewId, status) => {
    try {
      await validateReview({ reviewId, status }).unwrap();
      toast.success(`Review ${status} successfully`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div>
      <h2>Pending Reviews</h2>
      {pendingReviews?.map((review) => (
        <div key={review._id}>
          <p>Movie: {review.movieTitle}</p>
          <p>
            User: {review.userFirstName} {review.userLastName} (
            {review.userEmail})
          </p>
          <p>Rating: {review.rating}</p>
          <p>Comment: {review.comment}</p>
          <button onClick={() => handleValidate(review._id, "approved")}>
            Approve
          </button>
          <button onClick={() => handleValidate(review._id, "rejected")}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
};

export default ReviewValidation;
