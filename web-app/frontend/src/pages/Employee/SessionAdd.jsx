import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import {
  useCreateSessionMutation,
  useGetBookedTimeRangesQuery,
  useGetAvailableTimeRangesQuery,
} from "../../redux/api/sessionApiSlice";
import { useGetCinemasQuery } from "../../redux/api/cinemaApiSlice";
import { useGetRoomsQuery } from "../../redux/api/roomApiSlice";
import { useGetMoviesQuery } from "../../redux/api/movieApiSlice";

const SessionAdd = () => {
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [sessionPrice, setSessionPrice] = useState("");
  const [selectedRanges, setSelectedRanges] = useState([]);

  const { data: cinemas, isLoading: cinemasLoading } = useGetCinemasQuery();
  const { data: rooms, isLoading: roomsLoading } = useGetRoomsQuery();
  const {
    data: moviesData,
    isLoading: moviesLoading,
    error: moviesError,
  } = useGetMoviesQuery({});

  const movies = moviesData?.movies || [];

  const { data: bookedTimeRanges } = useGetBookedTimeRangesQuery(
    {
      cinemaId: selectedCinemaId,
      roomId: selectedRoomId,
      date: selectedDate,
    },
    {
      skip: !selectedCinemaId || !selectedRoomId || !selectedDate,
    }
  );

  const { data: availableTimeRangesResponse } = useGetAvailableTimeRangesQuery(
    {
      cinemaId: selectedCinemaId,
      roomId: selectedRoomId,
      date: selectedDate,
      movieId: selectedMovieId,
    },
    {
      skip:
        !selectedCinemaId ||
        !selectedRoomId ||
        !selectedDate ||
        !selectedMovieId,
    }
  );

  const availableTimeRanges =
    availableTimeRangesResponse?.availableTimeRanges || [];

  const [createSession, { isLoading: isCreating }] = useCreateSessionMutation();

  useEffect(() => {
    setSelectedRoomId(null);
  }, [selectedCinemaId, selectedMovieId]);

  useEffect(() => {
    if (moviesError) {
      console.error("Error fetching movies:", moviesError);
    }
  }, [moviesData, moviesError]);

  useEffect(() => {
    if (selectedMovieId) {
      const selectedMovie = movies.find(
        (movie) => movie.id === parseInt(selectedMovieId, 10)
      );
      if (selectedMovie) {
        let dateToSet;
        if (selectedMovie.moviePremiereDate) {
          dateToSet = new Date(selectedMovie.moviePremiereDate);
        } else if (selectedMovie.movieScheduleDate) {
          dateToSet = new Date(selectedMovie.movieScheduleDate);
        }

        if (dateToSet && dateToSet >= new Date()) {
          setSelectedDate(dateToSet.toISOString().split("T")[0]);
        } else {
          setSelectedDate(new Date().toISOString().split("T")[0]);
        }
      }
    }
  }, [selectedMovieId, movies]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isCreating) return;

    // Check if selected date is earlier than scheduled or premiere date
    const selectedMovie = movies.find(
      (movie) => movie.id === parseInt(selectedMovieId, 10)
    );

    if (selectedMovie) {
      let comparisonDate;
      if (selectedMovie.moviePremiereDate) {
        comparisonDate = new Date(selectedMovie.moviePremiereDate);
      } else if (selectedMovie.movieScheduleDate) {
        comparisonDate = new Date(selectedMovie.movieScheduleDate);
      }

      if (comparisonDate) {
        const selectedDateValue = new Date(selectedDate);
        if (selectedDateValue < comparisonDate) {
          toast.error(
            "La date de la séance doit être postérieure à la date de l'avant-première ou de la programmation du film."
          );
          return;
        }
      }
    }

    try {
      const timeRanges = selectedRanges.map((range) => ({
        timeRangeStartTime: range.timeRangeStartTime,
        timeRangeEndTime: range.timeRangeEndTime,
        timeRangeStatus: "available",
      }));

      const payload = {
        movieId: parseInt(selectedMovieId, 10),
        cinemaId: parseInt(selectedCinemaId, 10),
        roomId: parseInt(selectedRoomId, 10),
        sessionDate: selectedDate,
        sessionPrice: parseFloat(sessionPrice),
        timeRanges: timeRanges,
      };

      await createSession(payload).unwrap();
      toast.success("La séance a été ajoutée avec succès !");
      resetForm();
    } catch (error) {
      if (error.data?.message?.includes("already exists")) {
        toast.error(
          <div>
            {error.data.message}{" "}
            <Link to={error.data.updateLink} className="text-blue-500">
              Update here
            </Link>
          </div>
        );
      } else {
        toast.error("An error occurred while adding the session.");
      }
      console.error("Error adding session:", error);
    }
  };

  const resetForm = () => {
    setSelectedMovieId("");
    setSelectedCinemaId("");
    setSelectedRoomId(null);
    setSessionPrice("");
    setSelectedRanges([]);
  };

  const handleTimeRangeSelection = (range) => {
    setSelectedRanges((prev) => {
      const existingIndex = prev.findIndex(
        (r) =>
          r.timeRangeStartTime === range.timeRangeStartTime &&
          r.timeRangeEndTime === range.timeRangeEndTime
      );
      if (existingIndex === -1) {
        return [...prev, range];
      } else {
        return prev.filter(
          (r) =>
            r.timeRangeStartTime !== range.timeRangeStartTime ||
            r.timeRangeEndTime !== range.timeRangeEndTime
        );
      }
    });
  };

  if (cinemasLoading || roomsLoading || moviesLoading) return <LoaderFull />;

  const filteredRooms = rooms.filter(
    (room) => room.cinema.id === Number(selectedCinemaId)
  );

  const activeMovies = movies.filter(
    (movie) => movie.moviePublishingState === "active"
  );

  const premiereMovies = movies.filter(
    (movie) => movie.moviePublishingState === "premiere"
  );

  return (
    <>
      <div className="py-10">
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <header className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  Ajouter une séance
                </h1>
                <div className="sm:flex sm:items-center">
                  <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link
                      to="/session-list"
                      className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                    >
                      Retour
                    </Link>
                  </div>
                </div>
              </div>
            </header>

            <form
              onSubmit={handleSubmit}
              className="mx-auto max-w-7xl sm:px-6 lg:px-8"
            >
              <div className="space-y-8 divide-y divide-gray-200">
                <div className="mt-12 bg-white rounded-md py-12 px-8 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="movie_id"
                      className="block text-sm font-medium"
                    >
                      Film
                    </label>
                    <select
                      value={selectedMovieId}
                      onChange={(e) => setSelectedMovieId(e.target.value)}
                      className="block mt-1 w-full text-black rounded-md border-gray-300 shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                    >
                      <option value="">Sélectionnez le film</option>
                      {movies
                        .filter((movie) =>
                          ["active", "premiere"].includes(
                            movie.moviePublishingState
                          )
                        )
                        .map((movie) => (
                          <option key={movie.id} value={movie.id}>
                            {movie.movieTitle}
                          </option>
                        ))}
                    </select>
                  </div>

                  {selectedMovieId && (
                    <div className="sm:col-span-1 mt-4">
                      <label className="block text-sm font-medium mb-2">
                        État de publication
                      </label>
                      {(() => {
                        const selectedMovie = movies.find(
                          (movie) => movie.id === parseInt(selectedMovieId, 10)
                        );
                        if (selectedMovie) {
                          return selectedMovie.moviePublishingState ===
                            "active" ? (
                            <span className="whitespace-nowrap text-sm py-1.5 px-2 rounded-md bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                              Actif
                            </span>
                          ) : (
                            <span className="whitespace-nowrap text-sm py-1.5 px-2 rounded-md bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                              En avant-première
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="cinema_id"
                      className="block text-sm font-medium"
                    >
                      Cinéma
                    </label>
                    <select
                      id="cinema_id"
                      name="cinema_id"
                      required
                      value={selectedCinemaId}
                      onChange={(e) => setSelectedCinemaId(e.target.value)}
                      className="mt-1 text-black block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
                    >
                      <option value="">Sélectionnez le cinéma</option>
                      {cinemas.map((cinema) => (
                        <option key={cinema.id} value={cinema.id}>
                          {cinema.cinemaName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="session_date"
                      className="block text-sm font-medium"
                    >
                      Date de la séance
                    </label>
                    <input
                      type="date"
                      id="session_date"
                      name="session_date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-1 focus:ring-yellow-500 focus:border-yellow-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="room_id"
                      className="block text-sm font-medium"
                    >
                      Salle
                    </label>
                    {selectedCinemaId && selectedMovieId ? (
                      filteredRooms.length > 0 ? (
                        filteredRooms.map((room) => (
                          <div key={room.id} className="mt-2 flex items-center">
                            <input
                              type="radio"
                              id={`room-${room.id}`}
                              name="room"
                              value={room.id}
                              checked={selectedRoomId === room.id}
                              onChange={() => setSelectedRoomId(room.id)}
                              className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`room-${room.id}`}
                              className="ml-3 block text-sm font-medium"
                            >
                              Salle n°{room.roomNumber} |{" "}
                              {room.cinema.cinemaName} | {room.roomQuality} (
                              {room.roomCapacity} places)
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="mt-2 text-sm text-gray-400">
                          Aucune salle n'est disponible pour ce cinéma.{" "}
                          <Link
                            to="/room-list"
                            className="text-blue-500 underline"
                          >
                            Ajouter une salle
                          </Link>
                        </p>
                      )
                    ) : (
                      <p className="mt-2 text-sm text-gray-400">
                        Veuillez sélectionner un film et un cinéma pour afficher
                        les salles disponibles.
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium"
                    >
                      Prix
                    </label>
                    <input
                      type="text"
                      id="sessionPrice"
                      name="sessionPrice"
                      value={sessionPrice}
                      onChange={(e) => setSessionPrice(e.target.value)}
                      className="mt-1 focus:ring-yellow-500 focus:border-yellow-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <p className="mt-2 text-sm text-gray-400">
                      Entrez le prix de la séance (ex : 8.50)
                    </p>
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="time_ranges"
                      className="block text-sm font-medium"
                    >
                      Plages horaires disponibles
                    </label>
                    {selectedMovieId &&
                    selectedCinemaId &&
                    selectedRoomId &&
                    selectedDate ? (
                      <>
                        {availableTimeRanges.length > 0 ? (
                          availableTimeRanges.map((range, index) => {
                            const startDate = new Date(
                              range.timeRangeStartTime
                            );
                            const endDate = new Date(range.timeRangeEndTime);

                            const formattedStartDate = `${startDate
                              .getUTCDate()
                              .toString()
                              .padStart(2, "0")}/${(startDate.getUTCMonth() + 1)
                              .toString()
                              .padStart(
                                2,
                                "0"
                              )}/${startDate.getUTCFullYear()} - ${startDate
                              .getUTCHours()
                              .toString()
                              .padStart(2, "0")}:${startDate
                              .getUTCMinutes()
                              .toString()
                              .padStart(2, "0")}`;
                            const formattedEndDate = `${endDate
                              .getUTCHours()
                              .toString()
                              .padStart(2, "0")}:${endDate
                              .getUTCMinutes()
                              .toString()
                              .padStart(2, "0")}`;

                            return (
                              <div
                                key={index}
                                className="mt-2 flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  id={`time-range-${index}`}
                                  name={`time-range-${index}`}
                                  checked={selectedRanges.some(
                                    (r) =>
                                      r.timeRangeStartTime ===
                                        range.timeRangeStartTime &&
                                      r.timeRangeEndTime ===
                                        range.timeRangeEndTime
                                  )}
                                  onChange={() =>
                                    handleTimeRangeSelection(range)
                                  }
                                  className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300 rounded"
                                />

                                <label
                                  htmlFor={`time-range-${index}`}
                                  className="ml-3 block text-sm font-medium"
                                >
                                  {formattedStartDate} à {formattedEndDate}
                                </label>
                              </div>
                            );
                          })
                        ) : (
                          <p className="mt-2 text-sm text-gray-400">
                            Aucune plage horaire disponible pour cette date.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-gray-400">
                        Veuillez sélectionner un film, un cinéma, une salle et
                        une date pour afficher les plages horaires disponibles.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="block rounded-md bg-green-700 px-3 py-2 text-center text-sm  text-white hover:bg-green-800"
                  >
                    Ajouter
                  </button>
                  <button
                    type="button"
                    className="ml-4 block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                    onClick={resetForm}
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default SessionAdd;
