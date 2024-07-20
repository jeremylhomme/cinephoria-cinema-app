import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import {
  useUpdateMovieMutation,
  useGetMovieDetailsQuery,
} from "../../redux/api/movieApiSlice";
import { useGetCategoriesQuery } from "../../redux/api/categoryApiSlice";

const MovieUpdate = () => {
  const { id } = useParams();

  const [updateMovie] = useUpdateMovieMutation();
  const { data: movie, isFetching } = useGetMovieDetailsQuery(id);

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useGetCategoriesQuery();

  const [movieTitle, setMovieTitle] = useState("");
  const [movieDescription, setMovieDescription] = useState("");
  const [movieReleaseDate, setMovieReleaseDate] = useState("");
  const [movieScheduleDate, setMovieScheduleDate] = useState("");
  const [premiereDate, setPremiereDate] = useState("");
  const [movieImageUrl, setMovieImageUrl] = useState("");
  const [movieLength, setMovieLength] = useState("");
  const [movieTrailerUrl, setMovieTrailerUrl] = useState("");
  const [movieMinimumAge, setMovieMinimumAge] = useState("");
  const [moviePublishingState, setMoviePublishingState] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [movieFavorite, setMovieFavorite] = useState(false);

  useEffect(() => {
    if (movie) {
      const formattedDate = movie.movieReleaseDate
        ? new Date(movie.movieReleaseDate).toISOString().split("T")[0]
        : "";
      setMovieTitle(movie.movieTitle || "");
      setMovieDescription(movie.movieDescription || "");
      setMovieReleaseDate(formattedDate);
      setMovieImageUrl(movie.movieImg || "");
      setMovieLength(movie.movieLength || "");
      setMovieTrailerUrl(movie.movieTrailerUrl || "");
      setMovieMinimumAge(movie.movieMinimumAge || "");
      setMoviePublishingState(movie.moviePublishingState || "");
      setMovieFavorite(movie.movieFavorite || false);
      setSelectedCategories(
        movie.categories.map((category) => category.id) || []
      );
      setMovieScheduleDate(
        movie.movieScheduleDate
          ? new Date(movie.movieScheduleDate).toISOString().split("T")[0]
          : ""
      );
      setPremiereDate(
        movie.moviePremiereDate
          ? new Date(movie.moviePremiereDate).toISOString().split("T")[0]
          : ""
      );
    }
  }, [movie]);

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

  const handleCategorySelection = (event) => {
    const categoryId = Number(event.target.value);
    const isChecked = event.target.checked;

    if (isChecked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      const updatedMovie = await updateMovie({
        id,
        movieTitle,
        movieDescription,
        movieReleaseDate,
        movieImg: movieImageUrl,
        movieLength,
        movieTrailerUrl,
        movieMinimumAge: parseInt(movieMinimumAge, 10),
        moviePublishingState,
        movieFavorite,
        movieScheduleDate: movieScheduleDate
          ? new Date(movieScheduleDate + "T00:00:00.000Z").toISOString()
          : null,
        moviePremiereDate: premiereDate
          ? new Date(premiereDate).toISOString()
          : null,
        categoryIds: selectedCategories,
      }).unwrap();

      toast.success("Le film a été mis à jour avec succès");
    } catch (error) {
      toast.error("Une erreur s'est produite lors de la mise à jour du film.");
      console.error("Error updating movie:", error);
    }
  };

  if (isFetching || isLoadingCategories) return <LoaderFull />;
  if (isErrorCategories) return <p>Error fetching categories.</p>;

  return (
    <div className="py-10 mb-8">
      <main>
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  Mettre à jour un film
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
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                  to="/movie-list"
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
                              htmlFor="title"
                              className="block text-sm font-medium leading-6"
                            >
                              Titre*
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                value={movieTitle}
                                onChange={(e) => setMovieTitle(e.target.value)}
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Ex : Bienvenue chez les Ch'tis
                            </p>
                          </div>
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="category"
                              className="block text-sm font-medium leading-6"
                            >
                              Catégories*
                            </label>
                            <div className="mt-2">
                              {categories.length === 0 ? (
                                <div>
                                  <p className="text-sm text-gray-400 mb-4">
                                    Aucune catégorie trouvée. Merci d'en ajouter
                                    une afin de poursuivre.
                                  </p>
                                  <Link
                                    to="/admin/categorylist"
                                    className="rounded-md bg-green-700 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800"
                                  >
                                    Ajouter
                                  </Link>
                                </div>
                              ) : (
                                categories.map((category) => (
                                  <div
                                    key={category.id}
                                    className="flex items-center"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`category-${category.id}`}
                                      name={`category-${category.id}`}
                                      value={category.id}
                                      checked={selectedCategories.includes(
                                        category.id
                                      )}
                                      onChange={handleCategorySelection}
                                      className="w-4 h-4 text-yellow-600 bg-transparent border-gray-300 rounded focus:ring-yellow-600"
                                    />
                                    <label
                                      htmlFor={`category-${category.id}`}
                                      className="ml-2 block text-sm font-medium"
                                    >
                                      {category.categoryName}
                                    </label>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="release_date"
                              className="block text-sm font-medium leading-6"
                            >
                              Date de sortie*
                            </label>
                            <div className="mt-2">
                              <input
                                type="date"
                                name="release_date"
                                id="release_date"
                                required
                                value={movieReleaseDate}
                                onChange={(e) =>
                                  setMovieReleaseDate(e.target.value)
                                }
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Date de la première sortie du film.
                              <br />
                              Ex : 2008-02-27
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="minimumAge"
                              className="block text-sm font-medium leading-6"
                            >
                              Âge minimum*
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="minimumAge"
                                id="minimumAge"
                                required
                                value={movieMinimumAge}
                                onChange={(e) =>
                                  setMovieMinimumAge(e.target.value)
                                }
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Ex : 10
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="trailerUrl"
                              className="block text-sm font-medium leading-6"
                            >
                              Lien de la bande-annonce*
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="trailerUrl"
                                id="trailerUrl"
                                value={movieTrailerUrl}
                                onChange={(e) =>
                                  setMovieTrailerUrl(e.target.value)
                                }
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Ex : https://www.youtube.com/watch?v=...
                            </p>
                          </div>
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="movie-image-url"
                              className="block text-sm font-medium leading-6"
                            >
                              URL de l'image du film*
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="movieImageUrl"
                                id="movieImageUrl"
                                required
                                value={movieImageUrl}
                                onChange={(e) =>
                                  setMovieImageUrl(e.target.value)
                                }
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Ex : https://example.com/image.jpg
                            </p>
                          </div>
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="publishingState"
                              className="block text-sm font-medium leading-6"
                            >
                              État de publication*
                            </label>
                            <div className="mt-2">
                              <select
                                id="publishingState"
                                name="publishingState"
                                required
                                className="max-w-lg block w-full shadow-sm focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                                value={moviePublishingState}
                                onChange={(e) =>
                                  setMoviePublishingState(e.target.value)
                                }
                              >
                                <option value="" disabled hidden>
                                  Sélectionnez un état
                                </option>
                                <option value="premiere">Avant-première</option>
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
                              </select>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Avant-première : le film sera diffusé à la date de
                              l'avant-première
                              <br />
                              Actif : le film sera diffusé à la date de
                              diffusion
                              <br />
                              Inactif : le film se sera pas visible par les
                              utilisateurss
                            </p>
                          </div>

                          {moviePublishingState === "active" && (
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="movieScheduleDate"
                                className="block text-sm font-medium leading-6"
                              >
                                Date de la diffusion*
                              </label>
                              <div className="mt-2">
                                <input
                                  type="date"
                                  name="movieScheduleDate"
                                  id="movieScheduleDate"
                                  value={movieScheduleDate}
                                  onChange={(e) =>
                                    setMovieScheduleDate(e.target.value)
                                  }
                                  className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                              <p className="mt-3 text-sm leading-6 text-gray-400">
                                Date à laquelle le film sera diffusé dans les
                                salles.
                                <br />
                                Ex : 2024-12-31
                              </p>
                            </div>
                          )}

                          {moviePublishingState === "premiere" && (
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="premiereDate"
                                className="block text-sm font-medium leading-6"
                              >
                                Date de l'avant-première*
                              </label>
                              <div className="mt-2">
                                <input
                                  type="date"
                                  name="premiereDate"
                                  id="premiereDate"
                                  value={premiereDate}
                                  onChange={(e) =>
                                    setPremiereDate(e.target.value)
                                  }
                                  className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                              <p className="mt-3 text-sm leading-6 text-gray-400">
                                Date de l'avant-première du film.
                                <br />
                                Ex : 2024-12-25
                              </p>
                            </div>
                          )}

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="length"
                              className="block text-sm font-medium leading-6"
                            >
                              Durée*
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="length"
                                id="length"
                                required
                                value={movieLength}
                                onChange={(e) => setMovieLength(e.target.value)}
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              En minutes. Ex : 107
                            </p>
                          </div>

                          <div className="col-span-full">
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium leading-6"
                            >
                              Description *
                            </label>
                            <div className="mt-2">
                              <textarea
                                id="description"
                                name="description"
                                rows={3}
                                required
                                value={movieDescription}
                                onChange={(e) =>
                                  setMovieDescription(e.target.value)
                                }
                                className="block w-full rounded-md border-0 py-1.5 bg-transparent shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Décrivez le film en quelques mots
                            </p>
                          </div>
                          <div className="sm:col-span-3">
                            <div className="flex items-center h-5">
                              <input
                                id="movieFavorite"
                                name="movieFavorite"
                                type="checkbox"
                                className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-600"
                                onChange={(e) =>
                                  setMovieFavorite(e.target.checked)
                                }
                                checked={movieFavorite}
                              />
                              <label
                                htmlFor="movieFavorite"
                                className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                              >
                                Coup de coeur
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pb-6 flex items-center justify-center gap-x-4">
                        <button
                          type="submit"
                          className="block rounded-md bg-green-700 px-3 py-2 text-center text-sm  text-white hover:bg-green-8000"
                        >
                          Enregistrer
                        </button>
                        <Link
                          to="/movie-list"
                          className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                        >
                          Retour
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

export default MovieUpdate;
