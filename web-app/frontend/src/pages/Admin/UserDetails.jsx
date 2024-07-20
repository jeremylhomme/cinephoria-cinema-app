import React from "react";
import { Link, useParams } from "react-router-dom";
import LoaderFull from "../../components/LoaderFull";
import { useGetUserDetailsQuery } from "../../redux/api/userApiSlice";

const UserDetails = () => {
  const { id } = useParams();
  const { data: user, isLoading, isError } = useGetUserDetailsQuery(id);

  if (isLoading) return <LoaderFull />;
  if (isError) return <p>Error fetching user details.</p>;

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

  return (
    <div className="py-10">
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 sm:px-6">
            <div className="max-w-lg mx-auto sm:flex sm:items-center justify-between">
              <header>
                <div className="max-w-7xl">
                  <h1 className="text-3xl font-bold leading-tight tracking-tight">
                    Détails de l'utilisateur
                  </h1>
                </div>
              </header>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                  to="/admin/user-list"
                  className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                >
                  Retour
                </Link>
              </div>
            </div>

            <div className="mt-8 flow-root">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="bg-white px-8 py-8 my-6 rounded-md sm:mx-auto sm:w-full sm:max-w-lg shadow-sm">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0 w-1/2"
                        >
                          Champ
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 px-3 text-left text-sm font-semibold w-1/2"
                        >
                          Valeur
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          ID
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {user.id}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Rôle
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {user.userRole === "admin"
                            ? "Administrateur"
                            : user.userRole === "employee"
                            ? "Employé"
                            : "Client"}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Prénom
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {user.userFirstName}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Nom
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {user.userLastName}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Email
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {user.userEmail}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Date d'ajout
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {formatDate(user.userCreatedAt)}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Date de mise à jour
                        </td>
                        <td className="whitespace-normal py-4 px-3 text-sm w-1/2">
                          {formatDate(user.userUpdatedAt)}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Adresse e-mail vérifiée
                        </td>
                        <td
                          className={`my-3.5 py-1.5 px-2 ml-2 inline-flex items-center rounded-md text-xs font-medium ${
                            user.isVerified
                              ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                              : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                          }`}
                        >
                          {user.isVerified ? "Oui" : "Non"}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          Politique de confidentialité
                        </td>
                        <td
                          className={`my-3.5 py-1.5 px-2 ml-2 inline-flex items-center rounded-md text-xs font-medium ${
                            user.agreedPolicy
                              ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                              : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                          }`}
                        >
                          {user.agreedPolicy ? "Acceptée" : "Non acceptée"}
                        </td>
                      </tr>
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 w-1/2">
                          CGV/CGU
                        </td>
                        <td
                          className={`my-3.5 py-1.5 px-2 ml-2 inline-flex items-center rounded-md text-xs font-medium ${
                            user.agreedCgvCgu
                              ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                              : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                          }`}
                        >
                          {user.agreedCgvCgu ? "Acceptés" : "Non acceptés"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDetails;
