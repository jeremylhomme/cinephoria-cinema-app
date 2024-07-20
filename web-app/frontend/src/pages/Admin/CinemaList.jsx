import React from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

import {
  useGetCinemasQuery,
  useDeleteCinemaMutation,
} from "../../redux/api/cinemaApiSlice";

const CinemaList = () => {
  const { data: cinemas, refetch, isLoading, error } = useGetCinemasQuery();

  const [deleteCinema] = useDeleteCinemaMutation();

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this cinema?")) {
      try {
        const cinemaId = Number(id);
        if (isNaN(cinemaId)) {
          toast.error("Invalid ID: Deletion not performed.");
          return;
        }
        await deleteCinema(cinemaId).unwrap();
        refetch();

        toast.success("Cinema deleted successfully!");
      } catch (err) {
        toast.error(
          "An error occurred while deleting the cinema. Please try again later."
        );
        console.error("Deletion error:", err);
      }
    }
  };

  if (isLoading) return <LoaderFull />;

  return (
    <>
      <div className="py-16">
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 sm:px-6">
              <div className="sm:flex sm:items-center justify-between">
                <header>
                  <div className="max-w-7xl">
                    <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight">
                      Cinémas
                    </h1>
                  </div>
                </header>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                  <NavLink
                    to="/admin/cinema-add"
                    className="block rounded-md bg-green-700 px-3 py-2 text-center text-sm  text-white hover:bg-green-800"
                  >
                    Ajouter
                  </NavLink>
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
                            ID
                          </th>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                          >
                            Nom
                          </th>
                          <th
                            scope="col"
                            className="pr-3 py-3.5 text-left text-sm font-semibold"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="pr-3 py-3.5 text-left text-sm font-semibold"
                          >
                            Téléphone
                          </th>
                          <th
                            scope="col"
                            className="pr-3 py-3.5 text-left text-sm font-semibold"
                          >
                            Heures d'ouverture
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
                        {cinemas && cinemas.length > 0 ? (
                          cinemas.map((cinema) => (
                            <tr key={cinema.id}>
                              <td className="whitespace-nowrap pr-3 py-5 text-sm pl-4 sm:pl-0">
                                {cinema.id}
                              </td>
                              <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                {cinema.cinemaName}
                              </td>
                              <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                {cinema.cinemaEmail}
                              </td>
                              <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                {cinema.cinemaTelNumber}
                              </td>
                              <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                {cinema.cinemaStartTimeOpening} -{" "}
                                {cinema.cinemaEndTimeOpening}
                              </td>
                              <td className="whitespace-nowrap px-3 py-5 text-sm flex items-center">
                                <NavLink
                                  to={`/admin/cinema-details/${cinema.id}`}
                                  className="hover:text-gray-300 mr-4"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </NavLink>
                                <NavLink
                                  to={`/admin/cinema-update/${cinema.id}`}
                                  className="hover:text-gray-300"
                                >
                                  <PencilSquareIcon className="h-5 w-5" />
                                </NavLink>
                                <button
                                  onClick={() => deleteHandler(cinema.id)}
                                  className="ml-3 hover:text-gray-300"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="whitespace-nowrap pr-3 py-5 text-sm text-center text-gray-500"
                            >
                              Aucun cinéma trouvé.
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
    </>
  );
};

export default CinemaList;
