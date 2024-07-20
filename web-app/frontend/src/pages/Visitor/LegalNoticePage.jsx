import React from "react";

const LegalNoticePage = () => {
  return (
    <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Mentions Légales
        </h2>
        <p className="mt-2 text-lg leading-8 text-gray-600">
          Consultez les mentions légales de notre site.
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-xl sm:mt-16">
        <h3 className="text-xl font-semibold leading-7 text-gray-900">
          1. Informations sur l'Éditeur
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          <strong>Nom de l'entreprise :</strong> Cinéphoria
          <br />
          <strong>Siège social :</strong> 10 Rue du Cinéma, 75000 Paris, France
          <br />
          <strong>Numéro d'immatriculation :</strong> SIRET 123 456 789 00012
          <br />
          <strong>Directeur de la publication :</strong> John Doe
          <br />
          <strong>Contact :</strong> bonjour@jeremylhomme.fr
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          2. Hébergement
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          <strong>Nom de l'hébergeur :</strong> WebHosting Inc.
          <br />
          <strong>Adresse :</strong> 123 Web Hosting Street, 75001 Paris, France
          <br />
          <strong>Contact :</strong> support@webhosting.com
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          3. Propriété Intellectuelle
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Tous les contenus présents sur le site sont protégés par les droits de
          propriété intellectuelle et sont la propriété de Cinéphoria ou de ses
          partenaires.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          4. Données Personnelles
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Cinéphoria s'engage à protéger vos données personnelles conformément à
          notre politique de confidentialité.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          5. Cookies
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Ce site utilise des cookies pour améliorer l'expérience utilisateur.
          En continuant à naviguer sur ce site, vous acceptez notre utilisation
          des cookies.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          6. Contact
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Pour toute question concernant les mentions légales, vous pouvez nous
          contacter à l'adresse suivante : bonjour@jeremylhomme.fr
        </p>
      </div>
    </div>
  );
};

export default LegalNoticePage;
