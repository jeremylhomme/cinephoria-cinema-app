import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useCreateReviewMutation } from "../../redux/api/reviewApiSlice";
import Loader from "../../components/Loader";
import { goldIcon } from "../../redux/constants";

const ReviewPage = () => {
  const { movieId, sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { movieTitle, bookingId } = location.state || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [createReview, { isLoading }] = useCreateReviewMutation();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setMessage("Please select a rating");
      return;
    }
    try {
      const result = await createReview({
        movieId,
        sessionId,
        bookingId,
        rating,
        comment,
      }).unwrap();
      if (result.error) {
        throw new Error(result.error);
      }
      setMessage(
        "Review submitted successfully. It will be published after validation."
      );
      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setMessage(
        err.data?.message ||
          err.error ||
          "An error occurred while submitting the review."
      );
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-12 w-auto" src={goldIcon} alt="Cinéphoria" />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
          Laissez un avis
        </h2>
        <p className="mt-2 text-center text-base text-gray-600">
          Votre opinion compte ! Partagez votre avis sur le film {movieTitle}.
        </p>
      </div>

      <div className="bg-white mt-6 p-8 rounded-md sm:mx-auto sm:w-full sm:max-w-sm">
        {message && (
          <p
            className={`mb-4 text-center ${
              message.includes("successfully")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="rating"
              className="block text-sm font-medium leading-6"
            >
              Note
            </label>
            <div className="mt-2 flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl ${
                    rating >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium leading-6"
            >
              Commentaire
            </label>
            <div className="mt-2">
              <textarea
                id="comment"
                name="comment"
                rows="4"
                required
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre avis sur le film..."
              />
            </div>
          </div>

          <div className="!mt-10">
            <button
              disabled={isLoading}
              type="submit"
              className="flex w-full justify-center rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              {isLoading ? <Loader /> : "Soumettre l'avis"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewPage;
