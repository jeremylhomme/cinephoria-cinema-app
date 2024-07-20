import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../redux/api/userApiSlice";
import { logout } from "../redux/features/auth/authSlice";
import lightLogo from "../assets/logo-light.png";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  return (
    <header className="bg-neutral-800 shadow-md align-middle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex-1">{/* Empty div for spacing */}</div>
        <div className="flex justify-center flex-1">
          <img src={lightLogo} alt="Cinéphoria Logo" className="w-64" />
        </div>
        <div className="flex justify-end flex-1 py-6">
          <button
            onClick={handleLogout}
            className="text-white text-sm hover:text-gray-200"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
