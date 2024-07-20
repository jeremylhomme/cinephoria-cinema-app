import React from "react";
import { Link } from "react-router-dom";

const IncidentList = () => {
  return (
    <div className="pt-16 pb-24">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight">
            Liste des incidents
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="bg-white rounded-md shadow-sm p-8">
            <p className="text-center mb-6">
              Pour voir la liste des incidents, veuillez télécharger
              l'application bureautique selon votre système d'exploitation
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="#"
                className="inline-block rounded-md bg-green-700 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
              >
                Télécharger pour Windows
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncidentList;
