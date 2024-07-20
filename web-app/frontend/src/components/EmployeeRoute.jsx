import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const EmployeeRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return userInfo &&
    (userInfo.userRole === "employee" || userInfo.userRole === "admin") ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default EmployeeRoute;
