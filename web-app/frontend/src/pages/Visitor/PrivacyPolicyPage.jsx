import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Politique de Confidentialité
        </h2>
        <p className="mt-2 text-lg leading-8 text-gray-600">
          Veuillez lire attentivement notre politique de confidentialité.
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-xl sm:mt-16">
        <h3 className="text-xl font-semibold leading-7 text-gray-900">
          1. Collecte des Données Personnelles
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Cinéphoria collecte des données personnelles lorsque vous utilisez
          notre plateforme pour réserver des billets ou interagir avec nos
          services.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          2. Utilisation des Données
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Les données collectées sont utilisées pour améliorer nos services,
          traiter vos réservations, et vous informer des actualités de
          Cinéphoria.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          3. Partage des Données
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Cinéphoria ne partage pas vos données personnelles avec des tiers sans
          votre consentement, sauf si la loi l'exige.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          4. Sécurité des Données
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Nous mettons en place des mesures de sécurité techniques et
          organisationnelles pour protéger vos données contre tout accès non
          autorisé.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          5. Vos Droits
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Conformément à la législation en vigueur, vous avez le droit
          d'accéder, de rectifier, de supprimer et de vous opposer au traitement
          de vos données personnelles.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          6. Modifications de la Politique de Confidentialité
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Cinéphoria se réserve le droit de modifier la présente politique de
          confidentialité à tout moment. Les modifications seront publiées sur
          cette page.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          7. Contact
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Pour toute question concernant notre politique de confidentialité,
          vous pouvez nous contacter à l'adresse suivante :
          bonjour@jeremylhomme.fr
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
