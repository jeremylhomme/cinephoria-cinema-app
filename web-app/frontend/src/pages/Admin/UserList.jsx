import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import LoaderFull from "../../components/LoaderFull";
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserPasswordMutation,
} from "../../redux/api/userApiSlice";

const UserList = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [createUser] = useCreateUserMutation();

  const [editableUserId, setEditableUserId] = useState(null);
  const [editableUserFirstName, setEditableUserFirstName] = useState("");
  const [editableUserLastName, setEditableUserLastName] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");
  const [editableUserRole, setEditableUserRole] = useState("");

  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");

  const [updateUserPassword] = useUpdateUserPasswordMutation();

  const [adminCount, setAdminCount] = useState(0);
  useEffect(() => {
    if (users) {
      const adminUsers = users.filter((user) => user.userRole === "admin");
      setAdminCount(adminUsers.length);
    }
  }, [users]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const toggleEdit = (id, userFirstName, userLastName, userEmail, userRole) => {
    if (userRole === "customer") {
      toast.error("Les comptes clients ne peuvent pas être modifiés.");
      return;
    }
    setEditableUserId(id);
    setEditableUserFirstName(userFirstName);
    setEditableUserLastName(userLastName);
    setEditableUserEmail(userEmail);
    setEditableUserRole(userRole);
  };

  const saveHandler = async () => {
    if (!newUserFirstName || !newUserLastName || !newEmail || !newRole) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    if (newRole === "customer") {
      toast.error("La création de comptes clients n'est pas autorisée ici.");
      return;
    }
    try {
      const response = await createUser({
        userFirstName: newUserFirstName,
        userLastName: newUserLastName,
        userEmail: newEmail,
        userRole: newRole,
        userUserName: newUserName,
      }).unwrap();

      setNewUserFirstName("");
      setNewUserLastName("");
      setNewEmail("");
      setNewRole("");
      setNewUserName("");
      refetch();
      toast.success(
        "Utilisateur ajouté avec succès ! Un email de vérification a été envoyé."
      );

      if (response.generatedPassword) {
        console.log("Generated password:", response.generatedPassword);
        toast.info(
          "Un mot de passe temporaire a été généré. L'utilisateur devra le changer lors de sa première connexion."
        );
      }
    } catch (err) {
      console.log(err);
      toast.error(
        `Échec de l'ajout de l'utilisateur : ${err.data?.message || err.status}`
      );
    }
  };

  const updateHandler = async (id) => {
    const user = users.find((u) => u.id === id);
    if (user.userRole === "customer") {
      toast.error("Les comptes clients ne peuvent pas être modifiés.");
      return;
    }
    try {
      const updatedUser = {
        id: id,
        userFirstName: editableUserFirstName,
        userLastName: editableUserLastName,
        userEmail: editableUserEmail,
        userRole: editableUserRole,
      };

      await updateUser(updatedUser).unwrap();
      setEditableUserId(null);
      refetch();
      toast.success("Utilisateur mis à jour avec succès !");
    } catch (err) {
      toast.error(`Échec de la mise à jour de l'utilisateur : ${err.status}`);
    }
  };

  const deleteHandler = async (id) => {
    const userToDelete = users.find((user) => user.id === id);

    if (userToDelete.userRole === "admin" && adminCount <= 1) {
      toast.error("Impossible de supprimer le dernier administrateur.");
      return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?")) {
      try {
        const userId = Number(id);
        if (isNaN(userId)) {
          toast.error("Invalid ID: Deletion not performed.");
          return;
        }
        await deleteUser(userId).unwrap();
        if (userToDelete.userRole === "admin") {
          setAdminCount((prevCount) => prevCount - 1);
        }
        refetch();
        toast.success("Utilisateur supprimé avec succès !");
      } catch (err) {
        toast.error(
          "Échec de la suppression de l'utilisateur. Veuillez réessayer."
        );
        console.error("Deletion error:", err);
      }
    }
  };

  const generateNewPasswordHandler = async (id) => {
    const user = users.find((u) => u.id === id);
    if (user.userRole === "customer") {
      toast.error(
        "Impossible de générer un nouveau mot de passe pour les clients."
      );
      return;
    }
    try {
      const response = await updateUserPassword({ id }).unwrap();
      toast.success(
        "Nouveau mot de passe généré avec succès ! L'utilisateur devra le changer lors de sa prochaine connexion."
      );
      refetch();
    } catch (err) {
      toast.error(
        `Échec de la génération du mot de passe : ${
          err.data?.message || err.status
        }`
      );
    }
  };

  if (isLoading) return <LoaderFull />;

  return (
    <>
      <div className="py-16">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight">
              Utilisateurs
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <p className="text-sm">
                    Ajoutez, modifiez ou supprimez les utilisateurs de
                    l'application.
                  </p>
                </div>
              </div>
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="bg-white my-4 inline-block min-w-full py-4 align-middle shadow-sm rounded-md border-[#e5e7eb] sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                          >
                            ID
                          </th>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                          >
                            Prénom
                          </th>
                          <th
                            scope="col"
                            className="pr-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Nom
                          </th>
                          <th
                            scope="col"
                            className="pr-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Nom d'utilisateur
                          </th>
                          <th
                            scope="col"
                            className="pr-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="pr-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Mot de passe
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Rôle
                          </th>
                          <th
                            scope="col"
                            className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                          >
                            <span className="sr-only">Modifier</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users &&
                          users.map((user) => (
                            <tr key={user.id}>
                              <td className="whitespace-nowrap py-5 text-sm">
                                {user.id}
                              </td>
                              <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                {editableUserId === user.id ? (
                                  <div className="flex items-center">
                                    <input
                                      type="text"
                                      value={editableUserFirstName}
                                      onChange={(e) =>
                                        setEditableUserFirstName(e.target.value)
                                      }
                                      placeholder="Prénom"
                                      className="w-full p-2 border rounded-lg text-sm text-gray-900"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <div className="font-medium">
                                      {user.userFirstName}{" "}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                {editableUserId === user.id ? (
                                  <div className="flex items-center">
                                    <input
                                      type="text"
                                      value={editableUserLastName}
                                      onChange={(e) =>
                                        setEditableUserLastName(e.target.value)
                                      }
                                      placeholder="Nom"
                                      className="w-full p-2 border rounded-lg text-sm text-gray-900"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <div className="font-medium">
                                      {user.userLastName}{" "}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                <div className="flex items-center">
                                  <div
                                    className={`inline-flex items-center rounded-md font-medium ${
                                      !user.userUserName
                                        ? "py-1.5 px-2 bg-gray-50 text-xs text-gray-700 ring-1 ring-inset ring-gray-600/20"
                                        : ""
                                    }`}
                                  >
                                    {user.userUserName
                                      ? user.userUserName
                                      : "Non défini"}
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                {editableUserId === user.id ? (
                                  <div className="flex items-center">
                                    <input
                                      type="text"
                                      value={editableUserEmail}
                                      onChange={(e) =>
                                        setEditableUserEmail(e.target.value)
                                      }
                                      placeholder="Email"
                                      className="w-full p-2 border rounded-lg text-sm text-gray-900"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <div className="font-medium">
                                      {user.userEmail}{" "}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="whitespace-nowrap pr-3 py-5 text-sm">
                                {user.userRole === "customer" ? (
                                  <span className="text-gray-500">*****</span>
                                ) : (
                                  <button
                                    onClick={() =>
                                      generateNewPasswordHandler(user.id)
                                    }
                                    className="text-blue-500 hover:underline"
                                  >
                                    Générer un nouveau mot de passe
                                  </button>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-5 text-sm">
                                {editableUserId === user.id ? (
                                  <div className="flex items-center">
                                    <select
                                      value={editableUserRole}
                                      onChange={(e) =>
                                        setEditableUserRole(e.target.value)
                                      }
                                      className="w-full p-2 border rounded-lg text-sm"
                                    >
                                      <option
                                        value=""
                                        disabled
                                        className="text-gray-900"
                                      >
                                        Rôle
                                      </option>
                                      <option value="admin">
                                        Administrateur
                                      </option>
                                      <option value="employee">Employé</option>
                                      <option value="customer">Client</option>
                                    </select>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <div className="font-medium">
                                      {user.userRole === "admin"
                                        ? "Administrateur"
                                        : user.userRole === "employee"
                                        ? "Employé"
                                        : user.userRole === "customer"
                                        ? "Client"
                                        : ""}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                {user.userRole !== "customer" &&
                                editableUserId === user.id ? (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => updateHandler(user.id)}
                                      className="block rounded-md bg-green-700 px-3 py-2 text-center text-sm  text-white hover:bg-green-800"
                                    >
                                      Enregistrer
                                    </button>
                                    <button
                                      onClick={() => setEditableUserId(null)}
                                      className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <NavLink
                                      to={`/admin/user-details/${user.id}`}
                                      className="text-gray-500 hover:text-gray-400"
                                      data-testid="EyeIcon"
                                    >
                                      <EyeIcon className="h-5 w-5" />
                                    </NavLink>
                                    {user.userRole !== "customer" && (
                                      <button
                                        onClick={() =>
                                          toggleEdit(
                                            user.id,
                                            user.userFirstName,
                                            user.userLastName,
                                            user.userEmail,
                                            user.userRole
                                          )
                                        }
                                        className="text-gray-500 hover:text-gray-400"
                                        data-testid="PencilSquareIcon"
                                      >
                                        <PencilSquareIcon className="h-5 w-5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteHandler(user.id)}
                                      className="text-gray-500 hover:text-gray-400"
                                      data-testid="TrashIcon"
                                    >
                                      <TrashIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        <tr>
                          <td className="whitespace-nowrap pr-3 py-5 text-sm text-gray-500">
                            <label
                              className="text-gray-700 font-medium"
                              htmlFor="id"
                            >
                              ID
                            </label>
                          </td>
                          <td className="whitespace-nowrap pr-3 py-5 text-sm text-gray-500">
                            <input
                              type="text"
                              value={newUserFirstName}
                              onChange={(e) =>
                                setNewUserFirstName(e.target.value)
                              }
                              placeholder="Prénom"
                              className="w-full p-2 border rounded-lg text-sm text-gray-900"
                            />
                          </td>
                          <td className="whitespace-nowrap pr-3 py-5 text-sm text-gray-500">
                            <input
                              type="text"
                              value={newUserLastName}
                              onChange={(e) =>
                                setNewUserLastName(e.target.value)
                              }
                              placeholder="Nom"
                              className="w-full p-2 border rounded-lg text-sm text-gray-900"
                            />
                          </td>
                          <td className="whitespace-nowrap pr-3 py-5 text-sm text-gray-500">
                            <input
                              type="text"
                              value={newUserName}
                              onChange={(e) => setNewUserName(e.target.value)}
                              placeholder="Nom d'utilisateur"
                              className="w-full p-2 border rounded-lg text-sm text-gray-900"
                            />
                          </td>
                          <td className="whitespace-nowrap pr-3 py-5 text-sm text-gray-500">
                            <input
                              type="text"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder="Email"
                              className="w-full p-2 border rounded-lg text-sm text-gray-900"
                            />
                          </td>
                          <td className="whitespace-nowrap pr-3 py-5 text-sm text-gray-500">
                            <div className="flex items-center">
                              <span className="text-gray-900">
                                Généré automatiquement
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                            <select
                              value={newRole}
                              onChange={(e) => setNewRole(e.target.value)}
                              className="w-full p-2 border rounded-lg text-sm text-gray-900"
                            >
                              <option value="" disabled>
                                Role
                              </option>
                              <option value="admin">Administrateur</option>
                              <option value="employee">Employé</option>
                            </select>
                          </td>

                          <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => saveHandler()}
                                className={`block rounded-md px-3 py-2 text-center text-sm ${
                                  newUserFirstName &&
                                  newUserLastName &&
                                  newEmail &&
                                  newRole
                                    ? "bg-green-700 text-white hover:bg-green-800"
                                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                }`}
                                disabled={
                                  !newUserFirstName ||
                                  !newUserLastName ||
                                  !newEmail ||
                                  !newRole
                                }
                              >
                                Ajouter
                              </button>
                            </div>
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
    </>
  );
};

export default UserList;
