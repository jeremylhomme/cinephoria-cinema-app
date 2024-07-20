import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useResetPasswordConfirmMutation,
  useVerifyResetTokenQuery,
} from "../../redux/api/userApiSlice";
import Loader from "../../components/Loader";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    data,
    error,
    isLoading: isVerifying,
  } = useVerifyResetTokenQuery(token);
  const [resetPasswordConfirm] = useResetPasswordConfirmMutation();

  useEffect(() => {
    if (error) {
      toast.error("Code de réinitialisation invalide ou expiré.");
      navigate("/lost-password");
    }
  }, [error, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setIsLoading(true);

    try {
      await resetPasswordConfirm({
        token,
        newPassword: password,
      }).unwrap();
      setIsLoading(false);
      toast.success("Mot de passe mis à jour avec succès.");
      navigate("/login");
    } catch (error) {
      setIsLoading(false);
      toast.error(
        "Échec de la mise à jour du mot de passe. Veuillez réessayer plus tard."
      );
      console.error("Password update failed:", error);
    }
  };

  if (isVerifying) {
    return <Loader />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Réinitialisation du mot de passe
        </h2>
      </div>

      <div className="bg-white p-8 rounded-md sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6"
            >
              Nouveau mot de passe
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                placeholder="Entrez votre nouveau mot de passe"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium leading-6"
            >
              Confirmer le nouveau mot de passe
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </div>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className={`flex w-full justify-center rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm ${
              isLoading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-green-700 text-white hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
            }`}
          >
            {isLoading ? <Loader /> : "Réinitialiser le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
