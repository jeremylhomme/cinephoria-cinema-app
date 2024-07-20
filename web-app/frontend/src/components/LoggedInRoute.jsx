import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const LoggedInRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return userInfo ? <Outlet /> : null;
};

export default LoggedInRoute;
