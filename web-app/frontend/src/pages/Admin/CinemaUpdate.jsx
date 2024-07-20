import React, { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import {
  useUpdateCinemaMutation,
  useGetCinemaDetailsQuery,
} from "../../redux/api/cinemaApiSlice";
import PhoneInput from "react-phone-number-input";

const CinemaUpdate = () => {
  const { id } = useParams();

  const [updateCinema] = useUpdateCinemaMutation();
  const {
    data: cinema,
    isFetching,
    isErrorCinemas,
  } = useGetCinemaDetailsQuery(id);

  const [cinemaName, setCinemaName] = useState("");
  const [cinemaEmail, setCinemaEmail] = useState("");
  const [cinemaAddress, setCinemaAddress] = useState("");
  const [cinemaPostalCode, setCinemaPostalCode] = useState("");
  const [cinemaCity, setCinemaCity] = useState("");
  const [cinemaCountry, setCinemaCountry] = useState("");
  const [cinemaTelNumber, setCinemaTelNumber] = useState("");
  const [cinemaStartTimeOpening, setCinemaStartTimeOpening] = useState("");
  const [cinemaEndTimeOpening, setCinemaEndTimeOpening] = useState("");

  useEffect(() => {
    if (cinema) {
      setCinemaName(cinema.cinemaName);
      setCinemaEmail(cinema.cinemaEmail);
      setCinemaAddress(cinema.cinemaAddress);
      setCinemaPostalCode(cinema.cinemaPostalCode);
      setCinemaCity(cinema.cinemaCity);
      setCinemaCountry(cinema.cinemaCountry);
      setCinemaTelNumber(cinema.cinemaTelNumber);
      setCinemaStartTimeOpening(cinema.cinemaStartTimeOpening);
      setCinemaEndTimeOpening(cinema.cinemaEndTimeOpening);
    }
  }, [cinema]);

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (
      !cinemaName ||
      !cinemaEmail ||
      !cinemaAddress ||
      !cinemaPostalCode ||
      !cinemaCity ||
      !cinemaCountry ||
      !cinemaTelNumber ||
      !cinemaStartTimeOpening ||
      !cinemaEndTimeOpening
    ) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const updatedCinema = await updateCinema({
        id: cinema.id,
        cinemaName,
        cinemaEmail,
        cinemaAddress,
        cinemaPostalCode,
        cinemaCity,
        cinemaCountry,
        cinemaTelNumber,
        cinemaStartTimeOpening,
        cinemaEndTimeOpening,
      }).unwrap();

      toast.success("Le cinéma a été mis à jour avec succès !");
    } catch (error) {
      toast.error(
        "Échec de la mise à jour du cinéma : " + error.data?.error.message
      );
    }
  };

  if (isFetching) return <LoaderFull />;
  if (isErrorCinemas)
    return <p>Erreur lors du chargement des détails du cinéma.</p>;

  return (
    <div className="py-10 mb-8">
      <main>
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-3xl font-bold leading-tight tracking-tight">
                  Mettre à jour un cinéma
                </h1>
                <div className="mt-4">
                  <p className="text-sm">
                    Cinéma ajouté le{" "}
                    {new Date(cinema.cinemaCreatedAt).toLocaleDateString(
                      "fr-FR"
                    )}
                  </p>
                  <p className="text-sm">
                    Dernière mise à jour le{" "}
                    {new Date(cinema.cinemaUpdatedAt).toLocaleDateString(
                      "fr-FR"
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <NavLink
                  to="/admin/cinema-list"
                  className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                >
                  Retour
                </NavLink>
              </div>
            </div>
            <div className="mt-12 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="rounded-md bg-white inline-block min-w-full py-2 align-middle px-4 sm:px-6 lg:px-8">
                  <div className="min-w-full divide-y divide-gray-300">
                    <form onSubmit={handleUpdate}>
                      <div className="space-y-12">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium leading-6"
                            >
                              Nom*
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="name"
                                id="cinemaName"
                                required
                                value={cinemaName}
                                onChange={(e) => setCinemaName(e.target.value)}
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Ex : Cinéma Paradiso
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium leading-6"
                            >
                              Email*
                            </label>
                            <div className="mt-2">
                              <input
                                type="email"
                                name="cinemaEmail"
                                id="cinemaEmail"
                                required
                                value={cinemaEmail}
                                onChange={(e) => setCinemaEmail(e.target.value)}
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Ex : contact@cinemaparadiso.com
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="address"
                              className="block text-sm font-medium leading-6"
                            >
                              Adresse*
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="cinemaAddress"
                                id="cinemaAddress"
                                required
                                value={cinemaAddress}
                                onChange={(e) =>
                                  setCinemaAddress(e.target.value)
                                }
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Ex : 123 Rue de Paris
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="postalCode"
                              className="block text-sm font-medium leading-6"
                            >
                              Code postal*
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="cinemaPostalCode"
                                id="cinemaPostalCode"
                                required
                                value={cinemaPostalCode}
                                onChange={(e) =>
                                  setCinemaPostalCode(e.target.value)
                                }
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Ex : 75001
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="city"
                              className="block text-sm font-medium leading-6"
                            >
                              Ville*
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="cinemaCity"
                                id="cinemaCity"
                                required
                                value={cinemaCity}
                                onChange={(e) => setCinemaCity(e.target.value)}
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Ex : Paris
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="country"
                              className="block text-sm font-medium leading-6"
                            >
                              Pays*
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="cinemaCountry"
                                id="cinemaCountry"
                                required
                                value={cinemaCountry}
                                onChange={(e) =>
                                  setCinemaCountry(e.target.value)
                                }
                                className="max-w-lg block w-full shadow-sm bg-transparent focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Ex : France
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="telNumber"
                              className="block text-sm font-medium leading-6"
                            >
                              Numéro de téléphone*
                            </label>
                            <div className="mt-2">
                              <PhoneInput
                                defaultCountry="FR"
                                name="cinemaTelNumber"
                                id="cinemaTelNumber"
                                required
                                value={cinemaTelNumber}
                                onChange={setCinemaTelNumber}
                                className="max-w-lg block w-full shadow-sm focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-400">
                              Ex : +33 1 23 45 67 89
                            </p>
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="openingHours"
                              className="block text-sm font-medium leading-6"
                            >
                              Heures d'ouverture*
                            </label>
                            <div className="mt-2 flex">
                              <div className="mr-4">
                                <input
                                  type="time"
                                  name="cinemaStartTimeOpening"
                                  id="cinemaStartTimeOpening"
                                  required
                                  value={cinemaStartTimeOpening}
                                  onChange={(e) =>
                                    setCinemaStartTimeOpening(e.target.value)
                                  }
                                  className="max-w-lg block w-full shadow-sm focus:ring-yellow-600 focus:border-yellow-600 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                                />
                                <p className="mt-2 text-sm leading-6 text-gray-400">
                                  De :
                                </p>
                              </div>
                              <div>
                                <input
                                  type="time"
                                  name="cinemaEndTimeOpening"
                                  id="cinemaEndTimeOpening"
                                  required
                                  value={cinemaEndTimeOpening}
                                  onChange={(e) =>
                                    setCinemaEndTimeOpening(e.target.value)
                                  }
                                  className="max-w-lg block w-full shadow-sm focus:ring-yellow-600 focus:border-yellow-600 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                                />
                                <p className="mt-2 text-sm leading-6 text-gray-400">
                                  À :
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pb-6 flex items-center justify-center gap-x-4">
                        <button
                          type="submit"
                          className="block rounded-md bg-green-700 px-3 py-2 text-center text-sm text-white hover:bg-green-800"
                        >
                          Enregistrer
                        </button>
                        <NavLink
                          to="/admin/cinema-list"
                          className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                        >
                          Retour
                        </NavLink>
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

export default CinemaUpdate;
