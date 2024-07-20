import React from "react";
import { Link } from "react-router-dom";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useGetIncidentsQuery } from "../redux/api/incidentApiSlice";
import { useGetCinemasQuery } from "../redux/api/cinemaApiSlice";
import { useGetRoomsQuery } from "../redux/api/roomApiSlice";

const IncidentList = () => {
  const { data: incidents, isLoading: incidentsLoading } =
    useGetIncidentsQuery();
  const { data: cinemas, isLoading: cinemasLoading } = useGetCinemasQuery();
  const { data: rooms, isLoading: roomsLoading } = useGetRoomsQuery();

  const formatDate = (date) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    };
    return new Date(date).toLocaleString("fr-FR", options).replace(/ /, " - ");
  };

  if (incidentsLoading || cinemasLoading || roomsLoading)
    return <p>Loading...</p>;

  const sortedIncidents = incidents
    ?.slice()
    .sort(
      (a, b) => new Date(b.incidentReportedAt) - new Date(a.incidentReportedAt)
    );

  return (
    <div className="py-10">
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6">
            <div className="sm:flex sm:items-center justify-between">
              <header>
                <div className="max-w-7xl">
                  <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight">
                    Incidents
                  </h1>
                </div>
              </header>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                  to="/incidentadd"
                  className="block rounded-md bg-green-700 px-3 py-2 text-center text-sm  text-white hover:bg-green-800"
                >
                  Ajouter
                </Link>
              </div>
            </div>

            <div className="mt-8 flow-root">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="bg-white inline-block min-w-full py-2 align-middle box-border border border-solid rounded-md border-[#e5e7eb] sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                        >
                          Cinéma
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold"
                        >
                          Salle
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold"
                        >
                          Reporté par
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold"
                        >
                          Reporté le
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                        >
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedIncidents && sortedIncidents.length > 0 ? (
                        sortedIncidents.map((incident) => {
                          const cinema = cinemas?.find(
                            (c) => c.id === parseInt(incident.cinemaId)
                          );
                          const room = rooms?.find(
                            (r) => r.id === parseInt(incident.roomId)
                          );
                          return (
                            <tr key={incident._id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                                {cinema?.cinemaName || "Unknown"}
                              </td>
                              <td className="whitespace-nowrap py-4 px-3 text-sm">
                                {room
                                  ? `${room.roomNumber} - ${room.roomQuality}`
                                  : "Unknown"}
                              </td>
                              <td className="whitespace-nowrap py-4 px-3 text-sm">
                                {incident.incidentDescription.substring(0, 50)}
                                ...
                              </td>
                              <td className="whitespace-nowrap py-4 px-3 text-sm">
                                {incident.incidentReportedBy}
                              </td>
                              <td className="whitespace-nowrap py-4 px-3 text-sm">
                                {formatDate(incident.incidentReportedAt)}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                <Link
                                  to={`/incidentdetails/${incident._id}`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="py-4 text-center text-sm text-gray-500"
                          >
                            Aucun incident trouvé.
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
    </div>
  );
};

export default IncidentList;
