import React, { Fragment, useState, useEffect } from "react";
import { Dialog, Transition, Menu } from "@headlessui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  TagIcon,
  FilmIcon,
  TicketIcon,
  StarIcon,
  PlayCircleIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";

import { lightLogo } from "../../redux/constants";
import { darkLogo } from "../../redux/constants";

import RoomIcon from "../../components/RoomIcon";

import {
  useLogoutMutation,
  useGetUserProfileQuery,
} from "../../redux/api/userApiSlice";

import { logout } from "../../redux/features/auth/authSlice";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const AdminMenu = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: userDetails, isError } = useGetUserProfileQuery(userInfo?.id);

  const [user, setUser] = useState({});
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      toast.success("Déconnexion réussie");
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    if (userDetails) {
      setUser(userDetails);
    }
  }, [userDetails]);

  const userNavigation = [
    { name: "Profil", href: "#" },
    { name: "Déconnexion", href: "#" },
  ];

  const navigation = [
    {
      name: "Tableau de bord",
      href: "/admin/admin-dashboard",
      icon: HomeIcon,
      current: pathname === "/admin/admin-dashboard",
    },
    {
      name: "Utilisateurs",
      href: "/admin/user-list",
      icon: UsersIcon,
      current: pathname === "/admin/user-list",
    },
    {
      name: "Catégories",
      href: "/category-list",
      icon: TagIcon,
      current: pathname === "/category-list",
    },
    {
      name: "Films",
      href: "/movie-list",
      icon: PlayCircleIcon,
      current: pathname === "/movie-list",
    },
    {
      name: "Cinémas",
      href: "/admin/cinema-list",
      icon: FilmIcon,
      current: pathname === "/admin/cinema-list",
    },
    {
      name: "Salles",
      href: "/room-list",
      icon: RoomIcon,
      current: pathname === "/roomlist",
    },
    {
      name: "Séances",
      href: "/admin/session-list",
      icon: VideoCameraIcon,
      current: pathname === "/admin/session-list",
    },
    {
      name: "Réservations",
      href: "/admin/booking-list",
      icon: TicketIcon,
      current: pathname === "/admin/booking-list",
    },
    {
      name: "Avis",
      href: "/review-list",
      icon: StarIcon,
      current: pathname === "/review-list",
    },
  ];

  return (
    <>
      <div>
        <Transition.Root show={sidebarMobileOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={setSidebarMobileOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarMobileOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component*/}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">
                      <img
                        className="h-8 w-auto"
                        src={darkLogo}
                        alt="Cinéphoria"
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  className={classNames(
                                    item.current
                                      ? "bg-gray-50 text-yellow-600"
                                      : "text-gray-700 hover:text-yellow-600 hover:bg-gray-50",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                  )}
                                  onClick={() => setSidebarMobileOpen(false)}
                                >
                                  <item.icon
                                    className={classNames(
                                      item.current
                                        ? "text-yellow-600"
                                        : "text-gray-400 group-hover:text-yellow-600",
                                      "h-6 w-6 shrink-0"
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}

        <div>
          <div className="bg-neutral-800 sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-white"
              onClick={() => setSidebarMobileOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 " aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex items-center gap-x-4 lg:gap-x-6 w-full ">
                {/* Profile dropdown */}
                <Menu as="div" className="relative w-full">
                  <div className="flex justify-between items-center w-full sm:">
                    <div className="-m-1.5 flex items-center">
                      <Link
                        to="/admin/admin-dashboard"
                        className="text-sm text-white font-semibold leading-6 pr-4 hidden sm:flex hover:text-gray-300 underline"
                      >
                        Administration
                      </Link>
                    </div>
                    <div className="flex h-16 shrink-0 items-center">
                      <Link to="/">
                        <img
                          className="h-6 w-auto sm:w-auto"
                          src={lightLogo}
                          alt="Cinéphoria"
                        />
                      </Link>
                    </div>

                    <div className="-m-1.5 flex items-center">
                      <div className="relative">
                        <button
                          onClick={() => setIsMenuOpen(!isMenuOpen)}
                          className="text-sm text-white font-semibold leading-6 hover:text-gray-200"
                        >
                          Mon compte
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[#fafaf9] ring-1 ring-black ring-opacity-5">
                            <div
                              className="py-1"
                              role="menu"
                              aria-orientation="vertical"
                            >
                              <Link
                                to={`/profile/${userInfo.id}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Profil
                              </Link>
                              <button
                                onClick={logoutHandler}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Déconnexion
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                      {userNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <a
                              href={item.href}
                              className={classNames(
                                active ? "bg-gray-50" : "",
                                "block px-3 py-1 text-sm leading-6 text-gray-900"
                              )}
                              onClick={(e) => {
                                e.preventDefault();
                                if (item.name === "Sign out") {
                                  handleLogout();
                                }
                              }}
                            >
                              {item.name}
                            </a>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminMenu;
