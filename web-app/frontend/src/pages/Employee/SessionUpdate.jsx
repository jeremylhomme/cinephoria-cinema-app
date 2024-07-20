import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import {
  useUpdateSessionMutation,
  useGetSessionDetailsQuery,
  useGetAvailableTimeRangesQuery,
  useGetBookedTimeRangesQuery,
  useCreateAvailableTimeRangesMutation,
} from "../../redux/api/sessionApiSlice";
import { useGetMoviesQuery } from "../../redux/api/movieApiSlice";
import { useGetCinemasQuery } from "../../redux/api/cinemaApiSlice";
import { useGetRoomsQuery } from "../../redux/api/roomApiSlice";

const SessionUpdate = () => {
  const { id } = useParams();

  const [updateSession] = useUpdateSessionMutation();
  const { data: session, isFetching } = useGetSessionDetailsQuery(id);

  const { data: moviesData, isLoading: isLoadingMovies } = useGetMoviesQuery();
  const movies = moviesData?.movies || [];
  const { data: cinemas, isLoading: isLoadingCinemas } = useGetCinemasQuery();
  const { data: rooms, isLoading: isLoadingRooms } = useGetRoomsQuery();

  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [sessionPrice, setSessionPrice] = useState("");
  const [selectedRanges, setSelectedRanges] = useState([]);
  const [selectedBookedRanges, setSelectedBookedRanges] = useState([]);

  const [createAvailableTimeRanges] = useCreateAvailableTimeRangesMutation();

  const {
    data: availableTimeRangesResponse,
    refetch: refetchAvailableTimeRanges,
  } = useGetAvailableTimeRangesQuery(
    {
      date: selectedDate,
      cinemaId: selectedCinemaId,
      movieId: selectedMovieId,
      roomId: selectedRoomId,
    },
    {
      skip:
        !selectedCinemaId ||
        !selectedMovieId ||
        !selectedRoomId ||
        !selectedDate,
    }
  );

  const { data: bookedTimeRangesResponse, refetch: refetchBookedTimeRanges } =
    useGetBookedTimeRangesQuery(
      {
        date: selectedDate,
        cinemaId: selectedCinemaId,
        roomId: selectedRoomId,
      },
      {
        skip: !selectedCinemaId || !selectedRoomId || !selectedDate,
      }
    );

  useEffect(() => {
    if (session) {
      setSelectedMovieId(session.movie?.id || "");
      setSelectedCinemaId(session.cinema?.id || "");
      setSelectedRoomId(session.room?.id || null);
      setSelectedDate(
        session.sessionDate
          ? new Date(session.sessionDate).toISOString().split("T")[0]
          : ""
      );
      setSessionPrice(session.sessionPrice || "");
      setSelectedRanges(session.timeRanges || []);
    }
  }, [session]);

  useEffect(() => {
    if (selectedMovieId && selectedCinemaId && selectedRoomId && selectedDate) {
      refetchAvailableTimeRanges();
      refetchBookedTimeRanges();
    }
  }, [
    selectedMovieId,
    selectedCinemaId,
    selectedRoomId,
    selectedDate,
    refetchAvailableTimeRanges,
    refetchBookedTimeRanges,
  ]);

  const formatDate = (date) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    };
    return new Date(date).toLocaleString("fr-FR", options).replace(/ /g, " - ");
  };

  const handleTimeRangeSelection = (range) => {
    const isSelected = selectedRanges.some(
      (r) =>
        r.timeRangeStartTime === range.timeRangeStartTime &&
        r.timeRangeEndTime === range.timeRangeEndTime
    );
    if (isSelected) {
      setSelectedRanges((prevRanges) =>
        prevRanges.filter(
          (r) =>
            r.timeRangeStartTime !== range.timeRangeStartTime ||
            r.timeRangeEndTime !== range.timeRangeEndTime
        )
      );
    } else {
      setSelectedRanges((prevRanges) => [
        ...prevRanges,
        { ...range, availableTimeRangeId: range.id },
      ]);
    }
  };

  const handleBookedRangeSelection = (range) => {
    const isSelected = selectedBookedRanges.some(
      (r) =>
        r.timeRangeStartTime === range.timeRangeStartTime &&
        r.timeRangeEndTime === range.timeRangeEndTime
    );
    if (isSelected) {
      setSelectedBookedRanges((prevRanges) =>
        prevRanges.filter(
          (r) =>
            r.timeRangeStartTime !== range.timeRangeStartTime ||
            r.timeRangeEndTime !== range.timeRangeEndTime
        )
      );
    } else {
      setSelectedBookedRanges((prevRanges) => [
        ...prevRanges,
        { ...range, availableTimeRangeId: range.id },
      ]);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      const { availableTimeRanges: fetchedTimeRanges } =
        await createAvailableTimeRanges({
          cinemaId: selectedCinemaId,
          roomId: selectedRoomId,
          date: selectedDate,
          movieId: selectedMovieId,
        }).unwrap();

      const timeRanges = selectedRanges.map((range) => {
        const matchingRange = fetchedTimeRanges.find(
          (r) =>
            r.timeRangeStartTime === range.timeRangeStartTime &&
            r.timeRangeEndTime === range.timeRangeEndTime
        );
        return {
          timeRangeStartTime: new Date(range.timeRangeStartTime).toISOString(),
          timeRangeEndTime: new Date(range.timeRangeEndTime).toISOString(),
          availableTimeRangeId: matchingRange ? Number(matchingRange.id) : null,
        };
      });

      const formattedBookedRanges = selectedBookedRanges.map((range) => ({
        timeRangeStartTime: new Date(range.timeRangeStartTime).toISOString(),
        timeRangeEndTime: new Date(range.timeRangeEndTime).toISOString(),
        availableTimeRangeId: Number(range.availableTimeRangeId),
      }));

      const payload = {
        id: parseInt(id, 10),
        movieId: parseInt(selectedMovieId, 10),
        cinemaId: parseInt(selectedCinemaId, 10),
        roomId: parseInt(selectedRoomId, 10),
        sessionDate: new Date(selectedDate).toISOString().split("T")[0],
        sessionPrice: parseFloat(sessionPrice),
        timeRanges: timeRanges,
        bookedTimeRanges: formattedBookedRanges,
      };

      const result = await updateSession(payload).unwrap();
      console.log("Update result:", result);
      toast.success("Session mise à jour avec succès");
    } catch (error) {
      toast.error(
        "Une erreur s'est produite lors de la mise à jour de la séance."
      );
      console.error("Error updating session:", error);
    }
  };

  if (isFetching || isLoadingMovies || isLoadingCinemas || isLoadingRooms)
    return <LoaderFull />;

  const availableTimeRanges =
    availableTimeRangesResponse?.availableTimeRanges || [];
  const bookedTimeRanges = bookedTimeRangesResponse?.bookedTimeRanges || [];

  return (
    <div className="py-10 mb-8">
      <main>
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  Mettre à jour une séance
                </h1>
                {session && (
                  <div className="mt-4">
                    <p className="text-sm">
                      Séance créée le {formatDate(session.createdAt)}
                    </p>
                    <p className="text-sm">
                      Dernière mise à jour le {formatDate(session.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                  to="/session-list"
                  className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                >
                  Retour
                </Link>
              </div>
            </div>
            <div className="mt-12 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="rounded-md bg-white inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="min-w-full divide-y divide-gray-300">
                    <form onSubmit={handleUpdate}>
                      <div className="space-y-12">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="movie_id"
                              className="block text-sm font-medium leading-6"
                            >
                              Film*
                            </label>
                            <div className="mt-2">
                              <select
                                id="movie_id"
                                name="movie_id"
                                required
                                value={selectedMovieId}
                                onChange={(e) =>
                                  setSelectedMovieId(e.target.value)
                                }
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              >
                                <option value="">Sélectionnez un film</option>
                                {Array.isArray(movies) && movies.length > 0 ? (
                                  movies.map((movie) => (
                                    <option key={movie.id} value={movie.id}>
                                      {movie.movieTitle}
                                    </option>
                                  ))
                                ) : (
                                  <option value="" disabled>
                                    {isLoadingMovies
                                      ? "Chargement des films..."
                                      : "Aucun film disponible"}
                                  </option>
                                )}
                              </select>
                            </div>
                          </div>
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="cinema_id"
                              className="block text-sm font-medium leading-6"
                            >
                              Cinéma*
                            </label>
                            <div className="mt-2">
                              <select
                                id="cinema_id"
                                name="cinema_id"
                                required
                                value={selectedCinemaId}
                                onChange={(e) =>
                                  setSelectedCinemaId(e.target.value)
                                }
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              >
                                <option value="">Sélectionnez un cinéma</option>
                                {Array.isArray(cinemas) &&
                                cinemas.length > 0 ? (
                                  cinemas.map((cinema) => (
                                    <option key={cinema.id} value={cinema.id}>
                                      {cinema.cinemaName}
                                    </option>
                                  ))
                                ) : (
                                  <option value="" disabled>
                                    {isLoadingCinemas
                                      ? "Chargement des cinémas..."
                                      : "Aucun cinéma disponible"}
                                  </option>
                                )}
                              </select>
                            </div>
                          </div>
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="room_id"
                              className="block text-sm font-medium leading-6"
                            >
                              Salle*
                            </label>
                            <div className="mt-2">
                              {Array.isArray(rooms) && rooms.length > 0 ? (
                                rooms
                                  .filter(
                                    (room) =>
                                      room.cinema.id ===
                                      Number(selectedCinemaId)
                                  )
                                  .map((room) => (
                                    <div
                                      key={room.id}
                                      className="flex items-center"
                                    >
                                      <input
                                        type="radio"
                                        id={`room-${room.id}`}
                                        name="room"
                                        value={room.id}
                                        checked={selectedRoomId === room.id}
                                        onChange={() =>
                                          setSelectedRoomId(room.id)
                                        }
                                        className="focus:ring-yellow-600 h-4 w-4 text-yellow-600 border-gray-300"
                                      />
                                      <label
                                        htmlFor={`room-${room.id}`}
                                        className="ml-3 block text-sm font-medium"
                                      >
                                        Salle n°{room.id} -{" "}
                                        {room.cinema.cinemaName} -{" "}
                                        {room.roomQuality}
                                      </label>
                                    </div>
                                  ))
                              ) : (
                                <p>
                                  {isLoadingRooms
                                    ? "Chargement des salles..."
                                    : "Aucune salle disponible"}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="session_date"
                              className="block text-sm font-medium leading-6"
                            >
                              Date de la séance*
                            </label>
                            <div className="mt-2">
                              <input
                                type="date"
                                id="session_date"
                                name="session_date"
                                required
                                value={selectedDate}
                                onChange={(e) =>
                                  setSelectedDate(e.target.value)
                                }
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="price"
                              className="block text-sm font-medium leading-6"
                            >
                              Prix*
                            </label>
                            <div className="mt-2">
                              <input
                                type="number"
                                step="0.01"
                                id="price"
                                name="price"
                                required
                                value={sessionPrice}
                                onChange={(e) =>
                                  setSessionPrice(e.target.value)
                                }
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                          <div className="sm:col-span-6">
                            <label
                              htmlFor="time_ranges"
                              className="block text-sm font-medium leading-6"
                            >
                              Plages horaires disponibles*
                            </label>
                            <div className="mt-2">
                              {availableTimeRanges.map((range, index) => (
                                <div key={index} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`time-range-${index}`}
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
                                    className="focus:ring-yellow-600 h-4 w-4 text-yellow-600 border-gray-300"
                                  />
                                  <label
                                    htmlFor={`time-range-${index}`}
                                    className="ml-3 block text-sm font-medium"
                                  >
                                    {new Date(
                                      range.timeRangeStartTime
                                    ).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}{" "}
                                    -
                                    {new Date(
                                      range.timeRangeEndTime
                                    ).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label
                              htmlFor="booked_time_ranges"
                              className="block text-sm font-medium leading-6"
                            >
                              Plages horaires actuellement réservées par ce film
                            </label>
                            <div className="mt-2">
                              {bookedTimeRanges.map((range, index) => (
                                <div key={index} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`booked-range-${index}`}
                                    checked={selectedBookedRanges.some(
                                      (r) =>
                                        r.timeRangeStartTime ===
                                          range.timeRangeStartTime &&
                                        r.timeRangeEndTime ===
                                          range.timeRangeEndTime
                                    )}
                                    onChange={() =>
                                      handleBookedRangeSelection(range)
                                    }
                                    className="focus:ring-yellow-600 h-4 w-4 text-yellow-600 border-gray-300"
                                  />
                                  <label
                                    htmlFor={`booked-range-${index}`}
                                    className="ml-3 block text-sm font-medium"
                                  >
                                    {new Date(
                                      range.timeRangeStartTime
                                    ).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}{" "}
                                    -
                                    {new Date(
                                      range.timeRangeEndTime
                                    ).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pb-6 flex items-center justify-center gap-x-4">
                        <button
                          type="submit"
                          className="block rounded-md px-3 py-2 text-center text-white text-sm bg-green-700 hover:bg-green-800"
                        >
                          Enregistrer
                        </button>
                        <Link
                          to="/session-list"
                          className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                        >
                          Retour à la liste des séances
                        </Link>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionUpdate;
