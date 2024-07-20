import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoaderFull from "../../components/LoaderFull";

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const bookingInfo = JSON.parse(localStorage.getItem("selectedBooking"));

    if (userInfo && bookingInfo) {
      localStorage.removeItem("selectedBooking");
      navigate("/cart", { state: bookingInfo });
    } else if (!userInfo) {
      navigate("/login");
    }
  }, [userInfo, navigate]);

  return <LoaderFull />;
};

export default AuthRedirect;
