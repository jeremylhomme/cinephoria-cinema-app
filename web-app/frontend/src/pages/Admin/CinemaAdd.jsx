import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import { useCreateCinemaMutation } from "../../redux/api/cinemaApiSlice";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const CinemaAdd = () => {
  const [cinemaName, setCinemaName] = useState("");
  const [cinemaEmail, setCinemaEmail] = useState("");
  const [cinemaAddress, setCinemaAddress] = useState("");
  const [cinemaPostalCode, setCinemaPostalCode] = useState("");
  const [cinemaCity, setCinemaCity] = useState("");
  const [cinemaCountry, setCinemaCountry] = useState("");
  const [cinemaTelNumber, setCinemaTelNumber] = useState("");
  const [cinemaStartTimeOpening, setCinemaStartTimeOpening] = useState("");
  const [cinemaEndTimeOpening, setCinemaEndTimeOpening] = useState("");

  const [createCinema, { isLoading }] = useCreateCinemaMutation();

  const handleSubmit = async (event) => {
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
      await createCinema({
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

      resetForm();

      toast.success("Le cinéma a été ajouté avec succès");
    } catch (error) {
      toast.error("Une erreur s'est produite lors de l'ajout du cinéma.");
      console.error("Error adding cinema:", error);
    }
  };

  const resetForm = () => {
    setCinemaName("");
    setCinemaEmail("");
    setCinemaAddress("");
    setCinemaPostalCode("");
    setCinemaCity("");
    setCinemaCountry("");
    setCinemaTelNumber("");
    setCinemaStartTimeOpening("");
    setCinemaEndTimeOpening("");
  };

  if (isLoading) return <LoaderFull />;

  return (
    <div className="py-10">
      <main>
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <header className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight tracking-tight">
                Ajouter un cinéma
              </h1>
              <div className="sm:flex sm:items-center">
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                  <Link
                    to="/admin/cinemalist"
                    className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                  >
                    Retour
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-7xl sm:px-6 lg:px-8"
          >
            <div className="space-y-8 divide-y divide-gray-200">
              <div className="mt-12 bg-white rounded-md py-12 px-8 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label
                    htmlFor="cinemaName"
                    className="block text-sm font-medium"
                  >
                    Nom
                  </label>
                  <input
                    type="text"
                    id="cinemaName"
                    name="cinemaName"
                    required
                    value={cinemaName}
                    onChange={(e) => setCinemaName(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Ex : Cinéphoria Paris
                  </p>
                </div>

                <div className="sm:col-span-1">
                  <label
                    htmlFor="cinemaEmail"
                    className="block text-sm font-medium"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="cinemaEmail"
                    name="cinemaEmail"
                    required
                    value={cinemaEmail}
                    onChange={(e) => setCinemaEmail(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Ex : cinema@exemple.com
                  </p>
                </div>

                <div className="sm:col-span-1">
                  <label
                    htmlFor="cinemaAddress"
                    className="block text-sm font-medium"
                  >
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="cinemaAddress"
                    name="cinemaAddress"
                    required
                    value={cinemaAddress}
                    onChange={(e) => setCinemaAddress(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Ex : 1 rue de Paris
                  </p>
                </div>

                <div className="sm:col-span-1">
                  <label
                    htmlFor="cinemaPostalCode"
                    className="block text-sm font-medium"
                  >
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="cinemaPostalCode"
                    name="cinemaPostalCode"
                    required
                    value={cinemaPostalCode}
                    onChange={(e) => setCinemaPostalCode(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">Ex : 75000</p>
                </div>

                <div className="sm:col-span-1">
                  <label
                    htmlFor="cinemaCity"
                    className="block text-sm font-medium"
                  >
                    Ville
                  </label>
                  <input
                    type="text"
                    id="cinemaCity"
                    name="cinemaCity"
                    required
                    value={cinemaCity}
                    onChange={(e) => setCinemaCity(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">Ex : Paris</p>
                </div>

                <div className="sm:col-span-1">
                  <label
                    htmlFor="cinemaCountry"
                    className="block text-sm font-medium"
                  >
                    Pays
                  </label>
                  <input
                    type="text"
                    id="cinemaCountry"
                    name="cinemaCountry"
                    required
                    value={cinemaCountry}
                    onChange={(e) => setCinemaCountry(e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">Ex : France</p>
                </div>

                <div className="sm:col-span-1">
                  <label
                    htmlFor="cinemaTelNumber"
                    className="block text-sm font-medium"
                  >
                    Numéro de Téléphone
                  </label>
                  <PhoneInput
                    defaultCountry="FR"
                    id="cinemaTelNumber"
                    name="cinemaTelNumber"
                    required
                    value={cinemaTelNumber}
                    onChange={setCinemaTelNumber}
                    className="text-black mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Ex: +33(0) 1 12 34 56 78
                  </p>
                </div>

                <div className="sm:col-span-1">
                  <label
                    htmlFor="openingHours"
                    className="block text-sm font-medium"
                  >
                    Heures d'Ouverture
                  </label>
                  <div className="mt-2 flex">
                    <div className="mr-4">
                      <label
                        htmlFor="cinemaStartTimeOpening"
                        className="block text-sm font-medium"
                      >
                        De:
                      </label>
                      <input
                        type="time"
                        id="cinemaStartTimeOpening"
                        name="cinemaStartTimeOpening"
                        required
                        value={cinemaStartTimeOpening}
                        onChange={(e) =>
                          setCinemaStartTimeOpening(e.target.value)
                        }
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cinemaEndTimeOpening"
                        className="block text-sm font-medium"
                      >
                        À:
                      </label>
                      <input
                        type="time"
                        id="cinemaEndTimeOpening"
                        name="cinemaEndTimeOpening"
                        required
                        value={cinemaEndTimeOpening}
                        onChange={(e) =>
                          setCinemaEndTimeOpening(e.target.value)
                        }
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="block rounded-md bg-green-700 px-3 py-2 text-center text-sm text-white hover:bg-green-800"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  className="ml-4 block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                  onClick={resetForm}
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CinemaAdd;
