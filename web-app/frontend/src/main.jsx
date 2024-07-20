import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import { Route, RouterProvider, createRoutesFromElements } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./redux/store";
import LoggedInRoute from "./components/LoggedInRoute.jsx";
import AuthRedirect from "./pages/Auth/AuthRedirect.jsx";

// Visitor Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import ContactPage from "./pages/Visitor/ContactPage.jsx";
import VerifyEmail from "./pages/Auth/VerifyEmail.jsx";
import CGVPage from "./pages/Visitor/CGV.jsx";
import CGUPage from "./pages/Visitor/CGUPage.jsx";
import PrivacyPolicyPage from "./pages/Visitor/PrivacyPolicyPage.jsx";
import LegalNoticePage from "./pages/Visitor/LegalNoticePage.jsx";

// User Pages
import Profile from "./pages/User/Profile.jsx";

// Employee
import EmployeeRoute from "./components/EmployeeRoute.jsx";

// Admin Pages
import AdminRoute from "./components/AdminRoute.jsx";
import UserList from "./pages/Admin/UserList.jsx";
import FirstLogin from "./pages/Auth/FirstLogin.jsx";
import LostPassword from "./pages/Auth/LostPassword.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";
import UserDetails from "./pages/Admin/UserDetails.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Visitor Routes */}
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/cgv" element={<CGVPage />} />
      <Route path="/cgu" element={<CGUPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/legal-notice" element={<LegalNoticePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/lost-password" element={<LostPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route index element={<Home />} />
      <Route
        path="/movie/:movieId/session/:sessionId/auth"
        element={<AuthRedirect />}
      />
      {/* Logged In Routes */}
      <Route path="/" element={<LoggedInRoute />}>
        {/* Users */}
        <Route path="first-login/:id" element={<FirstLogin />} />
        <Route path="/users" element={<LoggedInRoute />}>
          <Route path=":id" element={<LoggedInRoute />}></Route>
        </Route>
        <Route path="profile/:id" element={<Profile />} />
      </Route>

      {/* Employee Routes */}
      <Route element={<EmployeeRoute />}></Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route path="user-details/:id" element={<UserDetails />} />
        <Route path="user-list" element={<UserList />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <RouterProvider router={router} />
    </PersistGate>
  </Provider>
);
