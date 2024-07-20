import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useUpdateFirstLoginPasswordMutation,
  useLogoutMutation,
} from "../../redux/api/userApiSlice";
import { logout } from "../../redux/features/auth/authSlice";
import Loader from "../../components/Loader";
import { goldIcon } from "../../redux/constants";
import { useNavigate } from "react-router-dom";

const FirstLogin = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [updatePassword, { isLoading }] = useUpdateFirstLoginPasswordMutation();
  const [logoutApiCall] = useLogoutMutation();

  const validatePassword = (password) => {
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    if (!/[a-z]/.test(password)) {
      toast.error(
        "Le mot de passe doit contenir au moins une lettre minuscule"
      );
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error(
        "Le mot de passe doit contenir au moins une lettre majuscule"
      );
      return false;
    }
    if (!/[0-9]/.test(password)) {
      toast.error("Le mot de passe doit contenir au moins un chiffre");
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error(
        "Le mot de passe doit contenir au moins un caractère spécial"
      );
      return false;
    }
    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (!validatePassword(newPassword)) {
      return;
    }

    try {
      await updatePassword({
        id: userInfo.id,
        newPassword,
      }).unwrap();

      await logoutApiCall().unwrap();
      dispatch(logout());
      toast.success(
        "Mot de passe mis à jour avec succès. Veuillez vous connecter avec votre nouveau mot de passe."
      );
      navigate("/login");
    } catch (error) {
      toast.error("Échec de la mise à jour du mot de passe");
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-12 w-auto" src={goldIcon} alt="Cinéphoria" />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
          Bienvenue {userInfo.userFirstName} !
        </h2>
        <p className="mt-2 text-center text-base text-gray-600">
          Veuillez définir un nouveau mot de passe pour continuer. Le mot de
          passe doit contenir au moins 8 caractères, une lettre majuscule, une
          lettre minuscule, un chiffre et un caractère spécial.
        </p>
      </div>

      <div className="bg-white p-8 rounded-md sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={submitHandler}>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium leading-6"
            >
              Nouveau mot de passe
            </label>
            <div className="mt-2">
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                value={newPassword}
                placeholder="Entrez votre nouveau mot de passe"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-sm font-medium leading-6"
            >
              Confirmer le nouveau mot de passe
            </label>
            <div className="mt-2">
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                required
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                value={confirmNewPassword}
                placeholder="Confirmez votre nouveau mot de passe"
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="!mt-10">
            <button
              disabled={isLoading}
              type="submit"
              className="flex w-full justify-center rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            >
              {isLoading ? <Loader /> : "Mettre à jour le mot de passe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FirstLogin;
