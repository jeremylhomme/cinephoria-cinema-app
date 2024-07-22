import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import { useGetMovieDetailsQuery } from "../../redux/api/movieApiSlice";
import { useGetSessionDetailsQuery } from "../../redux/api/sessionApiSlice";
import { useCreateOrUpdateBookingMutation } from "../../redux/api/bookingApiSlice";
import { useGetMovieReviewsQuery } from "../../redux/api/reviewApiSlice";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { MdWheelchairPickup } from "react-icons/md";
import { PlayIcon } from "@heroicons/react/24/outline";
import Modal from "react-modal";
import { qualityIcons } from "../../redux/constants";
import QualityGuideModal from "../../components/QualityGuideModal";
import { StarIcon } from "@heroicons/react/24/solid";

Modal.setAppElement("#root");

const MoviePage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: movie,
    isError: movieError,
    isLoading: movieLoading,
  } = useGetMovieDetailsQuery(movieId);

  const {
    data: reviews,
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = useGetMovieReviewsQuery(movieId);

  const [selectedTimeRange, setSelectedTimeRange] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [createOrUpdateBooking] = useCreateOrUpdateBookingMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQualityGuideOpen, setIsQualityGuideOpen] = useState(false);

  const [allSeatsBooked, setAllSeatsBooked] = useState(false);

  const [visibleReviews, setVisibleReviews] = useState(3);

  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  const {
    data: sessionDetails,
    isLoading: sessionDetailsLoading,
    isError: sessionDetailsError,
    refetch: refetchSessionDetails,
  } = useGetSessionDetailsQuery(
    selectedTimeRange ? selectedTimeRange.sessionId : skipToken
  );

  useEffect(() => {
    if (movieError) {
      toast.error("An error occurred while fetching movie details.");
      console.error("Error fetching movie details:", movieError);
    }
  }, [movieError]);

  useEffect(() => {
    if (sessionDetailsError) {
      toast.error("An error occurred while fetching session details.");
      console.error("Error fetching session details:", sessionDetailsError);
    }
  }, [sessionDetailsError]);

  useEffect(() => {
    if (selectedTimeRange) {
      refetchSessionDetails();
    }
  }, [selectedTimeRange, refetchSessionDetails]);

  useEffect(() => {
    if (sessionDetails && sessionDetails.room && sessionDetails.room.seats) {
      const allBooked = sessionDetails.room.seats.every((seat) =>
        seat.statuses.some(
          (status) =>
            status.timeRangeId === selectedTimeRange.timeRangeId &&
            status.status === "booked"
        )
      );
      setAllSeatsBooked(allBooked);
    }
  }, [sessionDetails, selectedTimeRange]);

  if (sessionDetailsError) {
    console.error("Session details error:", sessionDetailsError);
  }

  const handleTimeRangeSelect = async (session, timeRange) => {
    if (!userInfo) {
      toast.error(
        "Veuillez vous connecter pour afficher les places disponibles."
      );
      return;
    }

    if (!session.room || !session.room.id) {
      console.error("Room information is missing in the session object");
      return;
    }

    setSelectedTimeRange({
      sessionId: session.id,
      roomId: session.room.id,
      cinemaId: session.cinema.id,
      cinemaName: session.cinema.cinemaName,
      movieId: movie.id,
      timeRangeId: timeRange.id,
      timeRangeStartTime: timeRange.timeRangeStartTime,
      timeRangeEndTime: timeRange.timeRangeEndTime,
      roomCapacity: session.room.roomCapacity,
    });

    // Only refetch if selectedTimeRange is set
    if (selectedTimeRange) {
      await refetchSessionDetails();
    }
  };

  const handleSeatSelect = (seat) => {
    setSelectedSeats((prev) => {
      const seatExists = prev.some(
        (selectedSeat) => selectedSeat.id === seat.id
      );
      if (seatExists) {
        return prev.filter((selectedSeat) => selectedSeat.id !== seat.id);
      } else if (prev.length < 9) {
        return [...prev, seat];
      } else {
        alert("Vous ne pouvez pas sélectionner plus de 9 places.");
        return prev;
      }
    });
  };

  const handleBooking = async () => {
    const basePrice = sessionDetails?.sessionPrice || 0;
    const discountedPrice = calculateDiscountedPrice(
      basePrice,
      selectedSeats.length
    );

    const bookingDetails = {
      movie,
      session: {
        ...selectedTimeRange,
        sessionPrice: basePrice,
        roomId: selectedTimeRange.roomId,
      },
      seatsBooked: selectedSeats.map((seat) => ({
        seatId: seat.id,
        seatNumber: seat.seatNumber,
        status: "pending",
        pmrSeat: seat.pmrSeat !== undefined ? seat.pmrSeat : false,
      })),
      timeRange: {
        timeRangeId: selectedTimeRange.timeRangeId,
        timeRangeStartTime: selectedTimeRange.timeRangeStartTime,
        timeRangeEndTime: selectedTimeRange.timeRangeEndTime,
      },
      bookingPrice: discountedPrice,
      bookingStatus: "pending",
    };

    if (!userInfo) {
      localStorage.setItem("selectedBooking", JSON.stringify(bookingDetails));
      navigate(`/movie/${movieId}/auth`);
    } else {
      try {
        const response = await createOrUpdateBooking({
          ...bookingDetails,
          sessionId: parseInt(selectedTimeRange.sessionId),
          userId: parseInt(userInfo.id),
          movieId: parseInt(movie.id),
          roomId: parseInt(selectedTimeRange.roomId),
          cinemaId: parseInt(selectedTimeRange.cinemaId),
        }).unwrap();

        const pendingBookingId = response.booking._id;

        localStorage.setItem(
          "selectedBooking",
          JSON.stringify({ ...bookingDetails, bookingId: pendingBookingId })
        );
        navigate(`/cart`, {
          state: { ...bookingDetails, bookingId: pendingBookingId },
        });
      } catch (error) {
        console.error("Error creating booking:", error);
        toast.error("Failed to create booking.");
      }
    }
  };

  const calculateDiscountedPrice = (basePrice, numberOfSeats) => {
    const discount = numberOfSeats >= 5 ? 0.1 : 0;
    const totalPrice = basePrice * numberOfSeats;
    return totalPrice - totalPrice * discount;
  };

  const renderSeat = (seat) => {
    const isBooked = seat.status === "booked";
    const isPmr = seat.pmrSeat;

    let seatColor = "border-2 bg-transaprent border-gray-500";
    if (isBooked) {
      seatColor = "bg-gray-300 opacity-50";
    } else if (
      selectedSeats.some((selectedSeat) => selectedSeat.id === seat.id)
    ) {
      seatColor = "bg-yellow-600 text-white";
    } else if (isPmr) {
      seatColor = "bg-blue-600 text-white";
    }

    return (
      <div
        key={seat.id}
        className={`h-7 w-7 text-xs rounded-tl-lg rounded-tr-lg mx-0.5 cursor-pointer flex flex-col items-center justify-center ${seatColor}`}
        onClick={!isBooked ? () => handleSeatSelect(seat) : null}
      >
        <span>{seat.seatNumber}</span>
        {isPmr && <MdWheelchairPickup size={14} />}
      </div>
    );
  };

  const renderSeats = (seats, roomCapacity) => {
    const seatsPerRow = 10;
    const totalRows = Math.ceil(seats.length / seatsPerRow);

    const seatGrid = Array.from({ length: totalRows }, () =>
      Array(seatsPerRow).fill(null)
    );

    seats.forEach((seat) => {
      const seatNumber = parseInt(seat.seatNumber, 10) - 1;
      const row = Math.floor(seatNumber / seatsPerRow);
      const col = seatNumber % seatsPerRow;

      // Ensure seat statuses are defined
      const seatStatuses = seat.statuses || [];

      // Check seat status for the selected time range
      const seatStatus = seatStatuses.find(
        (status) => status.timeRangeId === selectedTimeRange.timeRangeId
      );

      const updatedSeat = {
        ...seat,
        status: seatStatus ? seatStatus.status : "available",
      };

      seatGrid[row][col] = updatedSeat;
    });

    return (
      <div className="flex flex-col items-start">
        {seatGrid.map((row, rowIndex) => {
          const actualSeatsInRow = row.filter((seat) => seat !== null).length;
          const leftPadding = Math.floor((seatsPerRow - actualSeatsInRow) / 2);
          const rightPadding = seatsPerRow - actualSeatsInRow - leftPadding;

          return (
            <div key={rowIndex} className="flex justify-center my-1">
              {Array.from({ length: leftPadding }).map((_, index) => (
                <div key={`left-${index}`} className="h-7 w-7 mx-0.5"></div>
              ))}
              {row.map((seat, colIndex) => (
                <div key={colIndex} className="mx-0.5">
                  {seat ? (
                    renderSeat(seat)
                  ) : (
                    <div className="h-7 w-7 mx-0.5"></div>
                  )}
                </div>
              ))}
              {Array.from({ length: rightPadding }).map((_, index) => (
                <div key={`right-${index}`} className="h-7 w-7 mx-0.5"></div>
              ))}
            </div>
          );
        })}
        <div className="w-full mt-4">
          <svg
            viewBox="0 0 800 80"
            preserveAspectRatio="xMidYMid meet"
            className="block w-96 h-auto"
          >
            <path
              d="M0 30 Q400 70 800 30"
              stroke="black"
              strokeWidth="3"
              fill="none"
            />
            <text x="400" y="25" textAnchor="middle" fontSize="30" fill="black">
              Écran
            </text>
          </svg>
        </div>
        <div className="mt-4 w-96">
          <ul className="flex text-sm justify-center">
            <li className="flex items-center mx-2">
              <div className="h-3 w-3 border-2 bg-transaprent border-gray-500 rounded-tl-lg rounded-tr-lg"></div>
              <span className="ml-1">Disponible</span>
            </li>
            <li className="flex items-center mx-2">
              <div className="h-3 w-3 bg-gray-300 opacity-50 rounded-tl-lg rounded-tr-lg"></div>
              <span className="ml-1">Occupé</span>
            </li>
            <li className="flex items-center mx-2">
              <div className="h-3 w-3 bg-blue-600 border-blue-600 border-2 rounded-tl-lg rounded-tr-lg"></div>
              <span className="ml-1">PMR</span>
            </li>
          </ul>
          <p className="text-sm mt-3 ml-2 text-center">
            <span className="text-base">{selectedSeats.length}</span> sièges
            sélectionnés.
          </p>
        </div>
      </div>
    );
  };

  const formatDateInFrench = (dateString) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("fr-FR", { weekday: "long" });
    const restOfDate = date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return { day, restOfDate };
  };

  const formatTimeInUTC = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  if (movieLoading || sessionDetailsLoading) return <LoaderFull />;
  if (movieError || sessionDetailsError)
    return <div>Error loading movie or session details</div>;

  const availableCinemas = movie?.sessions
    .map((session) => session.cinema)
    .filter(
      (cinema, index, self) =>
        index === self.findIndex((c) => c.id === cinema.id)
    );

  const getUpcomingSessions = (cinemaId) => {
    const availableSessions = movie?.sessions.filter(
      (session) => session.cinema.id === parseInt(cinemaId)
    );

    const currentDateTime = new Date().toISOString();

    return availableSessions
      ?.map((session) => {
        return {
          ...session,
          timeRanges: session.timeRanges
            .map((timeRange) => {
              return {
                ...timeRange,
                allSeatsBooked: timeRange.fullyBooked || false,
              };
            })
            .filter(
              (timeRange) => timeRange.timeRangeEndTime > currentDateTime
            ),
        };
      })
      .filter((session) => session.timeRanges.length > 0);
  };

  const getUniqueQualities = (sessions) => {
    const qualities = sessions.reduce((acc, session) => {
      if (session.room && session.room.roomQuality) {
        acc.add(session.room.roomQuality);
      }
      return acc;
    }, new Set());
    return Array.from(qualities);
  };

  if (movieLoading || sessionDetailsLoading) return <LoaderFull />;
  if (movieError || sessionDetailsError)
    return (
      <div>Erreur lors du chargement des détails du film ou de la session</div>
    );

  const getQualityDescription = (quality) => {
    switch (quality) {
      case "Standard":
        return "Projection classique offrant une expérience cinématographique traditionnelle.";
      case "4DX":
        return "Expérience immersive avec sièges mobiles et effets sensoriels synchronisés au film.";
      case "Dolby Cinema":
        return `Qualité d'image HDR et son Dolby Atmos pour une expérience audiovisuelle optimale.`;
      case "IMAX":
        return "Grand écran et technologie de projection avancée pour une expérience plus immersive.";
      case "RealD 3D":
        return "Technologie 3D offrant une profondeur et un réalisme accrus aux images.";
      case "ScreenX":
        return "Projection sur trois murs pour une expérience panoramique à 270 degrés.";
      default:
        return "Description non disponible.";
    }
  };

  return (
    <>
      <div className="w-4/5 mx-auto py-12">
        <div className="relative max-w-4xl flex flex-col lg:flex-row">
          <div className="p-8 w-full lg:w-1/2 flex flex-col">
            <div className="relative">
              <img
                src={movie.movieImg}
                alt={movie.movieTitle}
                className="w-full object-cover rounded-lg"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute inset-0 flex items-center justify-center text-white text-6xl"
              >
                <PlayIcon className="w-20 h-20 bg-black bg-opacity-50 rounded-full p-2" />
              </button>
            </div>
          </div>

          <div className="w-fit flex flex-col py-8">
            {movie.movieFavorite && (
              <span className="w-fit py-1.5 px-2 mb-4 inline-flex items-center font-semibold text-white rounded-md text-sm bg-red-700">
                Coup de coeur
              </span>
            )}
            <div className="mb-4">
              <h1 className="text-4xl font-bold mb-4">{movie.movieTitle}</h1>
              <p className="text-gray-400">Note :</p>
              {averageRating ? (
                <span className="text-gray-700 flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                  {averageRating.toFixed(1)} ({reviews.length} avis)
                </span>
              ) : (
                <span className="text-gray-700">Pas encore d'avis</span>
              )}
              <div className="flex gap-x-2 mt-4">
                {getUniqueQualities(movie.sessions).map((quality) => (
                  <div key={quality} className="flex items-center">
                    <img
                      src={qualityIcons[quality]}
                      alt={quality}
                      className="h-7 mr-1 mb-2"
                    />
                  </div>
                ))}
              </div>
              <span>
                <button
                  onClick={() => setIsQualityGuideOpen(true)}
                  className="text-blue-500 underline"
                >
                  Guide des qualités
                </button>
              </span>
              <p className="text-gray-400 mt-4">Synopsis :</p>
              <p className="text-gray-700 mb-4=2">{movie.movieDescription}</p>
            </div>

            <div className="flex flex-col">
              <p className="text-gray-400">Date de première diffusion : </p>
              <span className="text-gray-700">
                {formatDateInFrench(movie.movieReleaseDate).restOfDate}
              </span>
              <p className="text-gray-400 mt-2">Genres : </p>
              {movie.categories
                .map((category) => category.categoryName)
                .join(", ")}
              <p className="text-gray-400 mt-2">Durée :</p>
              {movie.movieLength} minutes
            </div>
          </div>
        </div>

        <div className="px-8 pb-12 w-full">
          <div className="bg-white rounded-md mb-8 p-6 shadow-sm">
            <p className="text-gray-600 text-center">
              Bénéficiez de -10% de réduction si vous réservez 5 places ou plus
              !
            </p>
          </div>
          {availableCinemas.map((cinema) => {
            const upcomingSessions = getUpcomingSessions(cinema.id);
            return (
              <div key={cinema.id} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{cinema.cinemaName}</h2>
                {upcomingSessions && upcomingSessions.length > 0 ? (
                  <div className="flex flex-row space-x-2 mb-8">
                    {upcomingSessions.map((session) =>
                      session.timeRanges.map((timeRange, index) => (
                        <div
                          key={index}
                          onClick={
                            userInfo && !timeRange.allSeatsBooked
                              ? () => handleTimeRangeSelect(session, timeRange)
                              : null
                          }
                          className={`p-4 text-center text-sm cursor-pointer ${
                            selectedTimeRange?.timeRangeStartTime ===
                            timeRange.timeRangeStartTime
                              ? "border-green-700 border-2 rounded-md ring-1 ring-inset ring-green-600/20"
                              : "border rounded-md border-gray-300 hover:bg-gray-100 hover:border-gray-400"
                          } ${
                            !userInfo || timeRange.allSeatsBooked
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                        >
                          <p className="text-sm">
                            {
                              formatDateInFrench(timeRange.timeRangeStartTime)
                                .day
                            }{" "}
                            <br />
                            {
                              formatDateInFrench(timeRange.timeRangeStartTime)
                                .restOfDate
                            }
                          </p>
                          <p className="mt-2">
                            {formatTimeInUTC(timeRange.timeRangeStartTime)}{" "}
                            {" - "}
                            {formatTimeInUTC(timeRange.timeRangeEndTime)}
                          </p>
                          <div className="mt-2 flex justify-center items-center">
                            <img
                              src={qualityIcons[session.room.roomQuality]}
                              alt={session.room.roomQuality}
                              className="h-6 mr-1"
                            />
                          </div>
                          <p className="mt-4 w-fit text-sm mx-auto py-1 px-3 rounded-sm bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                            {session.sessionPrice} €
                          </p>
                          {timeRange.allSeatsBooked && (
                            <p className="mt-2 text-red-600 font-semibold">
                              Complet
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Aucune séance à venir disponible.
                  </p>
                )}
              </div>
            );
          })}
          {selectedTimeRange && sessionDetails && sessionDetails.room && (
            <div className="mt-8 lg:flex lg:space-x-8">
              <div className="lg:w-1/2">
                {allSeatsBooked ? (
                  <div className="font-semibold mb-4">
                    Toutes les places sont réservées pour cette séance.
                  </div>
                ) : (
                  renderSeats(
                    sessionDetails.room.seats,
                    sessionDetails.room.roomCapacity
                  )
                )}
              </div>

              {userInfo && (
                <div className="mt-8 lg:mt-0 lg:w-1/3">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">
                      Résumé de la réservation
                    </h3>
                    <p className="mb-2">
                      Prix par siège: {sessionDetails.sessionPrice.toFixed(2)} €
                    </p>
                    <p className="mb-2">
                      Sièges sélectionnés: {selectedSeats.length}
                    </p>
                    {selectedSeats.length >= 5 && (
                      <p className="text-green-600 font-bold mb-2">
                        Réduction de 10% appliquée !
                      </p>
                    )}
                    <p className="mb-4 text-lg font-semibold">
                      Prix total:{" "}
                      {calculateDiscountedPrice(
                        sessionDetails.sessionPrice || 0,
                        selectedSeats.length
                      ).toFixed(2)}{" "}
                      €
                    </p>
                    <button
                      onClick={handleBooking}
                      className={`w-full ${
                        selectedTimeRange &&
                        selectedSeats.length > 0 &&
                        !allSeatsBooked
                          ? "bg-green-700 text-white"
                          : "bg-gray-300"
                      } block rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm`}
                      disabled={
                        !selectedTimeRange ||
                        selectedSeats.length === 0 ||
                        allSeatsBooked
                      }
                    >
                      {allSeatsBooked ? "Séance complète" : "Réserver"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!userInfo && (
            <Link to={`/login?redirect=${location.pathname}${location.search}`}>
              <p className="py-2.5 px-3 underline inline-flex items-center rounded-md text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                Connectez-vous ou créez un compte pour réserver vos places.
              </p>
            </Link>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Avis des spectateurs</h2>
          {reviewsLoading ? (
            <p>Chargement des avis...</p>
          ) : reviewsError ? (
            <p>Erreur lors du chargement des avis.</p>
          ) : reviews && reviews.length > 0 ? (
            <>
              <div className="space-y-6">
                {reviews.slice(0, visibleReviews).map((review, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-semibold">
                          {review.userFirstName} {review.userLastName.charAt(0)}
                          .
                        </span>
                        <span className="ml-2 text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                          Avis certifié
                        </span>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
              {reviews.length > visibleReviews && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setVisibleReviews((prev) => prev + 3)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Voir plus d'avis
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500">Aucun avis pour le moment.</p>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Movie Trailer"
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75"
        >
          ;
          <div className="relative bg-white p-4 rounded-lg max-w-3xl w-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-14 -right-10 text-gray-50 text-4xl hover:text-gray-400"
            >
              &times;
            </button>
            <video
              src={movie.movieTrailerUrl}
              controls
              className="w-full h-auto"
            />
          </div>
        </Modal>
        <QualityGuideModal
          isOpen={isQualityGuideOpen}
          onClose={() => setIsQualityGuideOpen(false)}
          qualities={getUniqueQualities(movie.sessions)}
          getQualityDescription={getQualityDescription}
        />
      </div>
    </>
  );
};

export default MoviePage;
