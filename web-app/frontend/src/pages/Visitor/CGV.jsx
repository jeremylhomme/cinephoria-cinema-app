import React from "react";

const CGVPage = () => {
  return (
    <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Conditions Générales de Vente
        </h2>
        <p className="mt-2 text-lg leading-8 text-gray-600">
          Veuillez lire attentivement nos conditions générales de vente.
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-xl sm:mt-16">
        <h3 className="text-xl font-semibold leading-7 text-gray-900">
          1. Informations sur l'Entreprise
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          <strong>Dénomination sociale :</strong> Cinéphoria
          <br />
          <strong>Siège social :</strong> 10 Rue du Cinéma, 75000 Paris, France
          <br />
          <strong>Numéro d'immatriculation :</strong> SIRET 123 456 789 00012
          <br />
          <strong>Coordonnées :</strong>
          <br />- <strong>Adresse e-mail :</strong> contact@cinephoria.fr
          <br />- <strong>Numéro de téléphone :</strong> +33 1 23 45 67 89
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          2. Informations sur les Cinémas
        </h3>
        {[
          {
            cinemaName: "Cinéphoria Nantes",
            cinemaEmail: "nantes@cinephoria.jeremylhomme.fr",
            cinemaAddress: "1 Rue de Nantes",
            cinemaPostalCode: "44000",
            cinemaCity: "Nantes",
            cinemaCountry: "France",
            cinemaTelNumber: "+33 2 40 00 00 01",
            cinemaStartTimeOpening: "09:00",
            cinemaEndTimeOpening: "23:00",
          },
          {
            cinemaName: "Cinéphoria Paris",
            cinemaEmail: "paris@cinephoria.jeremylhomme.fr",
            cinemaAddress: "2 Avenue des Champs-Élysées",
            cinemaPostalCode: "75008",
            cinemaCity: "Paris",
            cinemaCountry: "France",
            cinemaTelNumber: "+33 1 40 00 00 02",
            cinemaStartTimeOpening: "10:00",
            cinemaEndTimeOpening: "22:00",
          },
          {
            cinemaName: "Cinéphoria Bordeaux",
            cinemaEmail: "bordeaux@cinephoria.jeremylhomme.fr",
            cinemaAddress: "3 Place de la Bourse",
            cinemaPostalCode: "33000",
            cinemaCity: "Bordeaux",
            cinemaCountry: "France",
            cinemaTelNumber: "+33 5 40 00 00 03",
            cinemaStartTimeOpening: "11:00",
            cinemaEndTimeOpening: "23:00",
          },
          {
            cinemaName: "Cinéphoria Lille",
            cinemaEmail: "lille@cinephoria.jeremylhomme.fr",
            cinemaAddress: "4 Grand Place",
            cinemaPostalCode: "59000",
            cinemaCity: "Lille",
            cinemaCountry: "France",
            cinemaTelNumber: "+33 3 20 00 00 04",
            cinemaStartTimeOpening: "09:00",
            cinemaEndTimeOpening: "21:00",
          },
          {
            cinemaName: "Cinéphoria Toulouse",
            cinemaEmail: "toulouse@cinephoria.jeremylhomme.fr",
            cinemaAddress: "5 Place du Capitole",
            cinemaPostalCode: "31000",
            cinemaCity: "Toulouse",
            cinemaCountry: "France",
            cinemaTelNumber: "+33 5 34 00 00 05",
            cinemaStartTimeOpening: "08:00",
            cinemaEndTimeOpening: "20:00",
          },
          {
            cinemaName: "Cinéphoria Charleroi",
            cinemaEmail: "charleroi@cinephoria.jeremylhomme.fr",
            cinemaAddress: "6 Rue de la Montagne",
            cinemaPostalCode: "6000",
            cinemaCity: "Charleroi",
            cinemaCountry: "Belgium",
            cinemaTelNumber: "+32 71 00 00 06",
            cinemaStartTimeOpening: "10:00",
            cinemaEndTimeOpening: "22:00",
          },
          {
            cinemaName: "Cinéphoria Liège",
            cinemaEmail: "liege@cinephoria.jeremylhomme.fr",
            cinemaAddress: "7 Place Saint-Lambert",
            cinemaPostalCode: "4000",
            cinemaCity: "Liège",
            cinemaCountry: "Belgium",
            cinemaTelNumber: "+32 4 00 00 07",
            cinemaStartTimeOpening: "09:00",
            cinemaEndTimeOpening: "21:00",
          },
        ].map((cinema, index) => (
          <div key={index} className="mt-4">
            <p className="text-base leading-7 text-gray-600">
              <strong>{cinema.cinemaName} :</strong>
              <br />
              {cinema.cinemaAddress}, {cinema.cinemaPostalCode}{" "}
              {cinema.cinemaCity}, {cinema.cinemaCountry}
              <br />
              <strong>Email :</strong> {cinema.cinemaEmail}
              <br />
              <strong>Téléphone :</strong> {cinema.cinemaTelNumber}
              <br />
              <strong>Horaires d'ouverture :</strong>{" "}
              {cinema.cinemaStartTimeOpening} - {cinema.cinemaEndTimeOpening}
            </p>
          </div>
        ))}

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          3. Conditions de Réservation et d'Achat de Billets
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Les réservations et achats de billets peuvent être effectués
          directement sur notre plateforme web.
          <br />
          <strong>Modes de paiement acceptés :</strong> Carte bancaire
          uniquement
          <br />
          <strong>Politique de remboursement et d'annulation :</strong>
          <br />
          - Les billets ne sont ni échangeables ni remboursables, sauf en cas
          d'annulation de la séance par Cinéphoria.
          <br />
          - En cas de problème technique empêchant la projection du film, les
          billets seront remboursés intégralement.
          <br />
          <strong>Validité des billets :</strong> Les billets sont valables
          uniquement pour la date et l'heure de la séance réservée.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          4. Tarification
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          <strong>Prix des billets :</strong>
          <br />
          Le prix des billets varient en fonction de la qualité de la séance, du
          cinéma et du nombre de places réservées.
          <br />
          <strong>Frais supplémentaires :</strong> Aucun frais de réservation en
          ligne
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          5. Utilisation de la Plateforme
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          <strong>Conditions d'inscription :</strong> L'inscription sur la
          plateforme est obligatoire pour réserver des billets. Les utilisateurs
          doivent fournir des informations exactes et à jour.
          <br />
          <strong>Droits et obligations des utilisateurs :</strong>
          <br />
          - Les utilisateurs s'engagent à utiliser la plateforme de manière
          légale et appropriée.
          <br />
          - Les utilisateurs doivent conserver leur mot de passe confidentiel et
          ne pas le partager avec des tiers.
          <br />
          <strong>
            Conditions d'utilisation des fonctionnalités de la plateforme :
          </strong>
          <br />- Les utilisateurs peuvent consulter les horaires des séances,
          visualiser tous les films projetés dans au moins un cinéma, commander
          des billets, et noter les séances.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          6. Politique de Confidentialité et de Protection des Données
          Personnelles
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Cinéphoria s'engage à protéger les données personnelles des
          utilisateurs conformément à la législation en vigueur. Les données
          collectées sont utilisées uniquement pour les besoins de la
          réservation et de l'amélioration des services.
          <br />
          <strong>Mesures de sécurité :</strong> Des mesures de sécurité
          techniques et organisationnelles sont mises en place pour protéger les
          données contre tout accès non autorisé.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          7. Responsabilité
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          <strong>Responsabilité de Cinéphoria :</strong>
          <br />
          - Cinéphoria n'est pas responsable en cas de problèmes techniques
          indépendants de sa volonté.
          <br />
          - Cinéphoria décline toute responsabilité en cas d'erreurs commises
          par les utilisateurs lors de la réservation.
          <br />
          <strong>Responsabilité des utilisateurs :</strong> Les utilisateurs
          sont responsables des informations qu'ils fournissent et de
          l'utilisation qu'ils font de la plateforme.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          8. Droits de Propriété Intellectuelle
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Tous les contenus présents sur la plateforme (textes, images, vidéos,
          etc.) sont la propriété de Cinéphoria ou de ses partenaires et sont
          protégés par les droits de propriété intellectuelle.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          9. Loi Applicable et Juridiction Compétente
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Les présentes CGV sont soumises à la loi française. En cas de litige,
          les tribunaux de Paris seront seuls compétents.
        </p>

        <h3 className="text-xl font-semibold leading-7 text-gray-900 mt-10">
          10. Service Client
        </h3>
        <p className="mt-2 text-base leading-7 text-gray-600">
          Pour toute question ou réclamation, vous pouvez contacter notre
          service client :<br />- <strong>Adresse e-mail :</strong>{" "}
          bonjour@jeremylhomme.fr
          <br />- <strong>Numéro de téléphone :</strong> +33 1 23 45 67 89
        </p>
      </div>
    </div>
  );
};

export default CGVPage;
