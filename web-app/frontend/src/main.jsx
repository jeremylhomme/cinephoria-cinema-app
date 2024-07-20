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
import Movies from "./pages/Visitor/Movies.jsx";
import MoviePage from "./pages/Visitor/MoviePage.jsx";
import CartPage from "./pages/Visitor/CartPage.jsx";
import ContactPage from "./pages/Visitor/ContactPage.jsx";
import Sessions from "./pages/Visitor/Sessions.jsx";
import VerifyEmail from "./pages/Auth/VerifyEmail.jsx";
import CGVPage from "./pages/Visitor/CGV.jsx";
import CGUPage from "./pages/Visitor/CGUPage.jsx";
import PrivacyPolicyPage from "./pages/Visitor/PrivacyPolicyPage.jsx";
import LegalNoticePage from "./pages/Visitor/LegalNoticePage.jsx";

// User Pages
import Profile from "./pages/User/Profile.jsx";
import PaymentPage from "./pages/User/PaymentPage.jsx";
import ThankYou from "./pages/User/ThankYou.jsx";
import ReviewPage from "./pages/User/ReviewPage.jsx";

// Employee
import CategoryList from "./pages/Employee/CategoryList.jsx";
import SessionList from "./pages/Employee/SessionList.jsx";
import SessionAdd from "./pages/Employee/SessionAdd.jsx";
import SessionDetails from "./pages/Employee/SessionDetails.jsx";
import SessionUpdate from "./pages/Employee/SessionUpdate.jsx";
import RoomList from "./pages/Employee/RoomList.jsx";
import RoomDetails from "./pages/Employee/RoomDetails.jsx";
import MovieList from "./pages/Employee/MovieList.jsx";
import MovieAdd from "./pages/Employee/MovieAdd.jsx";
import MovieUpdate from "./pages/Employee/MovieUpdate.jsx";
import MovieDetails from "./pages/Employee/MovieDetails.jsx";
import ReviewList from "./pages/Employee/ReviewList.jsx";
import ReviewPending from "./pages/Employee/ReviewPending.jsx";
import ReviewValidate from "./pages/Employee/ReviewValidate.jsx";
import EmployeeRoute from "./components/EmployeeRoute.jsx";
import IncidentList from "./pages/Employee/IncidentList.jsx";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import CinemaList from "./pages/Admin/CinemaList.jsx";
import CinemaAdd from "./pages/Admin/CinemaAdd.jsx";
import CinemaDetails from "./pages/Admin/CinemaDetails.jsx";
import CinemaUpdate from "./pages/Admin/CinemaUpdate.jsx";
import BookingList from "./pages/Admin/BookingList.jsx";
import BookingDetails from "./pages/Admin/BookingDetails.jsx";
import Orders from "./pages/User/Orders.jsx";
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
      <Route path="/sessions" element={<Sessions />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/lost-password" element={<LostPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route index element={<Home />} />
      <Route path="/movies" element={<Movies />} />
      <Route path="/movies/:movieId" element={<MoviePage />} />
      <Route path="/sessions/:id" element={<SessionDetails />} />
      <Route
        path="/movie/:movieId/session/:sessionId/auth"
        element={<AuthRedirect />}
      />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/bookings/:bookingId/payment" element={<PaymentPage />} />
      {/* Logged In Routes */}
      <Route path="/" element={<LoggedInRoute />}>
        {/* Movies and categories */}
        <Route path="movie-list" element={<MovieList />} />
        <Route path="movie-add" element={<MovieAdd />} />
        <Route path="movie-details/:id" element={<MovieDetails />} />
        <Route path="movie-update/:id" element={<MovieUpdate />} />
        <Route path="category-list" element={<CategoryList />} />
        {/* Sessions */}
        <Route path="session-list" element={<SessionList />} />
        <Route path="session-update/:id" element={<SessionUpdate />} />
        <Route path="session-add" element={<SessionAdd />} />
        {/* Rooms */}
        <Route path="room-list" element={<RoomList />} />
        <Route path="room-details/:id" element={<RoomDetails />} />
        {/* Reviews */}
        <Route path="review-list" element={<ReviewList />} />
        <Route path="review/:movieId/:sessionId" element={<ReviewPage />} />

        {/* Users */}
        <Route path="thank-you/:id" element={<ThankYou />} />
        <Route path="orders" element={<Orders />} />
        <Route path="first-login/:id" element={<FirstLogin />} />
        <Route path="/users" element={<LoggedInRoute />}>
          <Route path=":id" element={<LoggedInRoute />}></Route>
        </Route>
        <Route path="profile/:id" element={<Profile />} />
      </Route>

      {/* Employee Routes */}
      <Route element={<EmployeeRoute />}>
        <Route path="review-pending" element={<ReviewPending />} />
        <Route path="review-validate/:id" element={<ReviewValidate />} />
        <Route path="incident-list" element={<IncidentList />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route path="admin-dashboard" element={<AdminDashboard />} />
        <Route path="user-details/:id" element={<UserDetails />} />
        <Route path="cinema-list" element={<CinemaList />} />
        <Route path="cinema-add" element={<CinemaAdd />} />
        <Route path="cinema-details/:id" element={<CinemaDetails />} />
        <Route path="cinema-update/:id" element={<CinemaUpdate />} />
        <Route path="booking-list" element={<BookingList />} />
        <Route path="booking-details/:id" element={<BookingDetails />} />
        <Route path="session-list" element={<SessionList />} />
        <Route path="session-add" element={<SessionAdd />} />
        <Route path="sessions" element={<AdminRoute />}></Route>
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
