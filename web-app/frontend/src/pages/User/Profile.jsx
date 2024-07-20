import React from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import LoaderFull from "../../components/LoaderFull";
import { Link } from "react-router-dom";
import { useUpdateUserProfileMutation } from "../../redux/api/userApiSlice";

const Profile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const id = userInfo.id;
  const [updateUserProfile] = useUpdateUserProfileMutation();

  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewUserPassword, setConfirmNewUserPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setUserFirstName(userInfo.userFirstName);
      setUserLastName(userInfo.userLastName);
      setUserEmail(userInfo.userEmail);
    }
  }, [userInfo]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const updateData = {
      userFirstName,
      userLastName,
      userEmail,
      userPassword: currentPassword,
      newPassword,
      confirmUserPassword: confirmNewUserPassword,
    };

    try {
      const response = await updateUserProfile({
        id: userInfo.id,
        ...updateData,
      });

      if (response.error) {
        if (response.error.data.message === "Current password is incorrect.") {
          toast.error("Le mot de passe actuel est incorrect.");
        } else {
          toast.error(
            `Impossible de mettre à jour le profil : ${response.error.data.message}`
          );
        }
      } else {
        if (
          response.data.message === "No changes were made to the user profile."
        ) {
          toast.info("Aucun changement n'a été apporté à votre profil");
        } else {
          toast.success("Votre profil a été mis à jour avec succès");
        }
      }
    } catch (error) {
      toast.error(`An unexpected error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoaderFull />}
      <div className="py-10">
        <div className="mx-auto py-16 max-w-4xl sm:px-6 lg:px-8 bg-white rounded-md shadow-sm">
          <header className="mb-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight tracking-tight">
                Profil
              </h1>
              <div className="sm:flex sm:items-center">
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                  <Link
                    to="/"
                    className="block rounded-md px-3 py-2 text-center text-sm bg-gray-200 text-gray-600 hover:bg-gray-300"
                  >
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="mt-8 flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <div className="min-w-full divide-y divide-gray-300">
                        <form>
                          <div className="space-y-12">
                            <div>
                              <div className="grid gap-x-6 gap-y-8">
                                <div>
                                  <label
                                    htmlFor="userFirstName"
                                    className="block text-sm font-medium leading-6"
                                  >
                                    Prénom
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      name="userFirstName"
                                      id="userFirstName"
                                      required
                                      value={userFirstName}
                                      onChange={(e) =>
                                        setUserFirstName(e.target.value)
                                      }
                                      className="block w-full shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-gray-300 rounded-md"
                                      aria-describedby="userFirstNameHelp"
                                    />
                                    <p
                                      id="userFirstNameHelp"
                                      className="mt-2 text-sm text-gray-500"
                                    >
                                      Votre prénom sera affiché publiquement.
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <label
                                    htmlFor="userFirstName"
                                    className="block text-sm font-medium leading-6"
                                  >
                                    Nom
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      name="userLastName"
                                      id="userLastName"
                                      required
                                      value={userLastName}
                                      onChange={(e) =>
                                        setUserLastName(e.target.value)
                                      }
                                      className="block w-full shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-gray-300 rounded-md"
                                      aria-describedby="userLastNameHelp"
                                    />
                                    <p
                                      id="userLastNameHelp"
                                      className="mt-2 text-sm text-gray-500"
                                    >
                                      Votre nom sera affiché publiquement.
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <label
                                    htmlFor="userEmail"
                                    className="block text-sm font-medium leading-6"
                                  >
                                    Email
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      name="userEmail"
                                      id="userEmail"
                                      required
                                      value={userEmail}
                                      onChange={(e) =>
                                        setUserEmail(e.target.value)
                                      }
                                      className="block w-full shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-gray-300 rounded-md"
                                      aria-describedby="userEmailHelp"
                                    />
                                    <p
                                      id="userEmailHelp"
                                      className="mt-2 text-sm text-gray-500"
                                    >
                                      Votre email sera affiché publiquement.
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <label
                                    htmlFor="userPassword"
                                    className="block text-sm font-medium leading-6"
                                  >
                                    Mot de passe actuel
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="password"
                                      name="userPassword"
                                      id="userPassword"
                                      value={currentPassword}
                                      onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                      }
                                      className="block w-full shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-gray-300 rounded-md"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label
                                    htmlFor="newUserPassword"
                                    className="block text-sm font-medium leading-6"
                                  >
                                    Nouveau mot de passe
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="password"
                                      name="newUserPassword"
                                      id="newUserPassword"
                                      value={newPassword}
                                      onChange={(e) =>
                                        setNewPassword(e.target.value)
                                      }
                                      className="block w-full shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-gray-300 rounded-md"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label
                                    htmlFor="confirmNewUserPassword"
                                    className="block text-sm font-medium leading-6"
                                  >
                                    Confirmation du mot de passe
                                  </label>
                                  <div className="mt-2">
                                    <input
                                      type="password"
                                      name="confirmNewUserPassword"
                                      id="confirmNewUserPassword"
                                      value={confirmNewUserPassword}
                                      onChange={(e) =>
                                        setConfirmNewUserPassword(
                                          e.target.value
                                        )
                                      }
                                      className="block w-full shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm border-gray-300 rounded-md"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <button
                                    type="submit"
                                    onClick={handleUpdate}
                                    className="block rounded-md bg-green-700 px-3 py-2 text-center text-sm  text-white hover:bg-green-800"
                                  >
                                    Mettre à jour
                                  </button>
                                </div>
                              </div>
                            </div>
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
      </div>
    </>
  );
};

export default Profile;
