import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import LoaderFull from "../../components/LoaderFull";
import QRCode from "react-qr-code";
import { useNavigate, Link } from "react-router-dom";
import { useGetUserBookingsQuery } from "../../redux/api/userApiSlice";
import { useSoftDeleteBookingMutation } from "../../redux/api/bookingApiSlice";
import { useGetMovieReviewsQuery } from "../../redux/api/reviewApiSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import { parseISO, format, isAfter } from "date-fns";
import { fr } from "date-fns/locale";

const formatDateInFrench = (isoString) => {
  const date = parseISO(isoString);
  return format(date, "EEEE d MMMM yyyy", { locale: fr });
};

const formatTimeInLocal = (isoString) => {
  const date = parseISO(isoString);
  return format(date, "HH:mm");
};

Modal.setAppElement("#root");

const Orders = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  const navigate = useNavigate();

  const {
    data: bookings,
    isLoading,
    isError,
    refetch,
  } = useGetUserBookingsQuery(userInfo?.id);

  const [softDeleteBooking, { isLoading: isCancelling }] =
    useSoftDeleteBookingMutation();

  const uniqueMovieIds = [
    ...new Set(bookings?.map((booking) => booking.movieId) || []),
  ];

  const uniqueMovieSessionPairs = [
    ...new Set(
      bookings?.map((booking) => `${booking.movieId}-${booking.sessionId}`) ||
        []
    ),
  ];
  const movieSessionPairsString = uniqueMovieSessionPairs.join(",");

  const movieIdsString = uniqueMovieIds.join(",");

  const { data: allMovieReviews, isLoading: isLoadingReviews } =
    useGetMovieReviewsQuery(movieIdsString, {
      skip: uniqueMovieIds.length === 0,
      refetchOnMountOrArgChange: true,
    });

  const renderReviewButton = (booking) => {
    const now = new Date();
    const endTime = parseISO(booking.timeRange.timeRangeEndTime);

    if (booking.review) {
      switch (booking.review.status) {
        case "pending":
          return (
            <span className="text-sm pl-2 text-yellow-700 m-auto font-medium rounded-md">
              Avis en attente de validation
            </span>
          );
        case "approved":
          return (
            <span className="text-sm pl-2 text-green-700 m-auto font-medium rounded-md">
              Votre avis a été publié !
            </span>
          );
        case "rejected":
          return (
            <span className="text-sm pl-2 text-red-700 m-auto font-medium rounded-md">
              Votre avis n'a pas pu être validé
            </span>
          );
        default:
          return (
            <span className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md">
              Statut inconnu
            </span>
          );
      }
    } else if (isAfter(now, endTime)) {
      return (
        <Link
          to={`/review/${booking.movieId}/${booking.sessionId}`}
          state={{
            movieId: booking.movieId,
            sessionId: booking.sessionId,
            movieTitle: booking.movie.movieTitle,
            bookingId: booking._id,
          }}
          className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 inline-block"
        >
          Laisser un avis
        </Link>
      );
    } else {
      return (
        <span className="text-sm pl-2 text-gray-500 m-auto font-medium rounded-md">
          L'avis sera disponible après la séance
        </span>
      );
    }
  };

  useEffect(() => {
    if (triggerRefetch) {
      refetch();
      setTriggerRefetch(false);
    }
  }, [triggerRefetch, refetch]);

  useEffect(() => {
    if (bookings) {
      refetch();
    }
  }, [bookings, refetch]);

  const handleGenerateQR = (booking) => {
    setCurrentBooking(booking);
    setIsQRModalOpen(true);
  };

  const handleCompleteOrder = (bookingId) => {
    navigate(`/bookings/${bookingId}/payment`);
  };

  const handleCancelOrder = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Êtes-vous sûr de vouloir annuler cette commande ?"
    );
    if (confirmCancel) {
      try {
        await softDeleteBooking(bookingId).unwrap();
        toast.success("Votre commande a été annulée.");
        refetch();
      } catch (error) {
        console.error("Error canceling booking:", error);
        toast.error(
          "Une erreur s'est produite lors de l'annulation de la commande."
        );
      }
    }
  };

  const generateQRData = (booking) => {
    return {
      bookingId: booking._id,
      movieTitle: booking.movie.movieTitle,
      sessionDate: booking.timeRange
        ? `${formatDateInFrench(
            booking.timeRange.timeRangeStartTime
          )} de ${formatTimeInLocal(
            booking.timeRange.timeRangeStartTime
          )} à ${formatTimeInLocal(booking.timeRange.timeRangeEndTime)}`
        : "N/A",
      cinemaName: booking.session?.cinema?.cinemaName || "N/A",
      seats: booking.seatsBooked.map((seat) => seat.seatNumber).join(", "),
    };
  };

  if (isLoading || isDeleting) return <LoaderFull />;
  if (isError) return <div>Error loading bookings</div>;

  return (
    <div className="max-w-4xl px-8 py-16 mx-auto bg-white rounded-md my-12">
      <h1 className="text-2xl font-bold mb-6">Mes Commandes</h1>
      <ToastContainer />

      {!bookings || bookings.length === 0 ? (
        <div className="py-8">
          <p className="text-gray-500">Vous n'avez pas encore de commandes.</p>
          <Link
            to="/movies"
            className="mt-4 inline-block text-sm px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
          >
            Parcourir les films
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="border-t border-gray-200 pt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <img
                    src={`${booking.movie.movieImg}`}
                    alt={booking.movie.movieTitle}
                    className="w-24 object-cover"
                  />
                </div>
                <div className="ml-4 flex-1 flex flex-col">
                  <h3 className="mb-2">Commande n°{booking._id}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Date de la réservation :{" "}
                    {booking.bookingCreatedAt
                      ? `${formatDateInFrench(
                          booking.bookingCreatedAt
                        )} à ${formatTimeInLocal(booking.bookingCreatedAt)}`
                      : "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Montant payé : {booking.bookingPrice.toFixed(2)} €
                  </p>
                  <p className="text-sm text-gray-500 mt-1 mr-2">
                    Sièges sélectionnés :{" "}
                    <span className="flex flex-wrap mt-1">
                      {booking.seatsBooked.map((seat) => (
                        <span
                          key={seat.seatId}
                          className="bg-gray-100 rounded-md py-1 px-2 m-1 inline-block"
                        >
                          {seat.seatNumber}
                        </span>
                      ))}
                    </span>
                  </p>
                  <h3 className="mt-4 mb-2">Votre séance</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Film : {booking.movie.movieTitle}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Date de la séance :{" "}
                    {booking.timeRange
                      ? `${formatDateInFrench(
                          booking.timeRange.timeRangeStartTime
                        )} de ${formatTimeInLocal(
                          booking.timeRange.timeRangeStartTime
                        )} à ${formatTimeInLocal(
                          booking.timeRange.timeRangeEndTime
                        )}`
                      : "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Salle n° {booking.session.room?.roomNumber || "N/A"}
                  </p>
                  <h3 className="mt-4 mb-2">Votre cinéma</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {booking.session?.cinema?.cinemaName || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {booking.session?.cinema?.cinemaAddress || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {booking.session?.cinema?.cinemaPostalCode || "N/A"}{" "}
                    {booking.session?.cinema?.cinemaCity || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {booking.session?.cinema?.cinemaCountry || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex justify-center space-x-2 mt-8">
                {booking.bookingStatus === "confirmed" ? (
                  <>
                    <button
                      onClick={() => handleGenerateQR(booking)}
                      className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-800"
                    >
                      Afficher le QR Code
                    </button>
                    {renderReviewButton(booking)}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleCompleteOrder(booking._id)}
                      className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-800"
                    >
                      Terminer la réservation
                    </button>
                    <button
                      onClick={() => handleCancelOrder(booking._id)}
                      className="block rounded-md px-3 py-2 text-center text-sm bg-gray-300 text-gray-600 hover:bg-gray-400"
                    >
                      Annuler la réservation
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {currentBooking && (
        <Modal
          isOpen={isQRModalOpen}
          onRequestClose={() => setIsQRModalOpen(false)}
          contentLabel="QR Code"
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75"
        >
          <div className="relative bg-white p-4 rounded-lg max-w-3xl w-full">
            <button
              onClick={() => setIsQRModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-gray-900"
            >
              &times;
            </button>
            <div className="flex justify-center">
              <QRCode
                value={JSON.stringify({
                  bookingConfirmed: "Booking confirmed.",
                  details: generateQRData(currentBooking),
                })}
                size={256}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
