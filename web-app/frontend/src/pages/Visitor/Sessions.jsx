import React, { useEffect, useState } from "react";
import { useGetCinemasQuery } from "../../redux/api/cinemaApiSlice";
import { useGetMoviesQuery } from "../../redux/api/movieApiSlice";
import { useGetSessionsQuery } from "../../redux/api/sessionApiSlice";
import { useCreateOrUpdateBookingMutation } from "../../redux/api/bookingApiSlice";
import { useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LoaderFull from "../../components/LoaderFull";
import { MdWheelchairPickup } from "react-icons/md";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";

const Sessions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [desiredSeats, setDesiredSeats] = useState("");
  const [createOrUpdateBooking] = useCreateOrUpdateBookingMutation();

  const {
    data: cinemas,
    isLoading: cinemasLoading,
    isError: cinemasError,
  } = useGetCinemasQuery();

  const {
    data: moviesData,
    isLoading: moviesLoading,
    isError: moviesError,
  } = useGetMoviesQuery();

  const movies = moviesData?.movies || [];

  const {
    data: sessionsResponse,
    isLoading: sessionsLoading,
    isError: sessionsError,
  } = useGetSessionsQuery(
    selectedCinema && selectedMovie
      ? {
          cinemaId: parseInt(selectedCinema),
          movieId: parseInt(selectedMovie),
        }
      : skipToken
  );

  const shouldShowDiscount = (desiredSeats, selectedSeats) => {
    return desiredSeats >= 5 || selectedSeats.length >= 5;
  };

  useEffect(() => {
    if (cinemas && cinemas.length > 0 && !selectedCinema) {
      setSelectedCinema(""); // Ensure no cinema is selected initially
    }
  }, [cinemas]);

  const handleCinemaChange = (e) => {
    setSelectedCinema(e.target.value || "");
    setSelectedMovie("");
    setSelectedSession("");
    setSelectedTimeRange(null);
    setSelectedSeats([]);
  };

  const handleMovieChange = (e) => {
    setSelectedMovie(e.target.value || "");
    setSelectedSession("");
    setSelectedTimeRange(null); // Reset time range selection
    setSelectedSeats([]); // Reset seat selection
  };

  const handleSessionChange = (e) => {
    setSelectedSession(e.target.value || "");
    setSelectedTimeRange(null); // Reset time range selection
    setSelectedSeats([]); // Reset seat selection
  };

  const handleDesiredSeatsChange = (e) => {
    setDesiredSeats(e.target.value || "");
    setSelectedTimeRange(null); // Reset time range selection
    setSelectedSeats([]); // Reset seat selection
  };

  const handleTimeRangeSelect = (session, timeRange) => {
    if (!userInfo) {
      toast.error("Please log in to select a time range and book seats.");
      return;
    }

    setSelectedTimeRange({
      sessionId: session.id,
      roomId: session.room.id,
      cinemaId: session.cinema.id,
      cinemaName: session.cinema.cinemaName,
      movieId: session.movie.id,
      timeRangeId: timeRange.id,
      timeRangeStartTime: timeRange.timeRangeStartTime,
      timeRangeEndTime: timeRange.timeRangeEndTime,
      roomCapacity: session.room.roomCapacity,
      sessionPrice: session.sessionPrice || 0,
    });
    setSelectedSeats([]);
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
        toast.error("You can select up to 9 seats only.");
        return prev;
      }
    });
  };

  const handleBooking = async () => {
    if (!selectedTimeRange) {
      toast.error("Please select a time range.");
      return;
    }

    const applyDiscount = selectedSeats.length >= 5;
    const discountMultiplier = applyDiscount ? 0.9 : 1; // 10% discount if applicable

    const bookingDetails = {
      session: {
        ...selectedTimeRange,
        sessionPrice: selectedTimeRange.sessionPrice,
      },
      seatsBooked: selectedSeats.map((seat) => ({
        seatId: seat.id,
        seatNumber: seat.seatNumber,
        status: "pending",
        pmrSeat: seat.pmrSeat !== undefined ? seat.pmrSeat : false,
      })),
      bookingPrice:
        selectedTimeRange.sessionPrice *
        selectedSeats.length *
        discountMultiplier,
      bookingStatus: "pending",
      timeRange: {
        timeRangeId: selectedTimeRange.timeRangeId,
        timeRangeStartTime: selectedTimeRange.timeRangeStartTime,
        timeRangeEndTime: selectedTimeRange.timeRangeEndTime,
      },
    };

    if (!userInfo) {
      localStorage.setItem("selectedBooking", JSON.stringify(bookingDetails));
      navigate(`/auth`);
    } else {
      try {
        const response = await createOrUpdateBooking({
          ...bookingDetails,
          sessionId: parseInt(selectedTimeRange.sessionId),
          userId: parseInt(userInfo.id),
          movieId: parseInt(selectedTimeRange.movieId),
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

  const renderSeat = (seat) => {
    const isBooked = seat.status === "booked";
    const isPmr = seat.pmrSeat;

    let seatColor = "border-2 bg-transparent border-gray-500";
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

  const renderSeats = (seats) => {
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
        status: seatStatus ? seatStatus.status : seat.status,
        pmrSeat: seat.pmrSeat,
      };

      seatGrid[row][col] = updatedSeat;
    });

    return (
      <div className="flex flex-col items-center">
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
        <div className="w-full mt-4 flex justify-center ">
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
              <div className="h-3 w-3 border-2 bg-transparent border-gray-500 rounded-tl-lg rounded-tr-lg"></div>
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

  if (
    cinemasLoading ||
    moviesLoading ||
    (sessionsLoading && selectedCinema && selectedMovie)
  )
    return <LoaderFull />;
  if (
    cinemasError ||
    moviesError ||
    (sessionsError && selectedCinema && selectedMovie)
  )
    return <div>Error loading data</div>;

  const sessionsForSelectedCinemaAndMovie = sessionsResponse
    ? sessionsResponse.filter(
        (session) =>
          session.cinema.id === parseInt(selectedCinema) &&
          session.movie.id === parseInt(selectedMovie)
      )
    : [];

  const filteredSessions = sessionsForSelectedCinemaAndMovie.filter(
    (session) => {
      const availableTimeRanges = session.timeRanges.filter((timeRange) => {
        const availableSeatsCount = session.room.seats.filter(
          (seat) =>
            !seat.statuses.some(
              (status) =>
                status.timeRangeId === timeRange.id &&
                status.status === "booked"
            )
        ).length;
        return availableSeatsCount >= desiredSeats;
      });
      return availableTimeRanges.length > 0;
    }
  );

  return (
    <div className="bg-gray-50 flex flex-col lg:flex-row">
      {/* Main Content */}
      <main className="flex-1 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="pb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Réserver une séance
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base text-gray-500">
              Sélectionnez un cinéma et un film pour voir les séances
              disponibles. Bénéficiez de -10% de réduction pour 5 places ou plus
              !
            </p>
          </div>

          {/* Dropdowns */}
          <div className="flex flex-col mb-8 lg:flex-row justify-center space-y-4 lg:space-y-0 lg:space-x-4">
            <select
              value={selectedCinema}
              onChange={handleCinemaChange}
              className="pl-4 pr-8 py-2 text-center bg-white border border-gray-300 rounded shadow-sm"
            >
              <option value="" disabled>
                Sélectionnez un cinéma
              </option>
              {cinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.cinemaName}
                </option>
              ))}
            </select>

            <select
              value={selectedMovie}
              onChange={handleMovieChange}
              className="pl-4 pr-8 py-2 text-center bg-white border border-gray-300 rounded shadow-sm"
              disabled={!selectedCinema}
            >
              <option value="" disabled>
                Sélectionnez un film
              </option>
              {movies.length > 0 ? (
                movies
                  .filter(
                    (movie, index, self) =>
                      index === self.findIndex((m) => m.id === movie.id)
                  )
                  .map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.movieTitle}
                    </option>
                  ))
              ) : (
                <option disabled>Aucun film disponible</option>
              )}
            </select>

            <select
              value={selectedSession}
              onChange={handleSessionChange}
              className="pl-4 pr-8 py-2 text-center bg-white border border-gray-300 rounded shadow-sm"
            >
              <option value="">Toutes les dates</option>
              {filteredSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {formatDateInFrench(session.sessionDate).day},{" "}
                  {formatDateInFrench(session.sessionDate).restOfDate}
                </option>
              ))}
            </select>

            <select
              value={desiredSeats}
              onChange={handleDesiredSeatsChange}
              className="pl-4 pr-8 py-2 text-center bg-white border border-gray-300 rounded shadow-sm"
            >
              <option value="" disabled>
                Nombre de places souhaitées
              </option>
              {[...Array(9).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          {selectedCinema && selectedMovie && filteredSessions.length === 0 && (
            <div className="text-center mt-8">
              <h3 className="text-lg text-gray-900">
                Aucune séance disponible pour ce film dans ce cinéma.
              </h3>
            </div>
          )}

          {selectedCinema && selectedMovie && filteredSessions.length > 0 && (
            <div className="text-center mt-4">
              <h3 className="text-lg font-bold text-gray-900">
                Qualités disponibles pour ce film :
              </h3>
              <p className="text-gray-500">
                {sessionsResponse &&
                  Array.from(
                    new Set(
                      sessionsResponse
                        .filter(
                          (session) =>
                            session.cinema.id === parseInt(selectedCinema) &&
                            session.movie.id === parseInt(selectedMovie)
                        )
                        .map((session) => session.room.roomQuality)
                    )
                  ).join(", ")}
              </p>
            </div>
          )}

          <section aria-labelledby="sessions-heading" className="mt-8">
            <h2 id="sessions-heading" className="sr-only">
              Sessions
            </h2>
            {filteredSessions.length > 0 &&
              filteredSessions
                .filter(
                  (session) =>
                    !selectedSession || session.id === parseInt(selectedSession)
                )
                .map((session) => (
                  <div
                    key={session.id}
                    className="group grid grid-cols-1 md:grid-cols-4 gap-6 border p-8 mb-4 bg-white rounded-lg shadow-sm"
                  >
                    <div className="col-span-1">
                      <img
                        src={session.movie.movieImg}
                        alt={session.movie.movieTitle}
                        className="w-full object-cover"
                      />
                    </div>
                    <div className="col-span-3">
                      <div className="mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {session.movie.movieTitle}
                        </h3>
                        <p className="text-gray-500 mb-2">
                          {session.movie.movieDescription}
                        </p>
                        <p className="text-gray-500 mb-2">
                          Prix de la séance : {session.sessionPrice} €
                          {shouldShowDiscount(desiredSeats, selectedSeats) && (
                            <span className="ml-2 text-green-600 font-bold">
                              -10%
                            </span>
                          )}
                        </p>
                        <p className="text-gray-500 mb-2">
                          Salle n° {session.room.roomNumber}
                        </p>
                        <p className="text-gray-500 mb-2">
                          Qualité : {session.room.roomQuality}
                        </p>
                        <p className="text-gray-500 mb-2">
                          Durée : {session.movie.movieLength} min
                        </p>
                        <div className="flex flex-wrap justify-center mt-4">
                          {userInfo ? (
                            <>
                              {session.timeRanges
                                .filter((timeRange) => {
                                  const availableSeatsCount =
                                    session.room.seats.filter(
                                      (seat) =>
                                        !seat.statuses.some(
                                          (status) =>
                                            status.timeRangeId ===
                                              timeRange.id &&
                                            status.status === "booked"
                                        )
                                    ).length;
                                  return availableSeatsCount >= desiredSeats;
                                })
                                .map((timeRange, index) => {
                                  const availableSeatsCount =
                                    session.room.seats.filter(
                                      (seat) =>
                                        !seat.statuses.some(
                                          (status) =>
                                            status.timeRangeId ===
                                              timeRange.id &&
                                            status.status === "booked"
                                        )
                                    ).length;
                                  const allSeatsBooked =
                                    availableSeatsCount === 0;

                                  if (allSeatsBooked) {
                                    return (
                                      <div
                                        key={index}
                                        className="p-2 text-center text-sm m-1"
                                      >
                                        <p className="text-red-600 font-semibold">
                                          Complet
                                        </p>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div
                                      key={index}
                                      onClick={() =>
                                        handleTimeRangeSelect(
                                          session,
                                          timeRange
                                        )
                                      }
                                      className={`p-2 text-center text-sm cursor-pointer m-1 ${
                                        selectedTimeRange?.timeRangeStartTime ===
                                        timeRange.timeRangeStartTime
                                          ? "border-green-700 rounded-md border-2"
                                          : "border rounded-md border-gray-300 hover:bg-gray-100 hover:border-gray-400"
                                      }`}
                                    >
                                      <p className="text-sm">
                                        {
                                          formatDateInFrench(
                                            timeRange.timeRangeStartTime
                                          ).day
                                        }{" "}
                                        <br />
                                        {
                                          formatDateInFrench(
                                            timeRange.timeRangeStartTime
                                          ).restOfDate
                                        }
                                      </p>
                                      <p className="mt-2">
                                        {formatTimeInUTC(
                                          timeRange.timeRangeStartTime
                                        )}{" "}
                                        {" - "}
                                        {formatTimeInUTC(
                                          timeRange.timeRangeEndTime
                                        )}
                                      </p>
                                      <p className="mt-2 text-sm text-gray-500">
                                        {availableSeatsCount} places disponibles
                                      </p>
                                    </div>
                                  );
                                })}
                              {selectedTimeRange &&
                                selectedTimeRange.sessionId === session.id && (
                                  <div className="w-full mt-8">
                                    {session.room.seats.every((seat) =>
                                      seat.statuses.some(
                                        (status) =>
                                          status.timeRangeId ===
                                            selectedTimeRange.timeRangeId &&
                                          status.status === "booked"
                                      )
                                    ) ? (
                                      <div className="text-red-600 font-semibold text-center mb-4">
                                        Toutes les places sont réservées pour
                                        cette séance.
                                      </div>
                                    ) : (
                                      renderSeats(session.room.seats)
                                    )}
                                  </div>
                                )}
                              {selectedTimeRange &&
                                selectedTimeRange.sessionId === session.id && (
                                  <button
                                    onClick={handleBooking}
                                    className={`mt-4 ${
                                      selectedSeats.length > 0
                                        ? "bg-green-700 text-white"
                                        : "bg-gray-300"
                                    } block mx-auto rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm`}
                                    disabled={selectedSeats.length === 0}
                                  >
                                    Réserver
                                  </button>
                                )}
                            </>
                          ) : (
                            <div className="text-center">
                              <p className="text-gray-500 mb-6">
                                Veuillez vous connecter pour sélectionner vos
                                places et réserver.
                              </p>
                              <Link
                                to={`/login?redirect=${encodeURIComponent(
                                  location.pathname
                                )}`}
                                className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded"
                              >
                                Se connecter
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Sessions;
