import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { useLoginMutation } from "../../redux/api/userApiSlice";
import Loader from "../../components/Loader";

import { goldIcon } from "../../redux/constants";

const Login = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [login] = useLoginMutation();

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect") || "/";

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login({ userEmail, userPassword }).unwrap();

      // Handle successful login
      dispatch(setCredentials(response));

      if (response.isLostPassword) {
        setTimeout(
          () => navigate(`/users/${response.id}/lost-password-login`),
          100
        );
      } else if (response.mustChangePassword) {
        setTimeout(() => navigate(`/first-login/${response.id}`), 100);
      } else {
        setTimeout(() => {
          navigate(redirect);
          toast.success("Connexion réussie !");
        }, 100);
      }
    } catch (error) {
      if (!error.response) {
        setMessage("Erreur de réseau. Veuillez vérifier votre connexion.");
      } else if (error.response.status === 401) {
        setMessage("Adresse e-mail ou mot de passe invalide.");
      } else {
        setMessage(error.data?.message || "Erreur de connexion");
      }
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="bg-white px-8 py-12 rounded-md my-10 sm:mx-auto sm:w-full sm:max-w-md shadow-sm">
        {message && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
            data-testid="error-message"
          >
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-12 w-auto"
            src={goldIcon}
            alt="Cinéphoria"
          />
          <h2 className="mt-4 mb-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Connexion
          </h2>
        </div>

        <form className="space-y-10" onSubmit={submitHandler}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6"
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
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                value={userEmail}
                placeholder="Entrez votre adresse e-mail"
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6"
              >
                Mot de passe
              </label>

              <Link
                to="/lost-password"
                className="text-sm text-gray-500 hover:text-gray-400"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                value={userPassword}
                placeholder="Entrez votre mot de passe"
                onChange={(e) => setUserPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-10">
            <button
              type="submit"
              disabled={isLoading}
              data-testid="login-button"
              className={`block rounded-md px-3 py-2 text-center text-sm w-full ${
                isLoading
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-green-700 text-white hover:bg-green-800"
              }`}
            >
              {isLoading ? <Loader /> : "Connexion"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/register"
            className="text-sm text-gray-500 hover:text-gray-400"
          >
            Pas encore de compte ? S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
