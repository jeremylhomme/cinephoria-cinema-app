import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useVerifyEmailMutation } from "../../redux/api/userApiSlice";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { code: paramCode } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const queryCode = queryParams.get("code");

  const code = paramCode || queryCode;

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!code) {
        setMessage("Aucun code de vérification fourni.");
        return;
      }

      try {
        await verifyEmail(code).unwrap();
        setMessage("Email vérifié avec succès ! Redirection en cours...");
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        console.error("Erreur de vérification:", error);
        setMessage(
          "Code de vérification invalide ou expiré. Veuillez essayer de vous réinscrire."
        );
      }
    };

    verify();
  }, [code, verifyEmail, navigate]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h2>Vérification de l'email</h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;
