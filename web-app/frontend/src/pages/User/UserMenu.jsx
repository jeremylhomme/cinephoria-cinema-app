import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { useSelector, useDispatch } from "react-redux";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

import {
  useLogoutMutation,
  useGetUserProfileQuery,
} from "../../redux/api/userApiSlice";
import { logout } from "../../redux/features/auth/authSlice";

import { lightLogo } from "../../redux/constants";
import { darkLogo } from "../../redux/constants";
import { toast } from "react-toastify";

const UserMenu = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: userDetails, isError } = useGetUserProfileQuery(userInfo?.id);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const { pathname } = useLocation();
  const navigation = [
    { name: "Accueil", href: "/", current: pathname === "/" },
    {
      name: "Réservation",
      href: "/sessions",
      current: pathname === "/sessions",
    },
    { name: "Films", href: "/movies", current: pathname === "/movies" },
    { name: "Contact", href: "/contact", current: pathname === "/contact" },
  ];

  return (
    <header className="bg-neutral-800">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Cinéphoria</span>
            <img className="h-7 w-auto" src={lightLogo} alt="" />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-stone-50"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-semibold leading-6 text-stone-50 ${
                item.current ? "text-yellow-600" : ""
              } hover:text-yellow-600`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center">
          <Link to="/cart" className="text-stone-50 hover:text-yellow-600 mr-6">
            <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
          </Link>
          {userInfo ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-sm font-semibold leading-6 hover:text-yellow-600 text-stone-50"
              >
                Mon compte
              </button>
              {isMenuOpen && (
                <div className="z-50 absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      to={`/profile/${userInfo.id}`}
                      className="block px-4 py-2 text-sm"
                    >
                      Profil
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm">
                      Mes réservations
                    </Link>
                    <button
                      onClick={logoutHandler}
                      className="block w-full text-left px-4 py-2 text-sm"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-stone-50 hover:text-yellow-600 mr-6"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-stone-50 hover:text-yellow-600"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </nav>
      <Dialog
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Cinéphoria</span>
              <img className="h-7 w-auto" src={darkLogo} alt="" />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-50 ${
                      item.current ? "text-yellow-600" : ""
                    } hover:text-yellow-600`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6 space-y-2">
                {userInfo ? (
                  <>
                    <Link
                      to={`/user/profile/${userInfo.id}`}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-gray-50 hover:text-yellow-600"
                    >
                      Mon compte
                    </Link>
                    <button
                      onClick={logoutHandler}
                      className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-gray-50 hover:text-yellow-600"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-gray-50 hover:text-yellow-600"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-gray-50 hover:text-yellow-600"
                    >
                      Inscription
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default UserMenu;
