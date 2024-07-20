import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import { useCreateMovieMutation } from "../../redux/api/movieApiSlice";
import { useGetCategoriesQuery } from "../../redux/api/categoryApiSlice";

const MovieAdd = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [release_date, setReleaseDate] = useState("");
  const [movieImageUrl, setMovieImageUrl] = useState("");
  const [length, setLength] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [minimumAge, setMinimumAge] = useState("");
  const [publishingState, setPublishingState] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [premiereDate, setPremiereDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [movieFavorite, setMovieFavorite] = useState(false);
  const [isWednesday, setIsWednesday] = useState(false);

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useGetCategoriesQuery();
  const [createMovie] = useCreateMovieMutation();

  useEffect(() => {
    const today = new Date();
    setIsWednesday(today.getDay() === 3); // 3 represents Wednesday
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (publishingState === "premiere" && !premiereDate) {
      toast.error("Veuillez saisir la date de l'avant-première du film.");
      return;
    }

    if (publishingState === "active" && !scheduledDate) {
      toast.error("Veuillez saisir la date de diffusion du film.");
      return;
    }

    if (publishingState === "premiere" && premiereDate && !scheduledDate) {
      toast.error("Veuillez saisir également la date de diffusion du film.");
      return;
    }

    try {
      const categoryIdsAsNumbers = selectedCategories.map((id) =>
        parseInt(id, 10)
      );
      const newMovie = await createMovie({
        movieTitle: title,
        movieDescription: description,
        movieReleaseDate: release_date,
        movieLength: parseInt(length, 10),
        movieTrailerUrl: trailerUrl,
        movieMinimumAge: parseInt(minimumAge, 10),
        moviePublishingState: publishingState,
        movieFavorite,
        movieScheduleDate: scheduledDate
          ? new Date(scheduledDate).toISOString()
          : null,
        moviePremiereDate: premiereDate
          ? new Date(premiereDate).toISOString()
          : null,
        movieImg: movieImageUrl,
        categoryIds: categoryIdsAsNumbers,
      }).unwrap();

      resetForm();
      toast.success("Le film a été ajouté avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'ajout du film");
      console.error("Error adding movie:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setReleaseDate("");
    setMovieImageUrl("");
    setLength("");
    setTrailerUrl("");
    setMinimumAge("");
    setPublishingState("");
    setMovieFavorite(false);
    setScheduledDate("");
    setPremiereDate("");
    setSelectedCategories([]);
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

  if (isLoadingCategories) return <LoaderFull />;
  if (isErrorCategories) return <p>Error fetching categories.</p>;

  if (!isWednesday) {
    return (
      <div className="py-10 mb-8">
        <main>
          <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-3xl font-bold leading-tight tracking-tight">
                    Ajouter un film
                  </h1>
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
                <div className="rounded-md bg-white inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="min-w-full divide-y divide-gray-300">
                    <div className="box-border border border-solid rounded-md border-[#e5e7eb] py-4 text-center">
                      <p className="text-base text-gray-600">
                        Les films ne peuvent être ajoutés que le mercredi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="py-10 mb-8">
      <main>
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  Ajouter un film
                </h1>
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
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-12">
                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
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
                                value={release_date}
                                onChange={(e) => setReleaseDate(e.target.value)}
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
                                value={minimumAge}
                                onChange={(e) => setMinimumAge(e.target.value)}
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
                                value={trailerUrl}
                                onChange={(e) => setTrailerUrl(e.target.value)}
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
                                value={publishingState}
                                onChange={(e) =>
                                  setPublishingState(e.target.value)
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

                          {publishingState === "premiere" && (
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

                          {(publishingState === "active" ||
                            publishingState === "premiere") && (
                            <div className="sm:col-span-3">
                              <label
                                htmlFor="scheduledDate"
                                className="block text-sm font-medium leading-6"
                              >
                                Date de la diffusion*
                              </label>
                              <div className="mt-2">
                                <input
                                  type="date"
                                  name="scheduledDate"
                                  id="scheduledDate"
                                  value={scheduledDate}
                                  onChange={(e) =>
                                    setScheduledDate(e.target.value)
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
                                value={length}
                                onChange={(e) => setLength(e.target.value)}
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
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
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
                          className="block rounded-md px-3 py-2 text-center text-white text-sm bg-green-700 hover:bg-green-800"
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          className="block rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm bg-gray-300 text-gray-600 hover:bg-gray-400"
                          onClick={resetForm}
                        >
                          Réinitialiser
                        </button>
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

export default MovieAdd;
