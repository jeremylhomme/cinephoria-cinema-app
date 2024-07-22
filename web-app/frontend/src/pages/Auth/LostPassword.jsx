import React, { useState } from "react";
import { useResetPasswordMutation } from "../../redux/api/userApiSlice";
import { toast } from "react-toastify";

const LostPassword = () => {
  const [email, setEmail] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword({ userEmail: email }).unwrap();
      toast.success("Instructions de réinitialisation envoyées à votre email.");
    } catch (err) {
      if (err?.data?.message === "Utilisateur non trouvé.") {
        toast.error("Utilisateur non trouvé");
      } else {
        toast.error(err?.data?.message || "Une erreur est survenue");
      }
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col px-6 py-24 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Réinitialisation du mot de passe
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Adresse e-mail
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-700 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="block rounded-md px-3 py-2 text-center text-sm bg-green-700 text-white hover:bg-green-800"
            >
              {isLoading
                ? "Envoi en cours..."
                : "Envoyer les instructions par e-mail"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LostPassword;
