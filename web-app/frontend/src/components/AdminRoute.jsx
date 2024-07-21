import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (userInfo && userInfo.userRole === "admin") ||
    userInfo.userRole === "superadmin" ? (
    <Outlet />
  ) : null;
};

export default AdminRoute;
