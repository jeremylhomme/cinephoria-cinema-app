import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { useVerifyEmailMutation } from "../../redux/api/userApiSlice";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get("code") || "";
  console.log("Verification code extracted from URL:", code);

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [message, setMessage] = useState("");

  // Get the user info from Redux store
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const verify = async () => {
      try {
        console.log("Verification code being sent to verifyEmail:", code);
        const result = await verifyEmail(code).unwrap();
        console.log("Verification result:", result);
        setMessage("Email verified successfully! Redirecting...");
        setTimeout(() => {
          // Check if user is logged in
          if (userInfo) {
            navigate("/"); // Redirect to home page if logged in
          } else {
            navigate("/login"); // Redirect to login page if not logged in
          }
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        setMessage(
          "Invalid or expired verification code. Please try registering again."
        );
      }
    };
    if (code) {
      verify();
    } else {
      setMessage("No verification code provided.");
    }
  }, [code, verifyEmail, navigate, userInfo]);

  const handleRedirect = () => {
    if (userInfo) {
      navigate("/"); // Redirect to home page if logged in
    } else {
      navigate("/login"); // Redirect to login page if not logged in
    }
  };

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
        <p className="text-center mb-6">{message}</p>
        <button
          type="button"
          onClick={handleRedirect}
          className="flex w-full justify-center rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm bg-green-700 text-white hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          {userInfo ? "Aller à l'accueil" : "Se connecter"}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
