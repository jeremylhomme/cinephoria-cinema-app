import React from "react";
import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";

import { lightLogo } from "../../redux/constants";
import { darkLogo } from "../../redux/constants";

const VisitorMenu = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const navigation = [
    { name: "Accueil", href: "/", current: pathname === "/" },
    { name: "Films", href: "/movies", current: pathname === "/movies" },
    {
      name: "Réservation",
      href: "/sessions",
      current: pathname === "/sessions",
    },
    { name: "Contact", href: "/contact", current: pathname === "/contact" },
  ];

  return (
    <header>
      <nav
        className="bg-neutral-800 mx-auto text-white flex items-center justify-between p-6 lg:px-8"
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
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
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
              className={`text-sm leading-6 ${
                item.current ? "text-yellow-600" : ""
              } hover:text-yellow-600`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <div className="mr-4">
            <Link
              to="/register"
              className="text-sm leading-6 hover:text-yellow-600"
            >
              Inscription
            </Link>
          </div>
          <div className="">
            <Link
              to="/login"
              className="text-sm leading-6 text-stone-50 hover:text-yellow-600"
            >
              Connexion
            </Link>
          </div>
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
                    className={`-mx-3 block rounded-lg px-3 py-2 leading-7 hover:bg-gray-50 ${
                      item.current ? "text-yellow-600" : ""
                    } hover:text-yellow-600`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6 space-y-2">
                <Link
                  to="/login"
                  className="-mx-3 block rounded-lg px-3 py-2.5 leading-7 hover:bg-gray-50 hover:text-yellow-600"
                >
                  Connexion
                </Link>
                <Link
                  to="register"
                  className="-mx-3 block rounded-lg px-3 py-2.5 leading-7 hover:bg-gray-50 hover:text-yellow-600"
                >
                  Inscription
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default VisitorMenu;
