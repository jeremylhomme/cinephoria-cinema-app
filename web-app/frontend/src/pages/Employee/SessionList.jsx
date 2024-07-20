import React from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  useGetSessionsQuery,
  useDeleteSessionMutation,
} from "../../redux/api/sessionApiSlice";
import { useGetCinemasQuery } from "../../redux/api/cinemaApiSlice";

const SessionList = () => {
  const {
    data: cinemas,
    isLoading: cinemasLoading,
    error: cinemasError,
  } = useGetCinemasQuery();

  const {
    data: sessions,
    isLoading: sessionsLoading,
    error: sessionsError,
    refetch,
  } = useGetSessionsQuery({});

  const [deleteSession] = useDeleteSessionMutation();

  const deleteHandler = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette séance ?")) {
      try {
        const sessionId = Number(id);
        if (isNaN(sessionId)) {
          toast.error("Invalid ID: Deletion not performed.");
          return;
        }

        await deleteSession(sessionId).unwrap();
        await refetch();
        toast.success("Séance supprimée avec succès.");
      } catch (err) {
        toast.error(
          "Une erreur s'est produite lors de la suppression de la séance. Veuillez réessayer plus tard."
        );
        console.error("Deletion error:", err);
      }
    }
  };

  const formatDate = (date) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    };
    const formattedDate = new Date(date).toLocaleString("fr-FR", options);
    return formattedDate.replace(/ /, " - ");
  };

  const getSessionStatus = (session) => {
    const currentTime = new Date();
    const lastTimeRange = session.timeRanges[session.timeRanges.length - 1];
    const endTime = new Date(lastTimeRange.timeRangeEndTime);

    if (session.sessionStatus === "deleted") {
      return "Deleted";
    }
    return endTime < currentTime ? "Ended" : "Active";
  };

  if (cinemasLoading || sessionsLoading) return <LoaderFull />;
  if (cinemasError) {
    toast.error(
      "Une erreur s'est produite lors de la récupération des cinémas. Veuillez réessayer plus tard."
    );
    console.error("Error fetching cinemas:", cinemasError);
    return (
      <p className="text-red-500">
        Une erreur s'est produite. Veuillez réessayer plus tard.
      </p>
    );
  }
  if (sessionsError) {
    toast.error(
      "Une erreur s'est produite lors de la récupération des cinémas. Veuillez réessayer plus tard."
    );
    console.error("Error fetching sessions:", sessionsError);
    return (
      <p className="text-red-500">
        Une erreur s'est produite. Veuillez réessayer plus tard.
      </p>
    );
  }

  return (
    <div className="py-16">
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header>
            <div className="mx-auto max-w-7xl sm:px-0 lg:px-0">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  Séances
                </h1>
                <div className="mt-4 sm:mt-0">
                  <Link
                    to="/session-add"
                    className="block rounded-md bg-green-700 px-3 py-2 text-center text-sm  text-white hover:bg-green-800"
                  >
                    Ajouter une séance
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 sm:px-6 lg:px-8">
            {cinemas.map((cinema) => {
              const cinemaSessions = sessions.filter(
                (session) => session.cinema.id === cinema.id
              );

              return (
                <div key={cinema.id} className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">
                    {cinema.cinemaName}
                  </h2>
                  <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="bg-white inline-block min-w-full py-2 align-middle box-border border border-solid rounded-md border-[#e5e7eb] sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead>
                            <tr>
                              <th
                                scope="col"
                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                              >
                                ID
                              </th>
                              <th
                                scope="col"
                                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                              >
                                Film
                              </th>
                              <th
                                scope="col"
                                className="pr-3 py-3.5 text-left text-sm font-semibold"
                              >
                                Salle
                              </th>
                              <th
                                scope="col"
                                className="pr-3 py-3.5 text-left text-sm font-semibold"
                              >
                                Qualité
                              </th>
                              <th
                                scope="col"
                                className="pr-3 py-3.5 text-left text-sm font-semibold"
                              >
                                Date
                              </th>
                              <th
                                scope="col"
                                className="pr-3 py-3.5 text-left text-sm font-semibold"
                              >
                                Statut
                              </th>
                              <th
                                scope="col"
                                className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                              >
                                <span className="sr-only">Edit</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {cinemaSessions.length > 0 ? (
                              cinemaSessions.map((session) => (
                                <tr key={session.id}>
                                  <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                    {session.id}
                                  </td>
                                  <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                    {session.movie.movieTitle}
                                  </td>
                                  <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                    {session.room.roomNumber}
                                  </td>
                                  <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                    {session.room.roomQuality}
                                  </td>
                                  <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                    {formatDate(session.sessionDate)}
                                  </td>
                                  <td className="whitespace-nowrap pr-3 py-3.5 text-sm">
                                    <span
                                      className={`py-1.5 px-2 inline-flex items-center rounded-md text-xs font-medium ${
                                        getSessionStatus(session) === "Ended"
                                          ? "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20"
                                          : getSessionStatus(session) ===
                                            "Deleted"
                                          ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                                          : "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                                      }`}
                                    >
                                      {getSessionStatus(session)}
                                    </span>
                                  </td>
                                  {session.sessionStatus !== "deleted" && (
                                    <td className="whitespace-nowrap px-3 py-5 text-sm flex items-center">
                                      <Link
                                        to={`/sessions/${session.id}`}
                                        className="hover:text-gray-400 mr-4"
                                      >
                                        <EyeIcon className="h-5 w-5" />
                                      </Link>
                                      <Link
                                        to={`/session-update/${session.id}`}
                                        className="hover:text-gray-400"
                                      >
                                        <PencilSquareIcon className="h-5 w-5" />
                                      </Link>
                                      <button
                                        onClick={() =>
                                          deleteHandler(session.id)
                                        }
                                        className="ml-3 hover:text-gray-400"
                                      >
                                        <TrashIcon className="h-5 w-5" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="7"
                                  className="whitespace-nowrap pr-3 py-5 text-sm text-center text-gray-500"
                                >
                                  Il n'y a pas de séances pour ce cinéma.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionList;
