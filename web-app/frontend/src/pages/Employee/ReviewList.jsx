import React, { useState } from "react";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import { CheckIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import Modal from "react-modal";

import {
  useGetReviewsQuery,
  useValidateReviewMutation,
  useDeleteReviewMutation,
} from "../../redux/api/reviewApiSlice";

Modal.setAppElement("#root");

const ReviewList = () => {
  const { data, refetch, isLoading, error } = useGetReviewsQuery();
  const [validateReview] = useValidateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const handleValidate = async (review) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir valider cet avis ?"
    );
    if (isConfirmed) {
      try {
        await validateReview({
          reviewId: review._id,
          status: "approved",
        }).unwrap();
        toast.success("Avis validé avec succès !");
        refetch();
      } catch (err) {
        toast.error("Une erreur s'est produite. Veuillez réessayer.");
        console.error("Erreur de validation:", err);
      }
    }
  };

  const handleDelete = async (review) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cet avis ?"
    );
    if (isConfirmed) {
      try {
        await deleteReview(review._id).unwrap();
        toast.success("Avis supprimé avec succès !");
        refetch();
      } catch (err) {
        toast.error("Une erreur s'est produite. Veuillez réessayer.");
        console.error("Erreur de suppression:", err);
      }
    }
  };

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setModalIsOpen(true);
  };

  if (isLoading) return <LoaderFull />;
  if (error) return <p>Erreur lors du chargement des avis : {error.message}</p>;

  const reviews = data || [];

  return (
    <div className="pt-16 pb-24">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight">
            Avis
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="bg-white inline-block min-w-full py-2 align-middle box-border border border-solid rounded-md border-[#e5e7eb] sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                        >
                          Film
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                        >
                          Utilisateur
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                        >
                          Note
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                        >
                          Commentaire
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                        >
                          Statut
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-transparent">
                      {reviews.length > 0 ? (
                        reviews.map((review) => (
                          <tr key={review._id}>
                            <td className="whitespace-nowrap pr-3 py-5 text-sm">
                              {review.movieTitle}
                            </td>
                            <td className="whitespace-nowrap pr-3 py-5 text-sm">
                              {review.userEmail}
                            </td>
                            <td className="whitespace-nowrap pr-3 py-5 text-sm">
                              {review.rating}
                            </td>
                            <td className="pr-3 py-5 text-sm">
                              {review.comment}
                            </td>
                            <td className="whitespace-nowrap pr-3 py-5 text-sm">
                              {review.status === "pending" ? (
                                <span className="py-1.5 px-2 inline-flex items-center rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                                  En attente de validation
                                </span>
                              ) : review.status === "approved" ? (
                                <span className="py-1.5 px-2 inline-flex items-center rounded-md text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                                  Approuvé
                                </span>
                              ) : (
                                review.status === "rejected" && (
                                  <span className="py-1.5 px-2 inline-flex items-center rounded-md text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
                                    Rejeté
                                  </span>
                                )
                              )}
                            </td>
                            <td className="whitespace-nowrap pr-3 py-5 text-sm">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewDetails(review)}
                                  className="text-gray-500 hover:text-gray-400"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleValidate(review)}
                                  className="text-gray-500 hover:text-gray-400"
                                >
                                  <CheckIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(review)}
                                  className="text-gray-500 hover:text-gray-400"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="whitespace-nowrap pr-3 py-5 text-sm text-center text-gray-500"
                          >
                            Aucun avis trouvé.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Détails de l'avis"
        className="fixed inset-0 flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75"
      >
        <div className="bg-white p-8 rounded-lg max-w-2xl w-full">
          <h2 className="text-2xl font-bold mb-4">Détails de l'avis</h2>
          {selectedReview && (
            <div>
              <p className="mb-4">
                <strong>Film :</strong> {selectedReview.movieTitle}
              </p>
              <p className="mb-4">
                <strong>Utilisateur :</strong> {selectedReview.userEmail}
              </p>
              <p className="mb-4">
                <strong>Note :</strong> {selectedReview.rating}
              </p>
              <p className="mb-4">
                <strong>Commentaire :</strong> {selectedReview.comment}
              </p>
              <p className="mb-4">
                <strong>Statut :</strong>{" "}
                {selectedReview.status === "pending" ? (
                  <span className="py-1.5 px-2 inline-flex items-center rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                    En attente de validation
                  </span>
                ) : selectedReview.status === "approved" ? (
                  <span className="py-1.5 px-2 inline-flex items-center rounded-md text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                    Approuvé
                  </span>
                ) : (
                  selectedReview.status === "rejected" && (
                    <span className="py-1.5 px-2 inline-flex items-center rounded-md text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
                      Rejeté
                    </span>
                  )
                )}
              </p>
              <p>
                <strong>Créé le :</strong>{" "}
                {new Date(selectedReview.createdAt).toLocaleString()}
              </p>
            </div>
          )}
          <button
            onClick={() => setModalIsOpen(false)}
            className="mt-6 block rounded-md bg-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Fermer
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ReviewList;
