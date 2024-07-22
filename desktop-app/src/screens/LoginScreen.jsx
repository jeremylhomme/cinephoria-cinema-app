import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useLoginMutation } from "../redux/api/userApiSlice";
import darkLogo from "../assets/logo-dark.png";

const LoginScreen = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login] = useLoginMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const attemptLogin = async (retryCount = 0) => {
      try {
        const response = await login({ userEmail, userPassword }).unwrap();

        // Check if the user is an employee
        if (response.userRole === "customer") {
          setMessage("Access denied. Only employees can use this application.");
          setIsLoading(false);
          return;
        }

        // Handle successful login
        dispatch(setCredentials(response));

        if (response.mustChangePassword) {
          console.log("User must change password");
          // Handle password change if needed
        } else {
          navigate("/incidents");
          console.log("Login successful!");
        }
      } catch (error) {
        console.error(`Login attempt ${retryCount + 1} failed:`, error);

        if (retryCount < 2) {
          // Retry up to 2 times
          console.log(`Retrying login... (Attempt ${retryCount + 2})`);
          return attemptLogin(retryCount + 1);
        }

        setMessage(
          error.data?.message ||
            `Erreur de connexion (${error.status}): ${error.error}. Veuillez réessayer.`
        );
      }
    };

    await attemptLogin();
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img
            className="mx-auto w-auto"
            src={darkLogo}
            alt="Cinéphoria Logo"
          />
          <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
            Application Bureautique Cinéphoria
          </h2>
          <p className="mt-4 text-center text-base text-gray-600">
            Bienvenue sur l'application de gestion des incidents de Cinéphoria.
          </p>
          <p className="mt-2 text-center text-base text-gray-600">
            Veuillez vous connecter pour continuer.
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          {message && (
            <div className="text-red-500 text-center mb-4">{message}</div>
          )}

          <form className="space-y-6" onSubmit={submitHandler}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Adresse email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 px-4 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                  value={userEmail}
                  placeholder="Entrez votre adresse email"
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Mot de passe
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 px-4 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                  value={userPassword}
                  placeholder="Entrez votre mot de passe"
                  onChange={(e) => setUserPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-700 text-white hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                }`}
              >
                {isLoading ? "Connexion en cours..." : "Connexion"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
