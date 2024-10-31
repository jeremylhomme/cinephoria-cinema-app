import React from "react";
import { NavLink, useParams } from "react-router-dom";
import LoaderFull from "../../components/LoaderFull";
import { useGetCinemaDetailsQuery } from "../../redux/api/cinemaApiSlice";

const formatDate = (dateString) => {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-GB", options);
};

const CinemaDetails = () => {
  const { id } = useParams();
  const { data: cinema, isFetching, isError } = useGetCinemaDetailsQuery(id);

  if (isFetching) return <LoaderFull />;
  if (isError)
    return <p>Erreur pendant du chargement des détails du cinéma.</p>;

  return (
    <div className="py-10">
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6">
            <div className="max-w-xl mx-auto sm:flex sm:items-center justify-between">
              <header>
                <div className="max-w-7xl">
                  <h1 className="text-3xl font-bold leading-tight tracking-tight">
                    Détails du cinéma
                  </h1>
                </div>
              </header>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <NavLink
                  to="/admin/cinema-list"
                  className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                >
                  Retour
                </NavLink>
              </div>
            </div>
            <div className="mt-8 flow-root">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="bg-white px-8 pt-8 pb-4 my-6 rounded-md sm:mx-auto sm:w-full sm:max-w-xl shadow-sm">
                  <table className="min-w-full divide-y divide-gray-300">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Nom du cinéma
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {cinema.cinemaName}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Adresse
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {cinema.cinemaAddress} {cinema.cinemaCity}{" "}
                          {cinema.cinemaPostalCode} {cinema.cinemaCountry}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Email
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {cinema.cinemaEmail}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Numéro de téléphone
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {cinema.cinemaTelNumber}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Heures d'ouverture
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {cinema.cinemaStartTimeOpening} -{" "}
                          {cinema.cinemaEndTimeOpening}
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

export default CinemaDetails;
