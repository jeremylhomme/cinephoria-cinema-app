import React from "react";
import { Link } from "react-router-dom";
import { useGetCinemasQuery } from "../redux/api/cinemaApiSlice";

import { lightLogo } from "../redux/constants";

const Footer = () => {
  const { data: cinemas, isLoading, isError } = useGetCinemasQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading cinema information</div>;
  }

  return (
    <footer className="bg-neutral-800 text-[#fafaf9] py-14 flex-shrink-0">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8">
          {/* First row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo and text */}
            <div>
              <div className="flex mb-4 lg:flex-1">
                <Link to="/" className="-m-1.5 p-1.5">
                  <span className="sr-only">Cinéphoria</span>
                  <img className="h-5 w-auto" src={lightLogo} alt="" />
                </Link>
              </div>
              <p className="text-gray-400 mb-4">
                Cinéphoria est un joyau du cinéma français. Fondé par des
                passionnés de cinéma.
              </p>
              <Link to="/movies" className="text-yellow-600 underline">
                Voir les films
              </Link>
            </div>

            {/* Liens utiles */}
            <div>
              <h3 className="text-xl font-semibold text-gray-50 mb-2">
                Liens utiles
              </h3>
              <ul className="grid gap-2 text-sm">
                <li>
                  <Link to="/cgv" className="text-gray-400">
                    CGV
                  </Link>
                </li>
                <li>
                  <Link to="/cgu" className="text-gray-400">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link to="/legal-notice" className="text-gray-400">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-gray-400">
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Second row - Cinemas */}
          <div>
            <h3 className="text-xl mb-4 text-gray-50 font-semibold">Cinémas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {cinemas.map((cinema) => (
                <div key={cinema.id}>
                  <p className="text-white mb-2 text-sm">
                    {cinema.cinemaCountry}
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>{cinema.cinemaName}</li>
                    <li className="text-gray-400">{cinema.cinemaAddress}</li>
                    <li className="text-gray-400">
                      {cinema.cinemaPostalCode} {cinema.cinemaCity}
                    </li>
                    <li className="text-gray-400">{cinema.cinemaTelNumber}</li>
                    <li className="text-gray-400">
                      {cinema.cinemaStartTimeOpening} -{" "}
                      {cinema.cinemaEndTimeOpening}
                    </li>
                    <li className="text-gray-400">{cinema.cinemaEmail}</li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
