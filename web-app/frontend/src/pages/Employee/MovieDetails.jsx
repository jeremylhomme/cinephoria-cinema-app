import React from "react";
import { Link, useParams } from "react-router-dom";
import { PhotoIcon } from "@heroicons/react/24/outline";
import LoaderFull from "../../components/LoaderFull";
import { useGetMovieDetailsQuery } from "../../redux/api/movieApiSlice";
import { BASE_URL } from "../../redux/constants";
import { useGetCategoriesQuery } from "../../redux/api/categoryApiSlice";

const formatDate = (dateString) => {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-GB", options);
};

const MovieDetails = () => {
  const { id } = useParams();
  const { data: movie, isFetching } = useGetMovieDetailsQuery(id);
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useGetCategoriesQuery();

  if (isFetching || isLoadingCategories) return <LoaderFull />;
  if (isErrorCategories) return <p>Error fetching categories.</p>;

  return (
    <div className="py-10">
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6">
            <div className="max-w-xl mx-auto sm:flex sm:items-center justify-between">
              <header>
                <div className="max-w-7xl">
                  <h1 className="text-3xl font-bold leading-tight tracking-tight">
                    Détails du film
                  </h1>
                  <div className="mt-4">
                    <p className="text-sm">
                      Film ajouté le {formatDate(movie.movieCreatedAt)}
                    </p>
                    <p className="text-sm">
                      Dernière mise à jour le {formatDate(movie.movieUpdatedAt)}
                    </p>
                  </div>
                </div>
              </header>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                  to="/movie-list"
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
                          Titre du film
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {movie.movieTitle}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Description
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {movie.movieDescription}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Date de sortie
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {movie.movieReleaseDate
                            ? formatDate(movie.movieReleaseDate)
                            : "-"}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Durée
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {movie.movieLength} minutes
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Âge minimum
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {movie.movieMinimumAge}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          URL de la bande-annonce
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          <a
                            href={movie.movieTrailerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {movie.movieTrailerUrl}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          État de publication
                        </td>
                        <td
                          className={`my-3.5 py-1.5 px-2 ml-2 inline-flex items-center rounded-md text-xs font-medium ${
                            movie.moviePublishingState === "active"
                              ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                              : movie.moviePublishingState === "premiere"
                              ? "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                              : "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20"
                          }`}
                        >
                          {movie.moviePublishingState === "active"
                            ? "Actif"
                            : movie.moviePublishingState === "premiere"
                            ? "Avant-première"
                            : "Inactif"}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Date programmée
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {movie.movieScheduleDate
                            ? formatDate(movie.movieScheduleDate)
                            : "-"}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Date de l'avant-première
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {movie.moviePremiereDate
                            ? formatDate(movie.moviePremiereDate)
                            : "Aucune date d'avant-première n'est prévue"}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Catégories
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {movie.categories.map((category) => (
                            <span
                              key={category.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2"
                            >
                              {category.categoryName}
                            </span>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Image du film
                        </td>
                        <td className="whitespace-normal pt-4 px-3 text-sm w-1/2">
                          {movie.movieImg ? (
                            <div>
                              <img
                                className="inline-block w-20 rounded-md"
                                src={movie.movieImg}
                                alt={movie.movieTitle}
                              />
                              <p className="text-blue-600 mt-4 text-sm hover:underline">
                                {movie.movieImg}
                              </p>
                            </div>
                          ) : (
                            <PhotoIcon
                              className="h-7 w-7 text-gray-400"
                              aria-hidden="true"
                            />
                          )}
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

export default MovieDetails;
