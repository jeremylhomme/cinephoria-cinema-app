import React, { useState, useEffect } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGetMoviesQuery } from "../redux/api/movieApiSlice";
import { useGetCinemasQuery } from "../redux/api/cinemaApiSlice";
import LoaderFull from "../components/LoaderFull";
import queryString from "query-string";

import { backgroundVideoUrl } from "../redux/constants";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cinema, state } = queryString.parse(location.search);

  const {
    data: cinemas,
    isError: cinemasError,
    isLoading: cinemasLoading,
  } = useGetCinemasQuery();

  const [selectedCinema, setSelectedCinema] = useState(cinema || "");
  const [selectedState, setSelectedState] = useState(state || "all");

  const {
    data: moviesResponse,
    isError: moviesError,
    isLoading: moviesLoading,
    refetch: refetchMovies,
  } = useGetMoviesQuery(
    {
      state: selectedState,
      categories: ["all"],
      cinemaId: selectedCinema,
    },
    { skip: !selectedCinema }
  );

  useEffect(() => {
    const params = {
      cinema: selectedCinema || undefined,
      state: selectedState !== "all" ? selectedState : undefined,
    };

    navigate({
      pathname: location.pathname,
      search: queryString.stringify(params),
    });

    if (selectedCinema) {
      refetchMovies();
    }
  }, [
    selectedCinema,
    selectedState,
    navigate,
    location.pathname,
    refetchMovies,
  ]);

  if (cinemasLoading) return <LoaderFull />;
  if (cinemasError) return <div>Error loading cinemas</div>;

  const movies = moviesResponse?.movies ?? [];

  const getLastWednesday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysSinceLastWednesday = (dayOfWeek + 4) % 7;
    const lastWednesday = new Date(today);
    lastWednesday.setDate(today.getDate() - daysSinceLastWednesday);
    lastWednesday.setHours(0, 0, 0, 0);
    return lastWednesday;
  };

  const lastWednesday = getLastWednesday();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedCinemaData = cinemas?.find(
    (c) => c.id.toString() === selectedCinema
  );

  const filterMovies = (movies, category) => {
    const uniqueMovieIds = new Set();

    return movies.filter((movie) => {
      if (uniqueMovieIds.has(movie.id)) {
        return false;
      }

      const movieCreatedAt = new Date(movie.movieCreatedAt);
      const isAddedOnLastWednesday =
        movieCreatedAt >= lastWednesday &&
        movieCreatedAt <
          new Date(lastWednesday.getTime() + 24 * 60 * 60 * 1000);

      const hasFutureSessions = selectedCinemaData?.sessions.some(
        (session) =>
          new Date(session.sessionDate) >= today &&
          session.movie.id === movie.id
      );

      let shouldInclude = false;

      switch (category) {
        case "newReleases":
          shouldInclude =
            isAddedOnLastWednesday &&
            hasFutureSessions &&
            movie.moviePublishingState === "active";
          break;
        case "nowShowing":
          shouldInclude =
            !isAddedOnLastWednesday &&
            movie.moviePublishingState === "active" &&
            hasFutureSessions;
          break;
        case "premieres":
          shouldInclude =
            movie.moviePublishingState === "premiere" && hasFutureSessions;
          break;
        default:
          shouldInclude = false;
      }

      if (shouldInclude) {
        uniqueMovieIds.add(movie.id);
      }

      return shouldInclude;
    });
  };

  const newReleases = selectedCinemaData
    ? filterMovies(movies, "newReleases")
    : [];
  const nowShowingMovies = selectedCinemaData
    ? filterMovies(movies, "nowShowing")
    : [];
  const premiereMovies = selectedCinemaData
    ? filterMovies(movies, "premieres")
    : [];

  const formatSessionDates = (sessions) => {
    if (!sessions || sessions.length === 0) return "Aucune séance disponible";
    const uniqueDates = [
      ...new Set(
        sessions.map((session) => {
          const sessionDate = new Date(
            session.timeRanges[0].timeRangeStartTime
          );
          if (isNaN(sessionDate)) {
            return "Invalid Date";
          }
          return sessionDate.toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        })
      ),
    ];
    return uniqueDates.join(", ");
  };

  const faqs = [
    {
      question: "Comment puis-je réserver un billet de cinéma ?",
      answer:
        "Vous pouvez réserver un billet de cinéma en sélectionnant le film, l'heure de la séance et les sièges souhaités sur notre site web. Suivez les instructions pour compléter votre réservation.",
    },
    {
      question: "Quels modes de paiement sont acceptés ?",
      answer: "Nous acceptons les cartes de crédit/débit.",
    },
    {
      question: "Puis-je annuler ou modifier ma réservation ?",
      answer:
        "Oui, vous pouvez annuler ou modifier votre réservation jusqu'à une heure avant l'heure de la séance. Contactez-nous directement en renseignant votre numéro de réservation pour obtenir de l'aide.",
    },
    {
      question: "Dois-je imprimer mon billet ?",
      answer: `Non, vous pouvez générer le QR code de votre réservation depuis votre compte dan "Mes réservations". Nous vous recommandons de l'enregistrer sur votre appareil pour y accéder facilement.`,
    },

    {
      question: "Quelles sont les heures d'ouverture du cinéma ?",
      answer:
        "Les heures d'ouverture varient en fonction de l'emplacement du cinéma. Vous pourrez trouver les horaires de nos cinémas directement depuis le pied de page du site internet.",
    },
    {
      question: "Y a-t-il un parking disponible au cinéma ?",
      answer:
        "Oui, nous proposons des installations de parking dans la plupart de nos cinémas.",
    },
    {
      question: "Comment puis-je contacter le service client ?",
      answer:
        "Vous pouvez contacter notre équipe de service client via la page 'Contact' sur notre site web. Retrouvez également le numéro de téléphone et l'adresse e-mail de votre cinéma local dans le pied de page du site internet.",
    },
    {
      question:
        "Les aliments et boissons sont-ils autorisés à l'intérieur du cinéma ?",
      answer:
        "Oui, vous pouvez acheter des aliments et des boissons à nos stands de concession et les déguster à l'intérieur du cinéma. Les aliments et boissons extérieurs ne sont pas autorisés.",
    },
    {
      question:
        "Puis-je organiser un événement privé ou une projection au cinéma ?",
      answer:
        "Oui, nous offrons des services d'événements privés et de projections. Rendez-vous sur la page 'Contact' de notre site web pour obtenir plus d'informations.",
    },
  ];

  return (
    <div>
      <div className="relative w-full h-[80vh] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={backgroundVideoUrl}
          autoPlay
          loop
          muted
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
        >
          <source src={backgroundVideoUrl} type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70"></div>
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="text-white mb-4">
            <h1 className="text-2xl text-white font-bold mb-4">
              Le Joyau du Cinéma Français
            </h1>
            <Link to="/sessions">
              <button className="px-6 py-2 bg-red-700 text-white rounded hover:bg-red-800">
                Réserver une séance
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center w-full">
            <h2 className="text-3xl font-bold mb-6">Nos séances</h2>
            <select
              value={selectedCinema}
              onChange={(e) => setSelectedCinema(e.target.value)}
              className="mb-4 py-2 pl-4 pr-10 border rounded"
            >
              <option value="">Sélectionnez un cinéma</option>
              {cinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id.toString()}>
                  {cinema.cinemaName}
                </option>
              ))}
            </select>
          </div>

          {selectedCinema && moviesLoading && <LoaderFull />}
          {selectedCinema && moviesError && <div>Error loading movies</div>}

          {selectedCinema && !moviesLoading && !moviesError && (
            <>
              <h2 className="text-3xl font-bold my-6">Sorties de la semaine</h2>
              {newReleases.length === 0 ? (
                <p>Aucune nouveauté cette semaine.</p>
              ) : (
                <div className="border-t pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newReleases.map((movie) => (
                    <Link
                      key={movie.id}
                      to={`/movies/${movie.id}`}
                      className="group"
                    >
                      <div className="bg-white p-8 xl:p-10 rounded-md shadow-sm">
                        <img
                          src={movie.movieImg}
                          alt={movie.movieTitle}
                          className="w-full object-cover rounded-lg mb-4"
                        />
                        {movie.movieFavorite && (
                          <span className="w-fit py-1.5 px-2 mb-2 inline-flex items-center font-semibold text-white rounded-md text-xs bg-red-700">
                            Coup de coeur
                          </span>
                        )}
                        <h3 className="text-base font-semibold text-gray-900">
                          {movie.movieTitle}
                        </h3>
                        <p className="text-gray-400 mb-4">
                          {movie.categories
                            .map((category) => category.categoryName)
                            .join(", ")}
                        </p>
                        {movie.sessions && movie.sessions.length > 0 && (
                          <p className="text-gray-500">
                            {`Prochaines séances : ${formatSessionDates(
                              movie.sessions
                            )}`}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <h2 className="text-3xl font-bold mb-6 mt-14">À l'affiche</h2>
              {nowShowingMovies.length === 0 ? (
                <p>Aucun film à l'affiche pour le moment.</p>
              ) : (
                <div className="border-t pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                  {nowShowingMovies.map((movie) => (
                    <Link
                      key={movie.id}
                      to={`/movies/${movie.id}`}
                      className="group"
                    >
                      <div className="bg-white p-8 xl:p-10 rounded-md shadow-sm">
                        <img
                          src={movie.movieImg}
                          alt={movie.movieTitle}
                          className="w-full object-cover rounded-lg mb-4"
                        />
                        {movie.movieFavorite && (
                          <span className="w-fit py-1.5 px-2 mt-4 inline-flex items-center font-semibold text-white rounded-md text-xs bg-red-700">
                            Coup de coeur
                          </span>
                        )}
                        <h3 className="text-base font-semibold text-gray-900">
                          {movie.movieTitle}
                        </h3>
                        <p className="text-gray-400 mb-4">
                          {movie.categories
                            .map((category) => category.categoryName)
                            .join(", ")}
                        </p>
                        {movie.sessions && movie.sessions.length > 0 ? (
                          <p className="text-gray-500">
                            {`Prochaines séances : ${formatSessionDates(
                              movie.sessions
                            )}`}
                          </p>
                        ) : (
                          <p className="text-gray-500">
                            Aucune séance disponible
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <h2 className="text-3xl font-bold mb-6 mt-14">Avant-premières</h2>
              {premiereMovies.length === 0 ? (
                <p>Aucune avant-première pour le moment.</p>
              ) : (
                <div className="border-t pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {premiereMovies.map((movie) => (
                    <Link
                      key={movie.id}
                      to={`/movies/${movie.id}`}
                      className="group"
                    >
                      <div className="bg-white p-8 xl:p-10 rounded-md shadow-sm">
                        <img
                          src={movie.movieImg}
                          alt={movie.movieTitle}
                          className="w-full object-cover rounded-lg mb-4"
                        />
                        {movie.movieFavorite && (
                          <span className="w-fit py-1.5 px-2 mt-4 inline-flex items-center font-semibold text-white rounded-md text-xs bg-red-700">
                            Coup de coeur
                          </span>
                        )}
                        <h3 className="text-base font-semibold text-gray-900">
                          {movie.movieTitle}
                        </h3>
                        <p className="text-gray-400 mb-4">
                          {movie.categories
                            .map((category) => category.categoryName)
                            .join(", ")}
                        </p>
                        {movie.sessions && movie.sessions.length > 0 ? (
                          <p className="text-gray-500">
                            {`Prochaines séances : ${formatSessionDates(
                              movie.sessions
                            )}`}
                          </p>
                        ) : (
                          <p className="text-gray-500">
                            Aucune séance disponible
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
            <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
              Questions fréquentes
            </h2>
            <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
              {faqs.map((faq) => (
                <Disclosure as="div" key={faq.question} className="pt-6">
                  {({ open }) => (
                    <>
                      <dt>
                        <DisclosureButton className="flex w-full items-start justify-between text-left text-gray-900">
                          <span className="text-base font-semibold leading-7">
                            {faq.question}
                          </span>
                          <span className="ml-6 flex h-7 items-center">
                            {open ? (
                              <MinusIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            ) : (
                              <PlusIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                        </DisclosureButton>
                      </dt>
                      <DisclosurePanel as="dd" className="mt-2 pr-12">
                        <p className="text-base leading-7 text-gray-600">
                          {faq.answer}
                        </p>
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
