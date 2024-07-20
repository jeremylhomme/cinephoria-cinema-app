import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./redux/features/auth/authSlice";
import LoginScreen from "./screens/LoginScreen";
import IncidentList from "./screens/IncidentList";
import IncidentAdd from "./screens/IncidentAdd";
import IncidentDetails from "./screens/IncidentDetails";
import Header from "./components/Header";

const App = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const expirationTime = localStorage.getItem("expirationTime");
    if (expirationTime && new Date().getTime() > parseInt(expirationTime)) {
      dispatch(logout());
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {userInfo && <Header />}
        <main className="flex-grow">
          <Routes>
            <Route
              path="/login"
              element={
                !userInfo ? (
                  <LoginScreen />
                ) : (
                  <Navigate to="/incidents" replace />
                )
              }
            />
            <Route
              path="/incidents"
              element={
                userInfo ? <IncidentList /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/incidentadd"
              element={
                userInfo ? <IncidentAdd /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/incidentdetails/:id"
              element={
                userInfo ? (
                  <IncidentDetails />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/"
              element={
                userInfo ? (
                  <Navigate to="/incidents" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
