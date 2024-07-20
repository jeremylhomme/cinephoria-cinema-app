import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useRegisterMutation } from "../../redux/api/userApiSlice";
import Loader from "../../components/Loader";

import { goldIcon } from "../../redux/constants";

const Register = () => {
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userUserName, setUserUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [confirmUserPassword, setConfirmUserPassword] = useState("");
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!/[a-z]/.test(password)) {
      return "Le mot de passe doit contenir au moins une lettre minuscule";
    }
    if (!/[A-Z]/.test(password)) {
      return "Le mot de passe doit contenir au moins une lettre majuscule";
    }
    if (!/[0-9]/.test(password)) {
      return "Le mot de passe doit contenir au moins un chiffre";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Le mot de passe doit contenir au moins un caractère spécial";
    }
    return null;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(userPassword);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    if (userPassword !== confirmUserPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const res = await register({
        userFirstName,
        userLastName,
        userUserName,
        userEmail,
        userPassword,
      }).unwrap();
      toast.success("Inscription effectuée avec succès.");
      navigate("/login");
    } catch (err) {
      console.error("Erreur:", err);
      setMessage("Une erreur est survenue lors de l'inscription.");
      // Add more detailed error logging
      if (err.data) {
        console.error("Error data:", JSON.stringify(err.data, null, 2));
      }
      if (err.status) {
        console.error("Error status:", err.status);
      }
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="bg-white px-8 py-12 rounded-md my-10 sm:mx-auto sm:w-full sm:max-w-md shadow-sm">
        {message && (
          <div className="text-red-500 text-center mb-4">{message}</div>
        )}
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-12 w-auto"
            src={goldIcon}
            alt="Cinéphoria"
          />
          <h2 className="mt-4 mb-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Inscription
          </h2>
        </div>

        <form className="space-y-6" onSubmit={submitHandler}>
          <div>
            <label
              htmlFor="userFirstName"
              className="block text-sm font-medium leading-6"
            >
              Prénom
            </label>
            <div className="mt-2">
              <input
                id="userFirstName"
                name="userFirstName"
                type="text"
                autoComplete="given-name"
                required
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                value={userFirstName}
                placeholder="Entrez votre prénom"
                onChange={(e) => setUserFirstName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="userLastName"
              className="block text-sm font-medium leading-6"
            >
              Nom
            </label>
            <div className="mt-2">
              <input
                id="userLastName"
                name="userLastName"
                type="text"
                autoComplete="family-name"
                required
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                value={userLastName}
                placeholder="Entrez votre nom"
                onChange={(e) => setUserLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="userUserName"
              className="block text-sm font-medium leading-6"
            >
              Nom d'utilisateur
            </label>
            <div className="mt-2">
              <input
                id="userUserName"
                name="userUserName"
                type="text"
                autoComplete="username"
                required
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                value={userUserName}
                placeholder="Choisissez un nom d'utilisateur"
                onChange={(e) => setUserUserName(e.target.value)}
              />
            </div>
          </div>

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
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6"
            >
              Mot de passe
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                value={userPassword}
                placeholder="Entrez votre mot de passe"
                onChange={(e) => setUserPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmUserPassword"
              className="block text-sm font-medium leading-6"
            >
              Confirmer le mot de passe
            </label>
            <div className="mt-2">
              <input
                id="confirmUserPassword"
                name="confirmUserPassword"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                value={confirmUserPassword}
                placeholder="Confirmez votre mot de passe"
                onChange={(e) => setConfirmUserPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-10">
            <button
              type="submit"
              disabled={isLoading}
              className={`block rounded-md px-3 py-2 text-center text-sm w-full ${
                isLoading
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-green-700 text-white hover:bg-green-800"
              }`}
            >
              {isLoading ? <Loader /> : "S'inscrire"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-gray-400"
          >
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
