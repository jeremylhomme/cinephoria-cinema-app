import React from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import { useGetSessionDetailsQuery } from "../../redux/api/sessionApiSlice";

const formatDate = (dateString) => {
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  };
  return new Date(dateString).toLocaleDateString("en-GB", options);
};

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  });
};

const SessionDetails = () => {
  const { id } = useParams();
  const {
    data: sessionDetails,
    isLoading,
    isError,
  } = useGetSessionDetailsQuery(id);

  if (isLoading) return <LoaderFull />;
  if (isError) {
    toast.error("An error occurred while fetching session details.");
    return <p>Error fetching session details.</p>;
  }

  if (!sessionDetails) {
    return <p>No session details available.</p>;
  }

  const session = sessionDetails;

  return (
    <div className="py-10">
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6">
            <div className="max-w-xl mx-auto sm:flex sm:items-center justify-between">
              <header>
                <div className="max-w-7xl">
                  <h1 className="text-3xl font-bold leading-tight tracking-tight">
                    Détails de la séance
                  </h1>
                </div>
              </header>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                  to="/session-list"
                  className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                >
                  Retour
                </Link>
              </div>
            </div>
            <div className="mt-8 flow-root">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="bg-white px-8 pt-8 pb-4 my-6 rounded-md sm:mx-auto sm:w-full sm:max-w-xl shadow-sm">
                  <table className="min-w-full divide-y divide-gray-300">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Film
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {session.movie.movieTitle}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Cinéma
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {session.cinema.cinemaName}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Salle
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {session.room.roomNumber} ({session.room.roomQuality})
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Date
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {formatDate(session.sessionDate)}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Prix
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {session.sessionPrice} €
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Statut
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              session.sessionStatus === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {session.sessionStatus === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Horaires
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {session.timeRanges.map((timeRange, index) => (
                            <div key={index}>
                              {formatTime(timeRange.timeRangeStartTime)} -{" "}
                              {formatTime(timeRange.timeRangeEndTime)}
                            </div>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Capacité de la salle
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {session.room.roomCapacity} places
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionDetails;
