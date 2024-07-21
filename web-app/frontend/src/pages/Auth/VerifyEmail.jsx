import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { useVerifyEmailMutation } from "../../redux/api/userApiSlice";

const VerifyEmail = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [message, setMessage] = useState("");
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const verify = async () => {
      if (!code) {
        setMessage("Aucun code de vérification fourni.");
        setVerificationAttempted(true);
        return;
      }

      try {
        const result = await verifyEmail(code).unwrap();
        setMessage("Email vérifié avec succès ! Redirection en cours...");
        setVerificationAttempted(true);
        setTimeout(() => {
          navigate(userInfo ? "/" : "/login");
        }, 3000);
      } catch (error) {
        console.error("Erreur de vérification:", error);
        setMessage(
          "Code de vérification invalide ou expiré. Veuillez essayer de vous réinscrire."
        );
        setVerificationAttempted(true);
      }
    };

    verify();
  }, [code, verifyEmail, navigate, userInfo]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Vérification de l'email
        </h2>
      </div>
      <div className="bg-white p-8 rounded-md sm:mx-auto sm:w-full sm:max-w-sm">
        {verificationAttempted ? (
          <>
            <p className="text-center mb-6">{message}</p>
            {message.includes("succès") && (
              <button
                type="button"
                onClick={() => navigate(userInfo ? "/" : "/login")}
                className="flex w-full justify-center rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm bg-green-700 text-white hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
              >
                {userInfo ? "Aller à l'accueil" : "Se connecter"}
              </button>
            )}
          </>
        ) : (
          <p className="text-center">Vérification de votre email en cours...</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
