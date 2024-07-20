import React from "react";
import { Link, useParams } from "react-router-dom";
import { useGetIncidentDetailsQuery } from "../redux/api/incidentApiSlice";

const IncidentDetails = () => {
  const { id } = useParams();
  const { data: incident, isLoading, isError } = useGetIncidentDetailsQuery(id);

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

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error fetching incident details.</p>;

  return (
    <div className="py-10">
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6">
            <div className="sm:flex sm:items-center justify-between">
              <header>
                <div className="max-w-7xl">
                  <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight">
                    Détails de l'incident
                  </h1>
                </div>
              </header>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                  to="/incidents"
                  className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                >
                  Retour
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
                          Champ
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold"
                        >
                          Valeur
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                          ID
                        </td>
                        <td className="whitespace-nowrap py-4 px-3 text-sm">
                          {incident._id}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                          Cinéma
                        </td>
                        <td className="whitespace-nowrap py-4 px-3 text-sm">
                          {incident.cinemaName}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                          Salle
                        </td>
                        <td className="whitespace-nowrap py-4 px-3 text-sm">
                          {incident.roomNumber}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                          Sujet
                        </td>
                        <td className="whitespace-nowrap py-4 px-3 text-sm">
                          {incident.incidentSubject}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                          Description
                        </td>
                        <td className="py-4 px-3 text-sm">
                          {incident.incidentDescription}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                          Reporté par
                        </td>
                        <td className="whitespace-nowrap py-4 px-3 text-sm">
                          {incident.incidentReportedBy}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                          Reporté le
                        </td>
                        <td className="whitespace-nowrap py-4 px-3 text-sm">
                          {formatDate(incident.incidentReportedAt)}
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

export default IncidentDetails;
